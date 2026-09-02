import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";
import { resolveJoinPrimaryAction } from "@/features/join/actions";
import {
  loadJoinPageData,
  loadJoinSiteSettings,
} from "@/features/join/data";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadJoinSiteSettings();
  const siteName = settings?.siteName ?? siteConfig.name;
  const title = `Join ${siteName}`;
  const description = `Find a clear next step into gatherings, community, and everyday faith with ${siteName}.`;
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
    description,
    openGraph: {
      description,
      images: image ? [image] : undefined,
      siteName,
      title,
      type: "website",
    },
    robots: settings?.defaultSeo?.noIndex
      ? { follow: true, index: false }
      : undefined,
    title: "Join Us",
    twitter: {
      card: image ? "summary_large_image" : "summary",
      description,
      images: image ? [image.url] : undefined,
      title,
    },
  };
}

const nextSteps = [
  {
    action: "Browse events",
    description:
      "Choose an upcoming gathering that works for you and see the practical details before you arrive.",
    href: "/events",
    title: "Find a gathering",
  },
  {
    action: "Read community stories",
    description:
      "Meet the heart of the community through honest stories of faith, friendship, and belonging.",
    href: "/stories",
    title: "See what community feels like",
  },
  {
    action: "Explore resources",
    description:
      "Take a next step in everyday faith with teaching, guides, and trusted resources.",
    href: "/resources",
    title: "Keep growing",
  },
] as const;

export default async function JoinPage() {
  const { siteSettings, socialLinks } = await loadJoinPageData();
  const siteName = siteSettings?.siteName ?? siteConfig.name;
  const primaryAction = resolveJoinPrimaryAction(
    siteSettings?.primaryCallToAction ?? null,
  );
  const secondaryAction = primaryAction.url.startsWith("/events")
    ? { label: "Learn about us", url: "/about" }
    : { label: "See upcoming events", url: "/events" };
  const communityLinks = socialLinks?.links ?? [];

  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="join-title" tone="secondary">
        <Container size="wide">
          <div className="max-w-reading">
            <p className="font-label text-label font-bold uppercase text-calm">
              You are welcome
            </p>
            <h1
              className="mt-5 text-balance font-display text-display font-extrabold"
              id="join-title"
            >
              Find your next step with {siteName}
            </h1>
            <p className="mt-6 text-pretty text-body-large text-secondary-foreground">
              Whether this is your first visit or you are ready to get more
              involved, start with the step that feels right for you.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
              <LinkButton href={primaryAction.url} size="large">
                {primaryAction.label}
              </LinkButton>
              <LinkButton
                href={secondaryAction.url}
                size="large"
                variant="secondary"
              >
                {secondaryAction.label}
              </LinkButton>
            </div>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="join-steps-title" tone="white">
        <Container size="wide">
          <SectionHeading
            description="There is no single right way to begin. These are three simple places to start."
            eyebrow="Choose your next step"
            id="join-steps-title"
            tone="white"
            title="Start where you are"
          />

          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {nextSteps.map((step, index) => (
              <li
                className="flex flex-col rounded-medium border border-border bg-surface p-6 sm:p-8"
                key={step.href}
              >
                <p className="font-label text-label font-bold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-6 font-heading text-heading-3 font-bold">
                  {step.title}
                </h3>
                <p className="mt-4 flex-1 text-muted">{step.description}</p>
                <Link
                  className="mt-6 inline-flex min-h-11 w-fit items-center rounded-small py-2 font-label text-label font-bold text-primary transition-colors duration-fast ease-standard hover:text-secondary motion-reduce:transition-none"
                  href={step.href}
                >
                  {step.action}
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section aria-labelledby="join-community-title" tone="calm">
        <Container size="reading">
          <SectionHeading
            description="Use one of our official community channels. This page does not ask for or store your personal information."
            eyebrow="Stay connected"
            id="join-community-title"
            tone="calm"
            title="Connect without another form"
          />

          {communityLinks.length > 0 ? (
            <nav aria-labelledby="join-community-title" className="mt-8">
              <ul className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
                {communityLinks.map((item, index) => (
                  <li key={`${item.platform}-${item.url}-${index}`}>
                    <LinkButton href={item.url} variant="outline">
                      Connect on {item.platform}
                    </LinkButton>
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <div className="mt-8">
              <p className="text-muted">
                Our official community links are being updated. You can still
                begin by finding the next gathering.
              </p>
              <div className="mt-6">
                <LinkButton href="/events">See upcoming events</LinkButton>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </main>
  );
}
