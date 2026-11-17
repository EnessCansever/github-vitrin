import type {Metadata} from "next";
import Link from "next/link";
import {NextIntlClientProvider} from "next-intl";
import {createTranslator} from "next-intl";
import tr from "@/messages/tr.json";
import en from "@/messages/en.json";
import {getSharePage,shareLocale,shareMetadata} from "@/features/shares/metadata";
import {PublicReport} from "@/features/shares/public-report";
import {StatePanel} from "@/features/analysis/analysis-states";
import {RetryNotice} from "@/components/retry-notice";

export const dynamic = "force-dynamic";
type Props={params:Promise<{id:string}>;searchParams:Promise<{lang?:string | string[]}>};

export async function generateMetadata({params,searchParams}:Props):Promise<Metadata>{
  const {id}=await params,query=await searchParams;
  const result=await getSharePage(id);
  return shareMetadata(result.status==="success"?result.share:null,shareLocale(query.lang));
}

export default async function SharePage({params,searchParams}:Props) {
  const {id}=await params,query=await searchParams;
  const locale=shareLocale(query.lang);
  const result=await getSharePage(id);
  const messages=locale==="tr"?tr:en;
  const t=createTranslator({locale,messages,namespace:"Sharing"});
  return <main lang={locale} id="main" className="shell prototype-main">
    <h1 className="stored-report-title">{t("publicTitle")}</h1>
    <NextIntlClientProvider locale={locale} messages={{Sharing:messages.Sharing,Report:messages.Report,Scoring:messages.Scoring,Common:messages.Common,Identity:messages.Identity,Requests:messages.Requests}}>
      {result.status === "success" ? <PublicReport share={result.share} /> : <StatePanel
        state={result.code === "missing" || result.code === "invalid" ? "notFound" : result.code === "rateLimit" ? "rateLimit" : "network"}
        title={t("unavailableTitle")} description={t(`errors.${result.code}`)}>
        <RetryNotice retryAt={result.retryAt} />
        <Link className="text-link" href="/">{t("home")}</Link>
      </StatePanel>}
    </NextIntlClientProvider>
  </main>;
}
