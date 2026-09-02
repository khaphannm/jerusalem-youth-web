import "server-only";

import { getCmsClient } from "@/lib/cms";
import type { CollectionResult, Resource, SiteSettings } from "@/lib/cms/domain";
import { parsePageParameter } from "@/lib/pagination";

export const resourcesPageSize = 9;

export type ResourceListingData = CollectionResult<Resource> | null;
export type ResourceDetailData =
  | Readonly<{ resource: Resource; status: "found" }>
  | Readonly<{ status: "not-found" }>
  | Readonly<{ status: "error" }>;

const resourceSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function logResourceDataError(source: string, error: unknown) {
  const reason = error instanceof Error ? error.message : "Unknown error.";

  console.error(`Resources ${source} could not be loaded: ${reason}`);
}

export const parseResourcePage = parsePageParameter;
export const isValidResourceSlug = (slug: string) =>
  resourceSlugPattern.test(slug);

export async function loadResourceListing(
  page: number,
): Promise<ResourceListingData> {
  try {
    return await getCmsClient().resources.list({
      page,
      pageSize: resourcesPageSize,
    });
  } catch (error) {
    logResourceDataError("listing", error);
    return null;
  }
}

export async function loadResourceSiteSettings(): Promise<SiteSettings | null> {
  try {
    return await getCmsClient().siteSettings();
  } catch (error) {
    logResourceDataError("metadata", error);
    return null;
  }
}

export async function loadResourceDetail(
  slug: string,
): Promise<ResourceDetailData> {
  if (!isValidResourceSlug(slug)) {
    return { status: "not-found" };
  }

  try {
    const resource = await getCmsClient().resources.findBySlug(slug);

    return resource
      ? { resource, status: "found" }
      : { status: "not-found" };
  } catch (error) {
    logResourceDataError("detail", error);
    return { status: "error" };
  }
}
