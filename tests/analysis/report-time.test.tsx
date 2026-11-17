import {renderToString} from "react-dom/server";
import {NextIntlClientProvider} from "next-intl";
import {expect, it, vi} from "vitest";
import {formatReportTime, useReportTime} from "../../src/components/report-time";
import {LiveReport} from "../../src/features/analysis/live-report";
import {ComparisonView} from "../../src/features/reports/comparison-view";
import {compareReports} from "../../src/features/reports/comparison";
import {report} from "../db/fixtures";
import tr from "../../src/messages/tr.json";
import en from "../../src/messages/en.json";

const times = ["2026-11-17T12:45:00Z", "2026-11-17T12:47:00Z"];

it.each(["tr", "en"])("uses the requested browser zone with unchanged 24-hour times in %s", locale => {
  for (const [zone, hours] of [["Europe/Istanbul", ["15:45", "15:47"]], ["America/New_York", ["07:45", "07:47"]]] as const) {
    times.forEach((time, index) => {
      const text = formatReportTime(time, locale, zone);
      expect(text).toContain(hours[index]);
      expect(text).toContain(zone);
      expect(text).toContain("2026");
    });
  }
  expect(formatReportTime(times[0], locale, "Europe/Istanbul")).toContain(locale === "tr" ? "Kas" : "Nov");
});

it("uses the date's actual DST offset rather than a fixed hour adjustment", () => {
  expect(formatReportTime("2026-07-17T12:45:00Z", "en", "America/New_York")).toContain("08:45");
  expect(formatReportTime("2026-11-17T12:45:00Z", "en", "America/New_York")).toContain("07:45");
});

function HistoryOption() {
  const {formatTime} = useReportTime();
  return <select aria-label="history"><option>{formatTime(times[0])}</option></select>;
}

it.each(["tr", "en"] as const)("renders a deterministic UTC server snapshot across all analysis time surfaces in %s", locale => {
  vi.stubEnv("TZ", "Europe/Istanbul");
  const before = {...report(), checkedAt: times[0]}, after = {...report(), checkedAt: times[1]};
  const originals = structuredClone({before, after});
  const comparison = compareReports(before, after);
  const html = renderToString(<NextIntlClientProvider locale={locale} messages={locale === "tr" ? tr : en} timeZone="UTC">
    <LiveReport report={after} /><HistoryOption /><ComparisonView comparison={comparison} />
  </NextIntlClientProvider>);
  for (const time of times) expect(html).toContain(formatReportTime(time, locale, "UTC"));
  expect(html).not.toContain("Europe/Istanbul");
  expect(html).not.toContain("15:45");
  expect(comparison).toMatchObject({status: "compared", delta: 0});
  expect({before, after}).toEqual(originals);
});
