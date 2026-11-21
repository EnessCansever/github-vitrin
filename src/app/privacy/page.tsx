import {getTranslations} from "next-intl/server";
import {InfoPage} from "@/components/info-page";
import {site} from "@/config/site";

export async function generateMetadata() {
  const t = await getTranslations("Privacy");
  return {title: t("title") + " · " + site.name, description: t("intro")};
}

export default function Page() {
  return <InfoPage page="Privacy" />;
}
