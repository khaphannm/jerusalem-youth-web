import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ArticlesPage, { generateMetadata } from "@/app/articles/page";
import type { Article, MediaAsset, SiteSettings } from "@/lib/cms/domain";

const { loadArticleListingMock, loadArticleSiteSettingsMock } = vi.hoisted(
  () => ({
    loadArticleListingMock: vi.fn(),
    loadArticleSiteSettingsMock: vi.fn(),
  }),
);

vi.mock("@/features/articles/data", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/features/articles/data")>();

  return {
    ...original,
    loadArticleListing: loadArticleListingMock,
    loadArticleSiteSettings: loadArticleSiteSettingsMock,
  };
});

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
  category: {
    id: "category-1",
    name: "Devotional",
    slug: "devotional",
    description: null,
  },
  tags: [],
  bibleReferences: [],
  featured: false,
  seo: null,
  publishedAt: "2026-08-21T00:00:00.000Z",
} satisfies Article;

const secondArticle = {
  ...article,
  id: "article-2",
  title: "Serving with joy",
  slug: "serving-with-joy",
  category: {
    id: "category-2",
    name: "Community",
    slug: "community",
    description: null,
  },
  publishedAt: "2026-08-20T00:00:00.000Z",
} satisfies Article;

const siteSettings = {
  siteName: "Jerusalem Youth",
  siteDescription: "A community growing in faith.",
  defaultSeo: {
    metaTitle: null,
    metaDescription: null,
    canonical: null,
    socialImage: media,
    noIndex: false,
  },
  defaultSocialImage: null,
  organizationContact: null,
  primaryCallToAction: null,
  footerContent: null,
} satisfies SiteSettings;

const renderPage = (page?: string) =>
  ArticlesPage({ searchParams: Promise.resolve({ page }) });

describe("ArticlesPage", () => {
  beforeEach(() => {
    loadArticleListingMock.mockReset();
    loadArticleSiteSettingsMock.mockReset();
  });

  it("renders article cards with category, author, and pagination", async () => {
    loadArticleListingMock.mockResolvedValue({
      items: [article, secondArticle],
      pagination: { page: 2, pageCount: 3, pageSize: 6, total: 14 },
    });

    render(await renderPage("2"));

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Articles for everyday faith",
      }),
    ).toBeInTheDocument();
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(2);
    expect(within(cards[0]).getByText("Devotional")).toBeInTheDocument();
    expect(
      within(cards[0]).getByRole("link", { name: "Devotional" }),
    ).toHaveAttribute("href", "/articles/category/devotional");
    expect(within(cards[0]).getByText(/By Youth Team/)).toBeInTheDocument();
    expect(
      within(cards[0]).getByRole("link", {
        name: "Faith in everyday moments",
      }),
    ).toHaveAttribute("href", "/articles/faith-in-everyday-moments");

    const pagination = screen.getByRole("navigation", {
      name: "Article pages",
    });
    expect(within(pagination).getByText("Page 2 of 3")).toBeInTheDocument();
    expect(within(pagination).getByRole("link", { name: /Previous/ })).toHaveAttribute(
      "href",
      "/articles",
    );
    expect(within(pagination).getByRole("link", { name: /Next/ })).toHaveAttribute(
      "href",
      "/articles?page=3",
    );
  });

  it("renders the first-page empty state", async () => {
    loadArticleListingMock.mockResolvedValue({
      items: [],
      pagination: { page: 1, pageCount: 0, pageSize: 6, total: 0 },
    });

    render(await renderPage());

    expect(screen.getByText("New articles are coming")).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Article pages" }),
    ).not.toBeInTheDocument();
  });

  it("offers a route back from an empty later page", async () => {
    loadArticleListingMock.mockResolvedValue({
      items: [],
      pagination: { page: 9, pageCount: 2, pageSize: 6, total: 8 },
    });

    render(await renderPage("9"));

    expect(screen.getByText("No articles on this page")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View first page" })).toHaveAttribute(
      "href",
      "/articles",
    );
  });

  it("distinguishes a CMS failure from a valid empty collection", async () => {
    loadArticleListingMock.mockResolvedValue(null);

    render(await renderPage());

    expect(
      screen.getByText("Articles are temporarily unavailable"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute(
      "href",
      "/articles",
    );
  });

  it("builds unique paginated social metadata from Site Settings", async () => {
    loadArticleSiteSettingsMock.mockResolvedValue(siteSettings);

    await expect(
      generateMetadata({ searchParams: Promise.resolve({ page: "2" }) }),
    ).resolves.toMatchObject({
      description:
        "Read thoughtful articles and devotionals for following Jesus, growing in faith, and living with purpose.",
      openGraph: {
        images: [{ url: media.url }],
        siteName: "Jerusalem Youth",
        title: "Articles — Page 2 | Jerusalem Youth",
        type: "website",
      },
      title: "Articles — Page 2",
      twitter: {
        card: "summary_large_image",
        title: "Articles — Page 2 | Jerusalem Youth",
      },
    });
  });
});
