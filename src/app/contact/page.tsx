import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { SafeLink } from "@/components/ui/safe-link";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";
import {
  loadContactPageData,
  loadContactSiteSettings,
} from "@/features/contact/data";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadContactSiteSettings();
  const siteName = settings?.siteName ?? siteConfig.name;
  const title = `Contact ${siteName}`;
  const description = `Find the official email, phone, address, and community channels for ${siteName}.`;
  const socialImage =
    settings?.defaultSeo?.socialImage ?? settings?.defaultSocialImage;
  const image = socialImage
    ? {
        alt: socialImage.alternativeText ?? title,
        height: socialImage.height ?? undefined,
        url: socialImage.url,
        width: socialImage.width ?? undefined,
      }
    : undefined;

  return {
    alternates: { canonical: "/contact" },
    description,
    openGraph: {
      description,
      images: image ? [image] : undefined,
      siteName,
      title,
      type: "website",
      url: "/contact",
    },
    robots: settings?.defaultSeo?.noIndex
      ? { follow: true, index: false }
      : undefined,
    title: "Contact",
    twitter: {
      card: image ? "summary_large_image" : "summary",
      description,
      images: image ? [image.url] : undefined,
      title,
    },
  };
}

const contactLinkClasses =
  "mt-4 inline-flex min-h-11 max-w-full items-center break-all rounded-small py-2 font-label text-body-large font-bold text-primary transition-colors duration-fast ease-standard hover:text-secondary motion-reduce:transition-none";

export default async function ContactPage() {
  const { siteSettings, socialLinks } = await loadContactPageData();
  const siteName = siteSettings?.siteName ?? siteConfig.name;
  const contact = siteSettings?.organizationContact;
  const hasContact = Boolean(
    contact?.email || contact?.phone || contact?.address,
  );
  const communityLinks = socialLinks?.links ?? [];

  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="contact-title" tone="secondary">
        <Container size="wide">
          <div className="max-w-reading">
            <p className="font-label text-label font-bold uppercase text-calm">
              Official contact
            </p>
            <h1
              className="mt-5 text-balance font-display text-display font-extrabold"
              id="contact-title"
            >
              Contact {siteName}
            </h1>
            <p className="mt-6 text-pretty text-body-large text-secondary-foreground">
              Use the organization-level channels published below. We do not
              list private staff details or collect messages on this page.
            </p>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="contact-channels-title" tone="white">
        <Container size="wide">
          <SectionHeading
            description="Choose the channel that best fits your question. Email and phone links open the app already configured on your device."
            eyebrow="Get in touch"
            id="contact-channels-title"
            tone="white"
            title="Official contact channels"
          />

          <div className="mt-10">
            {hasContact ? (
              <address className="not-italic">
                <ul className="grid gap-6 md:grid-cols-3">
                  {contact?.email ? (
                    <li className="rounded-medium border border-border bg-surface p-6 sm:p-8">
                      <h3 className="font-heading text-heading-3 font-bold">
                        Email
                      </h3>
                      <p className="mt-3 text-muted">
                        Send a message through your email provider.
                      </p>
                      <SafeLink
                        aria-label={`Email ${siteName} at ${contact.email}`}
                        className={contactLinkClasses}
                        href={`mailto:${contact.email}`}
                      >
                        {contact.email}
                      </SafeLink>
                    </li>
                  ) : null}

                  {contact?.phone ? (
                    <li className="rounded-medium border border-border bg-surface p-6 sm:p-8">
                      <h3 className="font-heading text-heading-3 font-bold">
                        Phone
                      </h3>
                      <p className="mt-3 text-muted">
                        Call using your device&apos;s phone app.
                      </p>
                      <SafeLink
                        aria-label={`Call ${siteName} at ${contact.phone}`}
                        className={contactLinkClasses}
                        href={`tel:${contact.phone}`}
                      >
                        {contact.phone}
                      </SafeLink>
                    </li>
                  ) : null}

                  {contact?.address ? (
                    <li className="rounded-medium border border-border bg-surface p-6 sm:p-8">
                      <h3 className="font-heading text-heading-3 font-bold">
                        Address
                      </h3>
                      <p className="mt-3 text-muted">
                        Our published organization address.
                      </p>
                      <p className="mt-4 whitespace-pre-line text-body-large font-bold">
                        {contact.address}
                      </p>
                    </li>
                  ) : null}
                </ul>
              </address>
            ) : (
              <EmptyState
                action={<LinkButton href="/join">Explore ways to join</LinkButton>}
                description="Our official direct contact details are being updated. You can still find a clear next step on the Join Us page."
                title="Contact details are being updated"
              />
            )}
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="contact-community-title" tone="calm">
        <Container size="reading">
          <SectionHeading
            description="These links come from our approved public channel list. No external form is required to view them."
            eyebrow="Community channels"
            id="contact-community-title"
            tone="calm"
            title="Connect through an official channel"
          />

          {communityLinks.length > 0 ? (
            <nav aria-labelledby="contact-community-title" className="mt-8">
              <ul className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
                {communityLinks.map((item, index) => (
                  <li key={`${item.platform}-${item.url}-${index}`}>
                    <LinkButton href={item.url} variant="outline">
                      Visit {item.platform}
                    </LinkButton>
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <p className="mt-8 text-calm-foreground">
              Our public community links are being updated. Please use an
              official contact channel above or visit the Join Us page.
            </p>
          )}
        </Container>
      </Section>
    </main>
  );
}
