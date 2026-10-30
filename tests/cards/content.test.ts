import {expect, it} from "vitest";
import {cardContent} from "../../src/features/cards/content";
import {report} from "../db/fixtures";
import tr from "../../src/messages/tr.json";
import en from "../../src/messages/en.json";

it("preserves stored fractional scores and the engine's first recommendation without reordering", () => {
  const value = report(3);
  value.recommendations = [
    {checkId: "repo:11:topics", target: {kind: "repo", id: 11, name: "mira-sample/a-long-project"}, suggestionKey: "topics", rawImpact: 1, categoryImpact: 1},
    ...value.recommendations,
  ];
  const before = structuredClone(value);
  const result = cardContent(value, "tr");
  expect(result?.score).toBe("96,7");
  expect(result?.categories.map(category => category.points)).toEqual(["20 / 20", "26,7 / 30", "50 / 50"]);
  expect(result?.task).toEqual({target: "a-long-project", text: tr.Card.actions.topics});
  expect(result?.scoreLabel).toBe("GitHub vitrin puanı");
  expect(result?.invitation).toBe(tr.Card.invitation);
  expect(value).toEqual(before);
  expect(fetch).not.toHaveBeenCalled();
});

it.each(["ready", "hiddenGem", "noDemo", "inProgress"] as const)("localizes the stored %s type without changing its meaning or scores", type => {
  const value = report(3);
  value.profileType = {id: type, checkIds: []};
  expect(cardContent(value, "tr")?.title).toEqual(tr.Card.types[type].split("\n"));
  expect(cardContent(value, "en")?.title).toEqual(en.Card.types[type].split("\n"));
  expect(cardContent(value, "en")?.score).toBe("96.7");
});

it("does not invent a task when the engine has no recommendations", () => {
  const value = report();
  value.recommendations = [];
  expect(cardContent(value, "tr")).toMatchObject({task: null, firstStep: tr.Card.summary, noTask: tr.Card.noTask});
});

it("keeps full unbroken username and repository names for renderer wrapping", () => {
  const value = report();
  value.profile.login = "a".repeat(39);
  value.recommendations[0].target.name = `${value.profile.login}/${"r".repeat(100)}`;
  const content = cardContent(value, "tr");
  expect(content?.username).toBe("a".repeat(39));
  expect(content?.task?.target).toBe("r".repeat(100));
});

it("uses a profile target and a UTC date without including evidence URLs or snapshot access data", () => {
  const value = report();
  value.checkedAt = "2026-10-28T23:30:00-03:00";
  value.recommendations[0] = {checkId: "profile:1:bio", target: {kind: "profile", id: 1, name: "mira-sample"}, suggestionKey: "bio", rawImpact: 5, categoryImpact: 5};
  const result = cardContent(value, "tr");
  expect(result?.task).toEqual({target: "Profil", text: tr.Card.actions.bio});
  expect(result?.date).toContain("29 Eki 2026");
  expect(JSON.stringify(result)).not.toContain("https:");
  expect(result).not.toHaveProperty("checks");
  expect(result).not.toHaveProperty("checkedAt");
});

it("rejects incomplete totals, types and categories rather than turning null into a shareable score", () => {
  expect(cardContent(report(3, true), "tr")).toBeNull();
  const value = report();
  value.score = null;
  expect(cardContent(value, "tr")).toBeNull();
  value.score = 80;
  value.profileType = null;
  expect(cardContent(value, "tr")).toBeNull();
  value.profileType = {id: "ready", checkIds: []};
  value.categories[0].score = null;
  expect(cardContent(value, "tr")).toBeNull();
});
