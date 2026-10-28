import { ScanSearch, Wrench, Send } from "lucide-react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { ProfileSearch } from "@/features/analysis/profile-search";
import { ResultSummary } from "@/components/result-summary";

export default async function Home() {
  const t = await getTranslations("Home");
  const messages = await getMessages();
  const common = await getTranslations("Common");

  return (
    <main id="main" className="shell home-main">
      <NextIntlClientProvider messages={{Home: messages.Home, Search: messages.Search, Select: messages.Select}}>
        <ProfileSearch preview={<ResultSummary compact />}>
          <p className="eyebrow"><span className="status-dot" />{t("eyebrow")}</p>
          <h1 id="hero-title">{t.rich("title", { accent: (text) => <span className="brand-accent">{text}</span> })}</h1>
          <p className="hero-intro">{t("intro")}</p>
        </ProfileSearch>
      </NextIntlClientProvider>
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
