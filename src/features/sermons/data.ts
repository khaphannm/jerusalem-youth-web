import "server-only";

import { getCmsClient } from "@/lib/cms";
import type { CollectionResult, Sermon, SiteSettings } from "@/lib/cms/domain";
import { parsePageParameter } from "@/lib/pagination";

export const sermonsPageSize = 6;

export type SermonListingData = CollectionResult<Sermon> | null;

export type SermonDetailData =
  | Readonly<{ sermon: Sermon; status: "found" }>
  | Readonly<{ status: "not-found" }>
  | Readonly<{ status: "error" }>;

function logSermonDataError(source: string, error: unknown) {
  const reason = error instanceof Error ? error.message : "Unknown error.";

  console.error(`Sermons ${source} could not be loaded: ${reason}`);
}

export const parseSermonPage = parsePageParameter;

export async function loadSermonListing(
  page: number,
): Promise<SermonListingData> {
  try {
    return await getCmsClient().sermons.list({
      page,
      pageSize: sermonsPageSize,
    });
  } catch (error) {
    logSermonDataError("listing", error);
    return null;
  }
}

export async function loadSermonSiteSettings(): Promise<SiteSettings | null> {
  try {
    return await getCmsClient().siteSettings();
  } catch (error) {
    logSermonDataError("metadata", error);
    return null;
  }
}

export const isValidSermonSlug = (slug: string) =>
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

export async function loadSermonDetail(
  slug: string,
): Promise<SermonDetailData> {
  if (!isValidSermonSlug(slug)) {
    return { status: "not-found" };
  }

  try {
    const sermon = await getCmsClient().sermons.findBySlug(slug);

    return sermon
      ? { sermon, status: "found" }
      : { status: "not-found" };
  } catch (error) {
    logSermonDataError("detail", error);
    return { status: "error" };
  }
}
