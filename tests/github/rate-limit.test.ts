import {expect, it, vi} from "vitest";
import {GitHubClient} from "../../src/lib/github/client";
import {GitHubTransport} from "../../src/lib/github/transport";
import {json, profile, respond} from "./fixtures";

it("does not let exhausted REST core quota block GraphQL", async () => {
  respond(json({}, 403, {"x-ratelimit-resource": "core", "x-ratelimit-remaining": "0"}), json({data: "ok"}));
  const transport = new GitHubTransport();
  await expect(transport.request("/users/mona/repos")).rejects.toMatchObject({code: "rate_limit",
    rateLimit: {scope: "primary", resource: "core"}});
  expect(await transport.request("/graphql", {})).toEqual({data: "ok"});
  await expect(transport.request("/users/mona/repos")).rejects.toMatchObject({code: "rate_limit"});
  expect(fetch).toHaveBeenCalledTimes(2);
});

it("does not let exhausted GraphQL quota block REST core", async () => {
  respond(json({}, 403, {"x-ratelimit-resource": "graphql", "x-ratelimit-remaining": "0"}), json([]));
  const transport = new GitHubTransport();
  await expect(transport.request("/graphql", {})).rejects.toMatchObject({code: "rate_limit"});
  expect(await transport.request("/users/mona/repos")).toEqual([]);
  expect(fetch).toHaveBeenCalledTimes(2);
});

it("attributes headers to their reported resource", async () => {
  respond(json({}, 200, {"x-ratelimit-resource": "graphql", "x-ratelimit-remaining": "0"}), json([]));
  const transport = new GitHubTransport();
  await transport.request("/users/mona/repos");
  expect(await transport.request("/users/mona/repos")).toEqual([]);
  await expect(transport.request("/graphql", {})).rejects.toMatchObject({code: "rate_limit", rateLimit: {resource: "graphql"}});
});

it("preserves known quota when later headers are missing", async () => {
  respond(json({}, 200, {"x-ratelimit-resource": "core", "x-ratelimit-remaining": "3", "x-ratelimit-reset": "9999999999"}),
    json({}), json({message: "API rate limit"}, 403));
  const transport = new GitHubTransport();
  await transport.request("/users/mona/repos");
  await transport.request("/users/mona/repos");
  await expect(transport.request("/users/mona/repos")).rejects.toMatchObject({code: "rate_limit",
    rateLimit: {resource: "core", remaining: 3, resetAt: 9999999999}});
});

it("records GraphQL HTTP 200 RATE_LIMITED errors for subsequent calls", async () => {
  respond(json({errors: [{type: "RATE_LIMITED"}]}), json([]));
  const client = new GitHubClient();
  expect(await client.getPinned(profile)).toMatchObject({status: "unknown", error: {code: "rate_limit"}});
  await expect(client.getProfile("mona")).rejects.toMatchObject({code: "rate_limit",
    rateLimit: {scope: "primary", resource: "graphql"}});
  await expect(client.getCandidates(profile, {status: "available", repos: []})).rejects.toMatchObject({code: "no_repos"});
  expect(fetch).toHaveBeenCalledTimes(2);
});

