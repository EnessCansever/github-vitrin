import {beforeEach, expect, it, vi} from "vitest";
import {readAnalysisCache, writeAnalysisCache} from "../../src/lib/db/analysis-cache";
import {analysisScope} from "../../src/lib/db/analysis-locks";
import {ANALYSIS_CACHE_TTL_MS, cacheKey, cacheSchema, type CacheRecord} from "../../src/lib/db/analysis-cache-schema";
import {StorageError} from "../../src/lib/db/errors";
import {reportSchema, scopeHash} from "../../src/lib/db/snapshot-schema";
import {report} from "./fixtures";

const db = vi.hoisted(() => ({get: vi.fn(), find: vi.fn(), index: vi.fn(), replace: vi.fn(), fence: vi.fn(), start: vi.fn(), commit: vi.fn(), abort: vi.fn(), end: vi.fn(), active: false}));
vi.mock("../../src/lib/db/client", async original => ({...await original<typeof import("../../src/lib/db/client")>(), getDatabase: db.get}));
const now = new Date("2026-11-07T10:00:00Z");
const scope = {profileId: 1, repoIds: [10], rulesVersion: "1.0.0"};
const lock = {key: analysisScope(1, [10]), owner: "11111111-1111-4111-8111-111111111111", expiresAt: "2026-11-07T10:00:45.000Z"};
const session = {startTransaction: db.start, commitTransaction: db.commit, abortTransaction: db.abort, endSession: db.end, inTransaction: () => db.active};

function freshReport(count = 1) {
  return reportSchema.parse({...report(count), checkedAt: now.toISOString()});
}

function record(): CacheRecord {
  return {
    _id: cacheKey(scope), cacheVersion: 1, profileId: 1, selectedRepoIds: [10],
    scopeHash: scopeHash([10]), rulesVersion: "1.0.0", fetchedAt: now,
    expiresAt: new Date(now.getTime() + ANALYSIS_CACHE_TTL_MS), report: freshReport(),
  };
}

beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(now);
  db.active = false;
  db.start.mockReset().mockImplementation(() => {db.active = true;});
  db.commit.mockReset().mockImplementation(async () => {db.active = false;});
  db.abort.mockReset().mockImplementation(async () => {db.active = false;});
  db.end.mockReset().mockResolvedValue(undefined);
  db.index.mockReset().mockResolvedValue("analysis_cache_expiry");
  db.find.mockReset().mockResolvedValue(null);
  db.replace.mockReset().mockResolvedValue({acknowledged: true});
  db.fence.mockReset().mockResolvedValue({_id: lock.key, owner: lock.owner});
  db.get.mockReset().mockResolvedValue({client: {startSession: () => session}, collection: (name: string) => {
    if (name === "requestLocks") return {findOneAndUpdate: db.fence};
    if (name === "analysisCache") return {findOne: db.find, createIndex: db.index, replaceOne: db.replace};
    throw new Error("Cache must not access another collection");
  }});
});

it("keys profile, repo set and rules version independently of order, language or access credentials", () => {
  const ids = [30, 10, 20];
  expect(cacheKey({...scope, repoIds: ids})).toBe(cacheKey({...scope, repoIds: [10, 20, 30]}));
  expect(ids).toEqual([30, 10, 20]);
  expect(cacheKey({...scope, profileId: 2})).not.toBe(cacheKey(scope));
  expect(cacheKey({...scope, repoIds: [11]})).not.toBe(cacheKey(scope));
  expect(cacheKey({...scope, rulesVersion: "1.0.1"})).not.toBe(cacheKey(scope));
});

it.each([
  {...scope, profileId: 0}, {...scope, repoIds: []}, {...scope, repoIds: [10, 10]},
  {...scope, repoIds: [1, 2, 3, 4]}, {...scope, rulesVersion: "../1"},
  {...scope, token: "not-an-access-input"},
])("rejects invalid or credential-bearing read input before DB access", async input => {
  await expect(readAnalysisCache(input)).rejects.toMatchObject({code: "invalid_report"});
  expect(db.get).not.toHaveBeenCalled();
});

it("returns a distinct miss without touching locks, snapshots or counters", async () => {
  expect(await readAnalysisCache(scope)).toEqual({status: "miss"});
  expect(db.fence).not.toHaveBeenCalled();
  expect(db.replace).not.toHaveBeenCalled();
  expect(db.index).not.toHaveBeenCalled();
});

