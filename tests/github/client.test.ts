import {describe, expect, it, vi} from "vitest";
import {GitHubClient, type Pinned} from "../../src/lib/github/client";
import {GitHubTransport} from "../../src/lib/github/transport";
import {json, profile, readme, repository, respond} from "./fixtures";


const noPins: Pinned = {status: "available", repos: []};

it("validates server input before sending a request", async () => {
  await expect(new GitHubClient().getProfile("github.com/mona/repo")).rejects.toMatchObject({code: "invalid_input"});
  expect(fetch).not.toHaveBeenCalled();
});

it("normalizes only requested public profile fields", async () => {
  respond(json({data: {user: {databaseId: 7, login: "mona", name: "Mona", bio: null,
    websiteUrl: null, avatarUrl: profile.avatarUrl, secret: "discard"}}}));
  expect(await new GitHubClient().getProfile("github.com/Mona")).toEqual(profile);
});

it.each([
  [{data: {user: null}, errors: [{type: "NOT_FOUND"}]}, "user_not_found"],
  [{data: {user: {login: "mona"}}, errors: [{type: "INTERNAL"}]}, "partial"],
  [{data: null, errors: [{type: "RATE_LIMITED"}]}, "rate_limit"],
  [{errors: [{extensions: {code: "FORBIDDEN"}}]}, "auth"],
  [{data: {user: {login: "mona"}}}, "invalid_response"],
])("rejects GraphQL missing, partial and errored data", async (data, code) => {
  respond(json(data));
  await expect(new GitHubClient().getProfile("mona")).rejects.toMatchObject({code});
});

it("keeps unavailable pinned data distinct from a known empty list", async () => {
  respond(json({data: {user: {pinnedItems: {nodes: []}}}}),
    json({data: {user: {pinnedItems: {nodes: []}}}, errors: [{type: "INTERNAL"}]}));
  const client = new GitHubClient();
  expect(await client.getPinned(profile)).toEqual({status: "available", repos: []});
  expect(await client.getPinned(profile)).toMatchObject({status: "unknown", error: {code: "partial"}});
});

it("filters pinned repositories by public ownership, archived and fork flags", async () => {
  const pin = {databaseId: 10, name: "one", isPrivate: false, isArchived: false, isFork: false,
    owner: {login: "mona", __typename: "User"}};
  respond(json({data: {user: {pinnedItems: {nodes: [pin, {...pin, isFork: true},
    {...pin, isPrivate: true}, {...pin, isArchived: true}, {...pin, owner: {login: "org", __typename: "Organization"}}]}}}}));
  expect(await new GitHubClient().getPinned(profile)).toEqual({status: "available", repos: [{id: 10, name: "one"}]});
});

it("paginates, filters scope and stops at 100 eligible candidates", async () => {
  const first = Array.from({length: 100}, (_, i) => repository(i + 1, {fork: true}));
  first[0] = repository(1);
  first[1] = repository(2, {private: true});
  first[2] = repository(3, {archived: true});
  first[3] = repository(4, {owner: {id: 8, login: "other", type: "User"}});
  first[4] = repository(5, {owner: {id: 7, login: "mona", type: "Organization"}});
  const mocked = respond(json(first), json(Array.from({length: 100}, (_, i) => repository(101 + i))));
  const result = await new GitHubClient().getCandidates(profile, noPins);
  expect(result.repos.map(repo => repo.id)).toEqual([1, ...Array.from({length: 99}, (_, i) => 101 + i)]);
  expect(result.limited).toBe(true);
  expect(mocked).toHaveBeenCalledTimes(2);
  expect(String(mocked.mock.calls[1][0])).toContain("page=2");
});

it("prioritizes eligible pins without duplicating them in recent candidates", async () => {
  respond(json(repository(12)), json([repository(11), repository(12)]));
  const result = await new GitHubClient().getCandidates(profile, {status: "available", repos: [{id: 12, name: "project-12"}]});
  expect(result.repos.map(repo => repo.id)).toEqual([12, 11]);
  expect(result.limited).toBe(false);
});

it("falls back to recent candidates while preserving unknown pinned status", async () => {
  respond(json({}, 503), json([repository()]));
  const client = new GitHubClient();
  const pins = await client.getPinned(profile);
  expect(pins).toMatchObject({status: "unknown", error: {code: "service"}});
  expect(await client.getCandidates(profile, pins)).toMatchObject({pinnedStatus: "unknown", repos: [{id: 10}]});
});

it("distinguishes no eligible repositories from a list access failure", async () => {
  respond(json([repository(10, {fork: true})]), json({}, 403));
  await expect(new GitHubClient().getCandidates(profile, noPins)).rejects.toMatchObject({code: "no_repos"});
  await expect(new GitHubClient().getCandidates(profile, noPins)).rejects.toMatchObject({code: "auth"});
});

