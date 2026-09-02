import { describe, expect, it } from "vitest";

import { siteConfig } from "@/config/site";
import { buildGlobalMetadata } from "@/features/seo/metadata";
import type { SiteSettings } from "@/lib/cms/domain";

const socialImage = {
  id: "social-1",
  name: "social.jpg",
  url: "https://media.example.test/social.jpg",
  alternativeText: "Young people gathering",
  mimeType: "image/jpeg",
  width: 1_200,
  height: 630,
  sizeInKilobytes: 120,
  variants: [],
};

const settings = {
  siteName: "Jerusalem Youth",
  siteDescription: "A community growing in faith.",
  defaultSeo: {
    metaTitle: "Faith, friendship, and purpose",
    metaDescription: "Join Jerusalem Youth as we grow together.",
    canonical: "https://youth.example.org",
    socialImage,
    noIndex: false,
  },
  defaultSocialImage: null,
  organizationContact: null,
  primaryCallToAction: null,
  footerContent: null,
} satisfies SiteSettings;

describe("buildGlobalMetadata", () => {
  it("builds CMS-backed defaults and a title template", () => {
    expect(
      buildGlobalMetadata(settings, new URL("https://youth.example.org")),
    ).toMatchObject({
      applicationName: "Jerusalem Youth",
      description: "Join Jerusalem Youth as we grow together.",
      metadataBase: new URL("https://youth.example.org"),
      openGraph: {
        images: [
          {
            alt: "Young people gathering",
            height: 630,
            url: socialImage.url,
            width: 1_200,
          },
        ],
        siteName: "Jerusalem Youth",
        title: "Faith, friendship, and purpose",
      },
      title: {
        default: "Faith, friendship, and purpose",
        template: "%s | Jerusalem Youth",
      },
      twitter: {
        card: "summary_large_image",
        images: [socialImage.url],
      },
    });
  });

  it("uses checked-in defaults when CMS settings are unavailable", () => {
    expect(
      buildGlobalMetadata(null, new URL("http://localhost:3000")),
    ).toMatchObject({
      applicationName: siteConfig.name,
      description: siteConfig.description,
      openGraph: { title: siteConfig.name },
      title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`,
      },
      twitter: { card: "summary", title: siteConfig.name },
    });
  });
});
