import { describe, expect, it } from "vitest";

import { buildSitemap } from "@/features/seo/sitemap";
import type {
  SitemapData,
  SitemapRecord,
} from "@/features/seo/sitemap-data";

const siteUrl = new URL("https://youth.example.org");

const record = (
  slug: string,
  overrides: Partial<SitemapRecord> = {},
): SitemapRecord => ({
  canonical: null,
  noIndex: false,
  publishedAt: "2026-08-20T00:00:00.000Z",
  slug,
  ...overrides,
});

const data = {
  articles: [
    { ...record("welcome"), categorySlug: "devotional" },
    {
      ...record("private-draft-preview", { noIndex: true }),
      categorySlug: "devotional",
    },
  ],
  events: [record("friday-gathering")],
  globalNoIndex: false,
  homeCanonical: null,
  resources: [
    record("external-guide", {
      canonical: "https://resources.example.net/guide",
    }),
  ],
  sermons: [
    record("hope-that-holds", {
      canonical: "https://youth.example.org/messages/hope-that-holds",
    }),
  ],
  stories: [record("finding-community")],
} satisfies SitemapData;

describe("buildSitemap", () => {
  it("includes public routes, published details, and published categories", () => {
    const sitemap = buildSitemap(data, siteUrl);
    const urls = sitemap.map((entry) => entry.url);

    expect(urls).toEqual(
      expect.arrayContaining([
        "https://youth.example.org/",
        "https://youth.example.org/about",
        "https://youth.example.org/articles",
        "https://youth.example.org/articles/category/devotional",
        "https://youth.example.org/articles/welcome",
        "https://youth.example.org/events/friday-gathering",
        "https://youth.example.org/messages/hope-that-holds",
        "https://youth.example.org/stories/finding-community",
      ]),
    );
    expect(
      sitemap.find(
        (entry) =>
          entry.url === "https://youth.example.org/articles/welcome",
      ),
    ).toMatchObject({ lastModified: "2026-08-20T00:00:00.000Z" });
  });

  it("excludes noindex, private, search, API, and external-canonical URLs", () => {
    const urls = buildSitemap(data, siteUrl).map((entry) => entry.url);
    const serializedUrls = urls.join("\n");

    expect(serializedUrls).not.toContain("private-draft-preview");
    expect(serializedUrls).not.toContain("external-guide");
    expect(serializedUrls).not.toContain("/search");
    expect(serializedUrls).not.toContain("/api/");
    expect(urls).not.toContain("https://resources.example.net/guide");
  });

  it("omits the homepage when its canonical belongs to another origin", () => {
    const sitemap = buildSitemap(
      { ...data, homeCanonical: "https://organization.example.net/youth" },
      siteUrl,
    );

    expect(sitemap.map((entry) => entry.url)).not.toContain(
      "https://youth.example.org/",
    );
  });

  it("returns no indexable URLs when the global noindex switch is enabled", () => {
    expect(buildSitemap({ ...data, globalNoIndex: true }, siteUrl)).toEqual([]);
  });
});
