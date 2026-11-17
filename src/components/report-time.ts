"use client";

import {useSyncExternalStore} from "react";
import {useLocale} from "next-intl";

function subscribe(onChange: () => void) {
  window.addEventListener("focus", onChange);
  return () => window.removeEventListener("focus", onChange);
}

function browserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function formatReportTime(value: string, locale: string, timeZone: string): string {
  const date = new Intl.DateTimeFormat(locale, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone, timeZoneName: "short",
  }).format(new Date(value));
  return `${date} · ${timeZone}`;
}

export function useReportTime() {
  const locale = useLocale();
  const timeZone = useSyncExternalStore(subscribe, browserTimeZone, () => "UTC");
  return {timeZone, formatTime: (value: string) => formatReportTime(value, locale, timeZone)};
}
