import {MongoServerError} from "mongodb";
import {beforeEach, expect, it, vi} from "vitest";
import {acquireAnalysisCapacity, ownsAnalysisCapacity, releaseAnalysisCapacity} from "../../src/lib/db/analysis-capacity";
import {StorageError} from "../../src/lib/db/errors";
import {analysisCapacityLimit, analysisLeaseMs} from "../../src/config/request-limits";

const db = vi.hoisted(() => ({get: vi.fn(), collection: vi.fn(), index: vi.fn(), claim: vi.fn(), update: vi.fn(), find: vi.fn()}));
vi.mock("../../src/lib/db/client", async original => ({...await original<typeof import("../../src/lib/db/client")>(), getDatabase: db.get}));
const owner = "11111111-1111-4111-8111-111111111111";
const permit = {owner, expiresAt: "2026-11-07T00:00:45.000Z"};
const database = {collection: db.collection};

beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-07T00:00:00Z"));
  db.get.mockReset().mockResolvedValue(database);
  db.collection.mockReset().mockReturnValue({createIndex: db.index, findOneAndUpdate: db.claim, updateOne: db.update, findOne: db.find});
  db.index.mockReset().mockResolvedValue("analysis_capacity_expiry");
  db.claim.mockReset().mockImplementation(async (_filter, update) => {
    const own = update[1].$set.permits.$cond[1].$concatArrays[1][0].owner;
    return {_id: "analysis-capacity-v1", limit: analysisCapacityLimit, expiresAt: new Date(permit.expiresAt), permits: [{owner: own, expiresAt: new Date(permit.expiresAt)}]};
  });
  db.find.mockReset().mockResolvedValue(null);
  db.update.mockReset().mockResolvedValue({acknowledged: true, modifiedCount: 1, matchedCount: 1});
});

it("claims a unique lease without storing scope, quota identity, report data or access tokens", async () => {
  const first = await acquireAnalysisCapacity(), second = await acquireAnalysisCapacity();
  expect(first).toMatchObject({acquired: true, permit: {expiresAt: permit.expiresAt}});
  if (!first.acquired || !second.acquired) throw new Error("Expected permits");
  expect(first.permit.owner).not.toBe(second.permit.owner);
  expect(Object.keys(first.permit).sort()).toEqual(["expiresAt", "owner"]);
  expect(db.index).toHaveBeenCalledWith({expiresAt: 1}, {name: "analysis_capacity_expiry", expireAfterSeconds: 0},
    {maxTimeMS: 4000, writeConcern: {w: "majority", wtimeoutMS: 4000}});
  expect(db.claim.mock.calls[0][2]).toMatchObject({upsert: true, returnDocument: "after", maxTimeMS: 4000});
  const pipeline = db.claim.mock.calls[0][1];
  expect(pipeline[0].$set.permits.$filter.cond).toEqual({$gt: ["$$permit.expiresAt", "$$NOW"]});
  expect(pipeline[1].$set.permits.$cond[1].$concatArrays[1][0].expiresAt).toEqual({$add: ["$$NOW", analysisLeaseMs]});
});

it("returns full capacity and the earliest actual lease expiry separately from DB errors", async () => {
  db.claim.mockResolvedValue({_id: "analysis-capacity-v1", limit: 5, expiresAt: new Date(permit.expiresAt), permits: Array.from({length: 5}, (_, i) => ({
    owner: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`, expiresAt: new Date(Date.now() + 10000 + i * 1000),
  }))});
  expect(await acquireAnalysisCapacity()).toEqual({acquired: false, retryAt: "2026-11-07T00:00:10.000Z"});
});

it("recovers once from an initial unique-key race, never from ambiguous network failures", async () => {
  db.claim.mockRejectedValueOnce(new MongoServerError({code: 11000, message: "duplicate"}));
  expect(await acquireAnalysisCapacity()).toMatchObject({acquired: true});
  expect(db.claim.mock.calls[1][2]).toMatchObject({upsert: false});
  db.claim.mockReset().mockRejectedValue(new Error("private URI"));
  await expect(acquireAnalysisCapacity()).rejects.toMatchObject({code: "unavailable", message: "unavailable"});
  expect(db.claim).toHaveBeenCalledTimes(1);
});

it("does not exceed a bounded second upsert recovery or invent success for a missing response", async () => {
  db.claim.mockRejectedValue(new MongoServerError({code: 11000, message: "duplicate"}));
  await expect(acquireAnalysisCapacity()).rejects.toMatchObject({code: "unavailable"});
  expect(db.claim).toHaveBeenCalledTimes(2);
  db.claim.mockResolvedValue(null);
  await expect(acquireAnalysisCapacity()).rejects.toMatchObject({code: "unavailable"});
});

it("fails closed on mixed deployment capacities rather than adding permits under a second policy", async () => {
  db.claim.mockResolvedValue({_id: "analysis-capacity-v1", limit: 6, expiresAt: new Date(permit.expiresAt), permits: [{owner, expiresAt: new Date(permit.expiresAt)}]});
  await expect(acquireAnalysisCapacity()).rejects.toMatchObject({code: "configuration"});
});

it.each([{}, {_id: "analysis-capacity-v1", limit: 5, permits: [], expiresAt: new Date()}, {_id: "other"}])("rejects corrupt capacity responses", async record => {
  db.claim.mockResolvedValue(record);
  await expect(acquireAnalysisCapacity()).rejects.toMatchObject({code: "invalid_record"});
});

it("checks owner expiry with Mongo time and only releases the supplied owner's slot", async () => {
  expect(await ownsAnalysisCapacity(permit)).toBe(false);
  expect(db.find.mock.calls[0][0]).toMatchObject({_id: "analysis-capacity-v1", "permits.owner": owner});
  expect(JSON.stringify(db.find.mock.calls[0][0])).toContain("$$NOW");
  expect(await releaseAnalysisCapacity(permit)).toBe(true);
  expect(db.update.mock.calls[0][0]).toEqual({_id: "analysis-capacity-v1", "permits.owner": owner});
  expect(db.update.mock.calls[0][1]).toEqual({$pull: {permits: {owner}}});
  db.update.mockResolvedValue({acknowledged: true, modifiedCount: 0});
  expect(await releaseAnalysisCapacity(permit)).toBe(false);
});

it("rejects malformed owners before querying or releasing capacity", async () => {
  await expect(releaseAnalysisCapacity({...permit, owner: "invalid"})).rejects.toMatchObject({code: "invalid_lock"});
  expect(db.get).not.toHaveBeenCalled();
});

it.each(["connection", "index", "query", "release"])("sanitizes %s failures and never reports full capacity", async step => {
  if (step === "connection") db.get.mockRejectedValue(new StorageError("configuration"));
  if (step === "index") db.index.mockRejectedValue(new Error("private connection diagnostics"));
  if (step === "query") db.find.mockRejectedValue(new Error("private connection diagnostics"));
  if (step === "release") db.update.mockRejectedValue(new Error("private connection diagnostics"));
  const operation = step === "query" ? ownsAnalysisCapacity(permit) : step === "release" ? releaseAnalysisCapacity(permit) : acquireAnalysisCapacity();
  await expect(operation).rejects.toMatchObject({code: step === "connection" ? "configuration" : "unavailable"});
});
