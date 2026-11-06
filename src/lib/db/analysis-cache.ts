import "server-only";

import {randomUUID} from "node:crypto";
import type {Report} from "../../features/analysis/report";
import {getDatabase, dbMaxTimeMs, dbWriteConcern} from "./client";
import {analysisScope, lockFilter, type AnalysisLock, type LockRecord} from "./analysis-locks";
import {ANALYSIS_CACHE_TTL_MS, CACHE_VERSION, cacheKey, cacheSchema, cacheScope, type CacheRecord} from "./analysis-cache-schema";
import {StorageError} from "./errors";
import {reportSchema, scopeHash} from "./snapshot-schema";

export async function readAnalysisCache(input: unknown): Promise<
  {status: "hit"; report: Report; expiresAt: string} | {status: "miss"}
> {
  const scope = cacheScope.safeParse(input);
  if (!scope.success) throw new StorageError("invalid_report");
  const key = cacheKey(scope.data);
  try {
    const collection = (await getDatabase()).collection<CacheRecord>("analysisCache");
    const record = await collection.findOne({_id: key, $expr: {$and: [
      {$gt: ["$expiresAt", "$$NOW"]}, {$lte: ["$fetchedAt", "$$NOW"]},
    ]}}, {maxTimeMS: dbMaxTimeMs});
    if (!record) return {status: "miss"};
    const parsed = cacheSchema.safeParse(record);
    if (!parsed.success || parsed.data._id !== key) throw new StorageError("invalid_record");
    const cached = parsed.data;
    const now = Date.now();
    if (cached.expiresAt.getTime() <= now || cached.fetchedAt.getTime() > now) return {status: "miss"};
    return {status: "hit", report: cached.report, expiresAt: cached.expiresAt.toISOString()};
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw new StorageError("unavailable");
  }
}

export async function writeAnalysisCache(input: unknown, lock: AnalysisLock): Promise<void> {
  const report = reportSchema.safeParse(input);
  if (!report.success || report.data.status !== "complete") throw new StorageError("invalid_report");
  const value = report.data;
  const ids = [...new Set(value.checks.filter(check => check.scope.kind === "repo").map(check => check.scope.id))].sort((a, b) => a - b);
  if (lockFilter(lock)._id !== analysisScope(value.profile.id, ids)) throw new StorageError("invalid_lock");
  const fetchedAt = new Date(value.checkedAt);
  const expiresAt = new Date(fetchedAt.getTime() + ANALYSIS_CACHE_TTL_MS);
  const now = Date.now();
  if (fetchedAt.getTime() > now || expiresAt.getTime() <= now) throw new StorageError("invalid_report");
  const parsed = cacheSchema.safeParse({
    _id: cacheKey({profileId: value.profile.id, repoIds: ids, rulesVersion: value.rulesVersion}),
    cacheVersion: CACHE_VERSION, profileId: value.profile.id, selectedRepoIds: ids,
    scopeHash: scopeHash(ids), rulesVersion: value.rulesVersion, fetchedAt, expiresAt, report: value,
  });
  if (!parsed.success) throw new StorageError("invalid_report");
  try {
    const database = await getDatabase();
    const collection = database.collection<CacheRecord>("analysisCache");
    await collection.createIndex({expiresAt: 1}, {name: "analysis_cache_expiry", expireAfterSeconds: 0},
      {maxTimeMS: dbMaxTimeMs, writeConcern: dbWriteConcern});
    const session = database.client.startSession();
    const deadline = Date.now() + 8_000;
    function remaining() {
      const time = deadline - Date.now();
      if (time <= 0) throw new StorageError("unavailable");
      return Math.min(time, dbMaxTimeMs);
    }
    try {
      session.startTransaction({writeConcern: dbWriteConcern, maxCommitTimeMS: dbMaxTimeMs});
      const owned = await database.collection<LockRecord>("requestLocks").findOneAndUpdate(lockFilter(lock),
        {$set: {writeFence: randomUUID()}}, {session, returnDocument: "after", maxTimeMS: remaining()});
      if (!owned) throw new StorageError("lock_lost");
      const result = await collection.replaceOne({_id: parsed.data._id}, parsed.data,
        {upsert: true, session, ignoreUndefined: true, maxTimeMS: remaining()});
      if (!result.acknowledged) throw new StorageError("unavailable");
      remaining();
      await session.commitTransaction();
    } catch (error) {
      if (session.inTransaction()) await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw new StorageError("unavailable");
  }
}