it("returns unchanged report time, recommendations and evidence without renewing cache expiry", async () => {
  const value = record(); db.find.mockResolvedValue(value);
  vi.advanceTimersByTime(120_000);
  expect(await readAnalysisCache(scope)).toEqual({status: "hit", report: value.report, expiresAt: value.expiresAt.toISOString()});
  expect(db.find.mock.calls[0][0]).toMatchObject({_id: cacheKey(scope), $expr: {$and: [
    {$gt: ["$expiresAt", "$$NOW"]}, {$lte: ["$fetchedAt", "$$NOW"]},
  ]}});
  expect(db.replace).not.toHaveBeenCalled();
  expect(db.fence).not.toHaveBeenCalled();
});

it.each([ANALYSIS_CACHE_TTL_MS, ANALYSIS_CACHE_TTL_MS + 1])("rejects an expired record still present before TTL deletion: %s", async elapsed => {
  db.find.mockResolvedValue(record()); vi.advanceTimersByTime(elapsed);
  expect(await readAnalysisCache(scope)).toEqual({status: "miss"});
});

it("rechecks freshness after a slow read and rejects future data", async () => {
  db.find.mockImplementation(async () => {vi.advanceTimersByTime(ANALYSIS_CACHE_TTL_MS); return record();});
  expect(await readAnalysisCache(scope)).toEqual({status: "miss"});
  vi.setSystemTime(new Date(now.getTime() - 1)); db.find.mockResolvedValue(record());
  expect(await readAnalysisCache(scope)).toEqual({status: "miss"});
});

it.each([
  {...scope, profileId: 2}, {...scope, repoIds: [11]}, {...scope, rulesVersion: "1.0.1"},
])("isolates cache lookups for different identities, sets and rules", async input => {
  const cached = record();
  db.find.mockImplementation(async filter => filter._id === cached._id ? cached : null);
  expect(await readAnalysisCache(input)).toEqual({status: "miss"});
});

it("reads the same three-repo entry for either order without mutating either report or selection", async () => {
  const value = freshReport(3);
  const ids = [...new Set(value.checks.filter(check => check.scope.kind === "repo").map(check => check.scope.id))];
  const lease = {...lock, key: analysisScope(1, ids)};
  await writeAnalysisCache(value, lease);
  const stored = db.replace.mock.calls[0][1]; db.find.mockResolvedValue(stored);
  const reversed = [...ids].reverse();
  const result = await readAnalysisCache({...scope, repoIds: reversed});
  expect(result).toMatchObject({status: "hit", report: value});
  expect(reversed).toEqual([...ids].reverse());
});

it("writes only safe analysis data; cache sharing grants no stored-report credentials", async () => {
  const value = freshReport(); const original = structuredClone(value);
  await writeAnalysisCache(value, lock);
  const stored = db.replace.mock.calls[0][1];
  expect(Object.keys(stored).sort()).toEqual(["_id", "cacheVersion", "profileId", "selectedRepoIds", "scopeHash", "rulesVersion", "fetchedAt", "expiresAt", "report"].sort());
  expect(stored.report).toEqual(value);
  expect(value).toEqual(original);
  expect(stored.expiresAt.getTime() - stored.fetchedAt.getTime()).toBe(15 * 60 * 1000);
  expect(db.index).toHaveBeenCalledWith({expiresAt: 1}, {name: "analysis_cache_expiry", expireAfterSeconds: 0},
    {maxTimeMS: 4000, writeConcern: {w: "majority", wtimeoutMS: 4000}});
  expect(db.start).toHaveBeenCalledWith({writeConcern: {w: "majority", wtimeoutMS: 4000}, maxCommitTimeMS: 4000});
  expect(db.fence.mock.calls[0][0]).toMatchObject({_id: lock.key, owner: lock.owner, $expr: {$gt: ["$expiresAt", "$$NOW"]}});
  expect(db.replace.mock.calls[0][2]).toMatchObject({session, upsert: true, maxTimeMS: 4000, ignoreUndefined: true});
  expect(db.fence.mock.calls[0][2].session).toBe(session);
  expect(db.commit).toHaveBeenCalledTimes(1);
  db.find.mockResolvedValue(stored);
  expect(Object.keys(await readAnalysisCache(scope)).sort()).toEqual(["status", "report", "expiresAt"].sort());
});

