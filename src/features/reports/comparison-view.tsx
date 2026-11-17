"use client";

import {useFormatter, useTranslations} from "next-intl";
import {useReportTime} from "../../components/report-time";
import type {Comparison} from "./comparison";

export function ComparisonView({comparison}: {comparison: Comparison}) {
  const t = useTranslations("Comparison");
  const categories = useTranslations("Identity");
  const checks = useTranslations("Checks");
  const scoring = useTranslations("Scoring");
  const common = useTranslations("Common");
  const format = useFormatter();
  const {formatTime} = useReportTime();
  if (comparison.status === "blocked") return <p className="selection-notice">{t(`blocked.${comparison.reason}`)}</p>;
  const points = (value: number) => `${value > 0 ? "+" : ""}${format.number(value, {maximumFractionDigits: 1})}`;
  return <section className="comparison-result" aria-label={t("result")}>
    <h3>{t("result")}</h3>
    <p className="comparison-delta">{t("delta", {points: points(comparison.delta)})}</p>
    <p>{t(comparison.delta > 0 ? "increased" : comparison.delta < 0 ? "decreased" : "unchanged")}</p>
    <dl className="comparison-dates">
      {(["before", "after"] as const).map(side => <div key={side}><dt>{t(side)}</dt><dd>
        @{comparison[side].login}<br />{formatTime(comparison[side].checkedAt)}
        <br />{t("score", {points: format.number(comparison[side].score)})}
      </dd></div>)}
    </dl>
    <h4>{t("categories")}</h4>
    <ul className="comparison-categories">{comparison.categories.map(category => <li key={category.id}>
      <strong>{categories(category.id)}</strong><span>{format.number(category.before)} → {format.number(category.after)}</span>
      <span>{t(category.delta === 0 ? "noChange" : "delta", {points: points(category.delta)})}</span>
    </li>)}</ul>
    <h4>{t("checks")}</h4>
    <p className="small muted">{t("detectionNote")}</p>
    {comparison.changes.length === 0 && <p>{t("noCheckChanges")}</p>}
    <ul className="comparison-checks">{comparison.changes.map(change => <li key={change.id}>
      <p className={`comparison-${change.direction}`}><strong>{t(change.direction)}</strong> · {checks(`${change.rule}.label`)}</p>
      <p className="source-sha">{change.target}</p>
      <details className="evidence"><summary>{t("evidence")}</summary><div className="evidence-body">
        {(["before", "after"] as const).map(side => <div key={side}><h5>{t(side)}</h5>{change[side].map((source, index) => <p key={index}>
          {scoring(`evidence.${source.detailKey}`)}<br />
          <a className="text-link" href={`${source.sourceUrl}${source.line ? `#L${source.line}` : ""}`} target="_blank" rel="noreferrer">{source.path ?? source.field} ↗</a>
        </p>)}</div>)}
      </div></details>
    </li>)}</ul>
    <p className="small muted">{common("notQuality")}</p>
  </section>;
}
