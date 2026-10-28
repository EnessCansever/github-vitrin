import type {ReactNode} from "react";
import {ArrowDownRight} from "lucide-react";
import {useFormatter, useTranslations} from "next-intl";
import {site} from "../config/site";
import type {Category} from "@/features/analysis/scoring/types";

type Props = {
  username: string;
  initials?: string;
  title: string;
  label: string;
  caption: string;
  scoreLabel: string;
  score: number | null;
  categories: Pick<Category, "id" | "score" | "max">[];
  footer: ReactNode;
  children?: ReactNode;
  compact?: boolean;
  headingLevel?: "h1" | "h2";
  headingId?: string;
};

export function IdentityCard({username, initials = username.slice(0, 2).toUpperCase(), title, label, caption, scoreLabel, score, categories, footer, children,
  compact = false, headingLevel = "h1", headingId}: Props) {
  const common = useTranslations("Common");
  const card = useTranslations("Identity");
  const format = useFormatter();
  const Heading = compact ? "h2" : headingLevel;
  const titleId = headingId ?? (compact ? "preview-title" : "result-title");

  return (
    <section className={`identity-card${compact ? " identity-card--hero" : ""}`} aria-labelledby={titleId}>
      <div className="identity-masthead">
        <span className="identity-brand">{site.name}</span>
        <p><span>{card("label")}</span><span>{label}</span></p>
      </div>
      <div className="identity-person">
        <span className="identity-avatar" aria-hidden="true">{initials}</span>
        <div><p className="identity-handle">@{username}</p><p className="identity-caption">{caption}</p></div>
        {score !== null && <span className="identity-stamp" aria-hidden="true"><span>{title}</span><ArrowDownRight size={22} /></span>}
      </div>
      <div className="identity-headline">
        <Heading id={titleId} tabIndex={-1} className="identity-type">{title}</Heading>
        <div className="identity-score">
          <strong>{score === null ? "—" : format.number(score)}</strong>
          <p>{scoreLabel}{score !== null && <span>/ 100</span>}</p>
        </div>
      </div>
      <ul className="identity-categories" aria-label={card("categories")}>
        {categories.map(category => (
          <li key={category.id}>
            <span>{card(category.id)}</span>
            <span className="identity-track" aria-hidden="true">{category.score !== null && <span style={{width: `${category.score / category.max * 100}%`}} />}</span>
            <strong>{category.score === null ? card("incomplete") : common("points", {earned: format.number(category.score), max: category.max})}</strong>
          </li>
        ))}
      </ul>
      <div className="identity-footer">{footer}<span className="identity-caption">{card("presentation")}</span></div>
      {children}
    </section>
  );
}
