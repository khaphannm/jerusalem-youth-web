import type { Metadata } from "next";

import { ArticleCard } from "@/components/content/article-card";
import { EventCard } from "@/components/content/event-card";
import { SermonCard } from "@/components/content/sermon-card";
import { StoryCard } from "@/components/content/story-card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";
import { HeroGallery } from "@/features/home/hero-gallery";
import {
  loadHomePageData,
  loadHomeSiteSettings,
} from "@/features/home/data";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadHomeSiteSettings();
  const seo = settings?.defaultSeo;
  const title = seo?.metaTitle ?? settings?.siteName ?? siteConfig.name;
  const description =
    seo?.metaDescription ??
    settings?.siteDescription ??
    siteConfig.description;
  const socialImage = seo?.socialImage ?? settings?.defaultSocialImage;
  const canonical = seo?.canonical ?? "/";
  const image = socialImage
    ? {
        alt: socialImage.alternativeText ?? title,
        height: socialImage.height ?? undefined,
        url: socialImage.url,
        width: socialImage.width ?? undefined,
      }
    : undefined;

  return {
    alternates: { canonical },
    description,
    openGraph: {
      description,
      images: image ? [image] : undefined,
      siteName: settings?.siteName ?? siteConfig.name,
      title,
      type: "website",
      url: canonical,
    },
    robots: seo?.noIndex ? { follow: true, index: false } : undefined,
    title: { absolute: title },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      description,
      images: image ? [image.url] : undefined,
      title,
    },
  };
}

export default async function Home() {
  const {
    featuredEvent,
    latestArticle,
    latestSermon,
    siteSettings,
    stories,
    upcomingEvents,
  } = await loadHomePageData();
  const siteName = siteSettings?.siteName ?? siteConfig.name;
  const heroSlides = siteSettings?.heroSlides ?? [];
  const siteDescription =
    siteSettings?.siteDescription ?? siteConfig.description;
  const primaryCallToAction = siteSettings?.primaryCallToAction ?? {
    label: "Join us",
    url: "/join",
  };

  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="home-title">
        <Container size="wide">
          <div
            className={heroSlides.length
              ? "grid items-center gap-8 lg:grid-cols-5 lg:gap-12"
              : "max-w-reading"}
          >
            <div className={heroSlides.length ? "lg:col-span-2" : undefined}>
              <p className="font-label text-label font-bold uppercase text-primary">
                Youth ministry
              </p>
              <h1
                className="mt-5 text-balance font-display text-display font-extrabold"
                id="home-title"
              >
                {siteName}
              </h1>
              <p className="mt-6 text-pretty text-body-large text-muted">
                {siteDescription}
              </p>
              <div className={heroSlides.length ? "mt-8 hidden lg:block" : "mt-8"}>
                <LinkButton href={primaryCallToAction.url} size="large">
                  {primaryCallToAction.label}
                </LinkButton>
              </div>
            </div>
            {heroSlides.length ? (
              <>
                <div className="min-w-0 lg:col-span-3">
                  <HeroGallery slides={heroSlides} />
                </div>
                <div className="lg:hidden">
                  <LinkButton href={primaryCallToAction.url} size="large">
                    {primaryCallToAction.label}
                  </LinkButton>
                </div>
              </>
            ) : null}
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="featured-event-title" tone="secondary">
        <Container size="wide">
          <SectionHeading
            description="Make plans to gather, grow, and build community with us."
            eyebrow="Featured event"
            id="featured-event-title"
            tone="secondary"
            title="Next gathering"
          />
          <div className="mt-10">
            {featuredEvent ? (
              <EventCard event={featuredEvent} featured status="upcoming" />
            ) : (
              <EmptyState
                description="We are preparing the next gathering. Please check back soon for the details."
                title="A new event is on the way"
              />
            )}
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="upcoming-events-title" tone="white">
        <Container size="wide">
          <SectionHeading
            description="See what is coming up and find a gathering that fits your week."
            eyebrow="Come together"
            id="upcoming-events-title"
            tone="white"
            title="Upcoming events"
          />
          <div className="mt-10">
            {upcomingEvents.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <EventCard event={event} key={event.id} status="upcoming" />
                ))}
              </div>
            ) : (
              <EmptyState
                description="There are no additional event dates to share right now. New gatherings will appear here when they are published."
                title="More events are coming"
              />
            )}
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="latest-article-title" tone="calm">
        <Container size="wide">
          <SectionHeading
            description="Thoughtful encouragement for following Jesus in everyday life."
            eyebrow="Read and reflect"
            id="latest-article-title"
            tone="calm"
            title="Latest article"
          />
          <div className="mt-10">
            {latestArticle ? (
              <ArticleCard article={latestArticle} />
            ) : (
              <EmptyState
                description="Fresh encouragement is being prepared. Visit again soon for the next article."
                title="A new article is coming"
              />
            )}
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="latest-sermon-title" tone="surface">
        <Container size="wide">
          <SectionHeading
            description="Catch up on the latest teaching and continue the conversation."
            eyebrow="Watch and listen"
            id="latest-sermon-title"
            tone="surface"
            title="Latest sermon"
          />
          <div className="mt-10">
            {latestSermon ? (
              <SermonCard sermon={latestSermon} />
            ) : (
              <EmptyState
                description="The latest message is not available yet. Check back after our next gathering."
                title="A new sermon is coming"
              />
            )}
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="stories-title" tone="white">
        <Container size="wide">
          <SectionHeading
            description="Real stories of faith, friendship, and lives being changed."
            eyebrow="Our community"
            id="stories-title"
            tone="white"
            title="Stories from our youth"
          />
          <div className="mt-10">
            {stories.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {stories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            ) : (
              <EmptyState
                description="We are gathering stories from the community with care. They will be shared here when they are ready."
                title="Community stories are coming"
              />
            )}
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="join-title" tone="secondary">
        <Container size="reading">
          <SectionHeading
            description="Whether this is your first visit or your next step, there is a place for you in this community."
            eyebrow="You are welcome"
            id="join-title"
            tone="secondary"
            title="Find your place and grow with us"
          />
          <div className="mt-8">
            <LinkButton href="/join" size="large">
              Join the community
            </LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}
