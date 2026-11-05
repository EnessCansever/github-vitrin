import "server-only";

import {createHash, randomUUID} from "node:crypto";
import {MongoServerError, type Filter} from "mongodb";
import {z} from "zod";
import {analysisLeaseMs} from "../../config/request-limits";
import {getDatabase, dbMaxTimeMs, dbWriteConcern} from "./client";
import {StorageError} from "./errors";

const id = z.number().int().positive().safe();
const scopeSchema = z.object({profileId: id, repoIds: z.array(id).min(1).max(3)
  .refine(ids => new Set(ids).size === ids.length)}).strict();
const keySchema = z.string().regex(/^[a-f\d]{64}$/);
const recordSchema = z.object({
  _id: keySchema, owner: z.uuid(), expiresAt: z.date(), writeFence: z.uuid().optional(),
}).strict();
const leaseSchema = z.object({key: keySchema, owner: z.uuid(), expiresAt: z.iso.datetime()}).strict();

export type AnalysisLock = z.infer<typeof leaseSchema>;
export type LockRecord = z.infer<typeof recordSchema>;

export function analysisScope(profileId: number, repoIds: number[]): string {
  const parsed = scopeSchema.safeParse({profileId, repoIds});
  if (!parsed.success) throw new StorageError("invalid_lock");
  return createHash("sha256").update(JSON.stringify([
    "analysis-scope-v1", parsed.data.profileId, [...parsed.data.repoIds].sort((a, b) => a - b),
  ])).digest("hex");
}

export function lockFilter(input: AnalysisLock): Filter<LockRecord> {
  const parsed = leaseSchema.safeParse(input);
  if (!parsed.success) throw new StorageError("invalid_lock");
  return {_id: parsed.data.key, owner: parsed.data.owner, expiresAt: {$type: "date"}, $expr: {$gt: ["$expiresAt", "$$NOW"]}};
}

export async function acquireAnalysisLock(key: string): Promise<
  {acquired: true; lock: AnalysisLock} | {acquired: false; retryAt: string}
> {
  if (!keySchema.safeParse(key).success) throw new StorageError("invalid_lock");
  const owner = randomUUID();
  const expired = {$lte: [{$ifNull: ["$expiresAt", new Date(0)]}, "$$NOW"]};
  const update = [{$set: {
    owner: {$cond: [expired, owner, "$owner"]},
    expiresAt: {$cond: [expired, {$add: ["$$NOW", analysisLeaseMs]}, "$expiresAt"]},
    writeFence: {$cond: [expired, "$$REMOVE", "$writeFence"]},
  }}];
  try {
    const collection = (await getDatabase()).collection<LockRecord>("requestLocks");
    await collection.createIndex({expiresAt: 1}, {name: "request_lock_expiry", expireAfterSeconds: 0}, {maxTimeMS: dbMaxTimeMs, writeConcern: dbWriteConcern});
    let record: z.infer<typeof recordSchema> | null;
    try {
      record = await collection.findOneAndUpdate({_id: key}, update, {upsert: true, returnDocument: "after", maxTimeMS: dbMaxTimeMs, writeConcern: dbWriteConcern});
    } catch (error) {
      if (!(error instanceof MongoServerError) || error.code !== 11000) throw error;
      record = await collection.findOneAndUpdate({_id: key}, update, {upsert: false, returnDocument: "after", maxTimeMS: dbMaxTimeMs, writeConcern: dbWriteConcern});
    }
    if (!record) throw new StorageError("unavailable");
    const parsed = recordSchema.safeParse(record);
    if (!parsed.success || parsed.data._id !== key) throw new StorageError("invalid_record");
    const expiresAt = parsed.data.expiresAt.toISOString();
    return parsed.data.owner === owner
      ? {acquired: true, lock: {key, owner, expiresAt}}
      : {acquired: false, retryAt: expiresAt};
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw new StorageError("unavailable");
  }
}

export async function ownsAnalysisLock(lock: AnalysisLock): Promise<boolean> {
  const filter = lockFilter(lock);
  try {
    return (await (await getDatabase()).collection<LockRecord>("requestLocks").findOne(filter, {maxTimeMS: dbMaxTimeMs})) !== null;
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw new StorageError("unavailable");
  }
}

export async function releaseAnalysisLock(lock: AnalysisLock): Promise<boolean> {
  lockFilter(lock);
  try {
    const result = await (await getDatabase()).collection<LockRecord>("requestLocks").deleteOne(
      {_id: lock.key, owner: lock.owner}, {maxTimeMS: dbMaxTimeMs, writeConcern: dbWriteConcern},
    );
    if (!result.acknowledged) throw new StorageError("unavailable");
    return result.deletedCount === 1;
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw new StorageError("unavailable");
  }
}
