import {beforeEach, expect, it, vi} from "vitest";
import {getLocale} from "next-intl/server";
import {generateCard} from "../../src/features/cards/actions";
import {renderCard} from "../../src/features/cards/image";
import {readSnapshot} from "../../src/lib/db/snapshots";
import {reportSchema} from "../../src/lib/db/snapshot-schema";
import {report} from "../db/fixtures";

vi.mock("next-intl/server", () => ({getLocale: vi.fn()}));
vi.mock("../../src/lib/db/snapshots", () => ({readSnapshot: vi.fn()}));
vi.mock("../../src/features/cards/image", () => ({renderCard: vi.fn()}));
const id = "11111111-1111-4111-8111-111111111111", token = "a".repeat(64);
const input = {id, token, format: "story"};

beforeEach(() => {
  vi.mocked(getLocale).mockReset().mockResolvedValue("tr");
  vi.mocked(readSnapshot).mockReset().mockResolvedValue({id, snapshotVersion: 1, selectedRepoIds: [10], scopeHash: "f".repeat(64),
    createdAt: "2026-10-29T12:00:00Z", expiresAt: "2026-11-28T12:00:00Z", report: reportSchema.parse(report())});
  vi.mocked(renderCard).mockReset().mockResolvedValue(new Uint8Array([137, 80, 78, 71]).buffer);
});

it.each([null, {}, {...input, token: "wrong"}, {...input, id: "wrong"}, {...input, format: "square"}, {...input, report: report()}, {...input, locale: "en"}])("rejects invalid or client-supplied report data before storage access", async value => {
  expect(await generateCard(value)).toEqual({status: "error", code: "invalid"});
  expect(readSnapshot).not.toHaveBeenCalled();
  expect(renderCard).not.toHaveBeenCalled();
});

it("revalidates access on each generation and gives missing, wrong-token and expired results no image", async () => {
  expect((await generateCard(input)).status).toBe("success");
  vi.mocked(readSnapshot).mockResolvedValue(null);
  expect(await generateCard(input)).toEqual({status: "error", code: "missing"});
  expect(readSnapshot).toHaveBeenCalledTimes(2);
  expect(readSnapshot).toHaveBeenLastCalledWith(id, token);
  expect(renderCard).toHaveBeenCalledTimes(1);
});

it("returns safe storage errors instead of treating DB access failure as a missing record", async () => {
  vi.mocked(readSnapshot).mockRejectedValue(new Error("private database diagnostics"));
  expect(await generateCard(input)).toEqual({status: "error", code: "unavailable"});
  expect(renderCard).not.toHaveBeenCalled();
});

it("blocks incomplete snapshots on the server even if a client enables its button", async () => {
  const stored = await readSnapshot(id, token);
  vi.mocked(readSnapshot).mockResolvedValue({...stored!, report: reportSchema.parse(report(3, true))});
  expect(await generateCard(input)).toEqual({status: "error", code: "incomplete"});
  expect(renderCard).not.toHaveBeenCalled();
});

it("renders only the stored report in the server's locale, returning image bytes and dimensions without access data", async () => {
  vi.mocked(getLocale).mockResolvedValue("en");
  const result = await generateCard({...input, format: "landscape"});
  expect(result).toEqual({status: "success", format: "landscape", locale: "en", width: 1200, height: 630, png: "iVBORw=="});
  expect(renderCard).toHaveBeenCalledWith(expect.objectContaining({username: "mira-sample", score: "90", title: ["SHOWCASE", "READY"]}), "landscape");
  expect(JSON.stringify(result)).not.toContain(token);
  expect(JSON.stringify(vi.mocked(renderCard).mock.calls)).not.toContain(token);
  expect(fetch).not.toHaveBeenCalled();
});

it("does not expose rendering diagnostics", async () => {
  vi.mocked(renderCard).mockRejectedValue(new Error("private rendering diagnostics"));
  expect(await generateCard(input)).toEqual({status: "error", code: "render"});
});
