import {beforeEach, expect, it, vi} from "vitest";
import {getRepos} from "../../src/features/analysis/actions";
import {StorageError} from "../../src/lib/db/errors";

vi.mock("next/headers", () => ({cookies: async () => { throw new Error("sensitive cookie details"); }}));

const db = vi.hoisted(() => ({get: vi.fn(), index: vi.fn(), update: vi.fn()}));
vi.mock("../../src/lib/db/client", async original => ({
  ...await original<typeof import("../../src/lib/db/client")>(), getDatabase: db.get,
}));

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("SIGNING_SECRET", "synthetic-signing-secret-at-least-32-bytes");
  db.get.mockReset().mockResolvedValue({collection: () => ({createIndex: db.index, findOneAndUpdate: db.update})});
  db.index.mockReset().mockResolvedValue("rate_limit_expiry");
  db.update.mockReset();
});

it.each([
  ["db_connect", "server_selection"],
  ["quota_index", "authorization"],
  ["quota_update", "driver_failure"],
  ["quota_result", "invalid_record"],
  ["session", "unavailable"],
] as const)("logs only the stage and safe category for %s", async (stage, category) => {
  const log = vi.spyOn(console, "warn").mockImplementation(() => {});
  if (stage === "db_connect") db.get.mockRejectedValue(new StorageError("unavailable", "server_selection"));
  if (stage === "quota_index") db.index.mockRejectedValue(Object.assign(new Error("sensitive driver details"), {code: 13}));
  if (stage === "quota_update") db.update.mockRejectedValue(new Error("sensitive driver details"));
  if (stage === "quota_result") db.update.mockResolvedValue({raw: "sensitive record"});
  if (stage === "session") db.update.mockImplementation(async ({_id}) => ({
    _id, limit: 20, windowMs: 600_000, count: 1, allowed: true, expiresAt: new Date(Date.now() + 600_000),
  }));
  expect(await getRepos("private-input")).toEqual({status: "error", code: "unavailable"});
  expect(log).toHaveBeenCalledExactlyOnceWith("profile_search_admission_failed", {
    stage, category, correlationId: expect.stringMatching(/^[a-f0-9-]{36}$/), durationMs: expect.any(Number),
  });
  expect(fetch).not.toHaveBeenCalled();
});
