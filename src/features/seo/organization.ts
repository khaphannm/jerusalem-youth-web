import { siteConfig } from "@/config/site";
import type { OrganizationData } from "@/features/seo/data";

export function buildOrganizationStructuredData(
  data: OrganizationData,
  siteUrl: URL,
) {
  const settings = data.siteSettings;
  const contact = settings?.organizationContact;
  const sameAs = [
    ...new Set(data.socialLinks?.links.map((link) => link.url) ?? []),
  ];

  return {
    "@context": "https://schema.org",
    "@id": `${siteUrl.origin}/#organization`,
    "@type": "Organization",
    description: settings?.siteDescription ?? siteConfig.description,
    name: settings?.siteName ?? siteConfig.name,
    url: siteUrl.origin,
    ...(contact?.address ? { address: contact.address } : {}),
    ...(contact?.email ? { email: contact.email } : {}),
    ...(contact?.phone ? { telephone: contact.phone } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}
