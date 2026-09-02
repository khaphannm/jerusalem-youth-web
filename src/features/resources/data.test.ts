import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  isValidResourceSlug,
  loadResourceDetail,
  loadResourceListing,
  loadResourceSiteSettings,
  parseResourcePage,
  resourcesPageSize,
} from "@/features/resources/data";

const {
  resourcesFindBySlugMock,
  resourcesListMock,
  siteSettingsMock,
} = vi.hoisted(() => ({
  resourcesFindBySlugMock: vi.fn(),
  resourcesListMock: vi.fn(),
  siteSettingsMock: vi.fn(),
}));

vi.mock("@/lib/cms", () => ({
  getCmsClient: () => ({
    resources: {
      findBySlug: resourcesFindBySlugMock,
      list: resourcesListMock,
    },
    siteSettings: siteSettingsMock,
  }),
}));

describe("resource data", () => {
  beforeEach(() => {
    resourcesFindBySlugMock.mockReset();
    resourcesListMock.mockReset();
    siteSettingsMock.mockReset();
  });

  it("normalizes invalid page parameters", () => {
    expect(parseResourcePage(undefined)).toBe(1);
    expect(parseResourcePage("2")).toBe(2);
    expect(parseResourcePage(["3", "4"])).toBe(3);
    expect(parseResourcePage("0")).toBe(1);
    expect(parseResourcePage("2.5")).toBe(1);
  });

  it("requests a bounded resource page", async () => {
    const listing = {
      items: [],
      pagination: {
        page: 2,
        pageCount: 3,
        pageSize: resourcesPageSize,
        total: 20,
      },
    };
    resourcesListMock.mockResolvedValue(listing);

    await expect(loadResourceListing(2)).resolves.toBe(listing);
    expect(resourcesListMock).toHaveBeenCalledExactlyOnceWith({
      page: 2,
      pageSize: resourcesPageSize,
    });
  });

  it("returns a controlled listing error", async () => {
    resourcesListMock.mockRejectedValue(new Error("Resources offline"));
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(loadResourceListing(1)).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(
      "Resources listing could not be loaded: Resources offline",
    );
  });

  it("loads settings and handles metadata failures", async () => {
    const settings = { siteName: "Jerusalem Youth" };
    siteSettingsMock.mockResolvedValueOnce(settings);
    await expect(loadResourceSiteSettings()).resolves.toBe(settings);

    siteSettingsMock.mockRejectedValueOnce(new Error("Settings offline"));
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    await expect(loadResourceSiteSettings()).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(
      "Resources metadata could not be loaded: Settings offline",
    );
  });

  it("loads a valid public resource slug", async () => {
    const resource = { id: "resource-1", slug: "small-group-guide" };
    resourcesFindBySlugMock.mockResolvedValue(resource);

    expect(isValidResourceSlug("small-group-guide")).toBe(true);
    await expect(loadResourceDetail("small-group-guide")).resolves.toEqual({
      resource,
      status: "found",
    });
    expect(resourcesFindBySlugMock).toHaveBeenCalledExactlyOnceWith(
      "small-group-guide",
    );
  });

  it.each(["", "Small-group-guide", "small group", "../draft", "guide_"])(
    "rejects invalid slug %s before querying the CMS",
    async (slug) => {
      await expect(loadResourceDetail(slug)).resolves.toEqual({
        status: "not-found",
      });
      expect(resourcesFindBySlugMock).not.toHaveBeenCalled();
    },
  );

  it("handles missing and failed detail reads", async () => {
    resourcesFindBySlugMock.mockResolvedValueOnce(null);
    await expect(loadResourceDetail("missing-guide")).resolves.toEqual({
      status: "not-found",
    });

    resourcesFindBySlugMock.mockRejectedValueOnce(
      new Error("Resources offline"),
    );
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    await expect(loadResourceDetail("small-group-guide")).resolves.toEqual({
      status: "error",
    });
    expect(errorSpy).toHaveBeenCalledWith(
      "Resources detail could not be loaded: Resources offline",
    );
  });
});
