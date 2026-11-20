import {expect, it, vi} from "vitest";
import {compareReports} from "../../src/features/reports/comparison";
import {progressContent} from "../../src/features/cards/content";
import {renderCard} from "../../src/features/cards/image";
import {cardFormats} from "../../src/features/cards/types";
import {scoreAnalysis} from "../../src/features/analysis/scoring/engine";
import {report} from "../db/fixtures";
import {input} from "../scoring/fixtures";

it.each(["story", "post", "landscape"] as const)("exports comparable scores and UTC dates in %s", async format => {
  vi.mocked(fetch).mockRejectedValue(new Error("offline"));
  const original = report(3);
  const full = {...original, ...scoreAnalysis(input(3))};
  for (const locale of ["tr", "en"] as const) {
    const before = format === "post" ? full : original;
    const later = format === "story" ? full : original;
    const after = {...later, profile: {...later.profile, login: "portfolio-developer-with-long-user-name"}, checkedAt: "2026-11-20T12:47:00Z"};
    const comparison = compareReports(before, after);
    if (comparison.status !== "compared") throw Error(comparison.reason);
    const content = progressContent(comparison, locale);
    expect(content.delta).toContain(format === "landscape" ? "0" : (format === "post" ? "-" : "+") + (locale === "tr" ? "3,3" : "3.3"));
    expect(content.measurements.map(m => m.date)).toEqual([expect.stringContaining("10:00"), expect.stringContaining("12:47")]);
    const bytes = Buffer.from(await renderCard(content, format));
    expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([cardFormats[format].width, cardFormats[format].height]);
  }
}, 15000);
