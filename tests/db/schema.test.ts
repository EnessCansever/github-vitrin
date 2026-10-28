import {expect, it} from "vitest";
import {reportSchema, scopeHash} from "../../src/lib/db/snapshot-schema";
import {report} from "./fixtures";
import tr from "../../src/messages/tr.json";
import en from "../../src/messages/en.json";

it.each([1, 3])("preserves the current %i-repo report without changing score, evidence or recommendation order", count => {
  const value = report(count);
  const before = structuredClone(value);
  expect(reportSchema.parse(value)).toEqual(value);
  expect(value).toEqual(before);
});

it("preserves incomplete null scores and known findings", () => {
  const value = reportSchema.parse(report(3, true));
  expect(value.status).toBe("incomplete");
  expect(value.score).toBeNull();
  expect(value.profileType).toBeNull();
  expect(value.categories.find(category => category.id === "profile")?.score).toBe(20);
  expect(value.checks.find(check => check.rule === "description")?.status).toBe("fail");
  expect(value.checks.find(check => check.rule === "install")?.earned).toBeNull();
});

it.each([
  {token: "forbidden"}, {readme: "forbidden"}, {locale: "tr"}, {score: 101},
  {rulesVersion: "2.0.0"}, {repoCount: 0}, {profileType: null}, {status: "incomplete"},
])("rejects unsupported or inconsistent report fields: %j", patch => {
  expect(reportSchema.safeParse({...report(), ...patch}).success).toBe(false);
});

it("rejects raw excerpts and unsafe source URLs even inside evidence", () => {
  const value = report();
  const source = value.checks[0].evidence[0];
  for (const patch of [{excerpt: "raw content"}, {sourceUrl: "https://example.org"},
    {sourceUrl: "https://user:password@github.com/mira-sample"}, {sourceUrl: "https://github.com/another-user"},
    {sourceUrl: "https://github.com/mira-sample/../another-user"}, {sourceUrl: "not a URL"}]) {
    value.checks[0].evidence[0] = {...source, ...patch};
    expect(reportSchema.safeParse(value).success).toBe(false);
  }
});

it("rejects duplicate/missing checks and mismatched references or category totals", () => {
  const value = report();
  expect(reportSchema.safeParse({...value, checks: value.checks.slice(1)}).success).toBe(false);
  expect(reportSchema.safeParse({...value, checks: value.checks.map((check, index) => index === 1 ? value.checks[0] : check)}).success).toBe(false);
  expect(reportSchema.safeParse({...value, score: value.score! - 1}).success).toBe(false);
  value.recommendations[0].checkId = value.checks.find(check => check.status === "pass")!.id;
  expect(reportSchema.safeParse(value).success).toBe(false);
});

it("rejects fake complete scores when underlying checks are unknown", () => {
  const value = report(1, true);
  expect(reportSchema.safeParse({...value, status: "complete", score: 20}).success).toBe(false);
  value.checks.find(check => check.status === "unknown")!.earned = 0;
  expect(reportSchema.safeParse(value).success).toBe(false);
});

it("keeps locale-independent message keys and their scope parameters usable in both languages", () => {
  const value = reportSchema.parse(report());
  for (const messages of [tr, en]) {
    for (const check of value.checks) {
      const [rule, status] = check.evidence[0].detailKey.split(".");
      expect(messages.Scoring.evidence).toHaveProperty(`${rule}.${status}`);
      expect(messages.Scoring.suggestions).toHaveProperty(check.suggestionKey);
    }
    expect(value.recommendations[0].target.name).toBe("mira-sample/project-10");
  }
});

it("hashes the repository set independently of selection order", () => {
  expect(scopeHash([11, 10])).toBe(scopeHash([10, 11]));
  expect(scopeHash([10])).not.toBe(scopeHash([10, 11]));
});
