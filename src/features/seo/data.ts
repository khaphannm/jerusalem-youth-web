import "server-only";

import { getCmsClient } from "@/lib/cms";
import type { SiteSettings, SocialLinks } from "@/lib/cms/domain";

export type OrganizationData = Readonly<{
  siteSettings: SiteSettings | null;
  socialLinks: SocialLinks | null;
}>;

export async function loadGlobalSiteSettings(): Promise<SiteSettings | null> {
  try {
    return await getCmsClient().siteSettings();
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error.";

    console.error(`Global metadata site settings could not be loaded: ${reason}`);
    return null;
  }
}

function organizationValue<T>(
  source: string,
  result: PromiseSettledResult<T>,
): T | null {
  if (result.status === "fulfilled") {
    return result.value;
  }

  const reason =
    result.reason instanceof Error ? result.reason.message : "Unknown error.";

  console.error(`Organization ${source} could not be loaded: ${reason}`);
  return null;
}

export async function loadOrganizationData(): Promise<OrganizationData> {
  try {
    const client = getCmsClient();
    const [siteSettingsResult, socialLinksResult] = await Promise.allSettled([
      client.siteSettings(),
      client.socialLinks(),
    ]);

    return {
      siteSettings: organizationValue("site settings", siteSettingsResult),
      socialLinks: organizationValue("social links", socialLinksResult),
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown error.";

    console.error(`Organization CMS data could not be loaded: ${reason}`);
    return { siteSettings: null, socialLinks: null };
  }
}
