import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  isValidSermonSlug,
  loadSermonDetail,
  loadSermonListing,
  loadSermonSiteSettings,
  parseSermonPage,
  sermonsPageSize,
} from "@/features/sermons/data";

const { sermonsFindBySlugMock, sermonsListMock, siteSettingsMock } = vi.hoisted(() => ({
  sermonsFindBySlugMock: vi.fn(),
  sermonsListMock: vi.fn(),
  siteSettingsMock: vi.fn(),
}));

vi.mock("@/lib/cms", () => ({
  getCmsClient: () => ({
    sermons: {
      findBySlug: sermonsFindBySlugMock,
      list: sermonsListMock,
    },
    siteSettings: siteSettingsMock,
  }),
}));

describe("sermon data", () => {
  beforeEach(() => {
    sermonsFindBySlugMock.mockReset();
    sermonsListMock.mockReset();
    siteSettingsMock.mockReset();
  });

  it("normalizes missing, repeated, and invalid page parameters", () => {
    expect(parseSermonPage(undefined)).toBe(1);
    expect(parseSermonPage("2")).toBe(2);
    expect(parseSermonPage(["3", "4"])).toBe(3);
    expect(parseSermonPage("0")).toBe(1);
    expect(parseSermonPage("2.5")).toBe(1);
    expect(parseSermonPage("9007199254740992")).toBe(1);
  });

  it("requests a bounded CMS page", async () => {
    const listing = {
      items: [],
      pagination: {
        page: 2,
        pageCount: 3,
        pageSize: sermonsPageSize,
        total: 14,
      },
    };
    sermonsListMock.mockResolvedValue(listing);

    await expect(loadSermonListing(2)).resolves.toBe(listing);
    expect(sermonsListMock).toHaveBeenCalledExactlyOnceWith({
      page: 2,
      pageSize: sermonsPageSize,
    });
  });

  it("returns a controlled listing error when the CMS read fails", async () => {
    sermonsListMock.mockRejectedValue(new Error("Sermons offline"));
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(loadSermonListing(1)).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(
      "Sermons listing could not be loaded: Sermons offline",
    );
  });

  it("loads site settings for listing metadata", async () => {
    const settings = { siteName: "Jerusalem Youth" };
    siteSettingsMock.mockResolvedValue(settings);

    await expect(loadSermonSiteSettings()).resolves.toBe(settings);
  });

  it("returns controlled metadata fallback data when settings fail", async () => {
    siteSettingsMock.mockRejectedValue(new Error("Settings offline"));
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(loadSermonSiteSettings()).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(
      "Sermons metadata could not be loaded: Settings offline",
    );
  });

  it("loads a detail only for a valid public slug", async () => {
    const sermon = { id: "sermon-1", slug: "hope-that-holds" };
    sermonsFindBySlugMock.mockResolvedValue(sermon);

    expect(isValidSermonSlug("hope-that-holds")).toBe(true);
    await expect(loadSermonDetail("hope-that-holds")).resolves.toEqual({
      sermon,
      status: "found",
    });
    expect(sermonsFindBySlugMock).toHaveBeenCalledExactlyOnceWith(
      "hope-that-holds",
    );
  });

  it.each(["", "Hope-that-holds", "hope that holds", "../draft"])(
    "rejects invalid detail slug %j without calling the CMS",
    async (slug) => {
      await expect(loadSermonDetail(slug)).resolves.toEqual({
        status: "not-found",
      });
      expect(sermonsFindBySlugMock).not.toHaveBeenCalled();
    },
  );

  it("returns not-found when no published sermon matches the slug", async () => {
    sermonsFindBySlugMock.mockResolvedValue(null);

    await expect(loadSermonDetail("missing-sermon")).resolves.toEqual({
      status: "not-found",
    });
  });

  it("returns a controlled detail error when the CMS read fails", async () => {
    sermonsFindBySlugMock.mockRejectedValue(new Error("Sermons offline"));
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(loadSermonDetail("hope-that-holds")).resolves.toEqual({
      status: "error",
    });
    expect(errorSpy).toHaveBeenCalledWith(
      "Sermons detail could not be loaded: Sermons offline",
    );
  });
});
