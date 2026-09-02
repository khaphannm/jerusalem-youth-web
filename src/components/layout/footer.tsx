import Link from "next/link";

import { NavigationLink } from "@/components/layout/navigation-link";
import { Container } from "@/components/ui/container";
import { SafeLink } from "@/components/ui/safe-link";
import { siteConfig } from "@/config/site";
import { getCmsClient } from "@/lib/cms";
import type {
  Navigation,
  SiteSettings,
  SocialLinks,
} from "@/lib/cms/domain";

type FooterData = Readonly<{
  navigation: Navigation | null;
  siteSettings: SiteSettings | null;
  socialLinks: SocialLinks | null;
}>;

const emptyFooterData: FooterData = {
  navigation: null,
  siteSettings: null,
  socialLinks: null,
};

function logFooterDataError(source: string, error: unknown) {
  const reason = error instanceof Error ? error.message : "Unknown error.";

  console.error(`Footer ${source} could not be loaded: ${reason}`);
}

function settledValue<T>(
  source: string,
  result: PromiseSettledResult<T>,
): T | null {
  if (result.status === "fulfilled") {
    return result.value;
  }

  logFooterDataError(source, result.reason);
  return null;
}

async function loadFooterData(): Promise<FooterData> {
  try {
    const client = getCmsClient();
    const [navigationResult, siteSettingsResult, socialLinksResult] =
      await Promise.allSettled([
        client.navigation(),
        client.siteSettings(),
        client.socialLinks(),
      ]);

    return {
      navigation: settledValue("navigation", navigationResult),
      siteSettings: settledValue("site settings", siteSettingsResult),
      socialLinks: settledValue("social links", socialLinksResult),
    };
  } catch (error) {
    logFooterDataError("CMS data", error);
    return emptyFooterData;
  }
}

const sectionHeadingClasses =
  "font-label text-label font-semibold uppercase text-primary-foreground/70";

const footerLinkClasses =
  "inline-flex min-h-11 max-w-full items-center break-words rounded-small py-2 font-label text-label font-semibold text-primary-foreground transition-colors duration-fast ease-standard hover:text-calm motion-reduce:transition-none";

export async function Footer() {
  const { navigation, siteSettings, socialLinks } = await loadFooterData();
  const siteName = siteSettings?.siteName ?? siteConfig.name;
  const siteDescription =
    siteSettings?.siteDescription ?? siteConfig.description;
  const footerItems = navigation?.footerItems ?? [];
  const contact = siteSettings?.organizationContact;
  const hasContact = Boolean(
    contact?.email || contact?.phone || contact?.address,
  );
  const socialItems = socialLinks?.links ?? [];
  const year = new Date().getUTCFullYear();

  return (
    <footer className="bg-foreground text-primary-foreground">
      <Container size="wide">
        <div className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4 lg:py-16">
          <div className="min-w-0">
            <Link
              className="inline-flex min-h-11 items-center rounded-small font-heading text-heading-3 font-bold tracking-tight transition-colors duration-fast ease-standard hover:text-calm motion-reduce:transition-none"
              href="/"
            >
              {siteName}
            </Link>
            <p className="mt-4 max-w-reading text-body-small text-primary-foreground/70">
              {siteDescription}
            </p>
          </div>

          {footerItems.length > 0 ? (
            <nav
              aria-labelledby="footer-navigation-heading"
              className="min-w-0"
            >
              <h2
                className={sectionHeadingClasses}
                id="footer-navigation-heading"
              >
                Explore
              </h2>
              <ul className="mt-4 grid grid-cols-2 gap-x-3">
                {footerItems.map((item, index) => (
                  <li key={`${item.label}-${item.url}-${index}`}>
                    <NavigationLink item={item} tone="inverse" />
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {hasContact ? (
            <section
              aria-labelledby="footer-contact-heading"
              className="min-w-0"
            >
              <h2 className={sectionHeadingClasses} id="footer-contact-heading">
                Contact
              </h2>
              <address className="mt-4 flex flex-col items-start not-italic text-body-small text-primary-foreground/70">
                {contact?.email ? (
                  <SafeLink
                    className={footerLinkClasses}
                    href={`mailto:${contact.email}`}
                  >
                    {contact.email}
                  </SafeLink>
                ) : null}
                {contact?.phone ? (
                  <SafeLink
                    className={footerLinkClasses}
                    href={`tel:${contact.phone}`}
                  >
                    {contact.phone}
                  </SafeLink>
                ) : null}
                {contact?.address ? (
                  <p className="whitespace-pre-line py-2">{contact.address}</p>
                ) : null}
              </address>
            </section>
          ) : null}

          {socialItems.length > 0 ? (
            <nav
              aria-labelledby="footer-social-heading"
              className="min-w-0"
            >
              <h2 className={sectionHeadingClasses} id="footer-social-heading">
                Follow
              </h2>
              <ul className="mt-4">
                {socialItems.map((item, index) => (
                  <li key={`${item.platform}-${item.url}-${index}`}>
                    <SafeLink className={footerLinkClasses} href={item.url}>
                      {item.platform}
                    </SafeLink>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>

        <div className="border-t border-primary-foreground/20 py-6">
          <p className="text-body-small text-primary-foreground/70">
            © {year} {siteName}.
          </p>
        </div>
      </Container>
    </footer>
  );
}
