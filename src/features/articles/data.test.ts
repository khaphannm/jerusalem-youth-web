import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  articlesPageSize,
  isValidArticleSlug,
  loadArticleDetail,
  loadArticleListing,
  parseArticlePage,
} from "@/features/articles/data";

const { articlesFindBySlugMock, articlesListMock } = vi.hoisted(() => ({
  articlesFindBySlugMock: vi.fn(),
  articlesListMock: vi.fn(),
}));

vi.mock("@/lib/cms", () => ({
  getCmsClient: () => ({
    articles: {
      findBySlug: articlesFindBySlugMock,
      list: articlesListMock,
    },
  }),
}));

describe("article data", () => {
  beforeEach(() => {
    articlesFindBySlugMock.mockReset();
    articlesListMock.mockReset();
  });

  it("normalizes missing, repeated, and invalid page parameters", () => {
    expect(parseArticlePage(undefined)).toBe(1);
    expect(parseArticlePage("2")).toBe(2);
    expect(parseArticlePage(["3", "4"])).toBe(3);
    expect(parseArticlePage("0")).toBe(1);
    expect(parseArticlePage("2.5")).toBe(1);
    expect(parseArticlePage("9007199254740992")).toBe(1);
  });

  it("requests a bounded CMS page", async () => {
    const listing = {
      items: [],
      pagination: {
        page: 2,
        pageCount: 3,
        pageSize: articlesPageSize,
        total: 14,
      },
    };
    articlesListMock.mockResolvedValue(listing);

    await expect(loadArticleListing(2)).resolves.toBe(listing);
    expect(articlesListMock).toHaveBeenCalledExactlyOnceWith({
      page: 2,
      pageSize: articlesPageSize,
    });
  });

  it("returns a controlled error state when the CMS read fails", async () => {
    articlesListMock.mockRejectedValue(new Error("Articles offline"));
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(loadArticleListing(1)).resolves.toBeNull();
    expect(errorSpy).toHaveBeenCalledWith(
      "Articles listing could not be loaded: Articles offline",
    );
  });

  it("loads a detail only for a valid public slug", async () => {
    const article = { id: "article-1", slug: "everyday-faith" };
    articlesFindBySlugMock.mockResolvedValue(article);

    expect(isValidArticleSlug("everyday-faith")).toBe(true);
    await expect(loadArticleDetail("everyday-faith")).resolves.toEqual({
      article,
      status: "found",
    });
    expect(articlesFindBySlugMock).toHaveBeenCalledExactlyOnceWith(
      "everyday-faith",
    );
  });

  it.each(["", "Everyday-faith", "everyday faith", "../draft"])(
    "rejects invalid detail slug %j without calling the CMS",
    async (slug) => {
      await expect(loadArticleDetail(slug)).resolves.toEqual({
        status: "not-found",
      });
      expect(articlesFindBySlugMock).not.toHaveBeenCalled();
    },
  );

  it("returns not-found when no published article matches the slug", async () => {
    articlesFindBySlugMock.mockResolvedValue(null);

    await expect(loadArticleDetail("missing-article")).resolves.toEqual({
      status: "not-found",
    });
  });

  it("returns a controlled detail error when the CMS read fails", async () => {
    articlesFindBySlugMock.mockRejectedValue(new Error("Articles offline"));
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(loadArticleDetail("everyday-faith")).resolves.toEqual({
      status: "error",
    });
    expect(errorSpy).toHaveBeenCalledWith(
      "Articles detail could not be loaded: Articles offline",
    );
  });
});
