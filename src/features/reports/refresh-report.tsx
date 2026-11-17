"use client";

import {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {analyze} from "../analysis/actions";
import type {AnalysisError, Report} from "../analysis/report";
import {reportHref} from "./link";
import {RetryNotice} from "../../components/retry-notice";

export function RefreshReport({report}: {report: Report}) {
  const t = useTranslations("SavedReport");
  const errors = useTranslations("Report");
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<{code: AnalysisError | "saveFailed"; retryAt?: string} | null>(null);
  const busy = useRef(false);
  const version = useRef(0);
  useEffect(() => () => {version.current++;}, []);

  async function refresh() {
    if (busy.current) return;
    busy.current = true;
    const current = ++version.current;
    setPending(true); setFailure(null);
    const repos = [...new Map(report.checks.filter(check => check.scope.kind === "repo")
      .map(check => [check.scope.id, {id: check.scope.id, name: check.scope.name.split("/").slice(1).join("/")}])).values()];
    try {
      const result = await analyze({username: report.profile.login, profileId: report.profile.id, repos, force: true});
      if (current !== version.current) return;
      if (result.status === "error") setFailure({code: result.code, retryAt: result.retryAt});
      else if (result.snapshot.status === "saved") router.push(reportHref(result.snapshot));
      else setFailure({code: "saveFailed"});
    } catch {
      if (current === version.current) setFailure({code: "network"});
    } finally {
      if (current === version.current) {busy.current = false; setPending(false);}
    }
  }

  return <div className="report-actions">
    <button type="button" className="button button-secondary" disabled={pending} onClick={refresh}>{t(pending ? "refreshPending" : "refresh")}</button>
    <div role="status" aria-live="polite">
      {pending && <p className="small muted">{t("refreshHint")}</p>}
      {failure && <><p>{failure.code === "saveFailed" ? t("refreshSaveFailed") : errors(`errors.${failure.code}.description`)} {t("originalKept")}</p><RetryNotice retryAt={failure.retryAt} /></>}
    </div>
  </div>;
}
