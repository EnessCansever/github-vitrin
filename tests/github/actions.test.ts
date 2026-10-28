import {expect, it, vi} from "vitest";
import {getRepos} from "../../src/features/analysis/actions";
import {json, profile, repository, respond} from "./fixtures";

function publicProfile() {
  return json({data: {user: {databaseId: profile.id, login: profile.login, name: profile.name,
    bio: null, websiteUrl: null, avatarUrl: profile.avatarUrl}}});
}

const emptyPins = () => json({data: {user: {pinnedItems: {nodes: []}}}});

it.each([null, {}, "", "github.com/mona/repo", "https://token@github.com/mona", " ".repeat(257) + "mona"])(
  "rejects invalid or oversized action input before accessing GitHub", async input => {
    expect(await getRepos(input)).toEqual({status: "error", code: "invalid_input"});
    expect(fetch).not.toHaveBeenCalled();
  },
);

it("returns only selection fields and prioritizes pinned then recent candidates", async () => {
  respond(publicProfile(), json({data: {user: {pinnedItems: {nodes: [{databaseId: 20,
    name: "project-20", isPrivate: false, isArchived: false, isFork: false,
    owner: {login: "mona", __typename: "User"}}]}}}}), json(repository(20)),
  json([repository(21), repository(20), repository(22), repository(23)]));
  const result = await getRepos(" https://github.com/Mona/ ");
  expect(result).toEqual({status: "success", profile: {id: 7, login: "mona"}, repos: [20, 21, 22, 23].map(id => ({
    id: String(id), name: `project-${id}`, description: "Example", language: "TypeScript", pinned: id === 20,
  })), initialSelectedIds: ["20", "21", "22"], limited: false, pinnedUnknown: false});
  expect(vi.mocked(fetch).mock.calls.some(([url]) => String(url).includes("readme"))).toBe(false);
});

it("preserves pinned unknown while preselecting recent projects", async () => {
  respond(publicProfile(), json({}, 503), json([repository(31), repository(32)]));
  expect(await getRepos("mona")).toMatchObject({status: "success", initialSelectedIds: ["31", "32"],
    pinnedUnknown: true, repos: [{pinned: false}, {pinned: false}]});
});

it("reports no eligible public projects without producing a score", async () => {
  respond(publicProfile(), emptyPins(), json([repository(10, {fork: true})]));
  expect(await getRepos("mona")).toEqual({status: "error", code: "empty"});
});

it.each([
  [json({data: {user: null}}), "notFound"],
  [json({}, 401), "configuration"], [json({}, 403), "configuration"],
  [json({}, 429), "rateLimit"], [json({}, 503), "network"],
  [json({data: {user: {login: "mona"}}, errors: [{type: "INTERNAL", message: "private diagnostic"}]}), "network"],
])("maps failures to safe serializable UI codes", async (response, code) => {
  respond(response);
  expect(await getRepos("mona")).toEqual({status: "error", code});
});

it("maps transport failure to a safe connection error", async () => {
  vi.mocked(fetch).mockRejectedValueOnce(new Error("Internal request details"));
  expect(await getRepos("mona")).toEqual({status: "error", code: "network"});
});

it("creates a fresh client for a later user operation", async () => {
  vi.useFakeTimers();
  respond(publicProfile(), emptyPins(), json([repository()]), publicProfile(), emptyPins(), json([repository(11)]));
  expect(await getRepos("mona")).toMatchObject({status: "success"});
  await vi.advanceTimersByTimeAsync(21_000);
  expect(await getRepos("mona")).toMatchObject({status: "success", initialSelectedIds: ["11"]});
});

it("exposes the 100-candidate boundary without an unbounded response", async () => {
  respond(publicProfile(), emptyPins(), json(Array.from({length: 100}, (_, index) => repository(index + 1))));
  const result = await getRepos("mona");
  expect(result).toMatchObject({status: "success", limited: true});
  if (result.status === "success") expect(result.repos).toHaveLength(100);
});

it("keeps a pinned request timeout distinct while using the remaining common budget for candidates", async () => {
  vi.useFakeTimers();
  vi.spyOn(AbortSignal, "timeout").mockImplementation(ms => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  });
  respond(publicProfile());
  vi.mocked(fetch).mockImplementationOnce((_url, options) => new Promise((_resolve, reject) => {
    options?.signal?.addEventListener("abort", () => reject(options.signal?.reason));
  }));
  respond(json([repository()]));
  const result = getRepos("mona");
  await vi.advanceTimersByTimeAsync(8001);
  expect(await result).toMatchObject({status: "success", pinnedUnknown: true, initialSelectedIds: ["10"]});
  expect(fetch).toHaveBeenCalledTimes(3);
});

it("returns a safe configuration code without a token", async () => {
  vi.stubEnv("GITHUB_TOKEN", "");
  expect(await getRepos("mona")).toEqual({status: "error", code: "configuration"});
  expect(fetch).not.toHaveBeenCalled();
});
