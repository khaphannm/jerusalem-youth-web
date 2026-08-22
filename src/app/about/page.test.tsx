import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AboutPage, { generateMetadata } from "@/app/about/page";
import type { AboutPageData } from "@/features/about/data";
import type { AboutPage as AboutPageContent, SiteSettings } from "@/lib/cms/domain";

const { loadAboutPageDataMock, loadAboutSiteSettingsMock } = vi.hoisted(() => ({
  loadAboutPageDataMock: vi.fn(),
  loadAboutSiteSettingsMock: vi.fn(),
}));

vi.mock("@/features/about/data", () => ({
  loadAboutPageData: loadAboutPageDataMock,
  loadAboutSiteSettings: loadAboutSiteSettingsMock,
}));

const aboutPage = {
  id: "about-page-1",
  vision: "Young people rooted in Jesus and alive with hope.",
  mission: "We gather, grow, and serve together.",
  values: [
    {
      title: "Faith",
      description: "We follow Jesus in every part of life.",
    },
    {
      title: "Belonging",
      description: "We make room for every young person.",
    },
  ],
  callToAction: { label: "Plan your visit", url: "/join" },
  publishedAt: "2026-08-21T03:00:00.000Z",
} satisfies AboutPageContent;

const siteSettings = {
  siteName: "Jerusalem Youth",
  siteDescription: "A community growing in faith and serving together.",
  defaultSeo: {
    metaTitle: null,
    metaDescription: null,
    canonical: null,
    socialImage: null,
    noIndex: false,
  },
  defaultSocialImage: null,
  organizationContact: null,
  primaryCallToAction: { label: "Connect", url: "/contact" },
  footerContent: null,
} satisfies SiteSettings;

describe("AboutPage", () => {
  beforeEach(() => {
    loadAboutPageDataMock.mockReset();
    loadAboutSiteSettingsMock.mockReset();
  });

  it("renders CMS-owned vision, mission, values, and next action", async () => {
    loadAboutPageDataMock.mockResolvedValue({
      aboutPage,
      siteSettings,
    } satisfies AboutPageData);

    render(await AboutPage());

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "About Jerusalem Youth",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(aboutPage.vision)).toBeInTheDocument();
    expect(screen.getByText(aboutPage.mission)).toBeInTheDocument();

    const valuesSection = screen.getByRole("region", {
      name: "What shapes our community",
    });
    expect(
      within(valuesSection).getByRole("heading", {
        level: 3,
        name: "Faith",
      }),
    ).toBeInTheDocument();
    expect(
      within(valuesSection).getByRole("heading", {
        level: 3,
        name: "Belonging",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Plan your visit" }),
    ).toHaveAttribute("href", "/join");
  });

  it("keeps the page useful before About Page content is published", async () => {
    loadAboutPageDataMock.mockResolvedValue({
      aboutPage: null,
      siteSettings,
    } satisfies AboutPageData);

    render(await AboutPage());

    expect(
      screen.getByText("Our purpose will be shared here"),
    ).toBeInTheDocument();
    expect(screen.getByText("Our values are coming")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Connect" })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  it("builds unique social metadata from Site Settings", async () => {
    loadAboutSiteSettingsMock.mockResolvedValue(siteSettings);

    await expect(generateMetadata()).resolves.toMatchObject({
      description:
        "Learn about Jerusalem Youth, our vision, mission, and values. A community growing in faith and serving together.",
      openGraph: {
        siteName: "Jerusalem Youth",
        title: "About Jerusalem Youth",
        type: "website",
      },
      title: "About",
      twitter: {
        card: "summary",
        title: "About Jerusalem Youth",
      },
    });
  });
});
