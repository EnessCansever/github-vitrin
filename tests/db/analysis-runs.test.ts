import {beforeEach, expect, it, vi} from "vitest";
import {waitForAnalysis, failAnalysisRun, runSchema, type AnalysisRun} from "../../src/lib/db/analysis-runs";
import {createSnapshot, createJoinedSnapshot} from "../../src/lib/db/snapshots";
import {analysisScope} from "../../src/lib/db/analysis-locks";
import {analysisJoin, analysisLeaseMs} from "../../src/config/request-limits";
import {reportSchema} from "../../src/lib/db/snapshot-schema";
import {StorageError} from "../../src/lib/db/errors";
import {report} from "./fixtures";

const db = vi.hoisted(() => ({get: vi.fn(), index: vi.fn(), find: vi.fn(), fence: vi.fn(), insert: vi.fn(), runInsert: vi.fn(), update: vi.fn(), capacity: vi.fn(), start: vi.fn(), commit: vi.fn(), abort: vi.fn(), end: vi.fn(), active: false}));
vi.mock("../../src/lib/db/client", async original => ({...await original<typeof import("../../src/lib/db/client")>(), getDatabase: db.get}));
const lock = {key: analysisScope(1, [10]), owner: "11111111-1111-4111-8111-111111111111", expiresAt: "2026-11-07T00:00:45.000Z"};
const permit = {owner: "22222222-2222-4222-8222-222222222222", expiresAt: lock.expiresAt};
const session = {startTransaction: db.start, commitTransaction: db.commit, abortTransaction: db.abort, endSession: db.end, inTransaction: () => db.active};
function run(incomplete = false): AnalysisRun {
  return {_id: lock.owner, scope: lock.key, rulesVersion: "1.0.0", completedAt: new Date(), expiresAt: new Date(lock.expiresAt),
    outcome: {status: "success", report: reportSchema.parse({...report(1, incomplete), checkedAt: new Date().toISOString()})}};
}
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-07T00:00:00Z")); db.active = false;
  db.start.mockReset().mockImplementation(() => {db.active = true;});
  db.commit.mockReset().mockImplementation(async () => {db.active = false;});
  db.abort.mockReset().mockImplementation(async () => {db.active = false;}); db.end.mockReset().mockResolvedValue(undefined);
  for (const name of ["index", "insert", "runInsert", "update"] as const) db[name].mockReset().mockResolvedValue({acknowledged: true});
  db.find.mockReset().mockResolvedValue(null);
  db.fence.mockReset().mockResolvedValue(lock); db.capacity.mockReset().mockResolvedValue({acknowledged: true, matchedCount: 1});
  db.get.mockReset().mockResolvedValue({client: {startSession: () => session}, collection: (name: string) => {
    if (name === "requestLocks") return {findOneAndUpdate: db.fence};
    if (name === "analysisCapacity") return {updateOne: db.capacity};
    if (name === "analysisRuns") return {createIndex: db.index, findOne: db.find, insertOne: db.runInsert, updateOne: db.update};
    if (name === "analysisSnapshots") return {createIndex: db.index, insertOne: db.insert};
    throw new Error("Unexpected collection");
  }});
});

it.each([false, true])("publishes a tokenless outcome and leader snapshot atomically; incomplete=%s", async incomplete => {
  const value = run(incomplete);
  const saved = await createSnapshot(value.outcome.status === "success" ? value.outcome.report : null, lock, permit, true);
  expect(db.runInsert.mock.calls[0][0]).toEqual(value);
  expect(db.runInsert.mock.calls[0][1].session).toBe(session);
  expect(db.insert.mock.calls[0][1].session).toBe(session);
  expect(JSON.stringify(db.runInsert.mock.calls[0][0])).not.toContain(saved.readToken);
  expect(Object.keys(value).sort()).toEqual(["_id", "scope", "rulesVersion", "completedAt", "expiresAt", "outcome"].sort());
  expect(db.capacity.mock.invocationCallOrder[0]).toBeLessThan(db.fence.mock.invocationCallOrder[0]);
  expect(db.commit).toHaveBeenCalledTimes(1);
});

it.each([false, true])("gives joined callers distinct access with the original data time and snapshot expiry; incomplete=%s", async incomplete => {
  const value = run(incomplete); db.find.mockResolvedValue(value);
  vi.advanceTimersByTime(2000);
  const first = await createJoinedSnapshot(lock, "1.0.0"), second = await createJoinedSnapshot(lock, "1.0.0");
  expect(first.id).not.toBe(second.id); expect(first.readToken).not.toBe(second.readToken);
  expect(first.report).toEqual(value.outcome.status === "success" ? value.outcome.report : null);
  expect(db.insert.mock.calls[0][0].createdAt).toEqual(value.completedAt);
  expect(db.insert.mock.calls[0][0].expiresAt).toEqual(db.insert.mock.calls[1][0].expiresAt);
  expect(db.capacity).not.toHaveBeenCalled(); expect(db.fence).not.toHaveBeenCalled();
  expect(db.find.mock.calls[0][0]).toMatchObject({_id: lock.owner, scope: lock.key, rulesVersion: "1.0.0", expiresAt: new Date(lock.expiresAt)});
});

