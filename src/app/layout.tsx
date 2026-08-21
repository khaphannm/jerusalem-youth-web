import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import type { ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { siteConfig } from "@/config/site";

import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  display: "swap",
  subsets: ["latin", "vietnamese"],
  variable: "--font-be-vietnam-pro",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className={beVietnamPro.variable} lang="en">
      <body>
        <a
          className="fixed left-gutter top-gutter z-50 -translate-y-24 rounded-small bg-primary px-4 py-3 font-label text-label font-semibold text-primary-foreground transition-transform duration-fast ease-standard focus:translate-y-0 motion-reduce:transition-none"
          href="#main-content"
        >
          Skip to main content
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
