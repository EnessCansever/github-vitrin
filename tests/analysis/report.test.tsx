import {renderToStaticMarkup} from "react-dom/server";
import {NextIntlClientProvider} from "next-intl";
import {expect, it} from "vitest";
import {LiveReport} from "../../src/features/analysis/live-report";
import {scoreAnalysis} from "../../src/features/analysis/scoring/engine";
import type {Report} from "../../src/features/analysis/report";
import {GitHubError} from "../../src/lib/github/errors";
import {input} from "../scoring/fixtures";
import tr from "../../src/messages/tr.json";
import en from "../../src/messages/en.json";

function report(incomplete = false): Report {
  const value = input();
  value.profile.login = "live-user";
  value.repos[0].repo.owner.login = "live-user";
  if (incomplete) value.repos[0].readme = {status: "unknown", error: new GitHubError("network")};
  return {...scoreAnalysis(value), profile: {id: value.profile.id, login: value.profile.login}, repoCount: 1, checkedAt: "2026-10-28T12:00:00Z"};
}
function render(value: Report, locale: "tr" | "en" = "tr") {
  return renderToStaticMarkup(<NextIntlClientProvider locale={locale} messages={locale === "tr" ? tr : en} timeZone="UTC"><LiveReport report={value} /></NextIntlClientProvider>);
}

it("renders a complete live identity with engine values and real source links in both languages", () => {
  const value = report();
  const html = render(value);
  expect(html).toContain("@live-user");
  expect(html).toContain("Vitrini Hazır");
  expect(html).toContain('<strong>100</strong>');
  expect(html).toContain("https://github.com/live-user/project-10/blob/main/README.md#L5");
  expect(html).not.toContain("77,5");
  expect(html).not.toContain("Örnek analiz");
  expect(html).not.toContain("This application organizes reading notes.");
  const english = render(value, "en");
  expect(english).toContain("Showcase Ready");
  expect(english).toContain("Live analysis");
});

it("preserves null totals and missing profile type while exposing known category/check information", () => {
  const html = render(report(true));
  expect(html).toContain("Analiz eksik");
  expect(html).toContain('<strong>—</strong>');
  expect(html).toContain("20 / 20");
  expect(html).toContain("Veri belirsiz");
  expect(html).toContain("— / 10");
  expect(html).toContain("Repo açıklaması");
  expect(html).not.toContain("Vitrini Hazır");
  expect(html).not.toContain("Gizli Cevher");
  expect(html).not.toContain("/ 100");
  expect(html).not.toContain("identity-stamp");
});

it("displays recommendations in the server-provided order with their supplied point impacts", () => {
  const value = report();
  value.recommendations = [
    {checkId: "repo:10:topics", target: {kind: "repo", id: 10, name: "live-user/project-10"}, suggestionKey: "topics", rawImpact: 5, categoryImpact: 1.7},
    {checkId: "repo:10:description", target: {kind: "repo", id: 10, name: "live-user/project-10"}, suggestionKey: "description", rawImpact: 10, categoryImpact: 3.4},
  ];
  const html = render(value);
  expect(html.indexOf("ilgili bir topic ekle")).toBeLessThan(html.indexOf("kısa bir açıklama ekle"));
  expect(html).toContain("+1,7 puan");
  expect(html).toContain("+3,4 puan");
});

it.each(["tr", "en"] as const)("renders stored complete/incomplete reports in %s without a temporary-session claim", locale => {
  for (const incomplete of [false, true]) {
    const value = report(incomplete);
    const html = renderToStaticMarkup(<NextIntlClientProvider locale={locale} messages={locale === "tr" ? tr : en} timeZone="UTC"><LiveReport report={value} stored /></NextIntlClientProvider>);
    expect(html).toContain("@live-user");
    expect(html).not.toContain((locale === "tr" ? tr : en).Report.temporary);
    expect(html).toContain(incomplete ? '<strong>—</strong>' : '<strong>100</strong>');
  }
});
