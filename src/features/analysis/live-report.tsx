"use client";

import {Check as CheckIcon, ChevronDown, FileText, FolderGit2, HelpCircle, Minus, UserRound, Zap} from "lucide-react";
import {useFormatter, useTranslations} from "next-intl";
import {IdentityCard} from "../../components/identity-card";
import type {Report} from "./report";

type ReportCheck = Report["checks"][number];
const categoryIcons = {profile: UserRound, projects: FolderGit2, readme: FileText};

function CheckEvidence({check}: {check: ReportCheck}) {
  const t = useTranslations("Report");
  const scoring = useTranslations("Scoring");
  return (
    <details className="evidence">
      <summary>{t("evidence")}<ChevronDown size={16} aria-hidden="true" /></summary>
      <div className="evidence-body">
        {check.evidence.map((source, index) => (
          <div className="report-source" key={`${source.field}-${index}`}>
            <p>{scoring(`evidence.${source.detailKey}`)}</p>
            <a className="text-link" href={`${source.sourceUrl}${source.line ? `#L${source.line}` : ""}`} target="_blank" rel="noreferrer">
              {t("sourceLink", {field: source.path ?? source.field})}
            </a>
            {source.path && <p>{t("path", {path: source.path})}{source.line !== undefined && <> · {t("line", {line: source.line})}</>}</p>}
            {source.sha && <p className="source-sha">{t("sha", {sha: source.sha})}</p>}
          </div>
        ))}
        <code>{check.id}</code>
      </div>
    </details>
  );
}

export function LiveReport({report, stored = false}: {report: Report; stored?: boolean}) {
  const t = useTranslations("Report");
  const scoring = useTranslations("Scoring");
  const labels = useTranslations("Checks");
  const card = useTranslations("Identity");
  const common = useTranslations("Common");
  const format = useFormatter();
  const type = report.profileType;
  const title = type ? t(`types.${type.id}.title`) : t("incompleteTitle");

  return (
    <article className="live-report" aria-labelledby="live-result-title">
      <IdentityCard username={report.profile.login} title={title} label={t(report.status)} caption={t("publicProfile")}
        scoreLabel={t(report.score === null ? "notCalculated" : "scoreLabel")} score={report.score} categories={report.categories}
        headingLevel="h2" headingId="live-result-title"
        footer={<p>{type ? t(`types.${type.id}.description`) : t("partialSummary")}</p>}>
        {type && (
          <details className="evidence identity-evidence">
            <summary>{t("typeReason")}<ChevronDown size={16} aria-hidden="true" /></summary>
            <div className="evidence-body">
              <p>{t(`types.${type.id}.description`)}</p>
              <ul className="type-checks">
                {type.checkIds.map(id => {
                  const check = report.checks.find(check => check.id === id);
                  return check && <li key={id}><span>{check.scope.name} · {labels(`${check.rule}.label`)} · {t(`status.${check.status}`)}</span><code>{id}</code></li>;
                })}
              </ul>
            </div>
          </details>
        )}
      </IdentityCard>
      {report.status === "incomplete" && <p className="selection-notice report-incomplete" role="status">{t("incompleteText")}</p>}
      <p className="report-meta">{t("scope", {count: report.repoCount})} · {common("rule", {version: report.rulesVersion})}<br />
        {t("checkedAt", {time: format.dateTime(new Date(report.checkedAt), {dateStyle: "medium", timeStyle: "short", timeZone: "UTC"})})}
      </p>
      <div className="result-body">
        <div className="result-content">
          <section aria-labelledby="live-tasks-title">
            <div className="section-heading"><h2 id="live-tasks-title">{t("tasksTitle")}</h2><p>{t("tasksIntro")}</p></div>
            {report.recommendations.length === 0 && <p className="muted">{t(report.status === "incomplete" ? "noKnownTasks" : "noTasks")}</p>}
            <ol className="report-tasks">
              {report.recommendations.map((task, index) => {
                const check = report.checks.find(check => check.id === task.checkId);
                return (
                  <li key={task.checkId} className={index === 0 ? "first-step report-task" : "finding report-task"}>
                    {index === 0 && <Zap size={22} aria-hidden="true" />}
                    <div>
                      <p className="eyebrow">{index === 0 ? t("firstStep") : t("taskNumber", {number: index + 1})}</p>
                      <h3>{scoring(`suggestions.${task.suggestionKey}`, {repo: task.target.name.split("/").at(-1) ?? task.target.name})}</h3>
                      <p className="task-impact">{task.categoryImpact === null
                        ? t("rawImpact", {points: format.number(task.rawImpact, {maximumFractionDigits: 2})})
                        : t("impact", {points: format.number(task.categoryImpact)})}</p>
                      {check && <CheckEvidence check={check} />}
                    </div>
                  </li>
                );
              })}
            </ol>
            {report.recommendations.length > 0 && <p className="small muted">{t("impactNote")}</p>}
          </section>
        </div>
        <section className="result-details categories-section" aria-labelledby="live-categories-title">
          <div className="section-heading"><h2 id="live-categories-title">{t("categoriesTitle")}</h2><p>{t("categoriesIntro")}</p></div>
          {report.categories.map(category => {
            const Icon = categoryIcons[category.id];
            const checks = report.checks.filter(check => check.category === category.id);
            const scopes = [...new Set(checks.map(check => check.scope.name))];
            return (
              <details key={category.id} className="category">
                <summary><Icon size={19} aria-hidden="true" /><span>{card(category.id)}</span>
                  <span className="category-score">{category.score === null ? t("notCalculated") : common("points", {earned: format.number(category.score), max: category.max})}</span>
                  <ChevronDown className="chevron" size={18} aria-hidden="true" /></summary>
                <div className="category-content">
                  {category.id !== "profile" && <p className="category-note">{t("average", {count: report.repoCount})}</p>}
                  {scopes.map(scope => (
                    <section className="check-scope" key={scope}>
                      <h3>{scope}</h3>
                      <ul className="checks">
                        {checks.filter(check => check.scope.name === scope).map(check => {
                          const StatusIcon = check.status === "pass" ? CheckIcon : check.status === "unknown" ? HelpCircle : Minus;
                          return (
                            <li key={check.id}>
                              <div className="check-title"><StatusIcon size={15} aria-hidden="true" /><h4>{labels(`${check.rule}.label`)}</h4>
                                <span className="check-points">{common("points", {earned: check.earned === null ? "—" : format.number(check.earned), max: check.max})}</span></div>
                              <span className={`check-status ${check.status}`}>{t(`status.${check.status}`)}</span>
                              <CheckEvidence check={check} />
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  ))}
                </div>
              </details>
            );
          })}
          <p className="category-footnote">{t("countRule")}</p>
        </section>
      </div>
      <p className="method-note">{common("notQuality")}</p>
      {!stored && <p className="small muted report-session-note">{t("temporary")}</p>}
    </article>
  );
}
