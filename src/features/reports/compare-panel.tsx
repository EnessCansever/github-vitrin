"use client";

import {useEffect, useRef, useState} from "react";
import {useTranslations} from "next-intl";
import {useReportTime} from "../../components/report-time";
import type {Report} from "../analysis/report";
import {loadComparison} from "./actions";
import type {ComparisonResponse} from "./comparison";
import {CardStudio} from "../cards/card-studio";
import {ComparisonView} from "./comparison-view";
import {HISTORY_KEY, parseReportLink, rememberReport, reportHistory, type HistoryEntry} from "./history";
import {RetryNotice} from "../../components/retry-notice";

export function ComparePanel({id, report, expiresAt}: {id: string; report: Report; expiresAt: string}) {
  const t = useTranslations("Comparison");
  const {formatTime, timeZone} = useReportTime();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selected, setSelected] = useState("");
  const [link, setLink] = useState("");
  const [storageFailed, setStorageFailed] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [pending, setPending] = useState(false);
  const [response, setResponse] = useState<ComparisonResponse | null>(null);
  const [previous, setPrevious] = useState<{id: string; token: string} | null>(null);
  const busy = useRef(false);
  const version = useRef(0);
  const result = useRef<HTMLDivElement>(null);
  const storageAvailable = useRef(true);

  useEffect(() => {
    try {
      const access = parseReportLink(window.location.href, window.location.origin);
      if (!access || access.id !== id) return;
      const previous = reportHistory(localStorage.getItem(HISTORY_KEY), Date.now()).filter(entry => entry.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(rememberReport(previous, {...access, login: report.profile.login, checkedAt: report.checkedAt, expiresAt})));
    } catch {
      storageAvailable.current = false;
    }
    const generation = version;
    return () => {generation.current++;};
  }, [id, report, expiresAt]);

  function readHistory(open: boolean) {
    if (!open) return;
    try {
      const previous = reportHistory(localStorage.getItem(HISTORY_KEY), Date.now()).filter(entry => entry.id !== id);
      setHistory(previous);
      setSelected(value => previous.some(entry => entry.id === value) ? value : previous[0]?.id ?? "");
      setStorageFailed(!storageAvailable.current);
    } catch {setStorageFailed(true);}
  }

  function reset() {
    version.current++; busy.current = false; setPending(false); setInvalid(false); setResponse(null);
  }

  async function compare(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const entry = history.find(value => value.id === selected);
    const before = selected ? entry : parseReportLink(link, window.location.origin);
    const after = parseReportLink(window.location.href, window.location.origin);
    if (!before || !after) {setInvalid(true); return;}
    const current = ++version.current;
    busy.current = true; setPending(true); setResponse(null); setInvalid(false);
    try {
      const value = await loadComparison({before: {id: before.id, token: before.readToken}, after: {id: after.id, token: after.readToken}});
      if (current === version.current) {setResponse(value); setPrevious({id: before.id, token: before.readToken}); result.current?.focus({preventScroll: true});}
    } catch {
      if (current === version.current) setResponse({status: "unavailable"});
    } finally {
      if (current === version.current) {busy.current = false; setPending(false);}
    }
  }

  function clearHistory() {
    reset(); setHistory([]); setSelected("");
    try {localStorage.removeItem(HISTORY_KEY);} catch {setStorageFailed(true);}
  }

  return <details className="comparison-panel" id="compare-reports" onToggle={event => readHistory(event.currentTarget.open)}>
    <summary>{t("title")}</summary>
    <p>{t("intro")}</p>
    <p className="small muted">{t("historyNote")}</p>
    {storageFailed && <p role="status">{t("storageFailed")}</p>}
    <form onSubmit={compare} aria-busy={pending}>
      <label htmlFor="previous-report">{t("previous")}</label>
      <select id="previous-report" aria-describedby="history-time-zone" value={selected} onChange={event => {reset(); setSelected(event.target.value);}}>
        <option value="">{t("paste")}</option>
        {history.map(entry => <option key={entry.id} value={entry.id}>@{entry.login} · {formatTime(entry.checkedAt)} · {entry.id.slice(0, 8)}</option>)}
      </select>
      <p id="history-time-zone" className="small muted">{t("timeZone", {zone: timeZone})}</p>
      {!selected && <><label htmlFor="previous-link">{t("linkLabel")}</label>
        <input id="previous-link" type="text" value={link} onChange={event => {reset(); setLink(event.target.value);}} maxLength={2048}
          autoComplete="off" spellCheck={false} aria-invalid={invalid} aria-describedby="comparison-link-note" />
        <p id="comparison-link-note" className="small muted">{t("linkHint")}</p></>}
      {invalid && <p role="alert">{t("invalid")}</p>}
      <div className="report-actions">
        <button type="submit" className="button button-primary" disabled={pending || (!selected && !link.trim())}>{t(pending ? "pending" : "compare")}</button>
        {history.length > 0 && <button type="button" className="text-link" onClick={clearHistory}>{t("clear")}</button>}
      </div>
    </form>
    <div ref={result} tabIndex={-1} aria-label={t("result")}>
      <p role="status" aria-live="polite">{pending ? t("pending") : response ? t(response.status === "success" ? "ready" : "failed") : ""}</p>
      {response?.status === "success" ? <>
        <ComparisonView comparison={response.comparison} />
        {previous && response.comparison.status === "compared" && <CardStudio id={id} complete previous={previous} />}
      </> : response && <>
        <p role="alert">{t(`errors.${response.status}`)}</p>
        <RetryNotice retryAt={response.status === "rateLimit" ? response.retryAt : undefined} />
      </>}
    </div>
  </details>;
}
