import {entries, images} from "../cards/image-store";
vi.mock("../../src/lib/db/client", async () => (await import("../cards/image-store")).imageDatabase);
import {beforeEach, expect, it, vi} from "vitest";
import {getLocale} from "next-intl/server";
import {generateCard} from "../../src/features/cards/actions";
import {renderCard} from "../../src/features/cards/image";
import {readSnapshot} from "../../src/lib/db/snapshots";
import {reportSchema} from "../../src/lib/db/snapshot-schema";
import {report} from "../db/fixtures";

vi.mock("../../src/lib/security/requests", () => ({
  limitRequest: vi.fn(async () => {}), limitAnalysis: vi.fn(async () => {}), requestFailure: () => null,
}));
vi.mock("next-intl/server", () => ({getLocale: vi.fn()}));
vi.mock("../../src/lib/db/snapshots", () => ({readSnapshot: vi.fn()}));
vi.mock("../../src/features/cards/image", () => ({renderCard: vi.fn()}));
const id = "11111111-1111-4111-8111-111111111111", token = "a".repeat(64);
const input = {id, token, format: "story"};

beforeEach(() => {
  entries.clear();
  vi.mocked(getLocale).mockReset().mockResolvedValue("tr");
  vi.mocked(readSnapshot).mockReset().mockResolvedValue({id, snapshotVersion: 1, selectedRepoIds: [10], scopeHash: "f".repeat(64),
    createdAt: "2026-10-29T12:00:00Z", expiresAt: new Date(Date.now() + 60_000).toISOString(), report: reportSchema.parse(report())});
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

it("reuses one authorized PNG and separates format and language", async () => {
  const first = await generateCard(input);
  expect(await generateCard(input)).toEqual(first);
  expect(renderCard).toHaveBeenCalledTimes(1);
  expect(await generateCard({...input, format: "post"})).toMatchObject({width: 1080, height: 1350});
  vi.mocked(getLocale).mockResolvedValue("en");
  await generateCard(input);
  expect(entries.size).toBe(3);
  images.findOne.mockRejectedValueOnce(new Error("database unavailable"));
  expect(await generateCard(input)).toEqual({status: "error", code: "unavailable"});
  expect(renderCard).toHaveBeenCalledTimes(3);
});

it("binds cached progress cards to both authorized snapshots, their earliest expiry, format and language", async () => {
  const after = (await readSnapshot(id, token))!;
  const previous = {id: "22222222-2222-4222-8222-222222222222", token: "b".repeat(64)};
  const before = {...after, id: previous.id, expiresAt: new Date(Date.now() + 30_000).toISOString(),
    report: {...after.report, checkedAt: "2026-10-27T10:00:00Z"}};
  const alternate = "33333333-3333-4333-8333-333333333333";
  vi.mocked(readSnapshot).mockImplementation(async (key, value) => {
    if (key === id && value === token) return after;
    if ((key === previous.id || key === alternate) && value === previous.token) return {...before, id: key};
    return null;
  });
  const request = {...input, previous};
  expect((await generateCard(request)).status).toBe("success");
  expect((await generateCard(request)).status).toBe("success");
  expect(entries.size).toBe(1);
  expect([...entries.values()][0].expiresAt.toISOString()).toBe(before.expiresAt);
  await generateCard({...request, previous: {...previous, id: alternate}});
  await generateCard({...request, format: "post"});
  vi.mocked(getLocale).mockResolvedValue("en");
  await generateCard(request);
  expect(entries.size).toBe(4);
  expect(await generateCard({...request, previous: {...previous, token}})).toMatchObject({code: "missing"});
  expect(await generateCard({...request, token: previous.token})).toMatchObject({code: "missing"});
  const failed = async (code: string) => expect(await generateCard(request)).toMatchObject({status: "error", code});
  before.report.checkedAt = after.report.checkedAt;
  await failed("incompatible");
  before.report = {...reportSchema.parse(report(2)), checkedAt: "2026-10-27T10:00:00Z"};
  await failed("incompatible");
  before.report = {...reportSchema.parse(report(1, true)), checkedAt: "2026-10-27T10:00:00Z"};
  await failed("incomplete");
  before.expiresAt = new Date(0).toISOString();
  await failed("missing");
  expect(renderCard).toHaveBeenCalledTimes(4);
});
