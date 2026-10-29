import type {Metadata} from "next";
import {NextIntlClientProvider} from "next-intl";
import {getMessages, getTranslations} from "next-intl/server";
import {ReportAccess} from "@/features/reports/report-access";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {robots: {index: false, follow: false, noarchive: true}, referrer: "no-referrer"};

export default async function ReportPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const t = await getTranslations("SavedReport");
  const messages = await getMessages();
  return (
    <main id="main" className="shell prototype-main">
      <h1 className="stored-report-title">{t("title")}</h1>
      <NextIntlClientProvider messages={{SavedReport: messages.SavedReport, Report: messages.Report, Scoring: messages.Scoring, Checks: messages.Checks, Common: messages.Common, Identity: messages.Identity}}>
        <ReportAccess key={id} id={id} />
      </NextIntlClientProvider>
    </main>
  );
}
