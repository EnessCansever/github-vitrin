"use client";

import {useEffect, useRef, useState} from "react";
import Link from "next/link";
import {useFormatter, useTranslations} from "next-intl";
import {StatePanel} from "../analysis/analysis-states";
import {LiveReport} from "../analysis/live-report";
import type {StoredReportResponse} from "../analysis/report";
import {loadReport} from "./actions";
import {CopyLink} from "./copy-link";
import {CardStudio} from "../cards/card-studio";

export function ReportAccess({id}: {id: string}) {
  const t = useTranslations("SavedReport");
  const format = useFormatter();
  const [response, setResponse] = useState<StoredReportResponse | null>(null);
  const [attempt, setAttempt] = useState(0);
  const request = useRef<{token: string; attempt: number; promise: Promise<StoredReportResponse>} | null>(null);
  const region = useRef<HTMLDivElement>(null);
  const lastHeading = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let active = true;
    let version = 0;
    function read() {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const token = params.size === 1 ? params.get("token") ?? "" : "";
      if (!request.current || request.current.token !== token || request.current.attempt !== attempt) {
        request.current = {token, attempt, promise: loadReport({id, token}).catch(() => ({status: "unavailable"}))};
      }
      const current = ++version;
      setResponse(null);
      void request.current.promise.then(result => {if (active && current === version) setResponse(result);});
    }
    read();
    window.addEventListener("hashchange", read);
    return () => {active = false; window.removeEventListener("hashchange", read);};
  }, [id, attempt]);

  useEffect(() => {
    if (!response) return;
    const heading = region.current?.querySelector<HTMLElement>("h2");
    if (!heading || heading === lastHeading.current) return;
    lastHeading.current = heading;
    heading.focus({preventScroll: true});
    region.current?.closest("main")?.scrollIntoView({block: "start"});
  }, [response]);

  return (
    <div ref={region} aria-busy={!response} className="stored-report">
      <div className="report-actions"><Link href="/#github-profile" className="button button-secondary">{t("newAnalysis")}</Link></div>
      {!response && <StatePanel state="loading" title={t("loadingTitle")} description={t("loadingText")} />}
      {response?.status === "missing" && <StatePanel state="notFound" title={t("missingTitle")} description={t("missingText")} />}
      {response?.status === "unavailable" && (
        <StatePanel state="network" title={t("errorTitle")} description={t("errorText")}>
          <button type="button" className="button button-secondary state-action" onClick={() => setAttempt(value => value + 1)}>{t("retry")}</button>
        </StatePanel>
      )}
      {response?.status === "success" && (
        <>
          <div className="saved-report-info">
            <p>{t("expires", {time: format.dateTime(new Date(response.expiresAt), {dateStyle: "medium", timeStyle: "short", timeZone: "UTC"})})}</p>
            <CopyLink />
            <CardStudio id={id} complete={response.report.status === "complete"} />
          </div>
          <LiveReport report={response.report} stored />
        </>
      )}
    </div>
  );
}
