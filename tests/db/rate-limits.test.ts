import {MongoServerError} from "mongodb";
import {beforeEach, expect, it, vi} from "vitest";
import {consumeRateLimit} from "../../src/lib/db/rate-limits";
import {StorageError} from "../../src/lib/db/errors";

const db = vi.hoisted(() => ({get: vi.fn(), collection: vi.fn(), createIndex: vi.fn(), update: vi.fn()}));
vi.mock("../../src/lib/db/client", () => ({getDatabase: db.get}));

const key = "a".repeat(64);
const input = {key, limit: 10, windowMs: 600_000};
const resetAt = "2026-10-31T00:10:00.000Z";

function record(count: number, allowed = true, patch = {}) {
  return {_id: key, limit: input.limit, windowMs: input.windowMs, count, allowed, expiresAt: new Date(resetAt), ...patch};
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-31T00:00:00Z"));
  db.get.mockReset().mockResolvedValue({collection: db.collection});
  db.collection.mockReset().mockReturnValue({createIndex: db.createIndex, findOneAndUpdate: db.update});
  db.createIndex.mockReset().mockResolvedValue("rate_limit_expiry");
  db.update.mockReset().mockResolvedValue(record(1));
});

it("returns first, within-window, boundary and rejected decisions without extending the reset", async () => {
  db.update.mockResolvedValueOnce(record(1)).mockResolvedValueOnce(record(9))
    .mockResolvedValueOnce(record(10)).mockResolvedValueOnce(record(10, false));
  expect(await consumeRateLimit(input)).toEqual({allowed: true, remaining: 9, resetAt, retryAt: null});
  expect(await consumeRateLimit(input)).toEqual({allowed: true, remaining: 1, resetAt, retryAt: null});
  expect(await consumeRateLimit(input)).toEqual({allowed: true, remaining: 0, resetAt, retryAt: null});
  expect(await consumeRateLimit(input)).toEqual({allowed: false, remaining: 0, resetAt, retryAt: resetAt});
  expect(db.collection).toHaveBeenCalledWith("rateLimits");
  expect(db.createIndex).toHaveBeenCalledWith({expiresAt: 1}, {name: "rate_limit_expiry", expireAfterSeconds: 0});
  expect(db.update).toHaveBeenCalledTimes(4);
  expect(db.update.mock.calls[0]).toEqual([
    {_id: key}, expect.any(Array), {upsert: true, returnDocument: "after", writeConcern: {w: "majority"}},
  ]);
});

it("isolates keys and does not reuse a previous caller's decision", async () => {
  const secondKey = "b".repeat(64);
  db.update.mockResolvedValueOnce(record(10, false)).mockResolvedValueOnce(record(1, true, {_id: secondKey}));
  expect((await consumeRateLimit(input)).allowed).toBe(false);
  expect(await consumeRateLimit({...input, key: secondKey})).toMatchObject({allowed: true, remaining: 9});
  expect(db.update.mock.calls.map(call => call[0])).toEqual([{_id: key}, {_id: secondKey}]);
});

it("accepts a renewed window returned by MongoDB without relying on TTL deletion", async () => {
  vi.setSystemTime(new Date(resetAt));
  db.update.mockResolvedValue(record(1, true, {expiresAt: new Date("2026-10-31T00:20:00Z")}));
  expect(await consumeRateLimit(input)).toEqual({
    allowed: true, remaining: 9, resetAt: "2026-10-31T00:20:00.000Z", retryAt: null,
  });
});

it("returns each concurrent operation's own post-image, including creation races", async () => {
  db.update.mockRejectedValueOnce(new MongoServerError({code: 11000, message: "duplicate key"}))
    .mockResolvedValueOnce(record(9)).mockResolvedValueOnce(record(10))
    .mockResolvedValueOnce(record(10, false));
  const results = await Promise.all([consumeRateLimit(input), consumeRateLimit(input), consumeRateLimit(input)]);
  expect(results.filter(value => value.allowed)).toHaveLength(2);
  expect(results.filter(value => !value.allowed)).toHaveLength(1);
  expect(results.map(value => value.remaining).sort()).toEqual([0, 0, 1]);
  expect(db.update).toHaveBeenCalledTimes(4);
  expect(db.update.mock.calls[3][2]).toEqual({upsert: false, returnDocument: "after", writeConcern: {w: "majority"}});
});

