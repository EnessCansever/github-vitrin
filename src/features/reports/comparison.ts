import type {Report} from "../analysis/report";
import type {CategoryId} from "../analysis/scoring/types";

export type Comparison = {status: "blocked"; reason: "profile" | "scope" | "rules" | "incomplete" | "same" | "order"} | {
  status: "compared";
  before: {login: string; checkedAt: string; score: number};
  after: {login: string; checkedAt: string; score: number};
  delta: number;
  categories: {id: CategoryId; before: number; after: number; delta: number}[];
  changes: {id: string; rule: Report["checks"][number]["rule"]; target: string; direction: "improved" | "regressed";
    before: Report["checks"][number]["evidence"]; after: Report["checks"][number]["evidence"]}[];
};

export function compareReports(before: Report, after: Report): Comparison {
  if (before.profile.id !== after.profile.id) return {status: "blocked", reason: "profile"};
  const repos = (report: Report) => [...new Set(report.checks.filter(check => check.scope.kind === "repo").map(check => check.scope.id))].sort((a, b) => a - b);
  if (JSON.stringify(repos(before)) !== JSON.stringify(repos(after))) return {status: "blocked", reason: "scope"};
  if (before.rulesVersion !== after.rulesVersion) return {status: "blocked", reason: "rules"};
  if (before.status !== "complete" || after.status !== "complete" || before.score === null || after.score === null) return {status: "blocked", reason: "incomplete"};
  const earlier = Date.parse(before.checkedAt), later = Date.parse(after.checkedAt);
  if (earlier === later) return {status: "blocked", reason: "same"};
  if (earlier > later) return {status: "blocked", reason: "order"};
  const difference = (a: number, b: number) => Math.round((b - a) * 10) / 10;
  const previous = new Map(before.checks.map(check => [check.id, check]));
  return {
    status: "compared",
    before: {login: before.profile.login, checkedAt: before.checkedAt, score: before.score},
    after: {login: after.profile.login, checkedAt: after.checkedAt, score: after.score},
    delta: difference(before.score, after.score),
    categories: after.categories.flatMap(category => {
      const old = before.categories.find(value => value.id === category.id);
      return old?.score !== null && old?.score !== undefined && category.score !== null
        ? [{id: category.id, before: old.score, after: category.score, delta: difference(old.score, category.score)}] : [];
    }),
    changes: after.checks.flatMap(check => {
      const old = previous.get(check.id);
      const improved = old?.status === "fail" && check.status === "pass";
      const regressed = old?.status === "pass" && check.status === "fail";
      return old && (improved || regressed) ? [{id: check.id, rule: check.rule, target: check.scope.name,
        direction: improved ? "improved" as const : "regressed" as const, before: old.evidence, after: check.evidence}] : [];
    }),
  };
}

export type ComparisonResponse = {status: "success"; comparison: Comparison} |
  {status: "missing" | "unavailable" | "configuration"} | {status: "rateLimit"; retryAt: string};
