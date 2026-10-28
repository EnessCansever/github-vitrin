import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { setLocale } from "@/i18n/actions";
import { site } from "@/config/site";

export async function SiteHeader() {
  const t = await getTranslations("Common");
  const locale = await getLocale();

  return (
    <>
      <a className="skip-link" href="#main">{t("skip")}</a>
      <header className="site-header">
        <div className="site-header-inner shell">
          <Link href="/" className="brand" aria-label={`${site.name} · ${t("home")}`}>
            <span className="diamond" aria-hidden="true" />
            {site.name}
          </Link>
          <form action={setLocale}>
            <fieldset className="language-switch">
              <legend className="sr-only">{t("language")}</legend>
              {(["tr", "en"] as const).map((language) => (
                <button
                  key={language}
                  name="locale"
                  value={language}
                  type="submit"
                  lang={language}
                  aria-pressed={locale === language}
                >
                  {language.toUpperCase()}
                </button>
              ))}
            </fieldset>
          </form>
        </div>
      </header>
    </>
  );
}
