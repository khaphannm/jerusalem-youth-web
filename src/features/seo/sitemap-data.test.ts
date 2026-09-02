import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadSitemapData } from "@/features/seo/sitemap-data";

const mocks = vi.hoisted(() => ({
  articles: vi.fn(),
  events: vi.fn(),
  resources: vi.fn(),
  sermons: vi.fn(),
  settings: vi.fn(),
  stories: vi.fn(),
}));

vi.mock("@/lib/cms", () => ({
  getCmsClient: () => ({
    articles: { list: mocks.articles },
    events: { list: mocks.events },
    resources: { list: mocks.resources },
    sermons: { list: mocks.sermons },
    siteSettings: mocks.settings,
    stories: { list: mocks.stories },
  }),
}));

const emptyPage = {
  items: [],
  pagination: { page: 1, pageCount: 1, pageSize: 100, total: 0 },
};

describe("loadSitemapData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.settings.mockResolvedValue(null);

    for (const reader of [
      mocks.articles,
      mocks.events,
      mocks.resources,
      mocks.sermons,
      mocks.stories,
    ]) {
      reader.mockResolvedValue(emptyPage);
    }
  });

  it("loads every page and maps only the fields needed by the sitemap", async () => {
    mocks.settings.mockResolvedValue({
      defaultSeo: {
        canonical: "https://youth.example.org/",
        noIndex: false,
      },
    });
    mocks.articles
      .mockResolvedValueOnce({
        items: [
          {
            category: { slug: "devotional" },
            publishedAt: "2026-08-20T00:00:00.000Z",
            seo: null,
            slug: "first-article",
          },
        ],
        pagination: { page: 1, pageCount: 2, pageSize: 100, total: 2 },
      })
      .mockResolvedValueOnce({
        items: [
          {
            category: { slug: "news" },
            publishedAt: "2026-08-21T00:00:00.000Z",
            seo: { canonical: null, noIndex: true },
            slug: "second-article",
          },
        ],
        pagination: { page: 2, pageCount: 2, pageSize: 100, total: 2 },
      });

    await expect(loadSitemapData()).resolves.toMatchObject({
      articles: [
        {
          categorySlug: "devotional",
          noIndex: false,
          slug: "first-article",
        },
        {
          categorySlug: "news",
          noIndex: true,
          slug: "second-article",
        },
      ],
      globalNoIndex: false,
      homeCanonical: "https://youth.example.org/",
    });
    expect(mocks.articles).toHaveBeenNthCalledWith(1, {
      page: 1,
      pageSize: 100,
    });
    expect(mocks.articles).toHaveBeenNthCalledWith(2, {
      page: 2,
      pageSize: 100,
    });
  });

  it("keeps available sources when one CMS collection fails", async () => {
    mocks.articles.mockRejectedValue(new Error("Articles offline"));
    mocks.events.mockResolvedValue({
      items: [
        {
          publishedAt: "2026-08-22T00:00:00.000Z",
          seo: null,
          slug: "available-event",
        },
      ],
      pagination: { page: 1, pageCount: 1, pageSize: 100, total: 1 },
    });
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(loadSitemapData()).resolves.toMatchObject({
      articles: [],
      events: [{ slug: "available-event" }],
    });
    expect(errorSpy).toHaveBeenCalledWith(
      "Sitemap articles could not be loaded: Articles offline",
    );

    errorSpy.mockRestore();
  });
});
