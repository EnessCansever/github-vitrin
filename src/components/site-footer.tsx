import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { site } from "@/config/site";

export async function SiteFooter() {
  const t = await getTranslations("Common");
  return (
    <footer className="site-footer shell">
      <span className="brand brand-small"><span className="diamond" aria-hidden="true" />{site.name}</span>
      <nav aria-label={t("siteInfo")} className="footer-links">
        <Link className="text-link" href="/privacy">{t("privacy")}</Link>
        <Link className="text-link" href="/methodology">{t("methodology")}</Link>
      </nav>
      <div>
        <p>{t("author", { name: site.author })}</p>
        <nav aria-label={t("developerLinks")} className="footer-links">
          {site.profiles.map(({name, url}) => (
            <a key={name} className="text-link" href={url} target="_blank" rel="noopener noreferrer">{name}</a>
          ))}
          <a className="text-link" href={`mailto:${site.email}`}>{t("email")}</a>
        </nav>
      </div>
    </footer>
  );
}
