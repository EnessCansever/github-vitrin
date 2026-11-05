import {MongoServerError} from "mongodb";
import {beforeEach, expect, it, vi} from "vitest";
import {analysisScope, acquireAnalysisLock, ownsAnalysisLock, releaseAnalysisLock} from "../../src/lib/db/analysis-locks";
import {StorageError} from "../../src/lib/db/errors";
import {analysisLeaseMs} from "../../src/config/request-limits";

const db = vi.hoisted(() => ({get: vi.fn(), collection: vi.fn(), index: vi.fn(), update: vi.fn(), find: vi.fn(), remove: vi.fn()}));
vi.mock("../../src/lib/db/client", async original => ({...await original<typeof import("../../src/lib/db/client")>(), getDatabase: db.get}));
const key = analysisScope(7, [10, 20]);
const otherOwner = "11111111-1111-4111-8111-111111111111";

beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-05T00:00:00Z"));
  db.get.mockReset().mockResolvedValue({collection: db.collection});
  db.collection.mockReset().mockReturnValue({createIndex: db.index, findOneAndUpdate: db.update, findOne: db.find, deleteOne: db.remove});
  db.index.mockReset().mockResolvedValue("request_lock_expiry");
  db.update.mockReset().mockImplementation(async (filter, update) => ({
    _id: filter._id, owner: update[0].$set.owner.$cond[1], expiresAt: new Date(Date.now() + analysisLeaseMs),
  }));
  db.find.mockReset().mockResolvedValue(null);
  db.remove.mockReset().mockResolvedValue({acknowledged: true, deletedCount: 1});
});

it("keys verified numeric identities independent of login, repo order and input mutation", () => {
  const ids = [20, 10];
  expect(analysisScope(7, ids)).toBe(analysisScope(7, [10, 20]));
  expect(ids).toEqual([20, 10]);
  expect(analysisScope(8, ids)).not.toBe(key);
  expect(analysisScope(7, [10])).not.toBe(key);
});

it.each([[0, [10]], [7, []], [7, [10, 10]], [7, [1, 2, 3, 4]], [7, [0]]])("rejects invalid scope identities", (profileId, repos) => {
  expect(() => analysisScope(profileId as number, repos as number[])).toThrowError("invalid_lock");
});

it("acquires an opaque owner and fixed lease with only the required indexes and bounded DB commands", async () => {
  const result = await acquireAnalysisLock(key);
  expect(result).toMatchObject({acquired: true, lock: {key, expiresAt: "2026-11-05T00:00:45.000Z"}});
  if (!result.acquired) throw new Error("Expected lease");
  expect(result.lock.owner).toMatch(/^[a-f\d-]{36}$/);
  expect(db.collection).toHaveBeenCalledWith("requestLocks");
  expect(db.index).toHaveBeenCalledWith({expiresAt: 1}, {name: "request_lock_expiry", expireAfterSeconds: 0},
    {maxTimeMS: 4000, writeConcern: {w: "majority", wtimeoutMS: 4000}});
  expect(db.update.mock.calls[0][2]).toEqual({upsert: true, returnDocument: "after", maxTimeMS: 4000, writeConcern: {w: "majority", wtimeoutMS: 4000}});
});

it("returns contention separately without exposing another owner's token", async () => {
  db.update.mockResolvedValue({_id: key, owner: otherOwner, expiresAt: new Date(Date.now() + 12345)});
  expect(await acquireAnalysisLock(key)).toEqual({acquired: false, retryAt: "2026-11-05T00:00:12.345Z"});
});

it("accepts an expired lease's new atomic image even when TTL has not deleted the key", async () => {
  const first = await acquireAnalysisLock(key);
  vi.advanceTimersByTime(analysisLeaseMs);
  const next = await acquireAnalysisLock(key);
  expect(next).toMatchObject({acquired: true, lock: {key, expiresAt: "2026-11-05T00:01:30.000Z"}});
  if (!first.acquired || !next.acquired) throw new Error("Expected leases");
  expect(next.lock.owner).not.toBe(first.lock.owner);
});

it("handles an initial upsert race with one bounded update", async () => {
  db.update.mockRejectedValueOnce(new MongoServerError({code: 11000, message: "duplicate key"}));
  expect(await acquireAnalysisLock(key)).toMatchObject({acquired: true});
  expect(db.update).toHaveBeenCalledTimes(2);
  expect(db.update.mock.calls[1][2]).toMatchObject({upsert: false, maxTimeMS: 4000});
});

it("does not retry an ambiguous write or turn a second duplicate error into busy", async () => {
  db.update.mockRejectedValue(new MongoServerError({code: 11000, message: "private diagnostic"}));
  await expect(acquireAnalysisLock(key)).rejects.toMatchObject({code: "unavailable", message: "unavailable"});
  expect(db.update).toHaveBeenCalledTimes(2);
  db.update.mockReset().mockRejectedValue(new Error("network after write"));
  await expect(acquireAnalysisLock(key)).rejects.toMatchObject({code: "unavailable"});
  expect(db.update).toHaveBeenCalledTimes(1);
});

it("requires the active owner and server-side expiry for ownership checks", async () => {
  const acquired = await acquireAnalysisLock(key);
  if (!acquired.acquired) throw new Error("Expected lease");
  expect(await ownsAnalysisLock(acquired.lock)).toBe(false);
  expect(db.find).toHaveBeenCalledWith({_id: key, owner: acquired.lock.owner, expiresAt: {$type: "date"}, $expr: {$gt: ["$expiresAt", "$$NOW"]}}, {maxTimeMS: 4000});
});

it("cannot release a replacement owner's lease", async () => {
  const acquired = await acquireAnalysisLock(key);
  if (!acquired.acquired) throw new Error("Expected lease");
  db.remove.mockImplementation(async filter => ({acknowledged: true, deletedCount: filter.owner === otherOwner ? 1 : 0}));
  expect(await releaseAnalysisLock(acquired.lock)).toBe(false);
  expect(await releaseAnalysisLock({...acquired.lock, owner: otherOwner})).toBe(true);
  expect(db.remove.mock.calls[0][0]).toEqual({_id: key, owner: acquired.lock.owner});
});

it.each([null, {_id: key, owner: "bad", expiresAt: new Date()}, {_id: key, owner: otherOwner, expiresAt: "bad"}])("rejects missing or malformed acquisition responses", async value => {
  db.update.mockResolvedValue(value);
  await expect(acquireAnalysisLock(key)).rejects.toMatchObject({code: value === null ? "unavailable" : "invalid_record"});
});

it.each(["connection", "index", "query", "release"])("sanitizes %s errors without reporting contention", async step => {
  const acquired = await acquireAnalysisLock(key);
  if (!acquired.acquired) throw new Error("Expected lease");
  const raw = new Error("sensitive connection details");
  if (step === "connection") db.get.mockRejectedValue(new StorageError("configuration"));
  if (step === "index") db.index.mockRejectedValue(raw);
  if (step === "query") db.find.mockRejectedValue(raw);
  if (step === "release") db.remove.mockRejectedValue(raw);
  const action = step === "query" ? ownsAnalysisLock(acquired.lock) : step === "release" ? releaseAnalysisLock(acquired.lock) : acquireAnalysisLock(key);
  await expect(action).rejects.toMatchObject({code: step === "connection" ? "configuration" : "unavailable"});
});
