import "server-only";

import {randomUUID} from "node:crypto";
import {MongoServerError, type ClientSession, type Db, type Filter} from "mongodb";
import {z} from "zod";
import {analysisLeaseMs, analysisCapacityLimit} from "../../config/request-limits";
import {getDatabase, dbMaxTimeMs, dbWriteConcern} from "./client";
import {StorageError} from "./errors";

const poolId = "analysis-capacity-v1";
const permitSchema = z.strictObject({owner: z.uuid(), expiresAt: z.iso.datetime()});
export type AnalysisPermit = z.infer<typeof permitSchema>;
const recordSchema = z.strictObject({
  _id: z.literal(poolId), limit: z.number().int().positive().safe(), expiresAt: z.date(),
  permits: z.array(z.strictObject({owner: z.uuid(), expiresAt: z.date(), writeFence: z.uuid().optional()})),
}).refine(record => record.permits.length <= record.limit && new Set(record.permits.map(permit => permit.owner)).size === record.permits.length);

type CapacityRecord = z.infer<typeof recordSchema>;

function permitFilter(permit: AnalysisPermit): Filter<CapacityRecord> {
  if (!permitSchema.safeParse(permit).success) throw new StorageError("invalid_lock");
  return {_id: poolId, "permits.owner": permit.owner, $expr: {$anyElementTrue: {$map: {
    input: "$permits", as: "permit", in: {$and: [
      {$eq: ["$$permit.owner", permit.owner]}, {$gt: ["$$permit.expiresAt", "$$NOW"]},
    ]},
  }}}};
}

export async function acquireAnalysisCapacity(): Promise<
  {acquired: true; permit: AnalysisPermit} | {acquired: false; retryAt: string}
> {
  if (!Number.isSafeInteger(analysisCapacityLimit) || analysisCapacityLimit < 1) throw new StorageError("configuration");
  const owner = randomUUID();
  const compatible = {$or: [{$eq: [{$size: "$permits"}, 0]}, {$eq: ["$limit", analysisCapacityLimit]}]};
  const update = [
    {$set: {permits: {$filter: {input: {$ifNull: ["$permits", []]}, as: "permit", cond: {$gt: ["$$permit.expiresAt", "$$NOW"]}}}}},
    {$set: {
      limit: {$cond: [{$eq: [{$size: "$permits"}, 0]}, analysisCapacityLimit, "$limit"]},
      permits: {$cond: [{$and: [compatible, {$lt: [{$size: "$permits"}, analysisCapacityLimit]}]},
        {$concatArrays: ["$permits", [{owner, expiresAt: {$add: ["$$NOW", analysisLeaseMs]}}]]}, "$permits"]},
    }},
    {$set: {expiresAt: {$max: "$permits.expiresAt"}}},
  ];
  try {
    const collection = (await getDatabase()).collection<z.infer<typeof recordSchema>>("analysisCapacity");
    await collection.createIndex({expiresAt: 1}, {name: "analysis_capacity_expiry", expireAfterSeconds: 0},
      {maxTimeMS: dbMaxTimeMs, writeConcern: dbWriteConcern});
    let record;
    try {
      record = await collection.findOneAndUpdate({_id: poolId}, update,
        {upsert: true, returnDocument: "after", maxTimeMS: dbMaxTimeMs, writeConcern: dbWriteConcern});
    } catch (error) {
      if (!(error instanceof MongoServerError) || error.code !== 11000) throw error;
      record = await collection.findOneAndUpdate({_id: poolId}, update,
        {upsert: false, returnDocument: "after", maxTimeMS: dbMaxTimeMs, writeConcern: dbWriteConcern});
    }
    if (!record) throw new StorageError("unavailable");
    const parsed = recordSchema.safeParse(record);
    if (!parsed.success || parsed.data.permits.length === 0) throw new StorageError("invalid_record");
    if (parsed.data.limit !== analysisCapacityLimit) throw new StorageError("configuration");
    const permit = parsed.data.permits.find(value => value.owner === owner);
    return permit ? {acquired: true, permit: {owner, expiresAt: permit.expiresAt.toISOString()}}
      : {acquired: false, retryAt: new Date(Math.min(...parsed.data.permits.map(value => value.expiresAt.getTime()))).toISOString()};
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw new StorageError("unavailable");
  }
}

export async function ownsAnalysisCapacity(permit: AnalysisPermit): Promise<boolean> {
  const filter = permitFilter(permit);
  try {
    return (await (await getDatabase()).collection<CapacityRecord>("analysisCapacity").findOne(filter, {maxTimeMS: dbMaxTimeMs})) !== null;
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw new StorageError("unavailable");
  }
}

export async function fenceAnalysisCapacity(database: Db, session: ClientSession, permit: AnalysisPermit, maxTimeMS: number): Promise<void> {
  const filter = permitFilter(permit);
  // Hold the shared capacity document through commit so a replacement cannot race an old writer.
  const result = await database.collection<CapacityRecord>("analysisCapacity").updateOne(filter,
    {$set: {"permits.$.writeFence": randomUUID()}}, {session, maxTimeMS});
  if (!result.acknowledged || result.matchedCount !== 1) throw new StorageError("lock_lost");
}

export async function releaseAnalysisCapacity(permit: AnalysisPermit): Promise<boolean> {
  permitFilter(permit);
  try {
    const result = await (await getDatabase()).collection<CapacityRecord>("analysisCapacity").updateOne(
      {_id: poolId, "permits.owner": permit.owner}, {$pull: {permits: {owner: permit.owner}}},
      {maxTimeMS: dbMaxTimeMs, writeConcern: dbWriteConcern});
    if (!result.acknowledged) throw new StorageError("unavailable");
    return result.modifiedCount === 1;
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw new StorageError("unavailable");
  }
}
