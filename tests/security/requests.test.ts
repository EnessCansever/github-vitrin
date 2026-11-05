import {analysisScope} from "../../src/lib/db/analysis-locks";
import {createHmac} from "node:crypto";
import {beforeEach, expect, it, vi} from "vitest";
import {limitAnalysis, limitRequest, requestFailure} from "../../src/lib/security/requests";
import {consumeRateLimit} from "../../src/lib/db/rate-limits";
import {StorageError} from "../../src/lib/db/errors";
import {requestLimits} from "../../src/config/request-limits";

const request = vi.hoisted(() => ({headers: vi.fn(), values: new Map<string, string>()}));
vi.mock("next/headers", () => ({headers: request.headers}));
vi.mock("../../src/lib/db/rate-limits", () => ({consumeRateLimit: vi.fn()}));
const signingSecret = "synthetic-test-key-with-at-least-32-bytes";
const retryAt = "2026-11-01T00:10:00.000Z";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-01T00:00:00Z"));
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("VERCEL", "1");
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("SIGNING_SECRET", signingSecret);
  request.values.clear();
  request.values.set("x-vercel-forwarded-for", "192.0.2.10");
  request.headers.mockReset().mockResolvedValue({get: (name: string) => request.values.get(name) ?? null});
  vi.mocked(consumeRateLimit).mockReset().mockResolvedValue({allowed: true, remaining: 9, resetAt: retryAt, retryAt: null});
});

it("uses four separate approved budgets with opaque HMAC keys and no raw identity in storage", async () => {
  for (const operation of ["search", "analysis", "report", "card"] as const) await limitRequest(operation);
  const calls = vi.mocked(consumeRateLimit).mock.calls.map(([input]) => input);
  expect(calls).toEqual(Object.entries(requestLimits).map(([operation, policy]) => ({
    ...policy, key: createHmac("sha256", signingSecret).update(JSON.stringify([
      "request-v1", operation, Math.floor(Date.now() / policy.windowMs), "192.0.2.10",
    ])).digest("hex"),
  })));
  expect(new Set(calls.map(value => (value as {key: string}).key)).size).toBe(4);
  expect(JSON.stringify(calls)).not.toContain("192.0.2.10");
  expect(JSON.stringify(calls)).not.toContain(signingSecret);
});

it("does not trust spoofed fallback headers or browser cookies", async () => {
  await limitRequest("analysis");
  const original = vi.mocked(consumeRateLimit).mock.calls[0][0];
  request.values.set("x-forwarded-for", "198.51.100.50");
  request.values.set("x-real-ip", "203.0.113.90");
  request.values.set("cookie", "session=attacker-controlled");
  await limitRequest("analysis");
  expect(vi.mocked(consumeRateLimit).mock.calls[1][0]).toEqual(original);
});

it("canonicalizes IPv6 spellings before keying the budget", async () => {
  request.values.set("x-vercel-forwarded-for", "2001:0db8:0000:0000:0000:0000:0000:0001");
  await limitRequest("report");
  request.values.set("x-vercel-forwarded-for", "2001:db8::1");
  await limitRequest("report");
  expect(vi.mocked(consumeRateLimit).mock.calls[0][0]).toEqual(vi.mocked(consumeRateLimit).mock.calls[1][0]);
});

it.each(["", "192.0.2.1, 198.51.100.2", "unknown", "https://192.0.2.1", "[2001:db8::1]"])("fails closed for missing/ambiguous platform identity: %s", async ip => {
  request.values.set("x-vercel-forwarded-for", ip);
  request.values.set("x-forwarded-for", "192.0.2.1");
  await expect(limitRequest("search")).rejects.toMatchObject({code: "configuration"});
  expect(consumeRateLimit).not.toHaveBeenCalled();
});

