"use client";

import {useFormatter, useTranslations} from "next-intl";
import {IdentityCard} from "../../components/identity-card";
import {useReportTime} from "../../components/report-time";
import type {PublicShare} from "./types";

export function PublicReport({share}: {share: PublicShare}) {
  const t = useTranslations("Sharing");
  const report = useTranslations("Report");
  const scoring = useTranslations("Scoring");
  const common = useTranslations("Common");
  const format = useFormatter();
  const {formatTime} = useReportTime();
  const value = share.summary;
  const title = value.profileType ? report(`types.${value.profileType}.title`) : report("incompleteTitle");
  return <article aria-label={t("publicTitle")}>
    <IdentityCard username={value.profile.login} title={title} label={t("publicLabel")} caption={t("thisProfile")}
      scoreLabel={report(value.score === null ? "notCalculated" : "scoreLabel")} score={value.score} categories={value.categories}
      headingLevel="h2" footer={<p>{value.profileType ? report(`types.${value.profileType}.description`) : report("partialSummary")}</p>} />
    <p className="report-meta">{report("checkedAt", {time: formatTime(value.checkedAt)})}<br />{common("rule", {version: value.rulesVersion})}<br />{report("scope", {count: value.repos.length})}</p>
    <ul className="share-repos">{value.repos.map(name => <li key={name}>{name}</li>)}</ul>
    {value.status === "incomplete" && <p className="selection-notice">{report("incompleteText")}</p>}
    <section className="share-first-step">
      <h2>{report("firstStep")}</h2>
      {value.firstTask ? <>
        <p className="source-sha">{value.firstTask.target.kind === "profile" ? t("thisProfile") : value.firstTask.target.name}</p>
        <p>{scoring(`suggestions.${value.firstTask.suggestionKey}`, {repo: value.firstTask.target.name.split("/").at(-1) ?? value.firstTask.target.name})}</p>
        {value.firstTask.impact !== null && <p>{report("impact", {points: format.number(value.firstTask.impact)})}</p>}
      </> : <p>{report(value.status === "incomplete" ? "noKnownTasks" : "noTasks")}</p>}
    </section>
    <p className="method-note">{common("notQuality")}</p>
    <p className="small muted">{t("publicNote")}</p>
    <p className="small muted">{t("expires", {time: formatTime(share.expiresAt)})}</p>
  </article>;
}
