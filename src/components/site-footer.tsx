import { getTranslations } from "next-intl/server";
import { site } from "@/config/site";

export async function SiteFooter() {
  const t = await getTranslations("Common");
  return (
    <footer className="site-footer shell">
      <span className="brand brand-small"><span className="diamond" aria-hidden="true" />{site.name}</span>
      <p>{t("author", { name: site.author })}</p>
    </footer>
  );
}
