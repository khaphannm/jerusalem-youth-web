import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  loadContactPageData,
  loadContactSiteSettings,
} from "@/features/contact/data";

const { getCmsClientMock, siteSettingsMock, socialLinksMock } = vi.hoisted(
  () => ({
    getCmsClientMock: vi.fn(),
    siteSettingsMock: vi.fn(),
    socialLinksMock: vi.fn(),
  }),
);

vi.mock("@/lib/cms", () => ({
  getCmsClient: getCmsClientMock,
}));

describe("Contact page data", () => {
  beforeEach(() => {
    getCmsClientMock.mockReset();
    siteSettingsMock.mockReset();
    socialLinksMock.mockReset();
    getCmsClientMock.mockReturnValue({
      siteSettings: siteSettingsMock,
      socialLinks: socialLinksMock,
    });
  });

  it("loads organization settings and official social links concurrently", async () => {
    const settings = { siteName: "Jerusalem Youth" };
    const socialLinks = { links: [] };
    siteSettingsMock.mockResolvedValue(settings);
    socialLinksMock.mockResolvedValue(socialLinks);

    await expect(loadContactPageData()).resolves.toEqual({
      siteSettings: settings,
      socialLinks,
    });
    expect(siteSettingsMock).toHaveBeenCalledOnce();
    expect(socialLinksMock).toHaveBeenCalledOnce();
  });

  it("keeps available contact data when social links fail", async () => {
    const settings = { siteName: "Jerusalem Youth" };
    siteSettingsMock.mockResolvedValue(settings);
    socialLinksMock.mockRejectedValue(new Error("Social links offline"));
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(loadContactPageData()).resolves.toEqual({
      siteSettings: settings,
      socialLinks: null,
    });
    expect(errorSpy).toHaveBeenCalledWith(
      "Contact page social links could not be loaded: Social links offline",
    );
  });

  it("returns safe fallback data when client setup fails", async () => {
    getCmsClientMock.mockImplementation(() => {
      throw new Error("Missing configuration");
    });
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(loadContactPageData()).resolves.toEqual({
      siteSettings: null,
      socialLinks: null,
    });
    expect(errorSpy).toHaveBeenCalledWith(
      "Contact page CMS data could not be loaded: Missing configuration",
    );
  });

  it("loads metadata settings with a controlled fallback", async () => {
    const settings = { siteName: "Jerusalem Youth" };
    siteSettingsMock.mockResolvedValueOnce(settings);
    await expect(loadContactSiteSettings()).resolves.toBe(settings);

    siteSettingsMock.mockRejectedValueOnce(new Error("Settings offline"));
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    await expect(loadContactSiteSettings()).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(
      "Contact page metadata could not be loaded: Settings offline",
    );
  });
});
