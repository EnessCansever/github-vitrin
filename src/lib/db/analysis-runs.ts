import "server-only";

import {randomUUID} from "node:crypto";
import {z} from "zod";
import {analysisJoin, analysisLeaseMs} from "../../config/request-limits";
import {getDatabase, dbMaxTimeMs, dbWriteConcern} from "./client";
import {analysisScope, lockFilter, type AnalysisLock, type LockRecord} from "./analysis-locks";
import {reportSchema} from "./snapshot-schema";
import {StorageError} from "./errors";

const error = z.strictObject({
  status: z.literal("error"),
  code: z.enum(["invalid_input", "notFound", "empty", "network", "rateLimit", "configuration", "unavailable", "selectionChanged", "capacity", "busy", "analysisExpired"]),
  retryAt: z.iso.datetime().optional(),
});
export const runSchema = z.strictObject({
  _id: z.uuid(), scope: z.string().regex(/^[a-f\d]{64}$/), rulesVersion: z.string().max(64).regex(/^\d+\.\d+\.\d+$/),
  completedAt: z.date(), expiresAt: z.date(),
  outcome: z.discriminatedUnion("status", [z.strictObject({status: z.literal("success"), report: reportSchema}), error]),
}).superRefine((run, ctx) => {
  if (run.completedAt >= run.expiresAt) ctx.addIssue({code: "custom", message: "Expired analysis run"});
  if (run.outcome.status === "success") {
    const report = run.outcome.report;
    const ids = [...new Set(report.checks.filter(check => check.scope.kind === "repo").map(check => check.scope.id))];
    if (ids.length < 1 || ids.length > 3) {
      ctx.addIssue({code: "custom", message: "Invalid analysis run repos"});
      return;
    }
    const checkedAt = Date.parse(report.checkedAt);
    if (report.rulesVersion !== run.rulesVersion || analysisScope(report.profile.id, ids) !== run.scope ||
      checkedAt > run.completedAt.getTime() || checkedAt < run.expiresAt.getTime() - analysisLeaseMs) {
      ctx.addIssue({code: "custom", message: "Invalid analysis run scope or time"});
    }
  }
});
export type AnalysisRun = z.infer<typeof runSchema>;
export type RunError = z.infer<typeof error>;

export function runFilter(lock: AnalysisLock, rulesVersion: string) {
  lockFilter(lock);
  if (!/^\d+\.\d+\.\d+$/.test(rulesVersion) || rulesVersion.length > 64) throw new StorageError("invalid_report");
  return {_id: lock.owner, scope: lock.key, rulesVersion, expiresAt: new Date(lock.expiresAt), $expr: {$gt: ["$expiresAt", "$$NOW"]}};
}

export async function waitForAnalysis(lock: AnalysisLock, rulesVersion: string, deadline: number): Promise<AnalysisRun | null> {
  const filter = runFilter(lock, rulesVersion);
  const end = Math.min(deadline, Date.now() + analysisJoin.maxWaitMs, Date.parse(lock.expiresAt));
  try {
    const collection = (await getDatabase()).collection<AnalysisRun>("analysisRuns");
    for (let check = 0; check < analysisJoin.checks && Date.now() < end; check++) {
      const record = await collection.findOne(filter, {maxTimeMS: Math.min(dbMaxTimeMs, end - Date.now())});
      if (Date.now() >= end) return null;
      if (record) {
        const parsed = runSchema.safeParse(record);
        if (!parsed.success || parsed.data._id !== lock.owner || parsed.data.scope !== lock.key ||
          parsed.data.rulesVersion !== rulesVersion || parsed.data.expiresAt.getTime() !== Date.parse(lock.expiresAt)) throw new StorageError("invalid_record");
        return parsed.data;
      }
      if (check + 1 < analysisJoin.checks && Date.now() < end) {
        await new Promise(resolve => setTimeout(resolve, Math.min(analysisJoin.intervalMs, end - Date.now())));
      }
    }
    return null;
  } catch (cause) {
    if (cause instanceof StorageError) throw cause;
    throw new StorageError("unavailable");
  }
}

export async function failAnalysisRun(lock: AnalysisLock, rulesVersion: string, outcome: RunError): Promise<void> {
  const filter = lockFilter(lock);
  const parsed = runSchema.safeParse({_id: lock.owner, scope: lock.key, rulesVersion,
    completedAt: new Date(), expiresAt: new Date(lock.expiresAt), outcome});
  if (!parsed.success) throw new StorageError("invalid_report");
  try {
    const database = await getDatabase();
    const collection = database.collection<AnalysisRun>("analysisRuns");
    await collection.createIndex({expiresAt: 1}, {name: "analysis_run_expiry", expireAfterSeconds: 0}, {maxTimeMS: dbMaxTimeMs, writeConcern: dbWriteConcern});
    const session = database.client.startSession();
    const deadline = Date.now() + 8_000;
    function remaining() {
      const time = deadline - Date.now();
      if (time <= 0) throw new StorageError("unavailable");
      return Math.min(time, dbMaxTimeMs);
    }
    try {
      session.startTransaction({writeConcern: dbWriteConcern, maxCommitTimeMS: dbMaxTimeMs});
      const owned = await database.collection<LockRecord>("requestLocks").findOneAndUpdate(filter,
        {$set: {writeFence: randomUUID()}}, {session, returnDocument: "after", maxTimeMS: remaining()});
      if (!owned) throw new StorageError("lock_lost");
      const result = await collection.updateOne({_id: lock.owner}, {$setOnInsert: parsed.data}, {upsert: true, session, maxTimeMS: remaining(), ignoreUndefined: true});
      if (!result.acknowledged) throw new StorageError("unavailable");
      remaining();
      await session.commitTransaction();
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
