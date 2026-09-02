import type { Metadata } from "next";

import { SermonCard } from "@/components/content/sermon-card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { Pagination } from "@/components/ui/pagination";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";
import { canonicalPath } from "@/features/seo/canonical";
import {
  loadSermonListing,
  loadSermonSiteSettings,
  parseSermonPage,
} from "@/features/sermons/data";

type SermonsPageProps = Readonly<{
  searchParams: Promise<{
    page?: string | string[];
  }>;
}>;

const listingDescription =
  "Watch and listen to recent sermons from Jerusalem Youth, with biblical teaching for growing faith and everyday life.";

export async function generateMetadata({
  searchParams,
}: SermonsPageProps): Promise<Metadata> {
  const [query, settings] = await Promise.all([
    searchParams,
    loadSermonSiteSettings(),
  ]);
  const page = parseSermonPage(query.page);
  const siteName = settings?.siteName ?? siteConfig.name;
  const title = page > 1 ? `Sermons — Page ${page}` : "Sermons";
  const socialTitle = `${title} | ${siteName}`;
  const canonical = canonicalPath("/sermons", page);
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
    alternates: { canonical },
    description: listingDescription,
    openGraph: {
      description: listingDescription,
      images: image ? [image] : undefined,
      siteName,
      title: socialTitle,
      type: "website",
      url: canonical,
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

export default async function SermonsPage({
  searchParams,
}: SermonsPageProps) {
  const query = await searchParams;
  const requestedPage = parseSermonPage(query.page);
  const listing = await loadSermonListing(requestedPage);
  const sermons = listing?.items ?? [];

  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="sermons-title" tone="surface">
        <Container size="wide">
          <div className="max-w-reading">
            <p className="font-label text-label font-bold uppercase text-primary">
              Watch and listen
            </p>
            <h1
              className="mt-5 text-balance font-display text-display font-extrabold"
              id="sermons-title"
            >
              Messages for growing faith
            </h1>
            <p className="mt-6 text-pretty text-body-large text-muted">
              Explore biblical teaching from our gatherings and carry the
              conversation into everyday life.
            </p>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="sermon-list-title" tone="white">
        <Container size="wide">
          <SectionHeading
            description={
              listing
                ? `${listing.pagination.total} ${
                    listing.pagination.total === 1 ? "sermon" : "sermons"
                  }, ordered newest first.`
                : "Published sermons will appear here when the connection is restored."
            }
            eyebrow="Recent teaching"
            id="sermon-list-title"
            tone="white"
            title="Explore the sermons"
          />

          <div className="mt-10">
            {sermons.length > 0 ? (
              <>
                <ul className="space-y-8">
                  {sermons.map((sermon) => (
                    <li key={sermon.id}>
                      <SermonCard sermon={sermon} />
                    </li>
                  ))}
                </ul>
                <Pagination
                  ariaLabel="Sermon pages"
                  basePath="/sermons"
                  currentPage={listing?.pagination.page ?? requestedPage}
                  pageCount={listing?.pagination.pageCount ?? 0}
                />
              </>
            ) : listing ? (
              <EmptyState
                action={
                  requestedPage > 1 ? (
                    <LinkButton href="/sermons">View first page</LinkButton>
                  ) : undefined
                }
                description={
                  requestedPage > 1
                    ? "That page does not contain any published sermons. Return to the beginning to keep exploring."
                    : "New teaching will appear here after it is published."
                }
                title={
                  requestedPage > 1
                    ? "No sermons on this page"
                    : "New sermons are coming"
                }
              />
            ) : (
              <EmptyState
                action={<LinkButton href="/sermons">Try again</LinkButton>}
                description="We could not load the sermons right now. Please try again in a little while."
                title="Sermons are temporarily unavailable"
              />
            )}
          </div>
        </Container>
      </Section>
    </main>
  );
}
