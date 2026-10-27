import type { Metadata } from "next";
import type { ReactNode } from "react";
import { site } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  title: site.name,
  description: "GitHub portfolyo sunumu değerlendirme projesi. Geliştirme aşamasında.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
