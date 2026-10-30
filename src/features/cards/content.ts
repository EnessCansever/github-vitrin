import "server-only";

import {createTranslator} from "next-intl";
import {site} from "../../config/site";
import tr from "../../messages/tr.json";
import en from "../../messages/en.json";
import type {Report} from "../analysis/report";
import type {CardContent} from "./types";

export function cardContent(report: Report, locale: "tr" | "en"): CardContent | null {
  if (report.status !== "complete" || report.score === null || !report.profileType ||
    report.categories.some(category => category.score === null || category.status !== "complete")) return null;
  const t = createTranslator({locale, messages: locale === "tr" ? tr : en});
  const number = new Intl.NumberFormat(locale, {maximumFractionDigits: 1});
  const task = report.recommendations[0];
  return {
    brand: site.name, author: site.author, username: report.profile.login,
    title: t(`Card.types.${report.profileType.id}`).split("\n"), score: number.format(report.score),
    scoreLabel: t("Card.scoreLabel"),
    categories: report.categories.map(category => ({label: t(`Identity.${category.id}`), points: `${category.score === null ? "—" : number.format(category.score)} / ${category.max}`})),
    task: task ? {target: task.target.kind === "repo" ? task.target.name.split("/").at(-1) ?? task.target.name : t("Card.profileTarget"),
      text: t(`Card.actions.${task.suggestionKey}`)} : null,
    firstStep: t(task ? "Card.firstStep" : "Card.summary"), noTask: t("Card.noTask"),
    date: t("Card.date", {date: new Intl.DateTimeFormat(locale, {day: "numeric", month: "short", year: "numeric", timeZone: "UTC"}).format(new Date(report.checkedAt))}),
    scope: t("Card.scope"), identity: t("Card.identity"), signature: t("Card.signature"), invitation: t("Card.invitation"),
  };
}
