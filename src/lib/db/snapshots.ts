import "server-only";

import {createHash, randomBytes, randomUUID} from "node:crypto";
import {getDatabase} from "./client";
import {StorageError} from "./errors";
import {readToken, reportSchema, scopeHash, snapshotId, snapshotSchema, SNAPSHOT_TTL_MS, SNAPSHOT_VERSION, type SnapshotRecord} from "./snapshot-schema";

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSnapshot(input: unknown) {
  const report = reportSchema.safeParse(input);
  if (!report.success) throw new StorageError("invalid_report");
  const createdAt = new Date();
  const token = randomBytes(32).toString("hex");
  const selectedRepoIds = [...new Set(report.data.checks.filter(check => check.scope.kind === "repo").map(check => check.scope.id))].sort((a, b) => a - b);
  const parsed = snapshotSchema.safeParse({
    _id: randomUUID(), snapshotVersion: SNAPSHOT_VERSION,
    selectedRepoIds, scopeHash: scopeHash(selectedRepoIds),
    createdAt, expiresAt: new Date(createdAt.getTime() + SNAPSHOT_TTL_MS),
    readTokenHash: tokenHash(token), report: report.data,
  });
  if (!parsed.success) throw new StorageError("invalid_report");
  try {
    const collection = (await getDatabase()).collection<SnapshotRecord>("analysisSnapshots");
    await collection.createIndex({expiresAt: 1}, {name: "snapshot_expiry", expireAfterSeconds: 0});
    const result = await collection.insertOne(parsed.data, {ignoreUndefined: true});
    if (!result.acknowledged) throw new StorageError("unavailable");
    return {id: parsed.data._id, readToken: token};
  } catch (error) {
    if (error instanceof StorageError) throw error;
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
    const record = await collection.findOne({_id: parsedId.data, readTokenHash: tokenHash(parsedToken.data), expiresAt: {$gt: now}});
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
