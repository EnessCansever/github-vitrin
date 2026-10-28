import "server-only";

import {createHash} from "node:crypto";
import {z} from "zod";
import type {Report} from "../../features/analysis/report";
import {loginSchema} from "../github/input";
import {repoName} from "../github/schemas";

export const SNAPSHOT_VERSION = 1;
export const SNAPSHOT_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const snapshotId = z.uuid();
export const readToken = z.string().regex(/^[a-f\d]{64}$/);
const id = z.number().int().positive().safe();
const score = z.number().min(0).max(100);
const rule = z.enum(["bio", "website", "profileReadme", "description", "topics", "demo", "image", "readme", "purpose", "install", "usage", "technology", "features"]);
const categoryId = z.enum(["profile", "projects", "readme"]);
const scope = z.discriminatedUnion("kind", [
  z.strictObject({kind: z.literal("profile"), id, name: loginSchema}),
  z.strictObject({kind: z.literal("repo"), id, name: z.string().max(140).refine(value => {
    const parts = value.split("/");
    return parts.length === 2 && loginSchema.safeParse(parts[0]).success && repoName.safeParse(parts[1]).success;
  })}),
]);
const evidence = z.strictObject({
  sourceUrl: z.string().max(4096).refine(value => {
    try {
      const url = new URL(value);
      return !/[\s\u0000-\u001f\u007f]/.test(value) && url.protocol === "https:" && url.hostname === "github.com" && !url.port && !url.username && !url.password && !url.search;
    } catch {
      return false;
    }
  }),
  field: z.enum(["bio", "website", "readme", "description", "topics", "homepage"]),
  path: z.string().min(1).max(1024).optional(),
  branch: z.string().min(1).max(255).optional(),
  sha: z.string().regex(/^[a-f\d]{40,64}$/i).optional(),
  line: z.number().int().positive().max(2_147_483_647).optional(),
  availability: z.enum(["found", "missing", "unknown"]).optional(),
  detailKey: z.string().max(64).regex(/^(?:(?:bio|website|profileReadme|description|topics|homepage|demo|image|readme|purpose|install|usage|technology|features)\.(?:pass|fail|unknown)|readme\.(?:missing|empty))$/),
});
const check = z.strictObject({
  id: z.string().max(100), rulesVersion: z.literal("1.0.0"), rule,
  category: categoryId, scope,
  status: z.enum(["pass", "fail", "unknown"]),
  earned: score.nullable(), max: z.number().positive().max(50),
  evidence: z.array(evidence).min(1).max(2), suggestionKey: rule,
});
const category = z.strictObject({
  id: categoryId, status: z.enum(["complete", "incomplete"]),
  rawScore: score.nullable(), score: score.nullable(), max: z.number().positive().max(50),
});

