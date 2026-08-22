import "server-only";

import { getCmsClient } from "@/lib/cms";
import type {
  Article,
  CollectionResult,
  SiteSettings,
} from "@/lib/cms/domain";

export const articlesPageSize = 6;

export type ArticleListingData = CollectionResult<Article> | null;

export type ArticleDetailData =
  | Readonly<{ article: Article; status: "found" }>
  | Readonly<{ status: "not-found" }>
  | Readonly<{ status: "error" }>;

function logArticleDataError(source: string, error: unknown) {
  const reason = error instanceof Error ? error.message : "Unknown error.";

  console.error(`Articles ${source} could not be loaded: ${reason}`);
}

export function parseArticlePage(
  value: string | readonly string[] | undefined,
) {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (!candidate || !/^[1-9]\d*$/.test(candidate)) {
    return 1;
  }

  const page = Number(candidate);
  return Number.isSafeInteger(page) ? page : 1;
}

export async function loadArticleListing(
  page: number,
): Promise<ArticleListingData> {
  try {
    return await getCmsClient().articles.list({
      page,
      pageSize: articlesPageSize,
    });
  } catch (error) {
    logArticleDataError("listing", error);
    return null;
  }
}

export async function loadArticleSiteSettings(): Promise<SiteSettings | null> {
  try {
    return await getCmsClient().siteSettings();
  } catch (error) {
    logArticleDataError("metadata", error);
    return null;
  }
}

export const isValidArticleSlug = (slug: string) =>
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

export async function loadArticleDetail(
  slug: string,
): Promise<ArticleDetailData> {
  if (!isValidArticleSlug(slug)) {
    return { status: "not-found" };
  }

  try {
    const article = await getCmsClient().articles.findBySlug(slug);

    return article
      ? { article, status: "found" }
      : { status: "not-found" };
  } catch (error) {
    logArticleDataError("detail", error);
    return { status: "error" };
  }
}
