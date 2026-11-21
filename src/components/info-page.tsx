import {getTranslations} from "next-intl/server";
import {site} from "@/config/site";

export async function InfoPage({page}: {page: "Privacy" | "Methodology"}) {
  const t = await getTranslations(page);
  const sections: {heading: string; paragraphs: string[]; items?: string[]}[] = t.raw("sections");
  return <main id="main" className="info-page shell">
    <h1>{t("title")}</h1>
    <p>{t("intro")}</p>
    {sections.map(section => <section key={section.heading}>
      <h2>{section.heading}</h2>
      {section.paragraphs.map(text => <p key={text}>{text}</p>)}
      {section.items && <ol>{section.items.map(item => <li key={item}>{item}</li>)}</ol>}
    </section>)}
    {page === "Privacy" && <section>
      <h2>{t("contactTitle")}</h2>
      <p>{t.rich("contactText", {
        name: site.author,
        email: () => <a className="privacy-email" href={`mailto:${site.email}`}>{site.email}</a>,
      })}</p>
    </section>}
  </main>;
}
