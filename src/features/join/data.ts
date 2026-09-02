import "server-only";

import { getCmsClient } from "@/lib/cms";
import type { SiteSettings, SocialLinks } from "@/lib/cms/domain";

export type JoinPageData = Readonly<{
  siteSettings: SiteSettings | null;
  socialLinks: SocialLinks | null;
}>;

const emptyJoinPageData: JoinPageData = {
  siteSettings: null,
  socialLinks: null,
};

function logJoinDataError(source: string, error: unknown) {
  const reason = error instanceof Error ? error.message : "Unknown error.";

  console.error(`Join page ${source} could not be loaded: ${reason}`);
}

function settledValue<T>(
  source: string,
  result: PromiseSettledResult<T>,
): T | null {
  if (result.status === "fulfilled") {
    return result.value;
  }

  logJoinDataError(source, result.reason);
  return null;
}

export async function loadJoinPageData(): Promise<JoinPageData> {
  try {
    const client = getCmsClient();
    const [siteSettingsResult, socialLinksResult] = await Promise.allSettled([
      client.siteSettings(),
      client.socialLinks(),
    ]);

    return {
      siteSettings: settledValue("site settings", siteSettingsResult),
      socialLinks: settledValue("social links", socialLinksResult),
    };
  } catch (error) {
    logJoinDataError("CMS data", error);
    return emptyJoinPageData;
  }
}

export async function loadJoinSiteSettings(): Promise<SiteSettings | null> {
  try {
    return await getCmsClient().siteSettings();
  } catch (error) {
    logJoinDataError("metadata", error);
    return null;
  }
}
