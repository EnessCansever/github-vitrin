import Link from "next/link";
import {ArrowUpRight, ChevronDown} from "lucide-react";
import {getTranslations} from "next-intl/server";
import {demo} from "@/features/analysis/demo";
import {IdentityCard} from "./identity-card";

export async function ResultSummary({compact = false}: {compact?: boolean}) {
  const t = await getTranslations("Demo");
  const card = await getTranslations("Identity");
  const common = await getTranslations("Common");
  const home = await getTranslations("Home");
  return (
    <IdentityCard username={demo.username} initials={demo.initials} title={t("title")} label={common("demo")} caption={card("fictional")}
      scoreLabel={t("scoreLabel")} score={demo.score} categories={demo.categories} compact={compact}
      footer={compact ? <Link href="/demo">{home("previewLink")}<ArrowUpRight size={18} aria-hidden="true" /></Link> : <p>{t("summary")}</p>}>
      {!compact && (
        <details className="evidence identity-evidence">
          <summary>{t("typeReasonLabel")}<ChevronDown size={16} aria-hidden="true" /></summary>
          <div className="evidence-body"><p>{t("typeReason")}</p><p>{t("scope", {count: demo.repoCount})} · {common("rule", {version: demo.rulesVersion})}</p></div>
        </details>
      )}
    </IdentityCard>
  );
}
