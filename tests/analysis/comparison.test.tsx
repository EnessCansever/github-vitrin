import {renderToStaticMarkup} from "react-dom/server";
import {NextIntlClientProvider} from "next-intl";
import {beforeEach, expect, it, vi} from "vitest";
import {compareReports} from "../../src/features/reports/comparison";
import {ComparisonView} from "../../src/features/reports/comparison-view";
import {loadComparison} from "../../src/features/reports/actions";
import {readSnapshot} from "../../src/lib/db/snapshots";
import {limitRequest, requestFailure} from "../../src/lib/security/requests";
import {reportSchema} from "../../src/lib/db/snapshot-schema";
import {StorageError} from "../../src/lib/db/errors";
import {report} from "../db/fixtures";
import tr from "../../src/messages/tr.json";
import en from "../../src/messages/en.json";

vi.mock("../../src/lib/db/snapshots", () => ({readSnapshot: vi.fn()}));
vi.mock("../../src/lib/security/requests", () => ({limitRequest: vi.fn(), requestFailure: vi.fn()}));
const beforeAccess = {id: "11111111-1111-4111-8111-111111111111", token: "a".repeat(64)};
const afterAccess = {id: "22222222-2222-4222-8222-222222222222", token: "b".repeat(64)};
const accesses = {before: beforeAccess, after: afterAccess};
function pair() {
  const before = report(3), after = report(3);
  after.checkedAt = "2026-10-29T10:00:00Z";
  return {before, after};
}
function snapshot(value = report(3)) {
  return {id: beforeAccess.id, snapshotVersion: 1 as const, selectedRepoIds: [10, 11, 12], scopeHash: "f".repeat(64),
    createdAt: "2026-10-29T12:00:00Z", expiresAt: "2026-11-28T12:00:00Z", report: reportSchema.parse(value)};
}
function render(value: ReturnType<typeof compareReports>, locale: "tr" | "en") {
  return renderToStaticMarkup(<NextIntlClientProvider locale={locale} messages={locale === "tr" ? tr : en} timeZone="UTC"><ComparisonView comparison={value} /></NextIntlClientProvider>);
}
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-17T00:00:00Z"));
  vi.mocked(readSnapshot).mockReset(); vi.mocked(limitRequest).mockReset().mockResolvedValue(undefined);
  vi.mocked(requestFailure).mockReset().mockReturnValue(null);
});

it("compares recorded scores, categories and fail/pass signals without editing or rescoring them", () => {
  const {before, after} = pair();
  const improved = after.checks.find(check => check.id === "repo:10:description")!;
  improved.status = "pass"; improved.earned = improved.max;
  after.categories[1].score = 30; after.score = 100;
  const original = structuredClone({before, after});
  const result = compareReports(before, after);
  expect(result).toMatchObject({status: "compared", delta: 3.3, changes: [{id: improved.id, direction: "improved", before: before.checks.find(check => check.id === improved.id)!.evidence, after: improved.evidence}]});
  expect(result.status === "compared" && result.categories.find(category => category.id === "projects")).toMatchObject({before: 26.7, after: 30, delta: 3.3});
  expect({before, after}).toEqual(original);
  const backwards = {...after, checkedAt: before.checkedAt};
  const regressed = {...before, checkedAt: after.checkedAt};
  expect(compareReports(backwards, regressed)).toMatchObject({status: "compared", delta: -3.3, changes: [{direction: "regressed"}]});
});

it("treats a fresh equal-score analysis as unchanged, and a reused measurement as no second measurement", () => {
  const {before, after} = pair();
  after.checks.reverse();
  expect(compareReports(before, after)).toMatchObject({status: "compared", delta: 0, changes: []});
  for (const source of ["cache", "joined", undefined] as const) {
    expect(compareReports(before, {...after, checkedAt: before.checkedAt, source})).toEqual({status: "blocked", reason: "same"});
  }
  expect(compareReports(after, before)).toEqual({status: "blocked", reason: "order"});
});

