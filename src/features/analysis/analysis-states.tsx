"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CircleDashed, CloudOff, FolderSearch, Hourglass, TriangleAlert, UserRoundX } from "lucide-react";
import { useTranslations } from "next-intl";
import type { StateExample } from "./state-demo";

const stateIcons = {
  loading: CircleDashed,
  notFound: UserRoundX,
  empty: FolderSearch,
  network: CloudOff,
  rateLimit: Hourglass,
  partial: TriangleAlert,
  configuration: TriangleAlert,
};

export function AnalysisStates({ examples }: { examples: StateExample[] }) {
  const t = useTranslations("States");
  const [example, setExample] = useState(examples[0]);

  return (
    <section className="state-examples" aria-labelledby="state-picker-title">
      <div className="state-selector">
        <label htmlFor="analysis-state" id="state-picker-title">{t("label")}</label>
        <select
          id="analysis-state"
          value={example.id}
          onChange={(event) => {
            const next = examples.find((item) => item.id === event.target.value);
            if (next) setExample(next);
          }}
          aria-describedby="state-picker-help"
        >
          {examples.map((item) => <option value={item.id} key={item.id}>{t(`${item.id}.name`)}</option>)}
        </select>
        <p id="state-picker-help">{t("pickerHint")}</p>
      </div>
      <StatePanel state={example.id} title={t(`${example.id}.title`)} description={t(`${example.id}.description`)}>
          {example.knownFinding && (
            <div className="known-finding">
              <h3>{t("knownTitle")}</h3>
              <p className="repo-name">{example.knownFinding.repo}</p>
              <p>{t(example.knownFinding.messageKey)}</p>
              <p className="missing-score">{t("partialScore")}</p>
            </div>
          )}
        <p className="state-guidance">{t(`${example.id}.guidance`)}</p>
        <Link href={example.actionHref} className="button button-secondary state-action">
          {t(`${example.id}.action`)}<ArrowRight size={16} aria-hidden="true" />
        </Link>
      </StatePanel>
      <div className="sample-report-link">
        <p>{t("reportHint")}</p>
        <Link href="/demo" className="button button-secondary">{t("reportLink")}<ArrowRight size={16} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}

export function StatePanel({state, title, description, children}: {
  state: keyof typeof stateIcons;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  const Icon = stateIcons[state];
  return (
    <div className="analysis-state" data-state={state}>
      <div role="status" aria-live="polite" aria-atomic="true">
        <span className="state-icon"><Icon size={28} aria-hidden="true" /></span>
        <h2 tabIndex={-1}>{title}</h2>
        <p className="state-description">{description}</p>
      </div>
      {children}
    </div>
  );
}
