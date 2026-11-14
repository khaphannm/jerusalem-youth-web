import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import type { ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getSiteUrl } from "@/config/site-url";
import {
  loadGlobalSiteSettings,
  loadOrganizationData,
} from "@/features/seo/data";
import { buildGlobalMetadata } from "@/features/seo/metadata";
import { buildOrganizationStructuredData } from "@/features/seo/organization";
import { serializeStructuredData } from "@/lib/seo/structured-data";

import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  display: "swap",
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam-pro",
  weight: ["400", "500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadGlobalSiteSettings();

  return buildGlobalMetadata(settings, getSiteUrl());
}

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const organizationData = await loadOrganizationData();
  const structuredData = buildOrganizationStructuredData(
    organizationData,
    getSiteUrl(),
  );

  return (
    <html className={beVietnamPro.variable} lang="en">
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: serializeStructuredData(structuredData),
          }}
          type="application/ld+json"
        />
        <a
          className="fixed left-gutter top-gutter z-50 -translate-y-24 rounded-small bg-primary px-4 py-3 font-label text-label font-semibold text-primary-foreground transition-transform duration-fast ease-standard focus:translate-y-0 motion-reduce:transition-none"
          href="#main-content"
          lang="vi"
        >
          Đến nội dung chính
        </a>
        <Header locale="vi" />
        {children}
        <Footer locale="vi" />
      </body>
    </html>
  );
}
