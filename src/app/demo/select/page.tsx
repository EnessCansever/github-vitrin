import { DemoNav } from "@/components/demo-nav";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { demo } from "@/features/analysis/demo";
import { demoRepos, initialRepoIds } from "@/features/analysis/selection-demo";
import { RepoPicker } from "@/features/analysis/repo-picker";

export default async function SelectPage() {
  const t = await getTranslations("Select");
  const messages = await getMessages();

  return (
    <main id="main" className="shell prototype-main">
      <DemoNav current="select" />
      <div className="demo-topbar">
        <Link href="/demo" className="back-link"><ArrowLeft size={16} aria-hidden="true" />{t("back")}</Link>
      </div>
      <div className="prototype-heading">
        <span className="pill">{t("badge")}</span>
        <div className="profile-identity">
          <span className="avatar" aria-hidden="true">{demo.initials}</span>
          <p className="username">@{demo.username}</p>
        </div>
        <h1>{t("title")}</h1>
        <p>{t("intro")}</p>
      </div>
      <NextIntlClientProvider messages={{ Select: messages.Select }}>
        <RepoPicker repos={demoRepos} initialSelectedIds={initialRepoIds} />
      </NextIntlClientProvider>
    </main>
  );
}
