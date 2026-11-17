import "server-only";

import {z} from "zod";
import {reportSchema} from "./snapshot-schema";
import type {ShareSummary} from "../../features/shares/types";

export const SHARE_TTL_MS = 90 * 24 * 60 * 60 * 1000;
export const shareId = z.string().regex(/^[a-f\d]{48}$/);
export const managementToken = z.string().regex(/^[a-f\d]{64}$/);
const points = z.number().min(0).max(100);
const rule = z.enum(["bio", "website", "profileReadme", "description", "topics", "demo", "image", "readme", "purpose", "install", "usage", "technology", "features"]);
export const shareSummarySchema = z.strictObject({
  profile: z.strictObject({login: z.string().regex(/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i)}),
  repos: z.array(z.string().min(1).max(140)).min(1).max(3),
  checkedAt: z.iso.datetime(), rulesVersion: z.literal("1.0.0"), status: z.enum(["complete", "incomplete"]), score: points.nullable(),
  profileType: z.enum(["ready", "noDemo", "hiddenGem", "inProgress"]).nullable(),
  categories: z.array(z.strictObject({id: z.enum(["profile", "projects", "readme"]), score: points.nullable(), max: z.number().positive().max(50)})).length(3),
  firstTask: z.strictObject({suggestionKey: rule, target: z.strictObject({kind: z.enum(["profile", "repo"]), name: z.string().min(1).max(140)}), impact: points.nullable()}).nullable(),
}).superRefine((summary, ctx) => {
  const invalid = () => ctx.addIssue({code: "custom", message: "Invalid share summary"});
  if (new Set(summary.repos).size !== summary.repos.length) invalid();
  if (new Set(summary.categories.map(value => value.id)).size !== 3) invalid();
  for (const category of summary.categories) {
    if (category.max !== (category.id === "profile" ? 20 : category.id === "projects" ? 30 : 50) || (category.score !== null && category.score > category.max)) invalid();
  }
  if (summary.status === "complete") {
    if (summary.score === null || summary.profileType === null || summary.categories.some(value => value.score === null) ||
      Math.abs((summary.score ?? 0) - summary.categories.reduce((sum, value) => sum + (value.score ?? 0), 0)) > 1e-8) invalid();
  } else if (summary.score !== null || summary.profileType !== null || !summary.categories.some(value => value.score === null)) invalid();
}) satisfies z.ZodType<ShareSummary>;

export function shareSummary(input: unknown): ShareSummary {
  const report = reportSchema.parse(input);
  const task = report.recommendations[0];
  return shareSummarySchema.parse({
    repos: [...new Set(report.checks.filter(check => check.scope.kind === "repo").map(check => check.scope.name))],
    profile: {login: report.profile.login}, checkedAt: report.checkedAt, rulesVersion: report.rulesVersion,
    status: report.status, score: report.score, profileType: report.profileType?.id ?? null,
    categories: report.categories.map(({id, score, max}) => ({id, score, max})),
    firstTask: task ? {suggestionKey: task.suggestionKey, target: {kind: task.target.kind, name: task.target.name}, impact: task.categoryImpact} : null,
  });
}

export const shareRecordSchema = z.strictObject({
  _id: shareId, shareVersion: z.literal(1), createdAt: z.date(), expiresAt: z.date(), closedAt: z.date().nullable(),
  managementHash: z.string().regex(/^[a-f\d]{64}$/), summary: shareSummarySchema,
}).superRefine((value, ctx) => {
  if (value.expiresAt.getTime() - value.createdAt.getTime() !== SHARE_TTL_MS || Date.parse(value.summary.checkedAt) > value.createdAt.getTime() ||
    (value.closedAt && value.closedAt < value.createdAt)) ctx.addIssue({code: "custom", message: "Invalid share dates"});
});
export type ShareRecord = z.infer<typeof shareRecordSchema>;
