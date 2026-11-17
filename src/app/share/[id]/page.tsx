import type {Metadata} from "next";
import Link from "next/link";
import {NextIntlClientProvider} from "next-intl";
import {getMessages, getTranslations} from "next-intl/server";
import {loadPublicShare} from "@/features/shares/read";
import {PublicReport} from "@/features/shares/public-report";
import {StatePanel} from "@/features/analysis/analysis-states";
import {RetryNotice} from "@/components/retry-notice";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {robots:{index:false,follow:false,noarchive:true},referrer:"no-referrer"};

export default async function SharePage({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const result=await loadPublicShare(id);
  const t=await getTranslations("Sharing");
  const messages=await getMessages();
  return <main id="main" className="shell prototype-main">
    <h1 className="stored-report-title">{t("publicTitle")}</h1>
    <NextIntlClientProvider messages={{Sharing:messages.Sharing,Report:messages.Report,Scoring:messages.Scoring,Common:messages.Common,Identity:messages.Identity,Requests:messages.Requests}}>
      {result.status === "success" ? <PublicReport share={result.share} /> : <StatePanel
        state={result.code === "missing" || result.code === "invalid" ? "notFound" : result.code === "rateLimit" ? "rateLimit" : "network"}
        title={t("unavailableTitle")} description={t(`errors.${result.code}`)}>
        <RetryNotice retryAt={result.retryAt} />
        <Link className="text-link" href="/">{t("home")}</Link>
      </StatePanel>}
    </NextIntlClientProvider>
  </main>;
}
