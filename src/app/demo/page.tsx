import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ChevronDown, FileText, FolderGit2, LockKeyhole, Minus, UserRound, Zap } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { demo } from "@/features/analysis/demo";
import { ResultSummary } from "@/components/result-summary";

export default async function Demo() {
  const t = await getTranslations("Demo");
  const common = await getTranslations("Common");
  const checks = await getTranslations("Checks");
  const sources = await getTranslations("Sources");
  const format = await getFormatter();
  const categoryIcons = { profile: UserRound, projects: FolderGit2, readme: FileText };

  return (
    <main id="main" className="shell demo-main">
      <div className="demo-topbar">
        <Link href="/" className="back-link"><ArrowLeft size={16} aria-hidden="true" />{common("back")}</Link>
      </div>
      <p className="demo-notice">{common("demoNote")}</p>
      <ResultSummary />
      <div className="result-body">
        <div className="result-content">
          <section className="findings-section" aria-labelledby="findings-title">
            <div className="section-heading"><h2 id="findings-title">{t("whyTitle")}</h2></div>
            <div className="findings">
              {demo.findings.map((finding, index) => (
                <article className="finding" key={finding.rule}>
                  <div className="finding-title"><span className="finding-number">0{index + 1}</span><FolderGit2 size={18} aria-hidden="true" /><h3>{finding.repo}</h3></div>
                  <p className="finding-message">{t(finding.message)}</p>
                  <details className="evidence">
                    <summary>{common("evidence")}<ChevronDown size={16} aria-hidden="true" /></summary>
                    <div className="evidence-body">
                      <p className="source-line">{common("source")}: <span>{sources(finding.rule)}</span></p>
                      <p>{checks(`${finding.rule}.fail`)}</p>
                      <p>{t(finding.detail)}</p>
                      <code>{finding.repo}:{finding.rule} · fail · 0/10</code>
                    </div>
                  </details>
                </article>
              ))}
            </div>
          </section>
          <section className="first-step" aria-labelledby="first-step-title">
            <Zap size={25} aria-hidden="true" />
            <div>
              <p className="eyebrow">{t("firstLabel")}</p>
              <h2 id="first-step-title">{t("firstTitle", { repo: demo.firstRepo })}</h2>
            </div>
          </section>
          <section className="sharing-section" aria-labelledby="sharing-title">
            <h2 id="sharing-title">{t("sharingTitle")}</h2>
            <p id="sharing-note">{t("sharingText")}</p>
            <div className="pending-actions">
              <button type="button" className="button button-disabled" disabled aria-describedby="sharing-note"><LockKeyhole size={16} aria-hidden="true" />{t("share")}</button>
              <button type="button" className="button button-disabled" disabled aria-describedby="sharing-note">{t("retry")}</button>
            </div>
          </section>
        </div>
        <div className="result-details">
          <section className="categories-section" aria-labelledby="categories-title">
            <div className="section-heading"><h2 id="categories-title">{t("categoriesTitle")}</h2><p>{t("categoriesIntro")}</p></div>
            {demo.categories.map((category) => {
              const Icon = categoryIcons[category.id];
              return (
                <details key={category.id} className="category">
                  <summary><Icon size={19} aria-hidden="true" /><span>{t(category.id)}</span><span className="category-score">{common("points", { earned: format.number(category.score), max: category.max })}</span><ChevronDown className="chevron" size={18} aria-hidden="true" /></summary>
                  <div className="category-content">
                    {category.id !== "profile" && <p className="category-note">{t("average")}</p>}
                    {category.scopes.map((scope) => (
                      <section className="check-scope" key={scope.name}>
                        <h3>{scope.name}<span>{common("points", { earned: scope.score, max: category.max })}</span></h3>
                        {category.id !== "profile" && <p className="small muted">{t("repoContribution")}</p>}
                        <ul className="checks">
                          {scope.checks.map((check) => (
                            <li key={check.id}>
                              <div className="check-title">
                                {check.status === "pass" ? <Check size={15} aria-hidden="true" /> : <Minus size={15} aria-hidden="true" />}
                                <h4>{checks(`${check.rule}.label`)}</h4>
                                <span className="check-points">{common("points", { earned: check.earned, max: check.max })}</span>
                              </div>
                              <span className={`check-status ${check.status}`}>{common(check.status)}</span>
                              <p>{checks(`${check.rule}.${check.status}`)}</p>
                              <p className="check-source">{sources(check.rule)}</p>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                </details>
              );
            })}
            <p className="category-footnote">{t("countRule")}</p>
          </section>
          <section className="next-tasks" aria-labelledby="next-tasks-title">
            <h2 id="next-tasks-title">{t("otherTitle")}</h2>
            <ol start={2}>
              <li><span>02</span><p>{t("installTask", { repo: demo.secondRepo })}</p></li>
              <li><span>03</span><p>{t("usageTask", { repo: demo.secondRepo })}</p></li>
            </ol>
          </section>
        </div>
      </div>
      <p className="method-note">{common("notQuality")}</p>
      <Link href="/" className="text-link result-back">{common("back")}<ArrowRight size={16} aria-hidden="true" /></Link>
    </main>
  );
}
