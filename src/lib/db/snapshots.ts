import "server-only";

import {createHash, randomBytes, randomUUID} from "node:crypto";
import {getDatabase, dbMaxTimeMs, dbWriteConcern} from "./client";
import {fenceAnalysisCapacity, type AnalysisPermit} from "./analysis-capacity";
import {runSchema, runFilter, type AnalysisRun} from "./analysis-runs";
import {StorageError} from "./errors";
import {analysisScope, lockFilter, type AnalysisLock, type LockRecord} from "./analysis-locks";
import {readToken, reportSchema, scopeHash, snapshotId, snapshotSchema, SNAPSHOT_TTL_MS, SNAPSHOT_VERSION, type SnapshotRecord} from "./snapshot-schema";

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function makeSnapshot(input: unknown, createdAt: Date) {
  const report = reportSchema.safeParse(input);
  if (!report.success) throw new StorageError("invalid_report");
  const token = randomBytes(32).toString("hex");
  const selectedRepoIds = [...new Set(report.data.checks.filter(check => check.scope.kind === "repo").map(check => check.scope.id))].sort((a, b) => a - b);
  const parsed = snapshotSchema.safeParse({
    _id: randomUUID(), snapshotVersion: SNAPSHOT_VERSION,
    selectedRepoIds, scopeHash: scopeHash(selectedRepoIds),
    createdAt, expiresAt: new Date(createdAt.getTime() + SNAPSHOT_TTL_MS),
    readTokenHash: tokenHash(token), report: report.data,
  });
  if (!parsed.success) throw new StorageError("invalid_report");
  return {record: parsed.data, access: {id: parsed.data._id, readToken: token}};
}

export async function createSnapshot(input: unknown, lock?: AnalysisLock, permit?: AnalysisPermit, shared = false) {
  const {record, access} = makeSnapshot(input, new Date());
  if ((permit && !lock) || (shared && (!lock || !permit))) throw new StorageError("invalid_lock");
  if (lock && (lockFilter(lock)._id !== analysisScope(record.report.profile.id, record.selectedRepoIds))) throw new StorageError("invalid_lock");
  const run = shared && lock ? runSchema.safeParse({_id: lock.owner, scope: lock.key, rulesVersion: record.report.rulesVersion,
    completedAt: record.createdAt, expiresAt: new Date(lock.expiresAt), outcome: {status: "success", report: record.report}}) : null;
  if (run && !run.success) throw new StorageError("invalid_report");
  try {
    const database = await getDatabase();
    const collection = database.collection<SnapshotRecord>("analysisSnapshots");
    await collection.createIndex({expiresAt: 1}, {name: "snapshot_expiry", expireAfterSeconds: 0}, {maxTimeMS: dbMaxTimeMs, writeConcern: dbWriteConcern});
    if (run?.success) await database.collection<AnalysisRun>("analysisRuns").createIndex(
      {expiresAt: 1}, {name: "analysis_run_expiry", expireAfterSeconds: 0}, {maxTimeMS: dbMaxTimeMs, writeConcern: dbWriteConcern});
    if (lock) {
      const session = database.client.startSession();
      const deadline = Date.now() + 8_000;
      function remaining() {
        const value = deadline - Date.now();
        if (value <= 0) throw new StorageError("unavailable");
        return Math.min(value, dbMaxTimeMs);
      }
      try {
        session.startTransaction({writeConcern: dbWriteConcern, maxCommitTimeMS: dbMaxTimeMs});
        if (permit) await fenceAnalysisCapacity(database, session, permit, remaining());
        // A real write holds the lease document through snapshot commit, fencing out a newer owner.
        const owned = await database.collection<LockRecord>("requestLocks").findOneAndUpdate(lockFilter(lock),
          {$set: {writeFence: randomUUID()}}, {session, returnDocument: "after", maxTimeMS: remaining()});
        if (!owned) throw new StorageError("lock_lost");
        if (run?.success) {
          const published = await database.collection<AnalysisRun>("analysisRuns").insertOne(run.data, {session, ignoreUndefined: true, maxTimeMS: remaining()});
          if (!published.acknowledged) throw new StorageError("unavailable");
        }
        const result = await collection.insertOne(record, {session, ignoreUndefined: true, maxTimeMS: remaining()});
        if (!result.acknowledged) throw new StorageError("unavailable");
        remaining();
        await session.commitTransaction();
      } catch (error) {
        if (session.inTransaction()) await session.abortTransaction();
        throw error;
      } finally {
        await session.endSession();
      }
    } else {
      const result = await collection.insertOne(record, {ignoreUndefined: true, maxTimeMS: dbMaxTimeMs, writeConcern: dbWriteConcern});
      if (!result.acknowledged) throw new StorageError("unavailable");
    }
    return access;
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw new StorageError("unavailable");
  }
}