it("rejects changed user IDs, repo sets, versions and incomplete data without inventing a delta", () => {
  const {before, after} = pair();
  expect(compareReports(before, {...after, profile: {...after.profile, id: 2}})).toEqual({status: "blocked", reason: "profile"});
  expect(compareReports(before, {...after, rulesVersion: "2.0.0"})).toEqual({status: "blocked", reason: "rules"});
  expect(compareReports(before, {...after, checks: after.checks.map(check => check.scope.kind === "repo" ? {...check, scope: {...check.scope, id: check.scope.id + 100}} : check)})).toEqual({status: "blocked", reason: "scope"});
  expect(compareReports(before, report(3, true))).toEqual({status: "blocked", reason: "incomplete"});
  expect(compareReports({...before, profile: {...before.profile, login: "old-name"}}, after).status).toBe("compared");
});

it.each(["tr", "en"] as const)("renders real deltas, evidence and neutral states in %s", locale => {
  const {before, after} = pair();
  const text = (locale === "tr" ? tr : en).Comparison;
  expect(render(compareReports(before, after), locale)).toContain(text.unchanged);
  expect(render(compareReports(before, {...after, checkedAt: before.checkedAt}), locale)).toContain(text.blocked.same);
  expect(render(compareReports(before, report(3, true)), locale)).toContain(text.blocked.incomplete);
  const changed = after.checks.find(check => check.id === "repo:10:description")!;
  changed.status = "pass";
  const html = render(compareReports(before, after), locale);
  expect(html).toContain(text.improved); expect(html).toContain("https://github.com/");
  expect(html).not.toContain(beforeAccess.token);
});

it("reads both capabilities separately and returns only a safe comparison, using one report entry budget", async () => {
  const {before, after} = pair();
  vi.mocked(readSnapshot).mockResolvedValueOnce(snapshot(before)).mockResolvedValueOnce(snapshot(after));
  const result = await loadComparison(accesses);
  expect(result).toMatchObject({status: "success", comparison: {status: "compared", delta: 0}});
  expect(limitRequest).toHaveBeenCalledExactlyOnceWith("report");
  expect(readSnapshot).toHaveBeenNthCalledWith(1, beforeAccess.id, beforeAccess.token);
  expect(readSnapshot).toHaveBeenNthCalledWith(2, afterAccess.id, afterAccess.token);
  for (const token of [beforeAccess.token, afterAccess.token]) expect(JSON.stringify(result)).not.toContain(token);
  expect(result).not.toHaveProperty("report"); expect(fetch).not.toHaveBeenCalled();
});

it.each(["before", "after"] as const)("requires valid unexpired %s access even when the other report is valid", async side => {
  vi.mocked(readSnapshot).mockImplementation(async id => id === accesses[side].id ? null : snapshot());
  expect(await loadComparison(accesses)).toEqual({status: "missing"});
});

it("rechecks expiry after both reads complete", async () => {
  vi.mocked(readSnapshot).mockResolvedValueOnce({...snapshot(), expiresAt: "2026-11-17T00:00:01Z"}).mockImplementationOnce(async () => {
    vi.advanceTimersByTime(2000); return snapshot();
  });
  expect(await loadComparison(accesses)).toEqual({status: "missing"});
});

it("does not accept caller findings or invalid access and separates storage failure from absence", async () => {
  expect(await loadComparison({...accesses, score: 100})).toEqual({status: "missing"});
  expect(await loadComparison({...accesses, before: {...beforeAccess, token: "wrong"}})).toEqual({status: "missing"});
  expect(readSnapshot).not.toHaveBeenCalled();
  vi.mocked(readSnapshot).mockRejectedValue(new StorageError("unavailable"));
  expect(await loadComparison(accesses)).toEqual({status: "unavailable"});
});

it.each(["rateLimit", "configuration"] as const)("rejects %s before snapshot reads", async code => {
  const retryAt = "2026-11-17T00:01:00Z";
  vi.mocked(limitRequest).mockRejectedValue(new Error("private"));
  vi.mocked(requestFailure).mockReturnValue({code, retryAt});
  expect(await loadComparison(accesses)).toEqual(code === "rateLimit" ? {status: code, retryAt} : {status: code});
  expect(readSnapshot).not.toHaveBeenCalled();
});
