import localFont from "next/font/local";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site } from "@/config/site";
import "./globals.css";

const bodyFont = localFont({src: "./fonts/Manrope-Variable.ttf", variable: "--font-body", weight: "200 800", display: "swap"});
const headingFont = localFont({src: "./fonts/BarlowCondensed-ExtraBold.ttf", variable: "--font-heading", weight: "800", display: "swap"});
const codeFont = localFont({src: "./fonts/IBMPlexMono-Regular.ttf", variable: "--font-code", weight: "400", display: "swap"});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Common");
  return {
    title: site.name,
    description: t("notQuality"),
    robots: { index: false, follow: false },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${bodyFont.variable} ${headingFont.variable} ${codeFont.variable}`}>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
