import "server-only";

import {createHash, randomBytes} from "node:crypto";
import {getDatabase, dbMaxTimeMs, dbWriteConcern} from "./client";
import {StorageError} from "./errors";
import {managementToken, shareId, shareRecordSchema, shareSummary, SHARE_TTL_MS, type ShareRecord} from "./share-schema";
import type {PublicShare, ShareAccess} from "../../features/shares/types";

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createShare(input: unknown): Promise<ShareAccess> {
  let summary;
  try {summary = shareSummary(input);} catch {throw new StorageError("invalid_report");}
  const createdAt = new Date();
  const token = randomBytes(32).toString("hex");
  const parsed = shareRecordSchema.safeParse({
    _id: randomBytes(24).toString("hex"), shareVersion: 1, createdAt, expiresAt: new Date(createdAt.getTime() + SHARE_TTL_MS),
    closedAt: null, managementHash: tokenHash(token), summary,
  });
  if (!parsed.success) throw new StorageError("invalid_report");
  try {
    const collection = (await getDatabase()).collection<ShareRecord>("shareReports");
    await collection.createIndex({expiresAt: 1}, {name: "share_expiry", expireAfterSeconds: 0}, {maxTimeMS: dbMaxTimeMs, writeConcern: dbWriteConcern});
    const inserted = await collection.insertOne(parsed.data, {maxTimeMS: dbMaxTimeMs, writeConcern: dbWriteConcern, ignoreUndefined: true});
    if (!inserted.acknowledged) throw new StorageError("unavailable");
    return {id: parsed.data._id, managementToken: token, expiresAt: parsed.data.expiresAt.toISOString()};
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw new StorageError("unavailable");
  }
}

export async function readShare(id: unknown): Promise<PublicShare | null> {
  const parsedId = shareId.safeParse(id);
  if (!parsedId.success) return null;
  try {
    const collection = (await getDatabase()).collection<ShareRecord>("shareReports");
    const record = await collection.findOne({_id: parsedId.data, closedAt: null, expiresAt: {$gt: new Date()}}, {maxTimeMS: dbMaxTimeMs});
    if (!record) return null;
    const parsed = shareRecordSchema.safeParse(record);
    if (!parsed.success || parsed.data._id !== parsedId.data) throw new StorageError("invalid_record");
    const share = parsed.data;
    if (share.closedAt || share.expiresAt.getTime() <= Date.now()) return null;
    return {id: share._id, createdAt: share.createdAt.toISOString(), expiresAt: share.expiresAt.toISOString(), summary: share.summary};
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw new StorageError("unavailable");
  }
}


export async function manageShare(id: unknown, token: unknown, action: "close" | "delete"): Promise<boolean> {
  const parsedId = shareId.safeParse(id), parsedToken = managementToken.safeParse(token);
  if (!parsedId.success || !parsedToken.success) return false;
  try {
    const collection = (await getDatabase()).collection<ShareRecord>("shareReports");
    const filter = {_id: parsedId.data, managementHash: tokenHash(parsedToken.data)};
    if (action === "delete") {
      const result = await collection.deleteOne(filter, {maxTimeMS: dbMaxTimeMs, writeConcern: dbWriteConcern});
      if (!result.acknowledged) throw new StorageError("unavailable");
      return result.deletedCount === 1;
    }
    // Preserve the original closure time on repeated requests; there is no reopen operation.
    const result = await collection.updateOne(filter, [{$set: {closedAt: {$ifNull: ["$closedAt", "$$NOW"]}}}],
      {maxTimeMS: dbMaxTimeMs, writeConcern: dbWriteConcern});
    if (!result.acknowledged) throw new StorageError("unavailable");
    return result.matchedCount === 1;
  } catch (error) {
    if (error instanceof StorageError) throw error;
    throw new StorageError("unavailable");
  }
}
