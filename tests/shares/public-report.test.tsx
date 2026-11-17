import {renderToStaticMarkup} from "react-dom/server";
import {NextIntlClientProvider} from "next-intl";
import {expect, it} from "vitest";
import {PublicReport} from "../../src/features/shares/public-report";
import {shareSummary} from "../../src/lib/db/share-schema";
import {report} from "../db/fixtures";
import tr from "../../src/messages/tr.json";
import en from "../../src/messages/en.json";

it.each(["tr", "en"] as const)("renders only the public summary in %s, including truthful incomplete values", locale => {
  for (const incomplete of [false, true]) {
    const summary = shareSummary(report(3, incomplete));
    const share = {id:"a".repeat(48), createdAt:"2026-11-17T13:00:00Z", expiresAt:"2027-02-15T13:00:00Z", summary};
    const html = renderToStaticMarkup(<NextIntlClientProvider locale={locale} messages={locale === "tr" ? tr : en} timeZone="UTC"><PublicReport share={share} /></NextIntlClientProvider>);
    expect(html).toContain("@mira-sample");
    expect(html).toContain((locale === "tr" ? tr : en).Sharing.publicNote);
    for (const forbidden of ["#token", "managementToken", "readTokenHash", "localStorage", "compare-reports", "previous-report", "<form", "data-clipboard", "repo:10:description"]) expect(html).not.toContain(forbidden);
    if (incomplete) {expect(html).toContain("<strong>—</strong>"); expect(summary.profileType).toBeNull();}
  }
});
