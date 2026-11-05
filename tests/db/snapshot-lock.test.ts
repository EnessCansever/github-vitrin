import {beforeEach, expect, it, vi} from "vitest";
import {createSnapshot} from "../../src/lib/db/snapshots";
import {analysisScope} from "../../src/lib/db/analysis-locks";
import {report} from "./fixtures";

const db = vi.hoisted(() => ({get: vi.fn(), index: vi.fn(), insert: vi.fn(), fence: vi.fn(), start: vi.fn(), commit: vi.fn(), abort: vi.fn(), end: vi.fn(), active: false}));
vi.mock("../../src/lib/db/client", async original => ({...await original<typeof import("../../src/lib/db/client")>(), getDatabase: db.get}));
const lock = {key: analysisScope(1, [10]), owner: "11111111-1111-4111-8111-111111111111", expiresAt: "2026-11-05T00:00:45.000Z"};
const session = {startTransaction: db.start, commitTransaction: db.commit, abortTransaction: db.abort, endSession: db.end, inTransaction: () => db.active};

beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-05T00:00:00Z"));
  db.active = false;
  db.start.mockReset().mockImplementation(() => {db.active = true;});
  db.commit.mockReset().mockImplementation(async () => {db.active = false;});
  db.abort.mockReset().mockImplementation(async () => {db.active = false;});
  db.end.mockReset().mockResolvedValue(undefined);
  db.index.mockReset().mockResolvedValue("snapshot_expiry");
  db.insert.mockReset().mockResolvedValue({acknowledged: true});
  db.fence.mockReset().mockResolvedValue({_id: lock.key, owner: lock.owner});
  db.get.mockReset().mockResolvedValue({
    client: {startSession: () => session}, collection: (name: string) => name === "requestLocks"
      ? {findOneAndUpdate: db.fence} : {createIndex: db.index, insertOne: db.insert},
  });
});

it.each([false, true])("commits the unchanged snapshot under the same owner-fencing transaction; incomplete=%s", async incomplete => {
  const value = report(1, incomplete);
  const before = structuredClone(value);
  const access = await createSnapshot(value, lock);
  expect(access.id).toMatch(/^[a-f\d-]{36}$/);
  expect(db.start).toHaveBeenCalledWith({writeConcern: {w: "majority", wtimeoutMS: 4000}, maxCommitTimeMS: 4000});
  expect(db.fence.mock.calls[0][0]).toMatchObject({_id: lock.key, owner: lock.owner, $expr: {$gt: ["$expiresAt", "$$NOW"]}});
  expect(db.fence.mock.calls[0][1].$set.writeFence).toMatch(/^[a-f\d-]{36}$/);
  expect(db.fence.mock.calls[0][2]).toMatchObject({session, maxTimeMS: 4000});
  expect(db.insert.mock.calls[0][1]).toEqual({session, ignoreUndefined: true, maxTimeMS: 4000});
  expect(db.insert.mock.calls[0][0].report).toEqual(value);
  expect(value).toEqual(before);
  expect(db.commit).toHaveBeenCalledTimes(1);
  expect(db.abort).not.toHaveBeenCalled();
  expect(db.end).toHaveBeenCalledTimes(1);
});

it("cannot insert after lease loss or replacement and aborts the session", async () => {
  db.fence.mockResolvedValue(null);
  await expect(createSnapshot(report(), lock)).rejects.toMatchObject({code: "lock_lost"});
  expect(db.insert).not.toHaveBeenCalled();
  expect(db.commit).not.toHaveBeenCalled();
  expect(db.abort).toHaveBeenCalledTimes(1);
  expect(db.end).toHaveBeenCalledTimes(1);
});

it("rejects a lock for another profile or repo set before database access", async () => {
  await expect(createSnapshot(report(), {...lock, key: analysisScope(2, [10])})).rejects.toMatchObject({code: "invalid_lock"});
  expect(db.get).not.toHaveBeenCalled();
});

it("does not begin the insert when ownership checking exhausted the DB phase deadline", async () => {
  db.fence.mockImplementation(async () => {vi.advanceTimersByTime(8001); return {_id: lock.key};});
  await expect(createSnapshot(report(), lock)).rejects.toMatchObject({code: "unavailable"});
  expect(db.insert).not.toHaveBeenCalled();
  expect(db.commit).not.toHaveBeenCalled();
  expect(db.abort).toHaveBeenCalledTimes(1);
});

it("aborts rather than committing a snapshot after an overdue insert", async () => {
  db.insert.mockImplementation(async () => {vi.advanceTimersByTime(8001); return {acknowledged: true};});
  await expect(createSnapshot(report(), lock)).rejects.toMatchObject({code: "unavailable"});
  expect(db.commit).not.toHaveBeenCalled();
  expect(db.abort).toHaveBeenCalledTimes(1);
});

it.each(["fence", "insert", "commit"])("sanitizes transaction %s failure and always ends the session", async step => {
  db[step === "fence" ? "fence" : step === "insert" ? "insert" : "commit"].mockRejectedValue(new Error("private DB diagnostics"));
  await expect(createSnapshot(report(), lock)).rejects.toMatchObject({code: "unavailable", message: "unavailable"});
  expect(db.end).toHaveBeenCalledTimes(1);
  expect(db.start).toHaveBeenCalledTimes(1);
});
