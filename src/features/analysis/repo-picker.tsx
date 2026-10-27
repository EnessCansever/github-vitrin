"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Pin } from "lucide-react";
import { useTranslations } from "next-intl";
import type { RepoOption } from "./selection-demo";

type Props = {
  repos: RepoOption[];
  initialSelectedIds: string[];
};

export function RepoPicker({ repos, initialSelectedIds }: Props) {
  const t = useTranslations("Select");
  const [selectedIds, setSelectedIds] = useState(initialSelectedIds);
  const atLimit = selectedIds.length === 3;
  const empty = selectedIds.length === 0;

  function toggleRepo(id: string) {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((selectedId) => selectedId !== id);
      return current.length < 3 ? [...current, id] : current;
    });
  }

  return (
    <section className="repo-picker" aria-labelledby="selection-title">
      <div className="selection-toolbar">
        <h2 id="selection-title">{t("projects")}</h2>
        <p className="selection-count" role="status" aria-atomic="true">
          {t("count", { count: selectedIds.length })}
        </p>
      </div>
      <p id="selection-limit" className="selection-help">
        {t(atLimit ? "limitReached" : "limit")}
      </p>
      <fieldset className="repo-options" aria-describedby="selection-limit">
        <legend className="sr-only">{t("legend")}</legend>
        {repos.map((repo) => {
          const selected = selectedIds.includes(repo.id);
          const disabled = !selected && atLimit;
          return (
            <label className={`repo-option${selected ? " is-selected" : ""}`} key={repo.id}>
              <input
                type="checkbox"
                name="repo"
                value={repo.id}
                checked={selected}
                disabled={disabled}
                onChange={() => toggleRepo(repo.id)}
                aria-describedby={`${repo.id}-description${disabled ? " selection-limit" : ""}`}
              />
              <span className="repo-option-body">
                <span className="repo-option-heading">
                  <span className="repo-name">{repo.name}</span>
                  {selected && <span className="repo-selected"><Check size={14} aria-hidden="true" />{t("selected")}</span>}
                </span>
                <span className="repo-description" id={`${repo.id}-description`}>
                  {t(`descriptions.${repo.descriptionKey}`)}
                </span>
                <span className="repo-meta">
                  <span>{repo.language}</span>
                  {repo.pinned && <span><Pin size={13} aria-hidden="true" />{t("pinned")}</span>}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>
      <div className="selection-next">
        <p id="selection-next-help">{t(empty ? "empty" : "nextHint")}</p>
        {empty ? (
          <button type="button" disabled className="button button-disabled" aria-describedby="selection-next-help">
            {t("continue")}
          </button>
        ) : (
          <Link href="/demo/states" className="button button-primary" aria-describedby="selection-next-help">
            {t("continue")}<ArrowRight size={18} aria-hidden="true" />
          </Link>
        )}
      </div>
    </section>
  );
}
