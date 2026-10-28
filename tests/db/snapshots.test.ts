import {createHash} from "node:crypto";
import {BSON} from "mongodb";
import {beforeEach, expect, it, vi} from "vitest";
import {createSnapshot, readSnapshot} from "../../src/lib/db/snapshots";
import {snapshotSchema, SNAPSHOT_TTL_MS, type SnapshotRecord} from "../../src/lib/db/snapshot-schema";
import {StorageError} from "../../src/lib/db/errors";
import {report} from "./fixtures";

const db = vi.hoisted(() => ({
  get: vi.fn(), collection: vi.fn(), createIndex: vi.fn(), insertOne: vi.fn(), findOne: vi.fn(),
}));
vi.mock("../../src/lib/db/client", () => ({getDatabase: db.get}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-29T00:00:00Z"));
  db.get.mockReset().mockResolvedValue({collection: db.collection});
  db.collection.mockReset().mockReturnValue({createIndex: db.createIndex, insertOne: db.insertOne, findOne: db.findOne});
  db.createIndex.mockReset().mockResolvedValue("snapshot_expiry");
  db.insertOne.mockReset().mockResolvedValue({acknowledged: true});
  db.findOne.mockReset().mockResolvedValue(null);
});

function saved(): SnapshotRecord {
  return snapshotSchema.parse(db.insertOne.mock.calls[0][0]);
}

it.each([false, true])("round trips an immutable %s-incomplete report with separate format/rules versions", async incomplete => {
  const value = report(3, incomplete);
  const before = structuredClone(value);
  const access = await createSnapshot(value);
  const document = saved();
  expect(document.snapshotVersion).toBe(1);
  expect(document.report.rulesVersion).toBe("1.0.0");
  expect(document.selectedRepoIds).toEqual([10, 11, 12]);
  expect(document.report.checkedAt).toBe(value.checkedAt);
  expect(document.expiresAt.getTime() - document.createdAt.getTime()).toBe(SNAPSHOT_TTL_MS);
  expect(access.readToken).toMatch(/^[a-f\d]{64}$/);
  expect(document.readTokenHash).toBe(createHash("sha256").update(access.readToken).digest("hex"));
  expect(JSON.stringify(document)).not.toContain(access.readToken);
  expect(db.createIndex).toHaveBeenCalledWith({expiresAt: 1}, {name: "snapshot_expiry", expireAfterSeconds: 0});
  db.findOne.mockResolvedValue(document);
  const restored = await readSnapshot(access.id, access.readToken);
  expect(restored?.report).toEqual(value);
  expect(restored).not.toHaveProperty("readTokenHash");
  expect(value).toEqual(before);
  expect(db.collection).toHaveBeenCalledWith("analysisSnapshots");
});

it("uses new opaque identifiers for distinct snapshots without updating the old report", async () => {
  const first = await createSnapshot(report());
  const second = await createSnapshot(report());
  expect(first.id).not.toBe(second.id);
  expect(first.readToken).not.toBe(second.readToken);
  expect(db.insertOne).toHaveBeenCalledTimes(2);
});

it.each([false, true])("preserves optional evidence and real nulls through BSON serialization; incomplete=%s", async incomplete => {
  const value = report(1, incomplete);
  const access = await createSnapshot(value);
  const document = BSON.deserialize(BSON.serialize(saved(), {
    ignoreUndefined: db.insertOne.mock.calls[0][1]?.ignoreUndefined === true,
  }));
  expect(snapshotSchema.safeParse(document).success).toBe(true);
  db.findOne.mockResolvedValue(document);
  const restored = await readSnapshot(access.id, access.readToken);
  expect(restored?.report).toEqual(value);
  expect(restored?.report.checks[0].evidence[0]).not.toHaveProperty("path");
  expect(restored?.report.score === null).toBe(incomplete);
});

it("validates before any database access and rejects extra sensitive fields", async () => {
  await expect(createSnapshot({...report(), GITHUB_TOKEN: "forbidden"})).rejects.toMatchObject({code: "invalid_report"});
  expect(db.get).not.toHaveBeenCalled();
  expect(await readSnapshot("invalid", "invalid")).toBeNull();
  expect(db.get).not.toHaveBeenCalled();
});

it("requires both id and token hash and excludes expired records in the database query", async () => {
  const access = await createSnapshot(report());
  expect(await readSnapshot(access.id, "f".repeat(64))).toBeNull();
  expect(db.findOne).toHaveBeenLastCalledWith({
    _id: access.id, readTokenHash: createHash("sha256").update("f".repeat(64)).digest("hex"),
    expiresAt: {$gt: new Date()},
  });
  db.findOne.mockResolvedValue(saved());
  await expect(readSnapshot(access.id, "f".repeat(64))).rejects.toMatchObject({code: "invalid_record"});
  vi.advanceTimersByTime(SNAPSHOT_TTL_MS);
  expect(await readSnapshot(access.id, access.readToken)).toBeNull();
});

it.each([
  {snapshotVersion: 2}, {selectedRepoIds: [11]}, {scopeHash: "a".repeat(64)},
  {expiresAt: new Date("2026-11-30T00:00:00Z")}, {rawReadme: "forbidden"},
])("rejects invalid persisted records on read: %j", async patch => {
  const access = await createSnapshot(report());
  db.findOne.mockResolvedValue({...saved(), ...patch});
  await expect(readSnapshot(access.id, access.readToken)).rejects.toMatchObject({code: "invalid_record", message: "invalid_record"});
});

it("does not return a record that expires while the database read is pending", async () => {
  const access = await createSnapshot(report());
  const document = saved();
  db.findOne.mockImplementationOnce(async () => {
    vi.advanceTimersByTime(SNAPSHOT_TTL_MS);
    return document;
  });
  expect(await readSnapshot(access.id, access.readToken)).toBeNull();
});

it("rejects a corrupted nested report instead of recalculating or returning it", async () => {
  const access = await createSnapshot(report());
  const document = saved();
  document.report.score = 101;
  db.findOne.mockResolvedValue(document);
  await expect(readSnapshot(access.id, access.readToken)).rejects.toMatchObject({code: "invalid_record"});
});

it.each(["connect", "index", "insert", "read", "unacknowledged"])("sanitizes %s failures without exposing connection details", async step => {
  const raw = new Error("mongodb://test-user:test-password@invalid.invalid/private internal database error");
  const access = await createSnapshot(report());
  if (step === "connect") db.get.mockRejectedValue(raw);
  if (step === "index") db.createIndex.mockRejectedValue(raw);
  if (step === "insert") db.insertOne.mockRejectedValue(raw);
  if (step === "read") db.findOne.mockRejectedValue(raw);
  if (step === "unacknowledged") db.insertOne.mockResolvedValue({acknowledged: false});
  const action = step === "read" ? readSnapshot(access.id, access.readToken) : createSnapshot(report());
  await expect(action).rejects.toMatchObject({code: "unavailable", message: "unavailable"});
  expect(db.insertOne).toHaveBeenCalledTimes(step === "index" || step === "connect" || step === "read" ? 1 : 2);
});

it("preserves a safe configuration failure and does not pretend a write succeeded", async () => {
  db.get.mockRejectedValue(new StorageError("configuration"));
  await expect(createSnapshot(report())).rejects.toMatchObject({code: "configuration"});
  expect(db.insertOne).not.toHaveBeenCalled();
});
