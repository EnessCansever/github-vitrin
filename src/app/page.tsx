import Link from "next/link";
import { ArrowRight, ScanSearch, Wrench, Send } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ResultSummary } from "@/components/result-summary";

export default async function Home() {
  const t = await getTranslations("Home");
  const common = await getTranslations("Common");

  return (
    <main id="main" className="shell home-main">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="status-dot" />{t("eyebrow")}</p>
          <h1 id="hero-title">{t.rich("title", { accent: (text) => <span className="brand-accent">{text}</span> })}</h1>
          <p className="hero-intro">{t("intro")}</p>
          <div className="profile-entry">
            <label htmlFor="github-profile">{t("label")}</label>
            <div className="input-wrap">
              <span aria-hidden="true">@</span>
              <input id="github-profile" type="text" autoCapitalize="none" spellCheck={false} autoComplete="off" placeholder={t("placeholder")} aria-describedby="profile-hint" />
            </div>
            <p id="profile-hint" className="muted small">{t("inputHint")}</p>
            <Link className="button button-primary" href="/demo">{t("demoAction")}<ArrowRight size={19} aria-hidden="true" /></Link>
          </div>
        </div>
        <aside className="hero-preview" aria-labelledby="preview-title">
          <ResultSummary compact />
        </aside>
      </section>
      <section className="how-section" aria-labelledby="how-title">
        <h2 id="how-title">{t("howTitle")}</h2>
        <ol className="steps">
          {[{ key: "discover", Icon: ScanSearch }, { key: "improve", Icon: Wrench }, { key: "share", Icon: Send }].map(({ key, Icon }, index) => (
            <li key={key}>
              <span className="step-number">0{index + 1}</span>
              <Icon size={22} aria-hidden="true" />
              <h3>{t(`${key}Title`)}</h3>
              <p>{t(key)}</p>
            </li>
          ))}
        </ol>
      </section>
      <p className="scope-note">{common("notQuality")}</p>
    </main>
  );
}
