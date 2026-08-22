import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadAboutPageData } from "@/features/about/data";
import type { AboutPage, SiteSettings } from "@/lib/cms/domain";

const { aboutPageMock, siteSettingsMock } = vi.hoisted(() => ({
  aboutPageMock: vi.fn(),
  siteSettingsMock: vi.fn(),
}));

vi.mock("@/lib/cms", () => ({
  getCmsClient: () => ({
    aboutPage: aboutPageMock,
    siteSettings: siteSettingsMock,
  }),
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
  ],
  callToAction: { label: "Plan your visit", url: "/join" },
  publishedAt: "2026-08-21T03:00:00.000Z",
} satisfies AboutPage;

const siteSettings = {
  siteName: "Jerusalem Youth",
  siteDescription: "A community growing in faith.",
  defaultSeo: null,
  defaultSocialImage: null,
  organizationContact: null,
  primaryCallToAction: null,
  footerContent: null,
} satisfies SiteSettings;

describe("About page data loading", () => {
  beforeEach(() => {
    aboutPageMock.mockReset();
    siteSettingsMock.mockReset();
  });

  it("loads About Page content and site identity in parallel", async () => {
    aboutPageMock.mockResolvedValue(aboutPage);
    siteSettingsMock.mockResolvedValue(siteSettings);

    await expect(loadAboutPageData()).resolves.toEqual({
      aboutPage,
      siteSettings,
    });
    expect(aboutPageMock).toHaveBeenCalledOnce();
    expect(siteSettingsMock).toHaveBeenCalledOnce();
  });

  it("preserves site identity when About Page content fails", async () => {
    aboutPageMock.mockRejectedValue(new Error("About content offline"));
    siteSettingsMock.mockResolvedValue(siteSettings);
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(loadAboutPageData()).resolves.toEqual({
      aboutPage: null,
      siteSettings,
    });
    expect(errorSpy).toHaveBeenCalledWith(
      "About page content could not be loaded: About content offline",
    );
  });
});
