import {describe, expect, it, vi} from "vitest";
import {analyze} from "../../src/features/analysis/actions";
import {english} from "../scoring/fixtures";
import {json, readme, repository, respond} from "./fixtures";

const selection = {username: "mona", profileId: 7, repos: [{id: 10, name: "project-10"}]};
function publicProfile() {
  return json({data: {user: {databaseId: 7, login: "mona", name: "Mona", bio: "Frontend developer",
    websiteUrl: "https://example.org", avatarUrl: "https://avatars.githubusercontent.com/u/7"}}});
}
function noProfileReadme() {
  return json({data: {user: {databaseId: 7, login: "mona", repository: null}}});
}
function success() {
  respond(publicProfile(), json(repository()), json(repository()), json(readme(english)), noProfileReadme());
}

describe("analysis server action", () => {
  it.each([
    null, {}, {...selection, username: "https://token@github.com/mona"}, {...selection, username: " ".repeat(257) + "mona"},
    {...selection, username: "\u3000".repeat(100) + "mona"}, {...selection, username: "github.com/mona/project"}, {...selection, profileId: 8.5}, {...selection, repos: []},
    {...selection, repos: Array(4).fill(selection.repos[0])}, {...selection, repos: [selection.repos[0], selection.repos[0]]},
    {...selection, repos: [{id: 10, name: "project"}, {id: 11, name: "PROJECT"}]},
    {...selection, repos: [{id: 10, name: "../private"}]}, {...selection, score: 100},
    {...selection, repos: [{...selection.repos[0], description: "Injected metadata"}]},
    {...selection, rulesVersion: "2.0.0"}, {...selection, checkedAt: "2026-01-01"},
  ])("rejects malformed, duplicate or injected client data before network access", async value => {
    expect(await analyze(value)).toEqual({status: "error", code: "invalid_input"});
    expect(fetch).not.toHaveBeenCalled();
  });

  it("normalizes profile input and returns the real engine result with safe serializable evidence", async () => {
    success();
    const result = await analyze({...selection, username: " https://github.com/Mona/ "});
    expect(result.status).toBe("success");
    if (result.status !== "success") throw new Error("Expected successful analysis");
    expect(result.report).toMatchObject({profile: {id: 7, login: "mona"}, rulesVersion: "1.0.0", repoCount: 1,
      status: "complete", score: 90, categories: [{score: 10}, {score: 30}, {score: 50}], profileType: {id: "ready"}});
    expect(Number.isNaN(Date.parse(result.report.checkedAt))).toBe(false);
    expect(result.report.checks.find(check => check.rule === "install")?.evidence[0]).toMatchObject({
      sourceUrl: "https://github.com/mona/project-10/blob/main/README.md", line: 5, sha: "a".repeat(40), detailKey: "install.pass",
    });
    const serialized = JSON.stringify(result);
    expect(JSON.parse(serialized)).toMatchObject({status: "success", report: {score: 90}});
    for (const forbidden of [english, "Frontend developer", "avatarUrl", '"excerpt"', '"errorCode"', '"error"', '"stack"', "test_only_not_a_real_token"]) {
      expect(serialized).not.toContain(forbidden);
    }
    expect(fetch).toHaveBeenCalledTimes(5);
  });

  it("revalidates profile identity and does not reuse the old user's selection", async () => {
    respond(publicProfile());
    expect(await analyze({...selection, profileId: 99})).toEqual({status: "error", code: "selectionChanged"});
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    {id: 11}, {private: true}, {archived: true}, {fork: true},
    {owner: {id: 99, login: "other", type: "User"}}, {owner: {id: 7, login: "mona", type: "Organization"}},
  ])("rejects a changed repo identity or scope on the server", async changes => {
    respond(publicProfile(), json(repository(10, changes)));
    expect(await analyze(selection)).toEqual({status: "error", code: "selectionChanged"});
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("treats access lost during README validation as unknown rather than README absence", async () => {
    respond(publicProfile(), json(repository()), json(repository(10, {private: true})), noProfileReadme());
    const result = await analyze(selection);
    expect(result).toMatchObject({status: "success", report: {status: "incomplete", score: null, profileType: null}});
    if (result.status === "success") {
      expect(result.report.checks.find(check => check.rule === "readme")).toMatchObject({status: "unknown", earned: null});
      expect(result.report.checks.find(check => check.rule === "description")?.earned).toBe(10);
    }
  });

  it("preserves known findings and null category/total when README service data is incomplete", async () => {
    respond(publicProfile(), json(repository(10, {description: null})), json(repository()), json({}, 503), noProfileReadme());
    const result = await analyze(selection);
    expect(result).toMatchObject({status: "success", report: {status: "incomplete", score: null, profileType: null,
      categories: [{score: 10}, {score: null}, {score: null}], recommendations: [{suggestionKey: "profileReadme", rawImpact: 10, categoryImpact: 10}, {suggestionKey: "description", rawImpact: 10, categoryImpact: null}]}});
    if (result.status === "success") {
      expect(result.report.checks.find(check => check.rule === "topics")?.status).toBe("pass");
      expect(result.report.checks.find(check => check.rule === "readme")?.evidence[0]).not.toHaveProperty("errorCode");
    }
  });

  it.each([
    [json({data: {user: null}}), "notFound"], [json({}, 401), "configuration"],
    [json({}, 403), "configuration"], [json({}, 429), "rateLimit"], [json({}, 503), "network"],
  ])("maps errors without serializing raw responses or errors", async (response, code) => {
    respond(response);
    expect(await analyze(selection)).toEqual({status: "error", code});
  });

  it("does not leak unexpected errors to the client", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Private request diagnostic"));
    expect(await analyze(selection)).toEqual({status: "error", code: "network"});
  });

  it("uses a fresh operation budget when the user analyzes again", async () => {
    vi.useFakeTimers();
    success(); expect(await analyze(selection)).toMatchObject({status: "success"});
    await vi.advanceTimersByTimeAsync(21_000);
    success(); expect(await analyze(selection)).toMatchObject({status: "success"});
  });

  it("shares the same client deadline across profile and selected repository requests", async () => {
    vi.useFakeTimers();
    const start = Date.now();
    vi.mocked(fetch).mockImplementationOnce(async () => {
      vi.setSystemTime(start + 21_000);
      return publicProfile();
    });
    expect(await analyze(selection)).toEqual({status: "error", code: "network"});
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("returns an explicit safe configuration error without a token", async () => {
    vi.stubEnv("GITHUB_TOKEN", "");
    expect(await analyze(selection)).toEqual({status: "error", code: "configuration"});
    expect(fetch).not.toHaveBeenCalled();
  });
});
