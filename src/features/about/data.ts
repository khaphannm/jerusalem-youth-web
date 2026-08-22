import "server-only";

import { getCmsClient } from "@/lib/cms";
import type { AboutPage, SiteSettings } from "@/lib/cms/domain";

export type AboutPageData = Readonly<{
  aboutPage: AboutPage | null;
  siteSettings: SiteSettings | null;
}>;

const emptyAboutPageData: AboutPageData = {
  aboutPage: null,
  siteSettings: null,
};

function logAboutDataError(source: string, error: unknown) {
  const reason = error instanceof Error ? error.message : "Unknown error.";

  console.error(`About page ${source} could not be loaded: ${reason}`);
}

function settledValue<T>(
  source: string,
  result: PromiseSettledResult<T>,
): T | null {
  if (result.status === "fulfilled") {
    return result.value;
  }

  logAboutDataError(source, result.reason);
  return null;
}

export async function loadAboutPageData(): Promise<AboutPageData> {
  try {
    const client = getCmsClient();
    const [aboutPageResult, siteSettingsResult] = await Promise.allSettled([
      client.aboutPage(),
      client.siteSettings(),
    ]);

    return {
      aboutPage: settledValue("content", aboutPageResult),
      siteSettings: settledValue("site settings", siteSettingsResult),
    };
  } catch (error) {
    logAboutDataError("CMS data", error);
    return emptyAboutPageData;
  }
}

export async function loadAboutSiteSettings(): Promise<SiteSettings | null> {
  try {
    return await getCmsClient().siteSettings();
  } catch (error) {
    logAboutDataError("metadata", error);
    return null;
  }
}
