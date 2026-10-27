import { DemoNav } from "@/components/demo-nav";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { stateExamples } from "@/features/analysis/state-demo";
import { AnalysisStates } from "@/features/analysis/analysis-states";

export default async function StatesPage() {
  const t = await getTranslations("States");
  const messages = await getMessages();

  return (
    <main id="main" className="shell prototype-main">
      <DemoNav current="states" />
      <div className="demo-topbar">
        <Link href="/demo/select" className="back-link"><ArrowLeft size={16} aria-hidden="true" />{t("back")}</Link>
      </div>
      <div className="prototype-heading">
        <span className="pill">{t("badge")}</span>
        <h1>{t("title")}</h1>
        <p>{t("intro")}</p>
      </div>
      <NextIntlClientProvider messages={{ States: messages.States }}>
        <AnalysisStates examples={stateExamples} />
      </NextIntlClientProvider>
    </main>
  );
}
