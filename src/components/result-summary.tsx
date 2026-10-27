import Link from "next/link";
import { ArrowUpRight, ChevronDown, FolderGit2 } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { demo } from "@/features/analysis/demo";

export async function ResultSummary({ compact = false }: { compact?: boolean }) {
  const t = await getTranslations("Demo");
  const common = await getTranslations("Common");
  const home = await getTranslations("Home");
  const format = await getFormatter();
  const Heading = compact ? "h2" : "h1";
  const titleId = compact ? "preview-title" : "result-title";

  return (
    <section className={`result-card${compact ? " result-preview" : ""}`} aria-labelledby={titleId}>
      <div className="result-card-top">
        <div className="profile-identity">
          <span className="avatar" aria-hidden="true">{demo.initials}</span>
          <p className="username">@{demo.username}</p>
        </div>
        <span className="pill">{common("demo")}</span>
      </div>
      <div className="result-headline">
        <Heading id={titleId} className="result-type">
          <span className="diamond" aria-hidden="true" />
          <span>{t("title")}</span>
        </Heading>
        <div className="score-block">
          <p className="score-label">{t("scoreLabel")}</p>
          <p className="score">
            <span>{format.number(demo.score)}</span><span className="score-max">/100</span>
          </p>
        </div>
      </div>
      {compact ? (
        <>
          <ul className="preview-categories">
            {demo.categories.map((category) => (
              <li key={category.id}>
                <span>{t(category.id)}</span>
                <strong>{common("points", { earned: format.number(category.score), max: category.max })}</strong>
                <span className="score-track" aria-hidden="true">
                  <span style={{ width: `${category.score / category.max * 100}%` }} />
                </span>
              </li>
            ))}
          </ul>
          <p className="preview-finding">
            <FolderGit2 size={18} aria-hidden="true" />
            <span><strong>{demo.firstRepo}</strong> — {t("demoMissing")}</span>
          </p>
          <Link className="text-link" href="/demo">
            {home("previewLink")}<ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </>
      ) : (
        <>
          <p className="result-summary">{t("summary")}</p>
          <p className="result-scope">{t("scope", { count: demo.repoCount })}</p>
          <details className="evidence type-evidence">
            <summary>{t("typeReasonLabel")}<ChevronDown size={16} aria-hidden="true" /></summary>
            <div className="evidence-body">
              <p>{t("typeReason")}</p>
              <p>{common("rule", { version: demo.rulesVersion })}</p>
            </div>
          </details>
        </>
      )}
    </section>
  );
}
