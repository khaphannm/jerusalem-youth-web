import type { MetadataRoute } from "next";

import type {
  SitemapArticleRecord,
  SitemapData,
  SitemapRecord,
} from "@/features/seo/sitemap-data";

const staticPaths = [
  "/about",
  "/articles",
  "/contact",
  "/events",
  "/join",
  "/media",
  "/resources",
  "/sermons",
  "/stories",
] as const;

function canonicalUrl(
  siteUrl: URL,
  fallbackPath: string,
  canonical: string | null,
) {
  if (!canonical) {
    return new URL(fallbackPath, siteUrl);
  }

  const url = new URL(canonical);
  return url.origin === siteUrl.origin ? url : null;
}

function detailEntry(
  siteUrl: URL,
  basePath: string,
  record: SitemapRecord,
): MetadataRoute.Sitemap[number] | null {
  if (record.noIndex) {
    return null;
  }

  const url = canonicalUrl(
    siteUrl,
    `${basePath}/${encodeURIComponent(record.slug)}`,
    record.canonical,
  );

  return url
    ? {
        lastModified: record.publishedAt,
        url: url.href,
      }
    : null;
}

function categoryEntries(
  siteUrl: URL,
  articles: readonly SitemapArticleRecord[],
): MetadataRoute.Sitemap {
  const latestPublicationByCategory = new Map<string, string>();

  for (const article of articles) {
    const current = latestPublicationByCategory.get(article.categorySlug);

    if (!current || Date.parse(article.publishedAt) > Date.parse(current)) {
      latestPublicationByCategory.set(article.categorySlug, article.publishedAt);
    }
  }

  return [...latestPublicationByCategory].map(([slug, publishedAt]) => ({
    lastModified: publishedAt,
    url: new URL(
      `/articles/category/${encodeURIComponent(slug)}`,
      siteUrl,
    ).href,
  }));
}

function addUniqueEntry(
  entries: Map<string, MetadataRoute.Sitemap[number]>,
  entry: MetadataRoute.Sitemap[number] | null,
) {
  if (entry && !entries.has(entry.url)) {
    entries.set(entry.url, entry);
  }
}

export function buildSitemap(
  data: SitemapData,
  siteUrl: URL,
): MetadataRoute.Sitemap {
  if (data.globalNoIndex) {
    return [];
  }

  const entries = new Map<string, MetadataRoute.Sitemap[number]>();
  const homeUrl = canonicalUrl(siteUrl, "/", data.homeCanonical);

  addUniqueEntry(entries, homeUrl ? { url: homeUrl.href } : null);

  for (const path of staticPaths) {
    addUniqueEntry(entries, { url: new URL(path, siteUrl).href });
  }

  for (const entry of categoryEntries(siteUrl, data.articles)) {
    addUniqueEntry(entries, entry);
  }

  const collections = [
    ["/articles", data.articles],
    ["/events", data.events],
    ["/resources", data.resources],
    ["/sermons", data.sermons],
    ["/stories", data.stories],
  ] as const;

  for (const [basePath, records] of collections) {
    for (const record of records) {
      addUniqueEntry(entries, detailEntry(siteUrl, basePath, record));
    }
  }

  return [...entries.values()];
}
