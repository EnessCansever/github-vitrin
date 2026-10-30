import {renderToStaticMarkup} from "react-dom/server";
import {NextIntlClientProvider} from "next-intl";
import {expect, it} from "vitest";
import {CardStudio} from "../../src/features/cards/card-studio";
import tr from "../../src/messages/tr.json";
import en from "../../src/messages/en.json";

it.each(["tr", "en"] as const)("explains why an incomplete report cannot export a scored card in %s", locale => {
  const messages = locale === "tr" ? tr : en;
  const html = renderToStaticMarkup(<NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC"><CardStudio id="11111111-1111-4111-8111-111111111111" complete={false} /></NextIntlClientProvider>);
  expect(html).toContain('disabled=""');
  expect(html).toContain('class="button button-disabled"');
  expect(html).toContain('aria-describedby="card-incomplete"');
  expect(html).toContain(messages.Card.incomplete);
  expect(html).not.toContain("download=");
  expect(html).not.toContain("data:image");
  expect(fetch).not.toHaveBeenCalled();
});
