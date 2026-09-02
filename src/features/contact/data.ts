import "server-only";

import { getCmsClient } from "@/lib/cms";
import type { SiteSettings, SocialLinks } from "@/lib/cms/domain";

export type ContactPageData = Readonly<{
  siteSettings: SiteSettings | null;
  socialLinks: SocialLinks | null;
}>;

const emptyContactPageData: ContactPageData = {
  siteSettings: null,
  socialLinks: null,
};

function logContactDataError(source: string, error: unknown) {
  const reason = error instanceof Error ? error.message : "Unknown error.";

  console.error(`Contact page ${source} could not be loaded: ${reason}`);
}

function settledValue<T>(
  source: string,
  result: PromiseSettledResult<T>,
): T | null {
  if (result.status === "fulfilled") {
    return result.value;
  }

  logContactDataError(source, result.reason);
  return null;
}

export async function loadContactPageData(): Promise<ContactPageData> {
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
    logContactDataError("CMS data", error);
    return emptyContactPageData;
  }
}

export async function loadContactSiteSettings(): Promise<SiteSettings | null> {
  try {
    return await getCmsClient().siteSettings();
  } catch (error) {
    logContactDataError("metadata", error);
    return null;
  }
}