it("waits for the exact operation and preserves its result time without reading analysisCache", async () => {
  const value = run(); db.find.mockResolvedValueOnce(null).mockResolvedValue(value);
  const result = waitForAnalysis(lock, "1.0.0", Date.now() + 20000);
  await vi.advanceTimersByTimeAsync(1000);
  expect(await result).toEqual(value); expect(db.find).toHaveBeenCalledTimes(2);
});

it.each(["owner", "scope", "version", "expiry"])("rejects a stale or mismatched %s outcome even if the database returns it", async field => {
  const value = run();
  if (field === "owner") value._id = permit.owner;
  if (field === "scope") value.scope = analysisScope(2, [10]);
  if (field === "version") value.rulesVersion = "2.0.0";
  if (field === "expiry") value.expiresAt = new Date(Date.parse(lock.expiresAt) + 1);
  db.find.mockResolvedValue(value);
  await expect(waitForAnalysis(lock, "1.0.0", Date.now() + 20000)).rejects.toMatchObject({code: "invalid_record"});
});

it("does not accept old report data as a result of the current lease", () => {
  const value = run();
  if (value.outcome.status !== "success") throw new Error("Expected report");
  value.outcome.report.checkedAt = new Date(Date.parse(lock.expiresAt) - analysisLeaseMs - 1).toISOString();
  expect(runSchema.safeParse(value).success).toBe(false);
});

it("bounds pending reads and total wait, including a tighter request deadline", async () => {
  const full = waitForAnalysis(lock, "1.0.0", Date.now() + 20000);
  await vi.advanceTimersByTimeAsync(analysisJoin.maxWaitMs);
  expect(await full).toBeNull(); expect(db.find.mock.calls.length).toBeLessThanOrEqual(analysisJoin.checks);
  db.find.mockClear();
  const short = waitForAnalysis(lock, "1.0.0", Date.now() + 500);
  await vi.advanceTimersByTimeAsync(500);
  expect(await short).toBeNull(); expect(db.find).toHaveBeenCalledTimes(1);
});

it("does not even query after lease expiry and rejects an expired joined snapshot source", async () => {
  vi.advanceTimersByTime(45001);
  expect(await waitForAnalysis(lock, "1.0.0", Date.now() + 20000)).toBeNull();
  expect(db.find).not.toHaveBeenCalled();
  db.find.mockResolvedValue(null);
  await expect(createJoinedSnapshot(lock, "1.0.0")).rejects.toMatchObject({code: "lock_lost"});
  expect(db.insert).not.toHaveBeenCalled();
});

it("returns a leader's safe error without reinterpreting it as a cache miss", async () => {
  const value = {...run(), outcome: {status: "error", code: "network"}};
  db.find.mockResolvedValue(value);
  expect(await waitForAnalysis(lock, "1.0.0", Date.now() + 20000)).toEqual(value);
});

it("records leader failure behind the owner fence, without overwriting an already committed outcome", async () => {
  await failAnalysisRun(lock, "1.0.0", {status: "error", code: "network"});
  expect(db.update.mock.calls[0][1]).toEqual({$setOnInsert: expect.objectContaining({_id: lock.owner, outcome: {status: "error", code: "network"}})});
  db.fence.mockResolvedValue(null);
  await expect(failAnalysisRun(lock, "1.0.0", {status: "error", code: "network"})).rejects.toMatchObject({code: "lock_lost"});
  expect(db.update).toHaveBeenCalledTimes(1);
});

it("sanitizes read/write errors and cannot publish success if either atomic insert failed", async () => {
  db.find.mockRejectedValue(new Error("private URI"));
  await expect(waitForAnalysis(lock, "1.0.0", Date.now() + 20000)).rejects.toMatchObject({code: "unavailable", message: "unavailable"});
  db.insert.mockRejectedValue(new Error("private URI"));
  await expect(createSnapshot({...report(), checkedAt: new Date().toISOString()}, lock, permit, true)).rejects.toMatchObject({code: "unavailable"});
  expect(db.abort).toHaveBeenCalledTimes(1); expect(db.commit).not.toHaveBeenCalled();
  db.get.mockRejectedValue(new StorageError("configuration"));
  await expect(waitForAnalysis(lock, "1.0.0", Date.now() + 20000)).rejects.toMatchObject({code: "configuration"});
});
