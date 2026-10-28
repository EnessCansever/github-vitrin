import {expect, it} from "vitest";
import tr from "../../src/messages/tr.json";
import en from "../../src/messages/en.json";
import {scoreAnalysis} from "../../src/features/analysis/scoring/engine";
import {GitHubError} from "../../src/lib/github/errors";
import {input, readme} from "./fixtures";

function message(messages: object, key: string): unknown {
  let value: unknown = messages;
  for (const part of key.split(".")) {
    if (value === null || typeof value !== "object" || !(part in value)) return undefined;
    value = Reflect.get(value, part);
  }
  return value;
}

it("provides TR/EN text for emitted evidence and suggestion keys without giving a locale to the engine", () => {
  const empty = input(1, "");
  empty.profile.bio = ""; empty.profile.website = null; empty.profileReadme = readme("");
  empty.repos[0].repo.description = null; empty.repos[0].repo.topics = [];
  const unavailable = input();
  unavailable.profileReadme = {status: "unknown", error: new GitHubError("network")};
  unavailable.repos[0].readme = {status: "unknown", error: new GitHubError("network")};
  const missing = input();
  missing.profileReadme = {status: "missing"}; missing.repos[0].readme = {status: "missing"};
  const undetected = input(1, "## Other\nThis application organizes team notes.");
  for (const value of [input(), empty, missing, undetected, unavailable]) {
    for (const check of scoreAnalysis(value).checks) {
      for (const messages of [tr.Scoring, en.Scoring]) {
        expect(message(messages, `suggestions.${check.suggestionKey}`)).toBeTypeOf("string");
        for (const evidence of check.evidence) expect(message(messages, `evidence.${evidence.detailKey}`)).toBeTypeOf("string");
      }
    }
  }
});


it("distinguishes known missing/empty README from a structural detection failure and unavailable data", () => {
  const value = input(1, "## A different title\nThis application organizes team notes.");
  function detail() {
    return scoreAnalysis(value).checks.find(check => check.rule === "purpose")?.evidence[0];
  }
  expect(detail()).toMatchObject({availability: "found", detailKey: "purpose.fail"});
  value.repos[0].readme = readme("");
  expect(detail()).toMatchObject({availability: "found", detailKey: "readme.empty"});
  value.repos[0].readme = {status: "missing"};
  expect(detail()).toMatchObject({availability: "missing", detailKey: "readme.missing"});
  value.repos[0].readme = {status: "unknown", error: new GitHubError("partial")};
  expect(detail()).toMatchObject({availability: "unknown", detailKey: "purpose.unknown"});
  expect(scoreAnalysis(value).score).toBeNull();
});
