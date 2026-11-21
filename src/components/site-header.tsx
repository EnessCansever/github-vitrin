import {SkipLink} from "./skip-link";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import {Suspense} from "react";
import {LocaleSwitch} from "./locale-switch";
import { site } from "@/config/site";

export async function SiteHeader() {
  const t = await getTranslations("Common");
  const locale = await getLocale();

  return (
    <>
      <SkipLink label={t("skip")} />
      <header className="site-header">
        <div className="site-header-inner shell">
          <Link href="/" className="brand" aria-label={`${site.name} · ${t("home")}`}>
            <span className="diamond" aria-hidden="true" />
            {site.name}
          </Link>
          <Suspense><LocaleSwitch locale={locale} label={t("language")} /></Suspense>
        </div>
      </header>
    </>
  );
}
