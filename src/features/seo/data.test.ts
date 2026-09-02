import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  loadGlobalSiteSettings,
  loadOrganizationData,
} from "@/features/seo/data";

const { siteSettingsMock, socialLinksMock } = vi.hoisted(() => ({
  siteSettingsMock: vi.fn(),
  socialLinksMock: vi.fn(),
}));

vi.mock("@/lib/cms", () => ({
  getCmsClient: () => ({
    siteSettings: siteSettingsMock,
    socialLinks: socialLinksMock,
  }),
}));

describe("loadGlobalSiteSettings", () => {
  beforeEach(() => {
    siteSettingsMock.mockReset();
    socialLinksMock.mockReset();
  });

  it("loads the CMS site settings", async () => {
    siteSettingsMock.mockResolvedValue({ siteName: "Jerusalem Youth" });

    await expect(loadGlobalSiteSettings()).resolves.toEqual({
      siteName: "Jerusalem Youth",
    });
  });

  it("falls back safely when the CMS is unavailable", async () => {
    siteSettingsMock.mockRejectedValue(new Error("CMS offline"));
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(loadGlobalSiteSettings()).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(
      "Global metadata site settings could not be loaded: CMS offline",
    );

    errorSpy.mockRestore();
  });
});

describe("loadOrganizationData", () => {
  beforeEach(() => {
    siteSettingsMock.mockReset();
    socialLinksMock.mockReset();
  });

  it("loads approved organization identity and social sources in parallel", async () => {
    const settings = { siteName: "Jerusalem Youth" };
    const socialLinks = {
      links: [
        {
          displayOrder: 1,
          platform: "Instagram",
          url: "https://instagram.com/jerusalemyouth",
        },
      ],
    };
    siteSettingsMock.mockResolvedValue(settings);
    socialLinksMock.mockResolvedValue(socialLinks);

    await expect(loadOrganizationData()).resolves.toEqual({
      siteSettings: settings,
      socialLinks,
    });
  });

  it("keeps available organization fields when one source fails", async () => {
    siteSettingsMock.mockResolvedValue({ siteName: "Jerusalem Youth" });
    socialLinksMock.mockRejectedValue(new Error("Social links offline"));
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(loadOrganizationData()).resolves.toEqual({
      siteSettings: { siteName: "Jerusalem Youth" },
      socialLinks: null,
    });
    expect(errorSpy).toHaveBeenCalledWith(
      "Organization social links could not be loaded: Social links offline",
    );

    errorSpy.mockRestore();
  });
});
