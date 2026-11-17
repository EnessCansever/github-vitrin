import type {Metadata} from "next";
import {NextIntlClientProvider} from "next-intl";
import {getMessages,getTranslations} from "next-intl/server";
import {ShareManager} from "@/features/shares/manager";
export const dynamic="force-dynamic";
export const metadata:Metadata={robots:{index:false,follow:false,noarchive:true},referrer:"no-referrer"};
export default async function ManageSharePage(){
  const t=await getTranslations("Sharing"),messages=await getMessages();
  return <main id="main" className="shell prototype-main"><h1 className="stored-report-title">{t("manageTitle")}</h1>
    <NextIntlClientProvider messages={{Sharing:messages.Sharing,Requests:messages.Requests}}><ShareManager/></NextIntlClientProvider>
  </main>;
}
