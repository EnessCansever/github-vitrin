import {expect, it, vi} from "vitest";
import {GitHubClient} from "../../src/lib/github/client";
import {json, profile, readme, respond} from "./fixtures";

const commit = "b".repeat(40);
const repo = {
  databaseId: 20, name: "mona", isPrivate: false, isEmpty: false,
  owner: {login: "mona", __typename: "User"},
  defaultBranchRef: {name: "main", target: {oid: commit}},
};

function metadata(repository: unknown = repo, errors?: object[]) {
  return json({data: {user: {databaseId: 7, login: "mona", repository}}, ...(errors ? {errors} : {})});
}

function root(object: unknown = {__typename: "Blob", oid: "a".repeat(40)}) {
  return json({data: {user: {databaseId: 7, repository: {databaseId: 20, isPrivate: false, object}}}});
}

it("recognizes an error-free nullable repository as missing public profile README", async () => {
  respond(metadata(null));
  expect(await new GitHubClient().getProfileReadme(profile)).toEqual({status: "missing"});
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("does not confuse no eligible projects with no public profile README", async () => {
  respond(metadata(null), json([]));
  const client = new GitHubClient();
  expect(await client.getProfileReadme(profile)).toEqual({status: "missing"});
  await expect(client.getCandidates(profile, {status: "available", repos: []})).rejects.toMatchObject({code: "no_repos"});
});

it.each([
  [metadata(null, [{type: "FORBIDDEN"}]), "auth"],
  [metadata(null, [{type: "INTERNAL"}]), "partial"],
  [json({}, 401), "configuration"], [json({}, 429), "rate_limit"],
  [json({}, 404), "invalid_response"],
  [json({data: {user: {databaseId: 7, login: "mona"}}}), "invalid_response"],
])("keeps profile README errors or ambiguous absence unknown", async (response, code) => {
  respond(response);
  expect(await new GitHubClient().getProfileReadme(profile)).toMatchObject({status: "unknown", error: {code}});
});

it("keeps network failure unknown", async () => {
  vi.mocked(fetch).mockRejectedValueOnce(new TypeError("offline"));
  expect(await new GitHubClient().getProfileReadme(profile)).toMatchObject({status: "unknown", error: {code: "network"}});
});

it("does not read private repository contents", async () => {
  respond(metadata({...repo, isPrivate: true}));
  expect(await new GitHubClient().getProfileReadme(profile)).toEqual({status: "missing"});
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("only checks the root file even if a repository has docs/README.md", async () => {
  const mocked = respond(metadata(), root(null));
  expect(await new GitHubClient().getProfileReadme(profile)).toEqual({status: "missing"});
  const body = JSON.parse(String(mocked.mock.calls[1][1]?.body));
  expect(body.variables.expression).toBe(`${commit}:README.md`);
  expect(mocked).toHaveBeenCalledTimes(2);
  expect(mocked.mock.calls.some(([url]) => String(url).includes("/readme"))).toBe(false);
});

it("reads root README in an archived or forked public profile repository", async () => {
  const mocked = respond(metadata({...repo, isArchived: true, isFork: true}), root(), json(readme("# Mona")));
  expect(await new GitHubClient().getProfileReadme(profile)).toEqual({status: "found", text: "# Mona",
    path: "README.md", sha: "a".repeat(40), branch: "main"});
  expect(String(mocked.mock.calls[2][0])).toBe(`https://api.github.com/repos/mona/mona/contents/README.md?ref=${commit}`);
});

it("returns an empty root README as found data without claiming profile display", async () => {
  respond(metadata(), root(), json(readme("")));
  expect(await new GitHubClient().getProfileReadme(profile)).toEqual({status: "found", text: "",
    path: "README.md", sha: "a".repeat(40), branch: "main"});
});

it("recognizes an empty public repository as missing profile README", async () => {
  respond(metadata({...repo, isEmpty: true, defaultBranchRef: null}));
  expect(await new GitHubClient().getProfileReadme(profile)).toEqual({status: "missing"});
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("does not read contents after an errored nullable root object", async () => {
  respond(metadata(), json({data: {user: {databaseId: 7, repository: {databaseId: 20, isPrivate: false, object: null}}},
    errors: [{type: "INTERNAL"}]}));
  expect(await new GitHubClient().getProfileReadme(profile)).toMatchObject({status: "unknown", error: {code: "partial"}});
  expect(fetch).toHaveBeenCalledTimes(2);
});

it.each([json({}, 404), json({}, 403), json({}, 429)])(
  "does not turn REST access failure into confirmed absence", async response => {
    respond(metadata(), root(), response);
    expect(await new GitHubClient().getProfileReadme(profile)).toMatchObject({status: "unknown"});
  },
);

it.each([
  {...readme(), path: "docs/README.md"}, {...readme(), sha: "c".repeat(40)},
  readme("x".repeat(256 * 1024 + 1)), {...readme(), size: 123}, {...readme(), content: "bad!"},
])("preserves path, identity, size and encoding safeguards", async data => {
  respond(metadata(), root(), json(data));
  expect(await new GitHubClient().getProfileReadme(profile)).toMatchObject({status: "unknown"});
});

it.each([
  {databaseId: 99, repository: {databaseId: 20, isPrivate: false, object: null}},
  {databaseId: 7, repository: {databaseId: 99, isPrivate: false, object: null}},
  {databaseId: 7, repository: {databaseId: 20, isPrivate: true, object: null}},
])("does not infer absence after profile or repository scope changes", async user => {
  respond(metadata(), json({data: {user}}));
  expect(await new GitHubClient().getProfileReadme(profile)).toMatchObject({status: "unknown", error: {code: "repo_unavailable"}});
  expect(fetch).toHaveBeenCalledTimes(2);
});
