"use client";

import {useRef, useState} from "react";
import {Copy} from "lucide-react";
import {useTranslations} from "next-intl";

export function CopyLink() {
  const t = useTranslations("SavedReport");
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");
  const [link, setLink] = useState("");
  const busy = useRef(false);

  async function copy() {
    if (busy.current) return;
    busy.current = true;
    const url = window.location.href;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard_unavailable");
      await navigator.clipboard.writeText(url);
      setState("copied");
    } catch {
      setLink(url);
      setState("manual");
    } finally {
      busy.current = false;
    }
  }

  return (
    <div className="copy-report">
      <button type="button" className="button button-secondary" onClick={copy}><Copy size={16} aria-hidden="true" />{t("copy")}</button>
      <p className="small muted">{t("accessNote")}</p>
      <p role="status" className="small muted">{state === "idle" ? "" : t(state)}</p>
      {state === "manual" && (
        <div className="manual-copy">
          <label htmlFor="report-link">{t("manualLabel")}</label>
          <input id="report-link" type="text" readOnly value={link} onFocus={event => event.currentTarget.select()} />
        </div>
      )}
    </div>
  );
}
