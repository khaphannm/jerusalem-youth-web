import "server-only";

import { getCmsClient } from "@/lib/cms";
import type { CollectionResult, SiteSettings, Story } from "@/lib/cms/domain";
import { parsePageParameter } from "@/lib/pagination";

export const storiesPageSize = 6;

export type StoryListingData = CollectionResult<Story> | null;
export type StoryDetailData =
  | Readonly<{ status: "error" }>
  | Readonly<{ status: "found"; story: Story }>
  | Readonly<{ status: "not-found" }>;

const storySlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function logStoryDataError(source: string, error: unknown) {
  const reason = error instanceof Error ? error.message : "Unknown error.";

  console.error(`Stories ${source} could not be loaded: ${reason}`);
}

export const parseStoryPage = parsePageParameter;

export const isValidStorySlug = (slug: string) => storySlugPattern.test(slug);

export async function loadStoryDetail(slug: string): Promise<StoryDetailData> {
  if (!isValidStorySlug(slug)) {
    return { status: "not-found" };
  }

  try {
    const story = await getCmsClient().stories.findBySlug(slug);

    return story ? { status: "found", story } : { status: "not-found" };
  } catch (error) {
    logStoryDataError("detail", error);
    return { status: "error" };
  }
}

export async function loadStoryListing(
  page: number,
): Promise<StoryListingData> {
  try {
    return await getCmsClient().stories.list({
      page,
      pageSize: storiesPageSize,
    });
  } catch (error) {
    logStoryDataError("listing", error);
    return null;
  }
}

export async function loadStorySiteSettings(): Promise<SiteSettings | null> {
  try {
    return await getCmsClient().siteSettings();
  } catch (error) {
    logStoryDataError("metadata", error);
    return null;
  }
}
