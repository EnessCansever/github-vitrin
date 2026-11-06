import "server-only";

import {createHash} from "node:crypto";
import {z} from "zod";
import {analysisScope} from "./analysis-locks";
import {reportSchema, scopeHash} from "./snapshot-schema";

export const CACHE_VERSION = 1;
export const ANALYSIS_CACHE_TTL_MS = 15 * 60 * 1000;
const id = z.number().int().positive().safe();
export const cacheScope = z.strictObject({
  profileId: id,
  repoIds: z.array(id).min(1).max(3).refine(ids => new Set(ids).size === ids.length)
    .transform(ids => [...ids].sort((a, b) => a - b)),
  rulesVersion: z.string().max(64).regex(/^\d+\.\d+\.\d+$/),
});

export function cacheKey(input: z.input<typeof cacheScope>): string {
  const scope = cacheScope.parse(input);
  return createHash("sha256").update(JSON.stringify([
    "analysis-cache-v1", analysisScope(scope.profileId, scope.repoIds), scope.rulesVersion,
  ])).digest("hex");
}

export const cacheSchema = z.strictObject({
  _id: z.string().regex(/^[a-f\d]{64}$/), cacheVersion: z.literal(CACHE_VERSION),
  profileId: id, selectedRepoIds: z.array(id).min(1).max(3),
  scopeHash: z.string().regex(/^[a-f\d]{64}$/), rulesVersion: z.string().max(64),
  fetchedAt: z.date(), expiresAt: z.date(), report: reportSchema.refine(report => report.status === "complete"),
}).superRefine((record, ctx) => {
  const ids = [...new Set(record.report.checks.filter(check => check.scope.kind === "repo").map(check => check.scope.id))].sort((a, b) => a - b);
  const scope = cacheScope.safeParse({profileId: record.profileId, repoIds: ids, rulesVersion: record.rulesVersion});
  if (!scope.success) {
    ctx.addIssue({code: "custom", message: "Invalid cache scope"});
    return;
  }
  if (record.profileId !== record.report.profile.id || record.rulesVersion !== record.report.rulesVersion ||
    JSON.stringify(ids) !== JSON.stringify(record.selectedRepoIds) || record.scopeHash !== scopeHash(ids) ||
    record._id !== cacheKey(scope.data)) {
    ctx.addIssue({code: "custom", message: "Invalid cache scope"});
  }
  if (record.fetchedAt.getTime() !== Date.parse(record.report.checkedAt) ||
    record.expiresAt.getTime() - record.fetchedAt.getTime() !== ANALYSIS_CACHE_TTL_MS) {
    ctx.addIssue({code: "custom", message: "Invalid cache dates"});
  }
});

export type CacheRecord = z.infer<typeof cacheSchema>;
