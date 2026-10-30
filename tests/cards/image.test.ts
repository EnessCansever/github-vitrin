import {beforeEach, expect, it, vi} from "vitest";
import {cardContent} from "../../src/features/cards/content";
import {renderCard} from "../../src/features/cards/image";
import {report} from "../db/fixtures";

beforeEach(() => {
  vi.mocked(fetch).mockRejectedValue(new Error("Network disabled; use the renderer's local WASM fallback"));
});

it.each(["story", "landscape"] as const)("renders a real %s PNG at its exact export resolution using local fonts without network access", async format => {
  const content = cardContent(report(3), "tr");
  expect(content).not.toBeNull();
  const before = structuredClone(content);
  const png = Buffer.from(await renderCard(content!, format));
  expect(Buffer.from(await renderCard(content!, format))).toEqual(png);
  expect(content).toEqual(before);
  expect(png.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual(format === "story" ? [1080, 1920] : [1200, 630]);
  for (const [url] of vi.mocked(fetch).mock.calls) expect(new URL(String(url)).protocol).toBe("data:");
}, 15_000);
