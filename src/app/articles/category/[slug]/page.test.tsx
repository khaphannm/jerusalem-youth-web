import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ArticleCategoryNotFound from "@/app/articles/category/[slug]/not-found";
import ArticleCategoryPage, {
  generateMetadata,
} from "@/app/articles/category/[slug]/page";
import type { Article, Category, MediaAsset } from "@/lib/cms/domain";

const { loadArticleCategoryMock, notFoundMock } = vi.hoisted(() => ({
  loadArticleCategoryMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("@/features/articles/data", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/features/articles/data")>();

  return {
    ...original,
    loadArticleCategory: loadArticleCategoryMock,
  };
});

const category = {
  id: "category-1",
  name: "Devotional",
  slug: "devotional",
  description: "Reflections for following Jesus in everyday life.",
} satisfies Category;

const media = {
  id: "image-1",
  name: "journal.jpg",
  url: "https://media.example.test/journal.jpg",
  alternativeText: "An open journal beside a Bible",
  mimeType: "image/jpeg",
  width: 1_600,
  height: 900,
  sizeInKilobytes: 180,
  variants: [],
} satisfies MediaAsset;

const article = {
  id: "article-1",
  title: "Faith in everyday moments",
  slug: "faith-in-everyday-moments",
  excerpt: "Small choices can shape a life of faith.",
  body: [
    {
      type: "paragraph",
      children: [{ type: "text", text: "Article body" }],
    },
  ],
  featuredImage: media,
  author: {
    id: "author-1",
    displayName: "Youth Team",
    slug: "youth-team",
    avatar: null,
    bio: null,
  },
  category,
  tags: [],
  bibleReferences: [],
  featured: false,
  seo: null,
  publishedAt: "2026-08-21T00:00:00.000Z",
} satisfies Article;

const pageProps = (page?: string) => ({
  params: Promise.resolve({ slug: category.slug }),
  searchParams: Promise.resolve({ page }),
});

describe("ArticleCategoryPage", () => {
  beforeEach(() => {
    loadArticleCategoryMock.mockReset();
    notFoundMock.mockClear();
  });

  it("renders only the category listing with category pagination", async () => {
    loadArticleCategoryMock.mockResolvedValue({
      category,
      listing: {
        items: [article],
        pagination: { page: 2, pageCount: 3, pageSize: 6, total: 13 },
      },
      status: "found",
    });

    render(await ArticleCategoryPage(pageProps("2")));

    expect(
      screen.getByRole("heading", { level: 1, name: "Devotional articles" }),
    ).toBeInTheDocument();
    expect(screen.getByText(category.description)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Latest in Devotional" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(
      screen.getByRole("link", { name: article.title }),
    ).toHaveAttribute("href", `/articles/${article.slug}`);

    const pagination = screen.getByRole("navigation", {
      name: "Article pages",
    });
    expect(within(pagination).getByText("Page 2 of 3")).toBeInTheDocument();
    expect(
      within(pagination).getByRole("link", { name: /Previous/ }),
    ).toHaveAttribute("href", "/articles/category/devotional");
    expect(
      within(pagination).getByRole("link", { name: /Next/ }),
    ).toHaveAttribute("href", "/articles/category/devotional?page=3");
    expect(loadArticleCategoryMock).toHaveBeenCalledExactlyOnceWith(
      "devotional",
      2,
    );
  });

  it("renders a valid empty state for an existing category", async () => {
    loadArticleCategoryMock.mockResolvedValue({
      category,
      listing: {
        items: [],
        pagination: { page: 1, pageCount: 0, pageSize: 6, total: 0 },
      },
      status: "found",
    });

    render(await ArticleCategoryPage(pageProps()));

    expect(screen.getByText("No published articles yet")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Browse all articles" }),
    ).toHaveAttribute("href", "/articles");
  });

  it("offers the first category page when a later page is empty", async () => {
    loadArticleCategoryMock.mockResolvedValue({
      category,
      listing: {
        items: [],
        pagination: { page: 9, pageCount: 2, pageSize: 6, total: 10 },
      },
      status: "found",
    });

    render(await ArticleCategoryPage(pageProps("9")));

    expect(screen.getByText("No articles on this page")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View first page" }),
    ).toHaveAttribute("href", "/articles/category/devotional");
  });

  it("derives paginated social metadata from category content", async () => {
    loadArticleCategoryMock.mockResolvedValue({
      category,
      listing: {
        items: [article],
        pagination: { page: 2, pageCount: 3, pageSize: 6, total: 13 },
      },
      status: "found",
    });

    await expect(generateMetadata(pageProps("2"))).resolves.toMatchObject({
      description: category.description,
      openGraph: {
        description: category.description,
        images: [{ url: media.url }],
        title: "Devotional articles — Page 2 | Youth Ministry",
        type: "website",
      },
      title: "Devotional articles — Page 2",
      twitter: {
        card: "summary_large_image",
        images: [media.url],
        title: "Devotional articles — Page 2 | Youth Ministry",
      },
    });
  });

  it("uses the not-found boundary for an invalid or missing category", async () => {
    loadArticleCategoryMock.mockResolvedValue({ status: "not-found" });

    await expect(ArticleCategoryPage(pageProps())).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(notFoundMock).toHaveBeenCalledOnce();

    render(<ArticleCategoryNotFound />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Article category not found",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Browse all articles" }),
    ).toHaveAttribute("href", "/articles");
  });

  it("renders a controlled retry path when category data is unavailable", async () => {
    loadArticleCategoryMock.mockResolvedValue({ status: "error" });

    render(await ArticleCategoryPage(pageProps()));

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "This category is temporarily unavailable",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute(
      "href",
      "/articles/category/devotional",
    );
  });

  it("prevents missing and failed category states from being indexed", async () => {
    loadArticleCategoryMock.mockResolvedValueOnce({ status: "not-found" });
    await expect(generateMetadata(pageProps())).resolves.toMatchObject({
      robots: { follow: false, index: false },
      title: "Article category not found",
    });

    loadArticleCategoryMock.mockResolvedValueOnce({ status: "error" });
    await expect(generateMetadata(pageProps())).resolves.toMatchObject({
      robots: { follow: false, index: false },
      title: "Article category",
    });
  });
});