it("returns README source evidence without rendering or executing content", async () => {
  const text = "# Türkçe\n<script>throw Error('never')</script>";
  respond(json(repository()), json(readme(text)));
  expect(await new GitHubClient().getReadme(profile, {id: 10, name: "project-10"}))
    .toEqual({status: "found", text, path: "README.md", sha: "a".repeat(40), branch: "main"});
});

it("calls a README missing only after repository identity and scope are revalidated", async () => {
  const mocked = respond(json(repository()), json({}, 404), json(repository()));
  expect(await new GitHubClient().getReadme(profile, {id: 10, name: "project-10"})).toEqual({status: "missing"});
  expect(mocked).toHaveBeenCalledTimes(3);
});

it.each([
  json({}, 404), json(repository(99)), json(repository(10, {private: true})),
  json(repository(10, {archived: true})), json(repository(10, {default_branch: "new"})),
])("does not turn lost scope or a changed repository into a missing README", async metadata => {
  respond(json(repository()), json({}, 404), metadata);
  expect(await new GitHubClient().getReadme(profile, {id: 10, name: "project-10"}))
    .toMatchObject({status: "unknown", error: {code: "repo_unavailable"}});
});

it.each([
  [401, {}, "configuration"], [403, {}, "auth"],
  [403, {"x-ratelimit-remaining": "0", "x-ratelimit-reset": "1793145600"}, "rate_limit"],
  [429, {"retry-after": "30"}, "rate_limit"], [503, {}, "service"],
])("does not treat README HTTP %s as missing", async (status, headers, code) => {
  respond(json(repository()), json({}, status, headers));
  expect(await new GitHubClient().getReadme(profile, {id: 10, name: "project-10"}))
    .toMatchObject({status: "unknown", error: {code}});
});


it("keeps a network failure as unknown README data", async () => {
  respond(json(repository()));
  vi.mocked(fetch).mockRejectedValueOnce(new TypeError("network down"));
  expect(await new GitHubClient().getReadme(profile, {id: 10, name: "project-10"}))
    .toMatchObject({status: "unknown", error: {code: "network"}});
});

it.each([readme("a".repeat(256 * 1024 + 1)), {...readme(), size: 999}, {...readme(), content: "invalid!"}])(
  "rejects oversized, truncated or malformed README data", async data => {
    respond(json(repository()), json(data));
    const result = await new GitHubClient().getReadme(profile, {id: 10, name: "project-10"});
    expect(result.status).toBe("unknown");
  },
);

it("accepts a README exactly at the byte limit", async () => {
  const text = "é".repeat(128 * 1024);
  respond(json(repository()), json(readme(text)));
  expect(await new GitHubClient().getReadme(profile, {id: 10, name: "project-10"})).toMatchObject({status: "found", text});
});

it.each([[], [{id: 10, name: "../private"}], [10, 11, 12, 13].map(id => ({id, name: `p-${id}`})),
  [{id: 10, name: "one"}, {id: 10, name: "two"}]])("rejects invalid selections without requests", async input => {
  await expect(new GitHubClient().getSelected(profile, input)).rejects.toMatchObject({code: "invalid_input"});
  expect(fetch).not.toHaveBeenCalled();
});

it("retrieves selected metadata and README with scope validation", async () => {
  respond(json(repository()), json(repository()), json(readme()));
  expect(await new GitHubClient().getSelected(profile, [{id: 10, name: "project-10"}]))
    .toMatchObject([{repo: {id: 10, topics: ["web"]}, readme: {status: "found"}}]);
});

