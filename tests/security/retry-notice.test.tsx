import {renderToStaticMarkup} from "react-dom/server";
import {NextIntlClientProvider} from "next-intl";
import {expect, it} from "vitest";
import {RetryNotice} from "../../src/components/retry-notice";
import tr from "../../src/messages/tr.json";
import en from "../../src/messages/en.json";

it.each(["tr", "en"] as const)("renders a supplied reset time in %s without a made-up countdown", locale => {
  const messages = locale === "tr" ? tr : en;
  const render = (retryAt?: string) => renderToStaticMarkup(<NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
    <RetryNotice retryAt={retryAt} />
  </NextIntlClientProvider>);
  expect(render("2026-11-01T14:09:37Z")).toContain(locale === "tr" ? "14:09:37" : "2:09:37 PM");
  expect(render("2026-11-01T14:09:37Z")).toContain("UTC");
  expect(render()).toBe("");
});
