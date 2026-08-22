import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  articlesPageSize,
  isValidArticleSlug,
  loadArticleCategory,
  loadArticleDetail,
  loadArticleListing,
  parseArticlePage,
} from "@/features/articles/data";

const {
  articlesFindBySlugMock,
  articlesListByCategoryMock,
  articlesListMock,
  categoriesFindBySlugMock,
} = vi.hoisted(() => ({
  articlesFindBySlugMock: vi.fn(),
  articlesListByCategoryMock: vi.fn(),
  articlesListMock: vi.fn(),
  categoriesFindBySlugMock: vi.fn(),
}));

vi.mock("@/lib/cms", () => ({
  getCmsClient: () => ({
    articles: {
      findBySlug: articlesFindBySlugMock,
      listByCategory: articlesListByCategoryMock,
      list: articlesListMock,
    },
    categories: { findBySlug: categoriesFindBySlugMock },
  }),
}));

describe("article data", () => {
  beforeEach(() => {
    articlesFindBySlugMock.mockReset();
    articlesListByCategoryMock.mockReset();
    articlesListMock.mockReset();
    categoriesFindBySlugMock.mockReset();
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

  it("loads a category and its bounded article page in parallel", async () => {
    const category = {
      id: "category-1",
      name: "Devotional",
      slug: "devotional",
      description: "Reflections for everyday faith.",
    };
    const listing = {
      items: [],
      pagination: {
        page: 2,
        pageCount: 3,
        pageSize: articlesPageSize,
        total: 14,
      },
    };
    categoriesFindBySlugMock.mockResolvedValue(category);
    articlesListByCategoryMock.mockResolvedValue(listing);

    await expect(loadArticleCategory("devotional", 2)).resolves.toEqual({
      category,
      listing,
      status: "found",
    });
    expect(categoriesFindBySlugMock).toHaveBeenCalledExactlyOnceWith(
      "devotional",
    );
    expect(articlesListByCategoryMock).toHaveBeenCalledExactlyOnceWith(
      "devotional",
      { page: 2, pageSize: articlesPageSize },
    );
  });

  it.each(["", "Devotional", "daily faith", "../private"])(
    "rejects invalid category slug %j without calling the CMS",
    async (slug) => {
      await expect(loadArticleCategory(slug, 1)).resolves.toEqual({
        status: "not-found",
      });
      expect(categoriesFindBySlugMock).not.toHaveBeenCalled();
      expect(articlesListByCategoryMock).not.toHaveBeenCalled();
    },
  );

  it("returns not-found for a missing category even if its article read fails", async () => {
    categoriesFindBySlugMock.mockResolvedValue(null);
    articlesListByCategoryMock.mockRejectedValue(new Error("Articles offline"));

    await expect(loadArticleCategory("missing", 1)).resolves.toEqual({
      status: "not-found",
    });
  });

  it("returns a controlled category error when category data fails", async () => {
    categoriesFindBySlugMock.mockRejectedValue(new Error("Categories offline"));
    articlesListByCategoryMock.mockResolvedValue({
      items: [],
      pagination: { page: 1, pageCount: 0, pageSize: 6, total: 0 },
    });
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(loadArticleCategory("devotional", 1)).resolves.toEqual({
      status: "error",
    });
    expect(errorSpy).toHaveBeenCalledWith(
      "Articles category could not be loaded: Categories offline",
    );
  });
});
