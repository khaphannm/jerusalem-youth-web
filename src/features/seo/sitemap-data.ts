import "server-only";

import { getCmsClient } from "@/lib/cms";
import type {
  Article,
  CollectionOptions,
  CollectionResult,
  SiteSettings,
} from "@/lib/cms/domain";

const sitemapPageSize = 100;

export type SitemapRecord = Readonly<{
  canonical: string | null;
  noIndex: boolean;
  publishedAt: string;
  slug: string;
}>;

export type SitemapArticleRecord = SitemapRecord &
  Readonly<{ categorySlug: string }>;

export type SitemapData = Readonly<{
  articles: readonly SitemapArticleRecord[];
  events: readonly SitemapRecord[];
  globalNoIndex: boolean;
  homeCanonical: string | null;
  resources: readonly SitemapRecord[];
  sermons: readonly SitemapRecord[];
  stories: readonly SitemapRecord[];
}>;

type CollectionReader<T> = Readonly<{
  list: (options?: CollectionOptions) => Promise<CollectionResult<T>>;
}>;

type SitemapSource = Pick<Article, "publishedAt" | "seo" | "slug">;

async function loadAllPages<T>(reader: CollectionReader<T>) {
  const firstPage = await reader.list({ page: 1, pageSize: sitemapPageSize });
  const remainingPages = await Promise.all(
    Array.from(
      { length: Math.max(firstPage.pagination.pageCount - 1, 0) },
      (_, index) =>
        reader.list({ page: index + 2, pageSize: sitemapPageSize }),
    ),
  );

  return [
    ...firstPage.items,
    ...remainingPages.flatMap((page) => page.items),
  ];
}

function toSitemapRecord(item: SitemapSource): SitemapRecord {
  return {
    canonical: item.seo?.canonical ?? null,
    noIndex: item.seo?.noIndex ?? false,
    publishedAt: item.publishedAt,
    slug: item.slug,
  };
}

function toArticleSitemapRecord(article: Article): SitemapArticleRecord {
  return {
    ...toSitemapRecord(article),
    categorySlug: article.category.slug,
  };
}

function logSitemapError(source: string, error: unknown) {
  const reason = error instanceof Error ? error.message : "Unknown error.";

  console.error(`Sitemap ${source} could not be loaded: ${reason}`);
}

function settledValue<T>(
  source: string,
  result: PromiseSettledResult<T>,
  fallback: T,
) {
  if (result.status === "fulfilled") {
    return result.value;
  }

  logSitemapError(source, result.reason);
  return fallback;
}

export async function loadSitemapData(): Promise<SitemapData> {
  const client = getCmsClient();
  const [
    settingsResult,
    articlesResult,
    eventsResult,
    resourcesResult,
    sermonsResult,
    storiesResult,
  ] = await Promise.allSettled([
    client.siteSettings(),
    loadAllPages(client.articles),
    loadAllPages(client.events),
    loadAllPages(client.resources),
    loadAllPages(client.sermons),
    loadAllPages(client.stories),
  ]);
  const settings = settledValue<SiteSettings | null>(
    "site settings",
    settingsResult,
    null,
  );

  return {
    articles: settledValue("articles", articlesResult, []).map(
      toArticleSitemapRecord,
    ),
    events: settledValue("events", eventsResult, []).map(toSitemapRecord),
    globalNoIndex: settings?.defaultSeo?.noIndex ?? false,
    homeCanonical: settings?.defaultSeo?.canonical ?? null,
    resources: settledValue("resources", resourcesResult, []).map(
      toSitemapRecord,
    ),
    sermons: settledValue("sermons", sermonsResult, []).map(toSitemapRecord),
    stories: settledValue("stories", storiesResult, []).map(toSitemapRecord),
  };
}
