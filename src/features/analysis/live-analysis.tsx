"use client";

import {useEffect, useRef, useState} from "react";
import {ArrowLeft, RotateCcw} from "lucide-react";
import {useTranslations} from "next-intl";
import {analyze} from "./actions";
import {StatePanel} from "./analysis-states";
import {RepoPicker} from "./repo-picker";
import {LiveReport} from "./live-report";
import type {AnalysisResponse} from "./report";
import type {SearchResult} from "./selection";

type Selection = Extract<SearchResult, {status: "success"}>;

export function LiveAnalysis({selection, onProfile}: {selection: Selection; onProfile: () => void}) {
  const search = useTranslations("Search");
  const t = useTranslations("Report");
  const [view, setView] = useState<"select" | "analysis">("select");
  const [pending, setPending] = useState(false);
  const [response, setResponse] = useState<AnalysisResponse | null>(null);
  const requestId = useRef(0);
  const busy = useRef(false);
  const selected = useRef<string[]>(selection.initialSelectedIds);
  const region = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLDivElement>(null);
  const lastHeading = useRef<HTMLElement | null>(null);

  useEffect(() => () => { requestId.current++; }, []);
  useEffect(() => {
    const target = view === "select" ? picker.current : region.current;
    const heading = target?.querySelector<HTMLElement>("h2");
    if (!heading || heading === lastHeading.current) return;
    lastHeading.current = heading;
    heading.focus({preventScroll: true});
    target?.scrollIntoView({block: "start"});
  }, [view, pending, response]);

  function back() {
    requestId.current++;
    busy.current = false;
    setPending(false);
    setResponse(null);
    setView("select");
  }

  async function run(ids: string[]) {
    if (busy.current) return;
    const id = ++requestId.current;
    selected.current = [...ids];
    busy.current = true;
    setView("analysis");
    setResponse(null);
    setPending(true);
    let next: AnalysisResponse;
    try {
      next = await analyze({username: selection.profile.login, profileId: selection.profile.id,
        repos: selection.repos.filter(repo => ids.includes(repo.id)).map(repo => ({id: Number(repo.id), name: repo.name}))});
    } catch {
      next = {status: "error", code: "network"};
    }
    if (id !== requestId.current) return;
    busy.current = false;
    setPending(false);
    setResponse(next);
  }

  return (
    <>
      <div ref={picker} hidden={view !== "select"}>
        <section aria-labelledby="live-selection-title">
          <div className="prototype-heading">
            <div className="profile-identity">
              <span className="avatar" aria-hidden="true">{selection.profile.login.slice(0, 2).toUpperCase()}</span>
              <a className="username text-link" href={`https://github.com/${selection.profile.login}`}>@{selection.profile.login}</a>
            </div>
            <h2 id="live-selection-title" tabIndex={-1}>{search("title")}</h2>
            <p>{search("scope", {count: selection.repos.length})}</p>
            {selection.pinnedUnknown && <p className="selection-notice" role="status">{search("pinnedUnknown")}</p>}
            {selection.limited && <p className="selection-notice">{search("limited")}</p>}
          </div>
          <RepoPicker mode="live" repos={selection.repos} initialSelectedIds={selection.initialSelectedIds} onAnalyze={run} />
        </section>
      </div>
      {view === "analysis" && (
        <div ref={region} className="live-analysis" aria-busy={pending}>
          <div className="report-actions">
            <button type="button" className="button button-secondary" onClick={back}><ArrowLeft size={16} aria-hidden="true" />{t("backSelection")}</button>
            <button type="button" className="button button-secondary" onClick={onProfile}>{t("backProfile")}</button>
          </div>
          {pending && <StatePanel state="loading" title={t("loadingTitle")} description={t("loadingText")} />}
          {response?.status === "error" && (
            <StatePanel state={response.code === "selectionChanged" || response.code === "invalid_input" ? "configuration" : response.code}
              title={t(`errors.${response.code}.title`)} description={t(`errors.${response.code}.description`)} />
          )}
          {response?.status === "success" && <LiveReport report={response.report} />}
          {!pending && response && (
            <button type="button" className="button button-secondary report-retry" onClick={() => run(selected.current)}>
              <RotateCcw size={16} aria-hidden="true" />{t(response.status === "error" || response.report.status === "incomplete" ? "retry" : "reanalyze")}
            </button>
          )}
        </div>
      )}
    </>
  );
}
