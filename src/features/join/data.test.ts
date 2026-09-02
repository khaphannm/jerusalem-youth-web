import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  loadJoinPageData,
  loadJoinSiteSettings,
} from "@/features/join/data";

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

describe("Join page data", () => {
  beforeEach(() => {
    getCmsClientMock.mockReset();
    siteSettingsMock.mockReset();
    socialLinksMock.mockReset();
    getCmsClientMock.mockReturnValue({
      siteSettings: siteSettingsMock,
      socialLinks: socialLinksMock,
    });
  });

  it("loads approved settings and social links concurrently", async () => {
    const settings = { siteName: "Jerusalem Youth" };
    const socialLinks = { links: [] };
    siteSettingsMock.mockResolvedValue(settings);
    socialLinksMock.mockResolvedValue(socialLinks);

    await expect(loadJoinPageData()).resolves.toEqual({
      siteSettings: settings,
      socialLinks,
    });
    expect(siteSettingsMock).toHaveBeenCalledOnce();
    expect(socialLinksMock).toHaveBeenCalledOnce();
  });

  it("keeps available data when one CMS source fails", async () => {
    const settings = { siteName: "Jerusalem Youth" };
    siteSettingsMock.mockResolvedValue(settings);
    socialLinksMock.mockRejectedValue(new Error("Social links offline"));
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(loadJoinPageData()).resolves.toEqual({
      siteSettings: settings,
      socialLinks: null,
    });
    expect(errorSpy).toHaveBeenCalledWith(
      "Join page social links could not be loaded: Social links offline",
    );
  });

  it("returns safe fallback data when client setup fails", async () => {
    getCmsClientMock.mockImplementation(() => {
      throw new Error("Missing configuration");
    });
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(loadJoinPageData()).resolves.toEqual({
      siteSettings: null,
      socialLinks: null,
    });
    expect(errorSpy).toHaveBeenCalledWith(
      "Join page CMS data could not be loaded: Missing configuration",
    );
  });

  it("loads metadata settings with a controlled fallback", async () => {
    const settings = { siteName: "Jerusalem Youth" };
    siteSettingsMock.mockResolvedValueOnce(settings);
    await expect(loadJoinSiteSettings()).resolves.toBe(settings);

    siteSettingsMock.mockRejectedValueOnce(new Error("Settings offline"));
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    await expect(loadJoinSiteSettings()).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(
      "Join page metadata could not be loaded: Settings offline",
    );
  });
});
