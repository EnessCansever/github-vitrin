"use client";

import {useFormatter, useTranslations} from "next-intl";

export function RetryNotice({retryAt}: {retryAt?: string}) {
  const t = useTranslations("Requests");
  const format = useFormatter();
  if (!retryAt) return null;
  return <p className="small muted">{t("retryAt", {time: format.dateTime(new Date(retryAt), {
    dateStyle: "short", timeStyle: "medium", timeZone: "UTC",
  })})}</p>;
}