it.each([{VERCEL: ""}, {VERCEL_ENV: ""}, {VERCEL_ENV: "development"}])("requires deployment system configuration rather than a client header: %j", async patch => {
  for (const [key, value] of Object.entries(patch)) vi.stubEnv(key, value);
  await expect(limitRequest("search")).rejects.toMatchObject({code: "configuration"});
  expect(consumeRateLimit).not.toHaveBeenCalled();
});

it("shares local development budgets and never reads an IP header", async () => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("VERCEL", "");
  await limitRequest("card");
  request.values.set("x-vercel-forwarded-for", "203.0.113.1");
  await limitRequest("card");
  expect(vi.mocked(consumeRateLimit).mock.calls[0][0]).toEqual(vi.mocked(consumeRateLimit).mock.calls[1][0]);
  expect(request.headers).not.toHaveBeenCalled();
});

it.each(["", "too-short", " ".repeat(32)])("requires a server secret before any request budget is used", async secret => {
  vi.stubEnv("SIGNING_SECRET", secret);
  await expect(limitRequest("search")).rejects.toMatchObject({code: "configuration"});
  expect(consumeRateLimit).not.toHaveBeenCalled();
});

it("keeps the profile/scope cooldown separate from IP and repo ordering", async () => {
  await limitAnalysis(analysisScope(7, [20, 10]));
  request.values.set("x-vercel-forwarded-for", "198.51.100.99");
  await limitAnalysis(analysisScope(7, [10, 20]));
  expect(vi.mocked(consumeRateLimit).mock.calls[0][0]).toEqual(vi.mocked(consumeRateLimit).mock.calls[1][0]);
  expect(vi.mocked(consumeRateLimit).mock.calls[0][0]).toMatchObject({limit: 1, windowMs: 60_000});
  await limitAnalysis(analysisScope(7, [10]));
  expect(vi.mocked(consumeRateLimit).mock.calls[2][0]).not.toEqual(vi.mocked(consumeRateLimit).mock.calls[0][0]);
});

it("returns the actual stored retry time and permits a later consumption after expiry", async () => {
  vi.mocked(consumeRateLimit).mockResolvedValueOnce({allowed: false, remaining: 0, resetAt: retryAt, retryAt});
  await expect(limitRequest("analysis")).rejects.toMatchObject({code: "rateLimit", retryAt});
  await expect(limitRequest("analysis")).resolves.toBeUndefined();
});

it("rotates IP keys at aligned window boundaries, reports their true next availability and preserves the cooldown", async () => {
  vi.setSystemTime(new Date("2026-11-01T00:09:59Z"));
  vi.mocked(consumeRateLimit).mockResolvedValueOnce({allowed: false, remaining: 0, resetAt: "2026-11-01T00:19:59Z", retryAt: "2026-11-01T00:19:59Z"});
  await expect(limitRequest("analysis")).rejects.toMatchObject({retryAt: "2026-11-01T00:10:00.000Z"});
  const before = vi.mocked(consumeRateLimit).mock.calls[0][0];
  await limitAnalysis(analysisScope(7, [10]));
  const cooldown = vi.mocked(consumeRateLimit).mock.calls[1][0];
  vi.advanceTimersByTime(1000);
  await limitRequest("analysis");
  await limitAnalysis(analysisScope(7, [10]));
  expect(vi.mocked(consumeRateLimit).mock.calls[2][0]).not.toEqual(before);
  expect(vi.mocked(consumeRateLimit).mock.calls[3][0]).toEqual(cooldown);
});

it.each([
  [new StorageError("configuration"), "configuration"],
  [new StorageError("unavailable"), "unavailable"],
  [new Error("sensitive database details"), "unavailable"],
])("does not turn infrastructure errors into quota decisions", async (error, code) => {
  vi.mocked(consumeRateLimit).mockRejectedValue(error);
  let failure;
  try { await limitRequest("search"); } catch (caught) { failure = requestFailure(caught); }
  expect(failure).toEqual({code});
  expect(JSON.stringify(failure)).not.toContain("sensitive");
});
