import type { Metadata, ResolvingMetadata } from "next";

import { MediaCard } from "@/components/content/media-card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";
import { loadMediaListing } from "@/features/media/data";

const mediaDescription =
  "See approved photos and videos from the gatherings, stories, and teaching of Jerusalem Youth.";

export async function generateMetadata(
  _props: object,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const parentMetadata = await parent;
  const openGraphImages = parentMetadata?.openGraph?.images;
  const twitterImages = parentMetadata?.twitter?.images;

  return {
    alternates: { canonical: "/media" },
    description: mediaDescription,
    openGraph: {
      description: mediaDescription,
      images: openGraphImages,
      title: `Media | ${siteConfig.name}`,
      type: "website",
      url: "/media",
    },
    title: "Media",
    twitter: {
      card: twitterImages?.length ? "summary_large_image" : "summary",
      description: mediaDescription,
      images: twitterImages,
      title: `Media | ${siteConfig.name}`,
    },
  };
}

export default async function MediaPage() {
  const listing = await loadMediaListing();
  const items = listing?.items ?? [];

  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="media-title" tone="secondary">
        <Container size="wide">
          <div className="max-w-reading">
            <p className="font-label text-label font-bold uppercase text-calm">
              Life together
            </p>
            <h1
              className="motion-enter mt-5 text-balance font-display text-display font-extrabold"
              id="media-title"
            >
              Moments from our community
            </h1>
            <p className="mt-6 text-pretty text-body-large text-secondary-foreground">
              Explore photos and videos shared through our published events,
              stories, and teaching.
            </p>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="media-list-title" tone="white">
        <Container size="wide">
          <SectionHeading
            description="Published moments from across Jerusalem Youth, ordered by their latest content updates."
            eyebrow="Photos and videos"
            id="media-list-title"
            tone="white"
            title="Explore the media"
          />

          <div className="mt-10">
            {items.length > 0 ? (
              <>
                {listing && listing.unavailableSourceCount > 0 ? (
                  <p
                    className="mb-6 rounded-small border border-border bg-surface px-4 py-3 text-body-small text-muted"
                    role="status"
                  >
                    Some published media is temporarily unavailable.
                  </p>
                ) : null}
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <li className="motion-reveal" key={item.id}>
                      <MediaCard item={item} />
                    </li>
                  ))}
                </ul>
              </>
            ) : listing ? (
              <EmptyState
                action={<LinkButton href="/stories">Read community stories</LinkButton>}
                description="Approved photos and videos will appear here after related events, stories, or sermons are published."
                title="Media moments are coming"
              />
            ) : (
              <EmptyState
                action={<LinkButton href="/media">Try again</LinkButton>}
                description="We could not load the media right now. Please try again in a little while."
                title="Media is temporarily unavailable"
              />
            )}
          </div>
        </Container>
      </Section>
    </main>
  );
}
