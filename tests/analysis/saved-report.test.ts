import {beforeEach, expect, it, vi} from "vitest";
import {loadReport} from "../../src/features/reports/actions";
import {reportHref} from "../../src/features/reports/link";
import {readSnapshot} from "../../src/lib/db/snapshots";
import {StorageError} from "../../src/lib/db/errors";
import {reportSchema} from "../../src/lib/db/snapshot-schema";
import {report} from "../db/fixtures";

vi.mock("../../src/lib/db/snapshots", () => ({readSnapshot: vi.fn()}));
const id = "11111111-1111-4111-8111-111111111111";
const token = "a".repeat(64);
beforeEach(() => {vi.mocked(readSnapshot).mockReset();});

it.each([null, {}, {id, token: ""}, {id: "wrong", token}, {id, token: [token]}, {id, token, score: 100}])("rejects invalid access before database use", async input => {
  expect(await loadReport(input)).toEqual({status: "missing"});
  expect(readSnapshot).not.toHaveBeenCalled();
  expect(fetch).not.toHaveBeenCalled();
});

it.each([false, true])("returns the stored report unchanged without a token/hash or fresh GitHub access; incomplete=%s", async incomplete => {
  const value = reportSchema.parse(report(3, incomplete));
  const expiresAt = "2026-11-28T12:00:00Z";
  vi.mocked(readSnapshot).mockResolvedValue({id, snapshotVersion: 1, selectedRepoIds: [10, 11, 12], scopeHash: "f".repeat(64),
    createdAt: "2026-10-29T12:00:00Z", expiresAt, report: value});
  const result = await loadReport({id, token});
  expect(result).toEqual({status: "success", report: value, expiresAt});
  expect(readSnapshot).toHaveBeenCalledExactlyOnceWith(id, token);
  expect(JSON.stringify(result)).not.toContain(token);
  expect(result).not.toHaveProperty("readTokenHash");
  expect(fetch).not.toHaveBeenCalled();
});

it("shows invalid, wrong-token, missing and expired access as missing when storage returns no record", async () => {
  vi.mocked(readSnapshot).mockResolvedValue(null);
  expect(await loadReport({id, token})).toEqual({status: "missing"});
});

it.each([new StorageError("unavailable"), new StorageError("configuration"), new StorageError("invalid_record"), new Error("sensitive DB details")])("distinguishes database failures from missing reports without raw diagnostics", async error => {
  vi.mocked(readSnapshot).mockRejectedValue(error);
  expect(await loadReport({id, token})).toEqual({status: "unavailable"});
});

it("keeps the capability in the URL fragment, outside the HTTP path/query and locale", () => {
  const href = reportHref({id, readToken: token});
  const url = new URL(href, "https://example.org");
  expect(url.pathname).toBe(`/reports/${id}`);
  expect(url.search).toBe("");
  expect(url.hash).toBe(`#token=${token}`);
  expect(href).not.toContain("locale");
});
