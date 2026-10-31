import "server-only";

import {MongoServerError} from "mongodb";
import {z} from "zod";
import {getDatabase} from "./client";
import {StorageError} from "./errors";

const positiveInteger = z.number().int().min(1).max(Number.MAX_SAFE_INTEGER);
const keySchema = z.string().regex(/^[a-f\d]{64}$/);
const inputSchema = z.object({key: keySchema, limit: positiveInteger, windowMs: positiveInteger}).strict();
const recordSchema = z.object({
  _id: keySchema, limit: positiveInteger, windowMs: positiveInteger,
  count: positiveInteger, expiresAt: z.date(), allowed: z.boolean(),
}).strict();

export type RateLimitResult =
  | {allowed: true; remaining: number; resetAt: string; retryAt: null}
  | {allowed: false; remaining: 0; resetAt: string; retryAt: string};

export async function consumeRateLimit(input: unknown): Promise<RateLimitResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success || !Number.isFinite(new Date(Date.now() + parsed.data.windowMs).getTime())) {
    throw new StorageError("invalid_limit");
  }
  const {key, limit, windowMs} = parsed.data;
  const expired = {$lte: [{$ifNull: ["$expiresAt", new Date(0)]}, "$$NOW"]};
  const update = [
    {$set: {
      allowed: {$or: [expired, {$and: [
        {$eq: ["$limit", limit]}, {$eq: ["$windowMs", windowMs]}, {$lt: ["$count", limit]},
      ]}]},
      count: {$cond: [expired, 0, "$count"]},
      limit: {$cond: [expired, limit, "$limit"]},
      windowMs: {$cond: [expired, windowMs, "$windowMs"]},
      expiresAt: {$cond: [expired, {$add: ["$$NOW", windowMs]}, "$expiresAt"]},
    }},
    {$set: {count: {$cond: ["$allowed", {$add: ["$count", 1]}, "$count"]}}},
  ];
  try {
    const collection = (await getDatabase()).collection<z.infer<typeof recordSchema>>("rateLimits");
    await collection.createIndex({expiresAt: 1}, {name: "rate_limit_expiry", expireAfterSeconds: 0});
    let record: z.infer<typeof recordSchema> | null;
    try {
      record = await collection.findOneAndUpdate({_id: key}, update, {upsert: true, returnDocument: "after", writeConcern: {w: "majority"}});
    } catch (error) {
      if (!(error instanceof MongoServerError) || error.code !== 11000) throw error;
      // A competing upsert created the unique key; consume against that record once.
      record = await collection.findOneAndUpdate({_id: key}, update, {upsert: false, returnDocument: "after", writeConcern: {w: "majority"}});
    }
    if (!record) throw new StorageError("unavailable");
    const result = recordSchema.safeParse(record);
    if (!result.success || result.data._id !== key) throw new StorageError("invalid_record");
    const value = result.data;
    if (value.limit !== limit || value.windowMs !== windowMs) throw new StorageError("invalid_limit");
    if (value.count > limit || (!value.allowed && value.count !== limit)) throw new StorageError("invalid_record");
    const resetAt = value.expiresAt.toISOString();
    return value.allowed
      ? {allowed: true, remaining: limit - value.count, resetAt, retryAt: null}
      : {allowed: false, remaining: 0, resetAt, retryAt: resetAt};
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw new StorageError("unavailable");
  }
}
