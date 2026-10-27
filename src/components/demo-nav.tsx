import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { getTranslations } from "next-intl/server";

type Props = {
  current: "report" | "select" | "states";
};

export async function DemoNav({ current }: Props) {
  const t = await getTranslations("DemoNav");
  const links = [
    { id: "report", href: "/demo" },
    { id: "select", href: "/demo/select" },
    { id: "states", href: "/demo/states" },
  ];

  return (
    <nav className="demo-nav" aria-label={t("label")}>
      <p>{t("label")}</p>
      <ul>
        {links.map((link) => (
          <li key={link.id}>
            <Link href={link.href} aria-current={current === link.id ? "page" : undefined}>
              <span>{t(link.id)}</span>
              {current === link.id ? <Check size={15} aria-hidden="true" /> : <ArrowRight size={15} aria-hidden="true" />}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
