import { describe, expect, it } from "vitest";

import { siteConfig } from "@/config/site";
import { buildOrganizationStructuredData } from "@/features/seo/organization";
import type { SiteSettings, SocialLinks } from "@/lib/cms/domain";

const settings = {
  siteName: "Jerusalem Youth",
  siteDescription: "A community growing in faith.",
  defaultSeo: null,
  defaultSocialImage: null,
  organizationContact: {
    address: "123 Community Street",
    email: "hello@youth.example.org",
    phone: "+1 555 0100",
  },
  primaryCallToAction: null,
  footerContent: null,
} satisfies SiteSettings;

const socialLinks = {
  links: [
    {
      displayOrder: 1,
      platform: "Instagram",
      url: "https://instagram.com/jerusalemyouth",
    },
    {
      displayOrder: 2,
      platform: "YouTube",
      url: "https://youtube.com/@jerusalemyouth",
    },
    {
      displayOrder: 3,
      platform: "Instagram mirror",
      url: "https://instagram.com/jerusalemyouth",
    },
  ],
} satisfies SocialLinks;

describe("buildOrganizationStructuredData", () => {
  it("emits only approved identity, contact, and official social facts", () => {
    expect(
      buildOrganizationStructuredData(
        { siteSettings: settings, socialLinks },
        new URL("https://youth.example.org"),
      ),
    ).toEqual({
      "@context": "https://schema.org",
      "@id": "https://youth.example.org/#organization",
      "@type": "Organization",
      address: "123 Community Street",
      description: "A community growing in faith.",
      email: "hello@youth.example.org",
      name: "Jerusalem Youth",
      sameAs: [
        "https://instagram.com/jerusalemyouth",
        "https://youtube.com/@jerusalemyouth",
      ],
      telephone: "+1 555 0100",
      url: "https://youth.example.org",
    });
  });

  it("uses approved checked-in identity without fabricating optional facts", () => {
    const structuredData = buildOrganizationStructuredData(
      { siteSettings: null, socialLinks: null },
      new URL("http://localhost:3000"),
    );

    expect(structuredData).toMatchObject({
      "@type": "Organization",
      description: siteConfig.description,
      name: siteConfig.name,
      url: "http://localhost:3000",
    });
    expect(structuredData).not.toHaveProperty("address");
    expect(structuredData).not.toHaveProperty("email");
    expect(structuredData).not.toHaveProperty("logo");
    expect(structuredData).not.toHaveProperty("sameAs");
    expect(structuredData).not.toHaveProperty("telephone");
  });
});
