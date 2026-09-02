import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import type { SiteSettings } from "@/lib/cms/domain";

export function buildGlobalMetadata(
  settings: SiteSettings | null,
  metadataBase: URL,
): Metadata {
  const siteName = settings?.siteName ?? siteConfig.name;
  const title = settings?.defaultSeo?.metaTitle ?? siteName;
  const description =
    settings?.defaultSeo?.metaDescription ??
    settings?.siteDescription ??
    siteConfig.description;
  const socialImage =
    settings?.defaultSeo?.socialImage ?? settings?.defaultSocialImage;
  const image = socialImage
    ? {
        alt: socialImage.alternativeText ?? title,
        height: socialImage.height ?? undefined,
        url: socialImage.url,
        width: socialImage.width ?? undefined,
      }
    : undefined;

  return {
    applicationName: siteName,
    description,
    metadataBase,
    openGraph: {
      description,
      images: image ? [image] : undefined,
      siteName,
      title,
      type: "website",
    },
    robots: settings?.defaultSeo?.noIndex
      ? { follow: true, index: false }
      : undefined,
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      description,
      images: image ? [image.url] : undefined,
      title,
    },
  };
}
