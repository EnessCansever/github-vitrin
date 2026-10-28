import {describe, expect, it, vi} from "vitest";
import {scoreAnalysis, ScoringError} from "../../src/features/analysis/scoring/engine";
import type {AnalysisInput, AnalysisResult, Rule} from "../../src/features/analysis/scoring/types";
import {demo} from "../../src/features/analysis/demo";
import {GitHubError} from "../../src/lib/github/errors";
import {english, input, readme} from "./fixtures";

function check(result: AnalysisResult, rule: Rule, id = 10) {
  const found = result.checks.find(check => check.rule === rule && (check.scope.kind === "profile" || check.scope.id === id));
  if (!found) throw new Error(`Missing check: ${rule}`);
  return found;
}
function freeze(value: object) {
  Object.freeze(value);
  Object.values(value).forEach(child => { if (child && typeof child === "object") freeze(child); });
}

describe("scoring arithmetic and scope", () => {
  it("scores complete presentation as 100 with evidence and stable IDs", () => {
    const result = scoreAnalysis(input());
    expect(result.status).toBe("complete");
    expect(result.score).toBe(100);
    expect(result.categories.map(category => category.score)).toEqual([20, 30, 50]);
    expect(result.profileType?.id).toBe("ready");
    expect(result.rulesVersion).toBe("1.0.0");
    expect(result.recommendations).toEqual([]);
    expect(check(result, "install")).toMatchObject({id: "repo:10:install", earned: 10, max: 10, evidence: [{
      path: "README.md", branch: "main", sha: "a".repeat(40), checkedAt: "2026-10-28T10:00:00Z",
      repo: {id: 10, fullName: "mira-sample/project-10"}, line: 5,
      sourceUrl: "https://github.com/mira-sample/project-10/blob/main/README.md",
    }]});
    expect(result.profileType?.checkIds.every(id => result.checks.some(check => check.id === id))).toBe(true);
  });
  it("scores known empty presentation as zero while preserving a complete analysis", () => {
    const value = input(1, " \n");
    value.profile.bio = " "; value.profile.website = null; value.profileReadme = readme("");
    value.repos[0].repo.description = null; value.repos[0].repo.topics = [];
    const result = scoreAnalysis(value);
    expect(result.score).toBe(0);
    expect(result.status).toBe("complete");
    expect(result.profileType?.id).toBe("noDemo");
    expect(result.checks.every(check => check.status === "fail")).toBe(true);
    expect(result.checks.some(check => check.status === "not_applicable")).toBe(false);
  });
  it("gives one and three equivalent repositories the same category and total scores", () => {
    const one = scoreAnalysis(input()); const three = scoreAnalysis(input(3));
    expect(one.score).toBe(three.score);
    expect(one.categories).toEqual(three.categories);
  });
  it("rounds categories before summing the displayed total", () => {
    const value = input(3);
    value.repos[0].repo.description = null;
    value.repos[0].readme = readme(english.replace("## Technologies\n- TypeScript\n", ""));
    const result = scoreAnalysis(value);
    expect(result.categories.map(category => category.score)).toEqual([20, 26.7, 48.3]);
    expect(result.categories[1].rawScore).toBeCloseTo(80 / 3);
    expect(result.score).toBe(95);
  });
  it("rejects an empty scope without producing a low-scoring report", () => {
    expect(() => scoreAnalysis({...input(), repos: []})).toThrowError(new ScoringError("no_repos"));
  });
  it.each(["duplicateId", "duplicateName", "owner", "private", "archive", "fork", "invalidName", "tooMany"])("rejects invalid repository scope: %s", kind => {
    const value = input(kind === "tooMany" ? 4 : 2);
    const second = value.repos[1].repo;
    if (kind === "duplicateId") second.id = value.repos[0].repo.id;
    if (kind === "duplicateName") second.name = value.repos[0].repo.name.toUpperCase();
    if (kind === "owner") second.owner.id = 999;
    if (kind === "private") second.isPrivate = true;
    if (kind === "archive") second.isArchived = true;
    if (kind === "fork") second.isFork = true;
    if (kind === "invalidName") second.name = "../outside";
    expect(() => scoreAnalysis(value)).toThrowError(new ScoringError("invalid_scope"));
  });
  it("rejects an unsupported rules version", () => {
    expect(() => scoreAnalysis({...input(), rulesVersion: "2.0.0"})).toThrowError(new ScoringError("unsupported_rules"));
  });
  it("is deterministic, independent of repo order, clocks, environment and network, and does not mutate input", () => {
    const value = input(3);
    freeze(value);
    const before = JSON.stringify(value);
    vi.spyOn(Date, "now").mockImplementation(() => { throw new Error("Clock access"); });
    vi.spyOn(Math, "random").mockImplementation(() => { throw new Error("Random access"); });
    const first = scoreAnalysis(value);
    vi.stubEnv("GITHUB_TOKEN", "");
    expect(scoreAnalysis(value)).toEqual(first);
    expect(scoreAnalysis({...value, repos: [...value.repos].reverse()})).toEqual(first);
    expect(JSON.stringify(value)).toBe(before);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("missing and unknown evidence", () => {
  it.each(["missing", "empty"])("treats %s README as known failure, not unknown", state => {
    const value = input();
    value.repos[0].readme = state === "missing" ? {status: "missing"} : readme("");
    const result = scoreAnalysis(value);
    expect(result.status).toBe("complete");
    expect(check(result, "readme").status).toBe("fail");
    expect(check(result, "install").earned).toBe(0);
    expect(check(result, "description").status).toBe("pass");
  });
  it.each(["network", "auth", "rate_limit", "partial"] as const)("keeps %s as unknown while retaining metadata findings", code => {
    const value = input();
    value.repos[0].readme = {status: "unknown", error: new GitHubError(code)};
    const result = scoreAnalysis(value);
    expect(result.status).toBe("incomplete"); expect(result.score).toBeNull(); expect(result.profileType).toBeNull();
    expect(result.categories.map(category => category.score)).toEqual([20, null, null]);
    expect(check(result, "description").earned).toBe(10);
    expect(check(result, "topics").earned).toBe(5);
    expect(check(result, "readme")).toMatchObject({status: "unknown", earned: null, evidence: [{errorCode: code}]});
    expect(result.recommendations).toEqual([]);
    expect(JSON.stringify(result)).not.toContain('"stack"');
  });
  it("allows a known homepage signal to pass when README data is unknown", () => {
    const value = input(); value.repos[0].repo.homepage = "https://example.org";
    value.repos[0].readme = {status: "unknown", error: new GitHubError("network")};
    const result = scoreAnalysis(value);
    expect(check(result, "demo").status).toBe("pass");
    expect(check(result, "image").status).toBe("unknown");
    expect(result.score).toBeNull();
  });
  it("does not confuse profile README with project README", () => {
    const value = input(); value.profileReadme = readme(english); value.repos[0].readme = {status: "missing"};
    const result = scoreAnalysis(value);
    expect(check(result, "profileReadme").earned).toBe(10);
    expect(check(result, "purpose").status).toBe("fail");
  });
  it("marks only the profile category unknown for an unavailable profile README", () => {
    const value = input(); value.profileReadme = {status: "unknown", error: new GitHubError("partial")};
    expect(scoreAnalysis(value).categories.map(category => category.score)).toEqual([null, 30, 50]);
    expect(scoreAnalysis({...value, profileReadme: {status: "missing"}}).score).toBe(90);
  });
  it("does not cut an oversized multibyte README or score it as absent", () => {
    const value = input(); value.repos[0].readme = readme("ş".repeat(131073));
    const result = scoreAnalysis(value);
    expect(result.score).toBeNull();
    expect(check(result, "readme")).toMatchObject({status: "unknown", evidence: [{errorCode: "too_large"}]});
    value.profileReadme = readme("x".repeat(262145));
    expect(check(scoreAnalysis(value), "profileReadme").status).toBe("unknown");
  });
  it("retains verified failures and their recommendations in an incomplete result", () => {
    const value = input(); value.repos[0].repo.description = null;
    value.repos[0].readme = {status: "unknown", error: new GitHubError("timeout")};
    const result = scoreAnalysis(value);
    expect(result.recommendations).toEqual([expect.objectContaining({suggestionKey: "description", rawImpact: 10, categoryImpact: null})]);
  });
});

describe("profile types, suggestions and demo arithmetic", () => {
  it("applies the ready threshold at 80 and rejects it below 80", () => {
    const value = input(); value.profileReadme = readme(""); value.profile.bio = ""; value.profile.website = null;
    expect(scoreAnalysis(value)).toMatchObject({score: 80, profileType: {id: "ready"}});
    value.repos[0].repo.topics = [];
    expect(scoreAnalysis(value)).toMatchObject({score: 75, profileType: {id: "hiddenGem"}});
  });
  it("requires every demo and installation check for ready even above 80", () => {
    const value = input(); value.repos[0].readme = readme(english.replace("npm install", ""));
    expect(scoreAnalysis(value)).toMatchObject({score: 90, profileType: {id: "hiddenGem"}});
  });
  it("prioritizes noDemo over hiddenGem and otherwise uses inProgress", () => {
    const value = input(); value.repos[0].readme = readme(english.replace("[Open application](https://example.org/demo)", ""));
    expect(scoreAnalysis(value).profileType?.id).toBe("noDemo");
    value.repos[0].readme = readme("[Demo](https://example.org)");
    expect(scoreAnalysis(value).profileType?.id).toBe("inProgress");
  });
  it("deduplicates missing README tasks and ranks actual per-repo impact", () => {
    const value = input(3);
    value.repos[0].repo.description = null; value.profile.website = null;
    value.repos[0].readme = {status: "missing"};
    const result = scoreAnalysis(value);
    expect(result.recommendations.map(task => task.suggestionKey)).toEqual(["website", "description", "demo"]);
    expect(result.recommendations[0].rawImpact).toBe(5);
    expect(result.recommendations[1].rawImpact).toBeCloseTo(10 / 3);
    expect(result.recommendations[1].categoryImpact).toBeCloseTo(3.3);
    const allEmpty = input(); allEmpty.repos[0].repo.homepage = "https://example.org"; allEmpty.repos[0].readme = readme("");
    expect(scoreAnalysis(allEmpty).recommendations.map(task => task.suggestionKey)).toEqual(["readme"]);
  });
  it("matches all 23 demo check states and 77.5 arithmetic without modifying the UI fixture", () => {
    const value: AnalysisInput = input(2);
    value.profile.website = null;
    value.repos[0].repo.name = "paper-lantern";
    value.repos[1].repo.name = "quiet-orbit";
    value.repos[0].readme = readme(english.replace("[Open application](https://example.org/demo)", "").replace("![Project preview](./preview.png)", ""));
    value.repos[1].readme = readme(english.replace("## Installation\n```sh\nnpm install\n```\n", "").replace("## Usage\nRun the application locally.\n", ""));
    const result = scoreAnalysis(value);
    expect(result.score).toBe(demo.score);
    expect(result.categories.map(category => category.score)).toEqual(demo.categories.map(category => category.score));
    for (const category of demo.categories) for (const scope of category.scopes) for (const expected of scope.checks) {
      const actual = result.checks.find(check => check.rule === expected.rule && check.scope.name.split("/").at(-1) === scope.name);
      expect(actual).toMatchObject({status: expected.status, earned: expected.earned, max: expected.max});
    }
    expect(result.checks).toHaveLength(23);
    expect(result.profileType?.id).toBe("hiddenGem");
    expect(result.recommendations.map(task => task.suggestionKey)).toEqual(["website", "demo", "install"]);
    expect(result.recommendations.map(task => task.rawImpact)).toEqual([5, 5, 5]);
  });
});

describe("evidence and recommendation contracts", () => {
  it("distinguishes missing, empty and oversized evidence without inventing a source path or time", () => {
    const value = input(); delete value.checkedAt;
    value.repos[0].readme = {status: "missing"};
    const missing = check(scoreAnalysis(value), "readme").evidence[0];
    expect(missing.availability).toBe("missing"); expect(missing.path).toBeUndefined(); expect(missing.checkedAt).toBeUndefined();
    value.repos[0].readme = readme("");
    expect(check(scoreAnalysis(value), "readme").evidence[0]).toMatchObject({availability: "found", path: "README.md"});
  });
  it("uses a branch reference in source links and keeps the separate file SHA", () => {
    const value = input(); value.repos[0].readme = {...readme(english), branch: "release/v1", path: "docs/README.md"};
    const evidence = check(scoreAnalysis(value), "purpose").evidence[0];
    expect(evidence.sourceUrl).toBe("https://github.com/mira-sample/project-10/blob/release%2Fv1/docs/README.md");
    expect(evidence.sha).toBe("a".repeat(40));
    expect(evidence.sourceUrl).not.toContain(evidence.sha);
  });
  it("sorts equal-impact tasks by fixed check order and stable repository ID", () => {
    const value = input(3);
    value.repos.forEach(item => { item.repo.description = null; });
    const result = scoreAnalysis(value);
    expect(result.recommendations.map(task => task.target.id)).toEqual([10, 11, 12]);
    expect(new Set(result.recommendations.map(task => task.checkId)).size).toBe(3);
  });
  it("does not let social, time or language metadata affect points", () => {
    const value = input();
    const original = scoreAnalysis(value);
    Object.assign(value.profile, {followers: 999, createdAt: "2000-01-01", contributions: 999});
    Object.assign(value.repos[0].repo, {stars: 999, commits: 999, language: "Rust", updatedAt: "2020-01-01T00:00:00Z"});
    expect(scoreAnalysis(value)).toEqual(original);
  });
  it("keeps unknown evidence in one repo from erasing the other repo's known failures", () => {
    const value = input(2);
    value.repos[0].readme = {status: "unknown", error: new GitHubError("partial")};
    value.repos[1].readme = readme(english.replace("npm install", ""));
    const result = scoreAnalysis(value);
    expect(check(result, "install", 10).earned).toBeNull();
    expect(check(result, "install", 11).earned).toBe(0);
    expect(result.categories[2].score).toBeNull();
    expect(result.recommendations).toEqual([expect.objectContaining({suggestionKey: "install", target: {kind: "repo", id: 11, name: "mira-sample/project-11"}, rawImpact: 5, categoryImpact: null})]);
  });
});
