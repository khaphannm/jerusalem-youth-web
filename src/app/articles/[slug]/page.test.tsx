import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ArticleNotFound from "@/app/articles/[slug]/not-found";
import ArticlePage, { generateMetadata } from "@/app/articles/[slug]/page";
import {
  buildArticleStructuredData,
  serializeStructuredData,
} from "@/features/articles/structured-data";
import type { Article, MediaAsset } from "@/lib/cms/domain";

const { loadArticleDetailMock, notFoundMock } = vi.hoisted(() => ({
  loadArticleDetailMock: vi.fn(),
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
    loadArticleDetail: loadArticleDetailMock,
  };
});

const featuredImage = {
  id: "image-1",
  name: "bible-study.jpg",
  url: "https://media.example.test/bible-study.jpg",
  alternativeText: "Students reading the Bible together",
  mimeType: "image/jpeg",
  width: 1_600,
  height: 900,
  sizeInKilobytes: 210,
  variants: [],
} satisfies MediaAsset;

const avatar = {
  ...featuredImage,
  id: "avatar-1",
  name: "author.jpg",
  url: "https://media.example.test/author.jpg",
  alternativeText: "Youth Team",
  width: 400,
  height: 400,
} satisfies MediaAsset;

const article = {
  id: "article-1",
  title: "Faith in everyday moments",
  slug: "faith-in-everyday-moments",
  excerpt: "Small choices can shape a life of faith.",
  body: [
    {
      type: "paragraph",
      children: [
        { type: "text", text: "Following Jesus starts with today. " },
        {
          type: "link",
          url: "/about",
          children: [{ type: "text", text: "Learn about our community." }],
        },
      ],
    },
    {
      type: "heading",
      level: 2,
      children: [{ type: "text", text: "Practice faithful habits" }],
    },
  ],
  featuredImage,
  author: {
    id: "author-1",
    displayName: "Youth Team",
    slug: "youth-team",
    avatar,
    bio: "Leaders helping young people grow in faith.",
  },
  category: {
    id: "category-1",
    name: "Devotional",
    slug: "devotional",
    description: null,
  },
  tags: ["Faith", "Everyday life"],
  bibleReferences: ["Romans 12:2"],
  featured: true,
  seo: {
    metaTitle: "Everyday faith for young people",
    metaDescription: "Build faithful habits in ordinary moments.",
    canonical: "https://youth.example.test/articles/faith-in-everyday-moments",
    socialImage: null,
    noIndex: true,
  },
  publishedAt: "2026-08-21T00:00:00.000Z",
} satisfies Article;

const pageProps = {
  params: Promise.resolve({ slug: article.slug }),
};

describe("ArticlePage", () => {
  beforeEach(() => {
    loadArticleDetailMock.mockReset();
    notFoundMock.mockClear();
  });

  it("renders article metadata, rich content, media, author, and next action", async () => {
    loadArticleDetailMock.mockResolvedValue({ article, status: "found" });

    render(await ArticlePage(pageProps));

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Faith in everyday moments",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Devotional")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Devotional" })).toHaveAttribute(
      "href",
      "/articles/category/devotional",
    );
    expect(screen.getByText(/By Youth Team/)).toBeInTheDocument();
    expect(screen.getByText("August 21, 2026")).toBeInTheDocument();
    expect(
      screen.getByText("Following Jesus starts with today."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Practice faithful habits",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: featuredImage.alternativeText }))
      .toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Youth Team" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Romans 12:2")).toBeInTheDocument();
    expect(screen.getByText("Everyday life")).toBeInTheDocument();

    const nextSection = screen.getByRole("region", {
      name: "Explore more articles",
    });
    expect(
      within(nextSection).getByRole("link", { name: "Browse all articles" }),
    ).toHaveAttribute("href", "/articles");
  });

  it("builds article social metadata from validated SEO fields", async () => {
    loadArticleDetailMock.mockResolvedValue({ article, status: "found" });

    await expect(generateMetadata(pageProps)).resolves.toMatchObject({
      alternates: { canonical: article.seo.canonical },
      description: article.seo.metaDescription,
      openGraph: {
        images: [{ url: featuredImage.url }],
        publishedTime: article.publishedAt,
        title: article.seo.metaTitle,
        type: "article",
        url: article.seo.canonical,
      },
      robots: { follow: true, index: false },
      title: article.seo.metaTitle,
      twitter: {
        card: "summary_large_image",
        images: [featuredImage.url],
        title: article.seo.metaTitle,
      },
    });
  });

  it("emits only Article facts supplied by the CMS", async () => {
    loadArticleDetailMock.mockResolvedValue({ article, status: "found" });

    const { container } = render(await ArticlePage(pageProps));
    const script = container.querySelector('script[type="application/ld+json"]');
    const structuredData = JSON.parse(script?.textContent ?? "{}");

    expect(structuredData).toEqual(buildArticleStructuredData(article));
    expect(structuredData).not.toHaveProperty("author");
    expect(structuredData).not.toHaveProperty("publisher");
    expect(structuredData).not.toHaveProperty("dateModified");
    expect(serializeStructuredData({ headline: "</script><script>" }))
      .toBe('{"headline":"\\u003c/script>\\u003cscript>"}');
  });

  it("uses the not-found boundary for an invalid or unpublished slug", async () => {
    loadArticleDetailMock.mockResolvedValue({ status: "not-found" });

    await expect(ArticlePage(pageProps)).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledOnce();

    render(<ArticleNotFound />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Article not found" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Browse all articles" }),
    ).toHaveAttribute("href", "/articles");
  });

  it("renders a controlled retry path when the CMS is unavailable", async () => {
    loadArticleDetailMock.mockResolvedValue({ status: "error" });

    render(await ArticlePage(pageProps));

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "This article is temporarily unavailable",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Browse all articles" }),
    ).toHaveAttribute("href", "/articles");
  });

  it("prevents missing and failed detail states from being indexed", async () => {
    loadArticleDetailMock.mockResolvedValueOnce({ status: "not-found" });
    await expect(generateMetadata(pageProps)).resolves.toMatchObject({
      robots: { follow: false, index: false },
      title: "Article not found",
    });

    loadArticleDetailMock.mockResolvedValueOnce({ status: "error" });
    await expect(generateMetadata(pageProps)).resolves.toMatchObject({
      robots: { follow: false, index: false },
      title: "Article",
    });
  });
});