it.each([
  json({message: "secondary rate limit"}, 403, {"x-ratelimit-remaining": "0"}),
  json({}, 429), json({}, 403, {"retry-after": "10"}),
  json({message: "rate limit"}, 403, {"x-ratelimit-resource": "unrecognized", "x-ratelimit-remaining": "0"}),
])("preserves secondary or unknown restrictions across both APIs", async response => {
  respond(response);
  const transport = new GitHubTransport();
  await expect(transport.request("/users/mona/repos")).rejects.toMatchObject({code: "rate_limit"});
  await expect(transport.request("/graphql", {})).rejects.toMatchObject({code: "rate_limit"});
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("preserves a GraphQL HTTP 200 secondary limit across REST access", async () => {
  respond(json({errors: [{type: "RATE_LIMITED", message: "Secondary rate limit exceeded"}]}));
  const client = new GitHubClient();
  const pinned = await client.getPinned(profile);
  expect(pinned).toMatchObject({status: "unknown", error: {rateLimit: {scope: "secondary"}}});
  await expect(client.getCandidates(profile, pinned)).rejects.toMatchObject({code: "rate_limit"});
  expect(await client.getReadme(profile, {id: 10, name: "project-10"})).toMatchObject({status: "unknown", error: {code: "rate_limit"}});
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("allows a new request after an actual primary reset has passed", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-28T00:00:00Z"));
  const reset = Date.now() / 1000 + 2;
  respond(json({}, 403, {"x-ratelimit-remaining": "0", "x-ratelimit-reset": String(reset)}), json({}));
  const transport = new GitHubTransport();
  await expect(transport.request("/users/mona/repos")).rejects.toMatchObject({code: "rate_limit"});
  await expect(transport.request("/users/mona/repos")).rejects.toMatchObject({code: "rate_limit"});
  await vi.advanceTimersByTimeAsync(2001);
  expect(await transport.request("/users/mona/repos")).toEqual({});
  expect(fetch).toHaveBeenCalledTimes(2);
});

it("does not invent a reset for a zero balance without reset headers", async () => {
  vi.useFakeTimers();
  respond(json({}, 200, {"x-ratelimit-remaining": "0"}));
  const transport = new GitHubTransport();
  await transport.request("/users/mona/repos");
  await vi.advanceTimersByTimeAsync(5000);
  const request = transport.request("/users/mona/repos");
  await expect(request).rejects.toMatchObject({code: "rate_limit"});
  await expect(request).rejects.not.toHaveProperty("rateLimit.resetAt");
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("honors a real secondary retry-after across API sources", async () => {
  vi.useFakeTimers();
  respond(json({message: "secondary rate limit"}, 403, {"retry-after": "2"}), json({}));
  const transport = new GitHubTransport();
  await expect(transport.request("/users/mona/repos")).rejects.toMatchObject({code: "rate_limit"});
  await expect(transport.request("/graphql", {})).rejects.toMatchObject({code: "rate_limit"});
  await vi.advanceTimersByTimeAsync(2001);
  expect(await transport.request("/graphql", {})).toEqual({});
});

it("treats a GraphQL retry-after restriction as shared even with a generic error", async () => {
  respond(json({errors: [{type: "RATE_LIMITED"}]}, 200, {"retry-after": "3"}));
  const client = new GitHubClient();
  const pinned = await client.getPinned(profile);
  expect(pinned).toMatchObject({status: "unknown", error: {rateLimit: {scope: "secondary"}}});
  await expect(client.getCandidates(profile, pinned)).rejects.toMatchObject({code: "rate_limit"});
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("does not let an already expired primary header bypass a new secondary restriction", async () => {
  vi.useFakeTimers();
  respond(json({message: "secondary rate limit"}, 403, {
    "x-ratelimit-remaining": "0", "x-ratelimit-reset": String(Math.floor(Date.now() / 1000) - 1),
  }));
  const transport = new GitHubTransport();
  await expect(transport.request("/users/mona/repos")).rejects.toMatchObject({code: "rate_limit"});
  await expect(transport.request("/graphql", {})).rejects.toMatchObject({code: "rate_limit"});
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("unblocks a GraphQL HTTP 200 primary limit after its real reset", async () => {
  vi.useFakeTimers();
  const reset = Math.floor(Date.now() / 1000) + 2;
  respond(json({errors: [{type: "RATE_LIMITED"}]}, 200, {"x-ratelimit-reset": String(reset)}),
    json({data: {user: null}}));
  const client = new GitHubClient();
  await expect(client.getProfile("mona")).rejects.toMatchObject({code: "rate_limit"});
  await expect(client.getProfile("mona")).rejects.toMatchObject({code: "rate_limit"});
  await vi.advanceTimersByTimeAsync(2001);
  await expect(client.getProfile("mona")).rejects.toMatchObject({code: "user_not_found"});
  expect(fetch).toHaveBeenCalledTimes(2);
});
