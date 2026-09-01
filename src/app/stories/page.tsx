import type { Metadata } from "next";

import { StoryCard } from "@/components/content/story-card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { Pagination } from "@/components/ui/pagination";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";
import {
  loadStoryListing,
  loadStorySiteSettings,
  parseStoryPage,
} from "@/features/stories/data";

type StoriesPageProps = Readonly<{
  searchParams: Promise<{
    page?: string | string[];
  }>;
}>;

const listingDescription =
  "Read stories of faith, friendship, service, and belonging from the Jerusalem Youth community.";

export async function generateMetadata({
  searchParams,
}: StoriesPageProps): Promise<Metadata> {
  const [query, settings] = await Promise.all([
    searchParams,
    loadStorySiteSettings(),
  ]);
  const page = parseStoryPage(query.page);
  const siteName = settings?.siteName ?? siteConfig.name;
  const title = page > 1 ? `Stories — Page ${page}` : "Stories";
  const socialTitle = `${title} | ${siteName}`;
  const socialImage =
    settings?.defaultSeo?.socialImage ?? settings?.defaultSocialImage;
  const image = socialImage
    ? {
        alt: socialImage.alternativeText ?? socialTitle,
        height: socialImage.height ?? undefined,
        url: socialImage.url,
        width: socialImage.width ?? undefined,
      }
    : undefined;

  return {
    description: listingDescription,
    openGraph: {
      description: listingDescription,
      images: image ? [image] : undefined,
      siteName,
      title: socialTitle,
      type: "website",
    },
    robots: settings?.defaultSeo?.noIndex
      ? { follow: true, index: false }
      : undefined,
    title,
    twitter: {
      card: image ? "summary_large_image" : "summary",
      description: listingDescription,
      images: image ? [image.url] : undefined,
      title: socialTitle,
    },
  };
}

export default async function StoriesPage({ searchParams }: StoriesPageProps) {
  const query = await searchParams;
  const requestedPage = parseStoryPage(query.page);
  const listing = await loadStoryListing(requestedPage);
  const stories = listing?.items ?? [];

  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="stories-title" tone="calm">
        <Container size="wide">
          <div className="max-w-reading">
            <p className="font-label text-label font-bold uppercase text-secondary">
              Our community
            </p>
            <h1
              className="mt-5 text-balance font-display text-display font-extrabold"
              id="stories-title"
            >
              Stories of faith and belonging
            </h1>
            <p className="mt-6 text-pretty text-body-large text-calm-foreground">
              Discover honest moments of growth, friendship, service, and hope
              from across our youth community.
            </p>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="story-list-title" tone="white">
        <Container size="wide">
          <SectionHeading
            description={
              listing
                ? `${listing.pagination.total} ${
                    listing.pagination.total === 1 ? "story" : "stories"
                  }, ordered newest first.`
                : "Published stories will appear here when the connection is restored."
            }
            eyebrow="Lives and lessons"
            id="story-list-title"
            tone="white"
            title="Explore the stories"
          />

          <div className="mt-10">
            {stories.length > 0 ? (
              <>
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {stories.map((story, index) => {
                    const featured = index === 0;

                    return (
                      <li
                        className={
                          featured ? "sm:col-span-2 lg:col-span-3" : undefined
                        }
                        key={story.id}
                      >
                        <StoryCard featured={featured} story={story} />
                      </li>
                    );
                  })}
                </ul>
                <Pagination
                  ariaLabel="Story pages"
                  basePath="/stories"
                  currentPage={listing?.pagination.page ?? requestedPage}
                  pageCount={listing?.pagination.pageCount ?? 0}
                />
              </>
            ) : listing ? (
              <EmptyState
                action={
                  requestedPage > 1 ? (
                    <LinkButton href="/stories">View first page</LinkButton>
                  ) : undefined
                }
                description={
                  requestedPage > 1
                    ? "That page does not contain any published stories. Return to the beginning to keep exploring."
                    : "We are gathering community stories with care. They will appear here when they are ready."
                }
                title={
                  requestedPage > 1
                    ? "No stories on this page"
                    : "Community stories are coming"
                }
              />
            ) : (
              <EmptyState
                action={<LinkButton href="/stories">Try again</LinkButton>}
                description="We could not load the stories right now. Please try again in a little while."
                title="Stories are temporarily unavailable"
              />
            )}
          </div>
        </Container>
      </Section>
    </main>
  );
}
