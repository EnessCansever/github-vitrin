import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { demo } from "@/features/analysis/demo";
import { site } from "@/config/site";

export async function ResultSummary({ compact = false }: { compact?: boolean }) {
  const t = await getTranslations("Demo");
  const card = await getTranslations("Identity");
  const common = await getTranslations("Common");
  const home = await getTranslations("Home");
  const format = await getFormatter();
  const Heading = compact ? "h2" : "h1";
  const titleId = compact ? "preview-title" : "result-title";

  return (
    <section className={`identity-card${compact ? " identity-card--hero" : ""}`} aria-labelledby={titleId}>
      <div className="identity-masthead">
        <span className="identity-brand">{site.name}</span>
        <p><span>{card("label")}</span><span>{common("demo")}</span></p>
      </div>
      <div className="identity-person">
        <span className="identity-avatar" aria-hidden="true">{demo.initials}</span>
        <div>
          <p className="identity-handle">@{demo.username}</p>
          <p className="identity-caption">{card("fictional")}</p>
        </div>
        <span className="identity-stamp" aria-hidden="true"><span>{t("title")}</span><ArrowDownRight size={22} /></span>
      </div>
      <div className="identity-headline">
        <Heading id={titleId} className="identity-type">{t("title")}</Heading>
        <div className="identity-score">
          <strong>{format.number(demo.score)}</strong>
          <p>{t("scoreLabel")}<span>/ 100</span></p>
        </div>
      </div>
      <ul className="identity-categories" aria-label={card("categories")}>
        {demo.categories.map(category => (
          <li key={category.id}>
            <span>{t(category.id)}</span>
            <span className="identity-track" aria-hidden="true"><span style={{width: `${category.score / category.max * 100}%`}} /></span>
            <strong>{common("points", {earned: format.number(category.score), max: category.max})}</strong>
          </li>
        ))}
      </ul>
      <div className="identity-footer">
        {compact ? (
          <Link href="/demo">{home("previewLink")}<ArrowUpRight size={18} aria-hidden="true" /></Link>
        ) : (
          <p>{t("summary")}</p>
        )}
        <span className="identity-caption">{card("presentation")}</span>
      </div>
      {!compact && (
        <details className="evidence identity-evidence">
          <summary>{t("typeReasonLabel")}<ChevronDown size={16} aria-hidden="true" /></summary>
          <div className="evidence-body">
            <p>{t("typeReason")}</p>
            <p>{t("scope", {count: demo.repoCount})} · {common("rule", {version: demo.rulesVersion})}</p>
          </div>
        </details>
      )}
    </section>
  );
}