describe("request safeguards", () => {
  it("requires token configuration only when used", async () => {
    vi.stubEnv("GITHUB_TOKEN", "");
    const client = new GitHubClient();
    await expect(client.getProfile("mona")).rejects.toMatchObject({code: "configuration"});
    expect(fetch).not.toHaveBeenCalled();
  });

  it("reports real reset headers and does not invent them", async () => {
    respond(json({}, 429, {"x-ratelimit-remaining": "0", "x-ratelimit-reset": "1793145600", "retry-after": "15"}), json({}, 429));
    const transport = new GitHubTransport();
    await expect(transport.request("/graphql", {})).rejects.toMatchObject({code: "rate_limit",
      rateLimit: {remaining: 0, resetAt: 1793145600, retryAfterSeconds: 15}});
    await expect(new GitHubTransport().request("/graphql", {})).rejects.toMatchObject({code: "rate_limit", rateLimit: {}});
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("recognizes secondary rate limits even without reset headers", async () => {
    respond(json({message: "You have exceeded a secondary rate limit."}, 403));
    await expect(new GitHubTransport().request("/graphql", {})).rejects.toMatchObject({code: "rate_limit", rateLimit: {}});
  });

  it("carries rate information from GraphQL HTTP 200 errors", async () => {
    respond(json({errors: [{type: "RATE_LIMITED"}]}, 200, {"x-ratelimit-reset": "1793145600"}));
    await expect(new GitHubClient().getProfile("mona")).rejects.toMatchObject({code: "rate_limit", rateLimit: {resetAt: 1793145600}});
  });

  it("aborts a hanging request", async () => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockImplementationOnce((_url, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener("abort", () => reject(options.signal?.reason));
    }));
    // AbortSignal.timeout uses Node's real timer rather than Vitest's clock.
    vi.spyOn(AbortSignal, "timeout").mockImplementationOnce(ms => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), ms);
      return controller.signal;
    });
    const result = expect(new GitHubClient().getProfile("mona")).rejects.toMatchObject({code: "timeout"});
    await vi.advanceTimersByTimeAsync(8_000);
    await result;
  });

  it("shares a deadline across all calls on a client", async () => {
    vi.useFakeTimers();
    const client = new GitHubClient();
    await vi.advanceTimersByTimeAsync(20_001);
    await expect(client.getProfile("mona")).rejects.toMatchObject({code: "timeout"});
    expect(fetch).not.toHaveBeenCalled();
  });

  it("caps cumulative requests rather than retrying indefinitely", async () => {
    vi.mocked(fetch).mockImplementation(async () => json({}));
    const transport = new GitHubTransport();
    for (let i = 0; i < 40; i++) await transport.request("/graphql", {});
    await expect(transport.request("/graphql", {})).rejects.toMatchObject({code: "request_budget"});
    expect(fetch).toHaveBeenCalledTimes(40);
  });

  it("bounds streamed responses before JSON decoding", async () => {
    respond(new Response("x".repeat(1024 * 1024 + 1)));
    await expect(new GitHubTransport().request("/graphql", {})).rejects.toMatchObject({code: "too_large"});
  });
});

it("keeps body-stream failure distinct from a missing README", async () => {
  respond(json(repository()), new Response(new ReadableStream({start(controller) {
    controller.error(new TypeError("connection interrupted"));
  }})));
  expect(await new GitHubClient().getReadme(profile, {id: 10, name: "project-10"}))
    .toMatchObject({status: "unknown", error: {code: "network"}});
});

it("rejects malformed external repo fields instead of treating them as false flags", async () => {
  const repo = repository();
  respond(json([{...repo, private: undefined}]));
  await expect(new GitHubClient().getCandidates(profile, noPins)).rejects.toMatchObject({code: "invalid_response"});
});

it("does not use external download URLs from README responses", async () => {
  const mocked = respond(json(repository()), json({...readme(), download_url: "https://attacker.test/file"}));
  expect(await new GitHubClient().getReadme(profile, {id: 10, name: "project-10"})).toMatchObject({status: "found"});
  expect(mocked.mock.calls.every(([url]) => String(url).startsWith("https://api.github.com/"))).toBe(true);
  expect(mocked.mock.calls.every(([, options]) => options?.redirect === "error" && options.cache === "no-store")).toBe(true);
  expect(mocked).toHaveBeenCalledTimes(2);
});

it("uses only the time left in the common deadline", async () => {
  vi.useFakeTimers();
  const client = new GitHubClient();
  await vi.advanceTimersByTimeAsync(17_000);
  const spy = vi.spyOn(AbortSignal, "timeout");
  respond(json({data: {user: null}}));
  await expect(client.getProfile("mona")).rejects.toMatchObject({code: "user_not_found"});
  expect(spy).toHaveBeenCalledWith(3_000);
});

it("rejects a malformed token before making requests", async () => {
  vi.stubEnv("GITHUB_TOKEN", "bad token\nvalue");
  await expect(new GitHubClient().getProfile("mona")).rejects.toMatchObject({code: "configuration"});
  expect(fetch).not.toHaveBeenCalled();
});

it("stops further calls after a rate limit response", async () => {
  respond(json({}, 429));
  const transport = new GitHubTransport();
  await expect(transport.request("/graphql", {})).rejects.toMatchObject({code: "rate_limit"});
  await expect(transport.request("/users/mona/repos")).rejects.toMatchObject({code: "rate_limit"});
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("keeps GraphQL primary limits separate from REST candidate access", async () => {
  respond(json({errors: [{type: "RATE_LIMITED"}]}), json([repository()]));
  const client = new GitHubClient();
  const pinned = await client.getPinned(profile);
  expect(await client.getCandidates(profile, pinned)).toMatchObject({pinnedStatus: "unknown", repos: [{id: 10}]});
  expect(await client.getPinned(profile)).toMatchObject({status: "unknown", error: {code: "rate_limit"}});
  expect(fetch).toHaveBeenCalledTimes(2);
});
