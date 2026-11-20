import "server-only";

import {createTranslator} from "next-intl";
import {site} from "../../config/site";
import tr from "../../messages/tr.json";
import en from "../../messages/en.json";
import type {ShareSummary} from "../shares/types";
import type {Report} from "../analysis/report";
import type {Comparison} from "../reports/comparison";
import type {CardContent, ProgressContent} from "./types";

export function cardContent(report: Report, locale: "tr" | "en"): CardContent | null {
  if (report.status !== "complete" || report.score === null || !report.profileType ||
    report.categories.some(category => category.score === null || category.status !== "complete")) return null;
  const task=report.recommendations[0];
  return summaryCardContent({profile:{login:report.profile.login},checkedAt:report.checkedAt,rulesVersion:report.rulesVersion,
    repos:[...new Set(report.checks.filter(check=>check.scope.kind==="repo").map(check=>check.scope.name))],status:report.status,score:report.score,profileType:report.profileType.id,categories:report.categories,
    firstTask:task?{suggestionKey:task.suggestionKey,target:{kind:task.target.kind,name:task.target.name},impact:task.categoryImpact}:null},locale);
}

export function summaryCardContent(report: ShareSummary, locale: "tr" | "en"): CardContent | null {
  if(report.status!=="complete" || report.score===null || !report.profileType || report.categories.some(category=>category.score===null)) return null;
  const t = createTranslator({locale, messages: locale === "tr" ? tr : en});
  const number = new Intl.NumberFormat(locale, {maximumFractionDigits: 1});
  const task = report.firstTask;
  return {
    brand: site.name, author: site.author, username: report.profile.login,
    title: t(`Card.types.${report.profileType}`).split("\n"), score: number.format(report.score),
    scoreLabel: t("Card.scoreLabel"),
    categories: report.categories.map(category => ({label: t(`Identity.${category.id}`), points: `${category.score === null ? "—" : number.format(category.score)} / ${category.max}`})),
    task: task ? {target: task.target.kind === "repo" ? task.target.name.split("/").at(-1) ?? task.target.name : t("Card.profileTarget"),
      text: t(`Card.actions.${task.suggestionKey}`)} : null,
    firstStep: t(task ? "Card.firstStep" : "Card.summary"), noTask: t("Card.noTask"),
    date: t("Card.date", {date: new Intl.DateTimeFormat(locale, {day: "numeric", month: "short", year: "numeric", timeZone: "UTC"}).format(new Date(report.checkedAt))}),
    scope: t("Card.scope"), identity: t("Card.identity"), signature: t("Card.signature"), invitation: t("Card.invitation"),
  };
}

export function progressContent(result: Extract<Comparison, {status: "compared"}>, locale: "tr" | "en"): ProgressContent {
  const t = createTranslator({locale, messages: locale === "tr" ? tr : en});
  const number = new Intl.NumberFormat(locale);
  const signed = new Intl.NumberFormat(locale, {signDisplay: "exceptZero"});
  const date = new Intl.DateTimeFormat(locale, {dateStyle: "medium", timeStyle: "short", timeZone: "UTC"});
  return {
    username: result.after.login, brand: site.name,
    title: t(result.delta > 0 ? "Card.gain" : result.delta < 0 ? "Card.loss" : "Card.flat"),
    delta: t("Comparison.delta", {points: signed.format(result.delta)}),
    measurements: (["before", "after"] as const).map(side => ({
      label: t(`Comparison.${side}`), date: date.format(new Date(result[side].checkedAt)) + " UTC",
      score: t("Comparison.score", {points: number.format(result[side].score)}),
    })),
    categories: result.categories.map(category => ({label: t(`Identity.${category.id}`), delta: signed.format(category.delta)})),
    signals: t("Card.transitions", {up: result.changes.filter(c => c.direction === "improved").length,
      down: result.changes.filter(c => c.direction === "regressed").length}),
    scope: t("Card.scope"), signature: t("Card.signature") + " " + site.author,
  };
}