it("bounds duplicate-key recovery and sanitizes a second conflict", async () => {
  db.update.mockRejectedValue(new MongoServerError({code: 11000, message: "sensitive key"}));
  await expect(consumeRateLimit(input)).rejects.toMatchObject({code: "unavailable", message: "unavailable"});
  expect(db.update).toHaveBeenCalledTimes(2);
});

it("does not grant or report quota exhaustion when the competing record disappears", async () => {
  db.update.mockRejectedValueOnce(new MongoServerError({code: 11000, message: "duplicate key"})).mockResolvedValueOnce(null);
  await expect(consumeRateLimit(input)).rejects.toMatchObject({code: "unavailable"});
});

it("rejects conflicting active-window policies instead of granting a larger limit", async () => {
  db.update.mockResolvedValue(record(5, false));
  await expect(consumeRateLimit({...input, limit: 20})).rejects.toMatchObject({code: "invalid_limit"});
  await expect(consumeRateLimit({...input, windowMs: 60_000})).rejects.toMatchObject({code: "invalid_limit"});
});

it("allows caller-provided policies in a newly reset window", async () => {
  db.update.mockResolvedValue(record(1, true, {limit: 1, windowMs: 60_000, expiresAt: new Date("2026-10-31T00:01:00Z")}));
  expect(await consumeRateLimit({key, limit: 1, windowMs: 60_000})).toEqual({
    allowed: true, remaining: 0, resetAt: "2026-10-31T00:01:00.000Z", retryAt: null,
  });
});

it.each([
  null, {}, {...input, key: ""}, {...input, key: "user@example.invalid"}, {...input, key: "a".repeat(65)},
  {...input, key: {$ne: null}}, {...input, limit: 0}, {...input, limit: -1}, {...input, limit: 1.5},
  {...input, limit: Number.MAX_SAFE_INTEGER + 1}, {...input, windowMs: 0}, {...input, windowMs: -1},
  {...input, windowMs: 0.5}, {...input, windowMs: Infinity}, {...input, windowMs: Number.MAX_SAFE_INTEGER},
  {...input, windowMs: "600000"}, {...input, rawIp: "not accepted"},
])("rejects malformed inputs before database access: %j", async value => {
  await expect(consumeRateLimit(value)).rejects.toMatchObject({code: "invalid_limit", message: "invalid_limit"});
  expect(db.get).not.toHaveBeenCalled();
});

it.each([
  record(0), record(11), record(9, false), record(1, true, {_id: "b".repeat(64)}),
  record(1, true, {expiresAt: "not a date"}), record(1, true, {unexpected: "not accepted"}),
])("rejects malformed database decisions: %j", async value => {
  db.update.mockResolvedValue(value);
  await expect(consumeRateLimit(input)).rejects.toMatchObject({code: "invalid_record"});
});

it.each(["connect", "index", "update", "null"])("sanitizes %s errors without an allow/deny fallback", async step => {
  const error = new Error("sensitive connection details");
  if (step === "connect") db.get.mockRejectedValue(error);
  if (step === "index") db.createIndex.mockRejectedValue(error);
  if (step === "update") db.update.mockRejectedValue(error);
  if (step === "null") db.update.mockResolvedValue(null);
  await expect(consumeRateLimit(input)).rejects.toMatchObject({code: "unavailable", message: "unavailable"});
  expect(db.update).toHaveBeenCalledTimes(step === "connect" || step === "index" ? 0 : 1);
});

it("preserves safe configuration errors without retrying an ambiguous write", async () => {
  db.get.mockRejectedValue(new StorageError("configuration"));
  await expect(consumeRateLimit(input)).rejects.toMatchObject({code: "configuration"});
  expect(db.update).not.toHaveBeenCalled();
  db.get.mockResolvedValue({collection: db.collection});
  db.update.mockRejectedValue(new MongoServerError({code: 89, message: "network failure after write"}));
  await expect(consumeRateLimit(input)).rejects.toMatchObject({code: "unavailable"});
  expect(db.update).toHaveBeenCalledTimes(1);
});
