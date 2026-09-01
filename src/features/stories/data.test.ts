import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  isValidStorySlug,
  loadStoryDetail,
  loadStoryListing,
  loadStorySiteSettings,
  parseStoryPage,
  storiesPageSize,
} from "@/features/stories/data";

const { siteSettingsMock, storiesFindBySlugMock, storiesListMock } = vi.hoisted(() => ({
  siteSettingsMock: vi.fn(),
  storiesFindBySlugMock: vi.fn(),
  storiesListMock: vi.fn(),
}));

vi.mock("@/lib/cms", () => ({
  getCmsClient: () => ({
    siteSettings: siteSettingsMock,
    stories: {
      findBySlug: storiesFindBySlugMock,
      list: storiesListMock,
    },
  }),
}));

describe("story data", () => {
  beforeEach(() => {
    siteSettingsMock.mockReset();
    storiesFindBySlugMock.mockReset();
    storiesListMock.mockReset();
  });

  it("loads a valid story slug", async () => {
    const story = { id: "story-1", slug: "finding-a-place" };
    storiesFindBySlugMock.mockResolvedValue(story);

    await expect(loadStoryDetail("finding-a-place")).resolves.toEqual({
      status: "found",
      story,
    });
    expect(storiesFindBySlugMock).toHaveBeenCalledExactlyOnceWith(
      "finding-a-place",
    );
  });

  it.each(["", "Finding-place", "finding place", "../draft", "story_"])(
    "rejects invalid story slug %s before querying the CMS",
    async (slug) => {
      expect(isValidStorySlug(slug)).toBe(false);
      await expect(loadStoryDetail(slug)).resolves.toEqual({
        status: "not-found",
      });
      expect(storiesFindBySlugMock).not.toHaveBeenCalled();
    },
  );

  it("returns not found for a missing or unpublished story", async () => {
    storiesFindBySlugMock.mockResolvedValue(null);

    await expect(loadStoryDetail("private-story")).resolves.toEqual({
      status: "not-found",
    });
  });

  it("returns a controlled detail error when the CMS read fails", async () => {
    storiesFindBySlugMock.mockRejectedValue(new Error("Stories offline"));
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(loadStoryDetail("finding-a-place")).resolves.toEqual({
      status: "error",
    });
    expect(errorSpy).toHaveBeenCalledWith(
      "Stories detail could not be loaded: Stories offline",
    );
  });

  it("normalizes missing, repeated, and invalid page parameters", () => {
    expect(parseStoryPage(undefined)).toBe(1);
    expect(parseStoryPage("2")).toBe(2);
    expect(parseStoryPage(["3", "4"])).toBe(3);
    expect(parseStoryPage("0")).toBe(1);
    expect(parseStoryPage("2.5")).toBe(1);
    expect(parseStoryPage("9007199254740992")).toBe(1);
  });

  it("requests a bounded CMS page", async () => {
    const listing = {
      items: [],
      pagination: {
        page: 2,
        pageCount: 3,
        pageSize: storiesPageSize,
        total: 14,
      },
    };
    storiesListMock.mockResolvedValue(listing);

    await expect(loadStoryListing(2)).resolves.toBe(listing);
    expect(storiesListMock).toHaveBeenCalledExactlyOnceWith({
      page: 2,
      pageSize: storiesPageSize,
    });
  });

  it("returns a controlled listing error when the CMS read fails", async () => {
    storiesListMock.mockRejectedValue(new Error("Stories offline"));
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(loadStoryListing(1)).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(
      "Stories listing could not be loaded: Stories offline",
    );
  });

  it("loads site settings for listing metadata", async () => {
    const settings = { siteName: "Jerusalem Youth" };
    siteSettingsMock.mockResolvedValue(settings);

    await expect(loadStorySiteSettings()).resolves.toBe(settings);
  });

  it("returns controlled metadata fallback data when settings fail", async () => {
    siteSettingsMock.mockRejectedValue(new Error("Settings offline"));
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(loadStorySiteSettings()).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(
      "Stories metadata could not be loaded: Settings offline",
    );
  });
});