export async function createJoinedSnapshot(lock: AnalysisLock, rulesVersion: string) {
  const filter = runFilter(lock, rulesVersion);
  try {
    const database = await getDatabase();
    const snapshots = database.collection<SnapshotRecord>("analysisSnapshots");
    await snapshots.createIndex({expiresAt: 1}, {name: "snapshot_expiry", expireAfterSeconds: 0}, {maxTimeMS: dbMaxTimeMs, writeConcern: dbWriteConcern});
    const session = database.client.startSession();
    const deadline = Date.now() + 8_000;
    function remaining() {
      const time = deadline - Date.now();
      if (time <= 0) throw new StorageError("unavailable");
      return Math.min(time, dbMaxTimeMs);
    }
    try {
      session.startTransaction({writeConcern: dbWriteConcern, maxCommitTimeMS: dbMaxTimeMs});
      const source = await database.collection<AnalysisRun>("analysisRuns").findOne(filter, {session, maxTimeMS: remaining()});
      if (!source) throw new StorageError("lock_lost");
      const parsed = runSchema.safeParse(source);
      if (!parsed.success || parsed.data._id !== lock.owner || parsed.data.scope !== lock.key || parsed.data.rulesVersion !== rulesVersion ||
        parsed.data.expiresAt.getTime() !== Date.parse(lock.expiresAt)) throw new StorageError("invalid_record");
      const run = parsed.data;
      if (run.outcome.status !== "success") throw new StorageError("invalid_report");
      if (run.expiresAt.getTime() <= Date.now()) throw new StorageError("lock_lost");
      const {record, access} = makeSnapshot(run.outcome.report, run.completedAt);
      const inserted = await snapshots.insertOne(record, {session, ignoreUndefined: true, maxTimeMS: remaining()});
      if (!inserted.acknowledged) throw new StorageError("unavailable");
      remaining();
      await session.commitTransaction();
      return {report: record.report, ...access};
    } catch (cause) {
      if (session.inTransaction()) await session.abortTransaction();
      throw cause;
    } finally {
      await session.endSession();
    }
  } catch (cause) {
    if (cause instanceof StorageError) throw cause;
    throw new StorageError("unavailable");
  }
}

export async function readSnapshot(id: unknown, token: unknown) {
  const parsedId = snapshotId.safeParse(id);
  const parsedToken = readToken.safeParse(token);
  if (!parsedId.success || !parsedToken.success) return null;
  try {
    const collection = (await getDatabase()).collection<SnapshotRecord>("analysisSnapshots");
    const now = new Date();
    const record = await collection.findOne({_id: parsedId.data, readTokenHash: tokenHash(parsedToken.data), expiresAt: {$gt: now}}, {maxTimeMS: dbMaxTimeMs});
    if (!record) return null;
    const parsed = snapshotSchema.safeParse(record);
    if (!parsed.success) throw new StorageError("invalid_record");
    const snapshot = parsed.data;
    if (snapshot._id !== parsedId.data || snapshot.readTokenHash !== tokenHash(parsedToken.data)) throw new StorageError("invalid_record");
    if (snapshot.expiresAt.getTime() <= Date.now()) return null;
    return {
      id: snapshot._id, snapshotVersion: snapshot.snapshotVersion,
      selectedRepoIds: snapshot.selectedRepoIds, scopeHash: snapshot.scopeHash,
      createdAt: snapshot.createdAt.toISOString(), expiresAt: snapshot.expiresAt.toISOString(), report: snapshot.report,
    };
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw new StorageError("unavailable");
  }
}