export const reportSchema = z.strictObject({
  rulesVersion: z.literal("1.0.0"), status: z.enum(["complete", "incomplete"]), score: score.nullable(),
  profile: z.strictObject({id, login: loginSchema}), checkedAt: z.iso.datetime(),
  repoCount: z.number().int().min(1).max(3),
  checks: z.array(check).min(13).max(33),
  categories: z.array(category).length(3),
  profileType: z.strictObject({id: z.enum(["ready", "noDemo", "hiddenGem", "inProgress"]), checkIds: z.array(z.string().max(100)).min(1).max(33)}).nullable(),
  recommendations: z.array(z.strictObject({
    checkId: z.string().max(100), target: scope, suggestionKey: rule,
    rawImpact: z.number().positive().max(50), categoryImpact: score.nullable(),
  })).max(3),
}).superRefine((report, ctx) => {
  function invalid(message: string) { ctx.addIssue({code: "custom", message}); }
  const checks = new Map(report.checks.map(value => [value.id, value]));
  const repoScopes = new Map(report.checks.filter(value => value.scope.kind === "repo").map(value => [value.scope.id, value.scope.name]));
  if (checks.size !== report.checks.length || repoScopes.size !== report.repoCount) invalid("Invalid check/repo identity");
  if (report.checks.length !== 3 + report.repoCount * 10) invalid("Incomplete check set");
  for (const value of report.checks) {
    const target = value.scope;
    const expectedCategory = ["bio", "website", "profileReadme"].includes(value.rule) ? "profile"
      : ["description", "topics", "demo", "image"].includes(value.rule) ? "projects" : "readme";
    if (value.id !== `${target.kind}:${target.id}:${value.rule}` || value.suggestionKey !== value.rule) invalid("Invalid check reference");
    if (value.category !== expectedCategory || (value.category === "profile") !== (target.kind === "profile")) invalid("Invalid check category/scope");
    if (target.kind === "profile" && (target.id !== report.profile.id || target.name !== report.profile.login)) invalid("Invalid profile scope");
    if (target.kind === "repo" && (target.name !== repoScopes.get(target.id) || target.name.split("/")[0].toLowerCase() !== report.profile.login.toLowerCase())) invalid("Invalid repo scope");
    if (value.status === "unknown" ? value.earned !== null : value.earned !== (value.status === "pass" ? value.max : 0)) invalid("Invalid check contribution");
    for (const source of value.evidence) {
      const path = URL.canParse(source.sourceUrl) ? new URL(source.sourceUrl).pathname : "";
      const base = `/${target.name}`;
      if (path !== base && !path.startsWith(`${base}/`)) invalid("Evidence outside check scope");
    }
  }
  if (new Set(report.categories.map(value => value.id)).size !== 3) invalid("Duplicate category");
  for (const value of report.categories) {
    const unknown = report.checks.some(item => item.category === value.id && item.status === "unknown");
    const max = value.id === "profile" ? 20 : value.id === "projects" ? 30 : 50;
    if (value.max !== max || (unknown ? value.status !== "incomplete" || value.score !== null || value.rawScore !== null
      : value.status !== "complete" || value.score === null || value.rawScore === null || value.score > max || value.rawScore > max)) invalid("Invalid category completeness");
  }
  const incomplete = report.categories.some(value => value.status === "incomplete");
  if (incomplete ? report.status !== "incomplete" || report.score !== null || report.profileType !== null
    : report.status !== "complete" || report.score === null || report.profileType === null) invalid("Invalid report completeness");
  if (report.score !== null && Math.abs(report.score - report.categories.reduce((sum, value) => sum + (value.score ?? 0), 0)) > 1e-8) invalid("Invalid category total");
  if (report.profileType?.checkIds.some(value => !checks.has(value))) invalid("Unknown profile type reference");
  if (new Set(report.recommendations.map(value => value.checkId)).size !== report.recommendations.length) invalid("Duplicate recommendation");
  for (const value of report.recommendations) {
    const source = checks.get(value.checkId);
    if (!source || source.status !== "fail" || value.suggestionKey !== source.suggestionKey ||
      value.target.kind !== source.scope.kind || value.target.id !== source.scope.id || value.target.name !== source.scope.name) invalid("Invalid recommendation reference");
  }
}) satisfies z.ZodType<Report>;

export function scopeHash(ids: readonly number[]): string {
  return createHash("sha256").update(JSON.stringify([...ids].sort((a, b) => a - b))).digest("hex");
}

export const snapshotSchema = z.strictObject({
  _id: snapshotId, snapshotVersion: z.literal(SNAPSHOT_VERSION),
  selectedRepoIds: z.array(id).min(1).max(3), scopeHash: z.string().regex(/^[a-f\d]{64}$/),
  createdAt: z.date(), expiresAt: z.date(), readTokenHash: z.string().regex(/^[a-f\d]{64}$/),
  report: reportSchema,
}).superRefine((snapshot, ctx) => {
  const ids = [...new Set(snapshot.report.checks.filter(value => value.scope.kind === "repo").map(value => value.scope.id))].sort((a, b) => a - b);
  if (JSON.stringify(ids) !== JSON.stringify(snapshot.selectedRepoIds) || snapshot.scopeHash !== scopeHash(ids)) {
    ctx.addIssue({code: "custom", message: "Invalid snapshot scope"});
  }
  if (snapshot.expiresAt.getTime() - snapshot.createdAt.getTime() !== SNAPSHOT_TTL_MS || Date.parse(snapshot.report.checkedAt) > snapshot.createdAt.getTime()) {
    ctx.addIssue({code: "custom", message: "Invalid snapshot dates"});
  }
});

export type SnapshotRecord = z.infer<typeof snapshotSchema>;