it("anchors expiry to data collection rather than the later insertion time", async () => {
  vi.advanceTimersByTime(240_000);
  await writeAnalysisCache(freshReport(), lock);
  expect(db.replace.mock.calls[0][1].expiresAt).toEqual(new Date(now.getTime() + ANALYSIS_CACHE_TTL_MS));
});

it.each([
  () => ({...freshReport(), readToken: "not-stored"}),
  () => ({...freshReport(), readTokenHash: "not-stored"}),
  () => ({...freshReport(), status: "error"}),
  () => ({...report(1, true), checkedAt: now.toISOString()}),
  () => ({...freshReport(), checkedAt: new Date(now.getTime() + 1).toISOString()}),
  () => ({...freshReport(), checkedAt: new Date(now.getTime() - ANALYSIS_CACHE_TTL_MS).toISOString()}),
])("refuses incomplete, error, access-bearing or stale reports before DB access", async makeInput => {
  await expect(writeAnalysisCache(makeInput(), lock)).rejects.toMatchObject({code: "invalid_report"});
  expect(db.get).not.toHaveBeenCalled();
});

it.each([
  (value: CacheRecord) => ({...value, readTokenHash: "not-stored"}),
  (value: CacheRecord) => ({...value, cacheVersion: 2}),
  (value: CacheRecord) => ({...value, rulesVersion: "1.0.1"}),
  (value: CacheRecord) => ({...value, selectedRepoIds: [11]}),
  (value: CacheRecord) => ({...value, profileId: 2}),
  (value: CacheRecord) => ({...value, expiresAt: new Date(value.expiresAt.getTime() + 1)}),
  (value: CacheRecord) => ({...value, report: {...report(1, true), checkedAt: now.toISOString()}}),
])("rejects malformed, cross-scope or credential-bearing records on read", async change => {
  const value = change(record());
  expect(cacheSchema.safeParse(value).success).toBe(false);
  db.find.mockResolvedValue(value);
  await expect(readAnalysisCache(scope)).rejects.toMatchObject({code: "invalid_record"});
});

it("rejects a wrong scope or malformed lease before database access", async () => {
  for (const value of [{...lock, key: analysisScope(2, [10])}, {...lock, owner: "invalid"}]) {
    await expect(writeAnalysisCache(freshReport(), value)).rejects.toMatchObject({code: "invalid_lock"});
  }
  expect(db.get).not.toHaveBeenCalled();
});

it("prevents an expired or replaced owner from publishing cache data", async () => {
  db.fence.mockResolvedValue(null);
  await expect(writeAnalysisCache(freshReport(), lock)).rejects.toMatchObject({code: "lock_lost"});
  expect(db.replace).not.toHaveBeenCalled();
  expect(db.commit).not.toHaveBeenCalled();
  expect(db.abort).toHaveBeenCalledTimes(1);
  expect(db.end).toHaveBeenCalledTimes(1);
});

it.each(["fence", "replace"] as const)("does not start another write/commit once the %s phase exhausted its deadline", async step => {
  db[step].mockImplementation(async () => {vi.advanceTimersByTime(8001); return step === "fence" ? {_id: lock.key} : {acknowledged: true};});
  await expect(writeAnalysisCache(freshReport(), lock)).rejects.toMatchObject({code: "unavailable"});
  expect(db.commit).not.toHaveBeenCalled();
  if (step === "fence") expect(db.replace).not.toHaveBeenCalled();
  expect(db.abort).toHaveBeenCalledTimes(1);
});

it.each(["find", "index", "fence", "replace", "commit"] as const)("reports %s errors safely rather than a miss or success; no blind retry", async step => {
  db[step].mockRejectedValue(new Error("private URI and diagnostics"));
  const operation = step === "find" ? readAnalysisCache(scope) : writeAnalysisCache(freshReport(), lock);
  await expect(operation).rejects.toMatchObject({code: "unavailable", message: "unavailable"});
  expect(db[step]).toHaveBeenCalledTimes(1);
  if (["fence", "replace", "commit"].includes(step)) expect(db.end).toHaveBeenCalledTimes(1);
});

it("preserves configuration errors distinctly and rejects unacknowledged writes", async () => {
  db.get.mockRejectedValueOnce(new StorageError("configuration"));
  await expect(readAnalysisCache(scope)).rejects.toMatchObject({code: "configuration"});
  db.replace.mockResolvedValue({acknowledged: false});
  await expect(writeAnalysisCache(freshReport(), lock)).rejects.toMatchObject({code: "unavailable"});
  expect(db.commit).not.toHaveBeenCalled();
});
