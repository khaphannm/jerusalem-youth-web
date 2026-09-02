import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";
import {
  loadAboutPageData,
  loadAboutSiteSettings,
} from "@/features/about/data";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadAboutSiteSettings();
  const siteName = settings?.siteName ?? siteConfig.name;
  const siteDescription =
    settings?.siteDescription ?? siteConfig.description;
  const description = `Learn about ${siteName}, our vision, mission, and values. ${siteDescription}`;
  const socialImage =
    settings?.defaultSeo?.socialImage ?? settings?.defaultSocialImage;
  const image = socialImage
    ? {
        alt: socialImage.alternativeText ?? siteName,
        height: socialImage.height ?? undefined,
        url: socialImage.url,
        width: socialImage.width ?? undefined,
      }
    : undefined;

  return {
    alternates: { canonical: "/about" },
    description,
    openGraph: {
      description,
      images: image ? [image] : undefined,
      siteName,
      title: `About ${siteName}`,
      type: "website",
      url: "/about",
    },
    robots: settings?.defaultSeo?.noIndex
      ? { follow: true, index: false }
      : undefined,
    title: "About",
    twitter: {
      card: image ? "summary_large_image" : "summary",
      description,
      images: image ? [image.url] : undefined,
      title: `About ${siteName}`,
    },
  };
}

export default async function AboutPage() {
  const { aboutPage, siteSettings } = await loadAboutPageData();
  const siteName = siteSettings?.siteName ?? siteConfig.name;
  const siteDescription =
    siteSettings?.siteDescription ?? siteConfig.description;
  const callToAction =
    aboutPage?.callToAction ??
    siteSettings?.primaryCallToAction ??
    { label: "Join us", url: "/join" };

  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="about-title">
        <Container size="wide">
          <div className="max-w-reading">
            <p className="font-label text-label font-bold uppercase text-primary">
              About us
            </p>
            <h1
              className="mt-5 text-balance font-display text-display font-extrabold"
              id="about-title"
            >
              About {siteName}
            </h1>
            <p className="mt-6 text-pretty text-body-large text-muted">
              {siteDescription}
            </p>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="purpose-title" tone="secondary">
        <Container size="wide">
          <SectionHeading
            description="Our vision names where we are headed. Our mission describes how we move toward it together."
            eyebrow="Our purpose"
            id="purpose-title"
            tone="secondary"
            title="Why we gather"
          />

          <div className="mt-10">
            {aboutPage ? (
              <div className="grid gap-8 lg:grid-cols-2">
                <article className="border-t border-calm pt-6">
                  <h3 className="font-heading text-heading-3 font-bold">
                    Our vision
                  </h3>
                  <p className="mt-4 whitespace-pre-line text-pretty text-body-large text-secondary-foreground/80">
                    {aboutPage.vision}
                  </p>
                </article>
                <article className="border-t border-accent pt-6">
                  <h3 className="font-heading text-heading-3 font-bold">
                    Our mission
                  </h3>
                  <p className="mt-4 whitespace-pre-line text-pretty text-body-large text-secondary-foreground/80">
                    {aboutPage.mission}
                  </p>
                </article>
              </div>
            ) : (
              <EmptyState
                description="Our ministry team is preparing this page. Please check back soon to learn more about our vision and mission."
                title="Our purpose will be shared here"
              />
            )}
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="values-title" tone="white">
        <Container size="wide">
          <SectionHeading
            description="These values guide how we gather, grow, and care for one another."
            eyebrow="Our values"
            id="values-title"
            tone="white"
            title="What shapes our community"
          />

          <div className="mt-10">
            {aboutPage ? (
              <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {aboutPage.values.map((value, index) => (
                  <li
                    className="rounded-medium border border-border bg-surface p-6 sm:p-8"
                    key={`${value.title}-${index}`}
                  >
                    <p className="font-label text-label font-bold text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-6 font-heading text-heading-3 font-bold">
                      {value.title}
                    </h3>
                    <p className="mt-4 whitespace-pre-line text-muted">
                      {value.description}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState
                description="Our community values are being prepared and will be available here soon."
                title="Our values are coming"
              />
            )}
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="about-action-title" tone="calm">
        <Container size="reading">
          <SectionHeading
            description="Whether you are visiting for the first time or ready to get more involved, we would love to help you connect."
            eyebrow="Your next step"
            id="about-action-title"
            tone="calm"
            title="Find your place in the community"
          />
          <div className="mt-8">
            <LinkButton href={callToAction.url} size="large">
              {callToAction.label}
            </LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}
