import type { Metadata } from "next";

import { ResourceCard } from "@/components/content/resource-card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { Pagination } from "@/components/ui/pagination";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";
import { canonicalPath } from "@/features/seo/canonical";
import {
  loadResourceListing,
  loadResourceSiteSettings,
  parseResourcePage,
} from "@/features/resources/data";

type ResourcesPageProps = Readonly<{
  searchParams: Promise<{
    page?: string | string[];
  }>;
}>;

const listingDescription =
  "Find practical guides, documents, and trusted links for growing in faith and serving our community.";

export async function generateMetadata({
  searchParams,
}: ResourcesPageProps): Promise<Metadata> {
  const [query, settings] = await Promise.all([
    searchParams,
    loadResourceSiteSettings(),
  ]);
  const page = parseResourcePage(query.page);
  const siteName = settings?.siteName ?? siteConfig.name;
  const title = page > 1 ? `Resources — Page ${page}` : "Resources";
  const socialTitle = `${title} | ${siteName}`;
  const canonical = canonicalPath("/resources", page);
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

export default async function ResourcesPage({
  searchParams,
}: ResourcesPageProps) {
  const query = await searchParams;
  const requestedPage = parseResourcePage(query.page);
  const listing = await loadResourceListing(requestedPage);
  const resources = listing?.items ?? [];

  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="resources-title" tone="surface">
        <Container size="wide">
          <div className="max-w-reading">
            <p className="font-label text-label font-bold uppercase text-primary">
              Practical support
            </p>
            <h1
              className="motion-enter mt-5 text-balance font-display text-display font-extrabold"
              id="resources-title"
            >
              Resources for everyday faith
            </h1>
            <p className="mt-6 text-pretty text-body-large text-muted">
              Explore guides, documents, and trusted links chosen to support
              growth, conversation, and service.
            </p>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="resource-list-title" tone="white">
        <Container size="wide">
          <SectionHeading
            description={
              listing
                ? `${listing.pagination.total} ${
                    listing.pagination.total === 1 ? "resource" : "resources"
                  }, ordered newest first.`
                : "Published resources will appear here when the connection is restored."
            }
            eyebrow="Browse the library"
            id="resource-list-title"
            tone="white"
            title="Explore the resources"
          />

          <div className="mt-10">
            {resources.length > 0 ? (
              <>
                <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {resources.map((resource) => (
                    <li className="motion-reveal" key={resource.id}>
                      <ResourceCard resource={resource} />
                    </li>
                  ))}
                </ul>
                <Pagination
                  ariaLabel="Resource pages"
                  basePath="/resources"
                  currentPage={listing?.pagination.page ?? requestedPage}
                  pageCount={listing?.pagination.pageCount ?? 0}
                />
              </>
            ) : listing ? (
              <EmptyState
                action={
                  requestedPage > 1 ? (
                    <LinkButton href="/resources">View first page</LinkButton>
                  ) : undefined
                }
                description={
                  requestedPage > 1
                    ? "That page does not contain any published resources. Return to the beginning to keep exploring."
                    : "New guides and trusted links will appear here after they are published."
                }
                title={
                  requestedPage > 1
                    ? "No resources on this page"
                    : "New resources are coming"
                }
              />
            ) : (
              <EmptyState
                action={<LinkButton href="/resources">Try again</LinkButton>}
                description="We could not load the resources right now. Please try again in a little while."
                title="Resources are temporarily unavailable"
              />
            )}
          </div>
        </Container>
      </Section>
    </main>
  );
}
