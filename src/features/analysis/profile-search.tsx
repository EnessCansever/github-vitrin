"use client";

import {useEffect, useRef, useState, type FormEvent, type ReactNode} from "react";
import Link from "next/link";
import {ArrowRight} from "lucide-react";
import {useTranslations} from "next-intl";
import {profileInput} from "../../lib/github/input";
import {getRepos} from "./actions";
import {RepoPicker} from "./repo-picker";
import {StatePanel} from "./analysis-states";
import type {SearchResult} from "./selection";

export function ProfileSearch({children, preview}: {children: ReactNode; preview: ReactNode}) {
  const t = useTranslations("Search");
  const home = useTranslations("Home");
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [result, setResult] = useState<(SearchResult & {searchId: number}) | null>(null);
  const requestId = useRef(0);
  const busy = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const resultRegion = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) {
      resultRegion.current?.querySelector<HTMLElement>("h2")?.focus({preventScroll: true});
      resultRegion.current?.scrollIntoView({block: "start"});
    }
  }, [result]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    if (!profileInput.safeParse(input).success) {
      setInvalid(true);
      field.current?.focus();
      return;
    }
    const id = ++requestId.current;
    busy.current = true;
    setInvalid(false);
    setResult(null);
    setPending(true);
    let response: SearchResult;
    try {
      response = await getRepos(input);
    } catch {
      response = {status: "error", code: "network"};
    }
    if (id !== requestId.current) return;
    busy.current = false;
    setPending(false);
    if (response.status === "error" && response.code === "invalid_input") {
      setInvalid(true);
      field.current?.focus();
    } else {
      setResult({...response, searchId: id});
    }
  }

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          {children}
          <form ref={form} onSubmit={submit} noValidate className="profile-entry" aria-busy={pending}>
            <label htmlFor="github-profile">{home("label")}</label>
            <div className="input-wrap">
              <span aria-hidden="true">@</span>
              <input ref={field} id="github-profile" name="profile" type="text" value={input}
                autoCapitalize="none" spellCheck={false} autoComplete="off" required maxLength={256}
                placeholder={home("placeholder")} aria-invalid={invalid}
                aria-describedby={`profile-hint${invalid ? " profile-error" : ""}`}
                onChange={event => {
                  requestId.current++;
                  busy.current = false;
                  setPending(false);
                  setResult(null);
                  setInvalid(false);
                  setInput(event.target.value);
                }} />
            </div>
            <p id="profile-hint" className="muted small">{home("inputHint")}</p>
            {invalid && <p id="profile-error" className="field-error small" role="alert">{t("invalid")}</p>}
            <button type="submit" className="button button-primary" disabled={pending}>
              {t(pending ? "pending" : "submit")}<ArrowRight size={19} aria-hidden="true" />
            </button>
          </form>
          <Link className="button button-secondary search-demo" href="/demo">
            {home("demoAction")}<ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <aside className="hero-preview" aria-labelledby="preview-title">{preview}</aside>
      </section>
      <div ref={resultRegion} role="region" className="search-result" aria-label={t("region")}>
        {pending && <StatePanel state="loading" title={t("pending")} description={t("loading")} />}
        {result?.status === "error" && result.code !== "invalid_input" && (
          <StatePanel state={result.code} title={t(`errors.${result.code}.title`)} description={t(`errors.${result.code}.description`)}>
            <button type="button" className="button button-secondary state-action" onClick={() => form.current?.requestSubmit()}>
              {t("retry")}<ArrowRight size={16} aria-hidden="true" />
            </button>
          </StatePanel>
        )}
        {result?.status === "success" && (
          <section aria-labelledby="live-selection-title">
            <div className="prototype-heading">
              <div className="profile-identity">
                <span className="avatar" aria-hidden="true">{result.profile.login.slice(0, 2).toUpperCase()}</span>
                <a className="username text-link" href={`https://github.com/${result.profile.login}`}>@{result.profile.login}</a>
              </div>
              <h2 id="live-selection-title" tabIndex={-1}>{t("title")}</h2>
              <p>{t("scope", {count: result.repos.length})}</p>
              {result.pinnedUnknown && <p className="selection-notice" role="status">{t("pinnedUnknown")}</p>}
              {result.limited && <p className="selection-notice">{t("limited")}</p>}
            </div>
            <RepoPicker key={result.searchId} mode="live" repos={result.repos} initialSelectedIds={result.initialSelectedIds} />
          </section>
        )}
      </div>
    </>
  );
}
