import type { Metadata } from "next";

import { ArticleCard } from "@/components/content/article-card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";
import { ArticlePagination } from "@/features/articles/article-pagination";
import {
  loadArticleListing,
  loadArticleSiteSettings,
  parseArticlePage,
} from "@/features/articles/data";
import { canonicalPath } from "@/features/seo/canonical";

type ArticlesPageProps = Readonly<{
  searchParams: Promise<{
    page?: string | string[];
  }>;
}>;

const listingDescription =
  "Read thoughtful articles and devotionals for following Jesus, growing in faith, and living with purpose.";

export async function generateMetadata({
  searchParams,
}: ArticlesPageProps): Promise<Metadata> {
  const [query, settings] = await Promise.all([
    searchParams,
    loadArticleSiteSettings(),
  ]);
  const page = parseArticlePage(query.page);
  const siteName = settings?.siteName ?? siteConfig.name;
  const title = page > 1 ? `Articles — Page ${page}` : "Articles";
  const socialTitle = `${title} | ${siteName}`;
  const canonical = canonicalPath("/articles", page);
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

export default async function ArticlesPage({
  searchParams,
}: ArticlesPageProps) {
  const query = await searchParams;
  const requestedPage = parseArticlePage(query.page);
  const listing = await loadArticleListing(requestedPage);
  const articles = listing?.items ?? [];

  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="articles-title" tone="calm">
        <Container size="wide">
          <div className="max-w-reading">
            <p className="font-label text-label font-bold uppercase text-secondary">
              Read and reflect
            </p>
            <h1
              className="mt-5 text-balance font-display text-display font-extrabold"
              id="articles-title"
            >
              Articles for everyday faith
            </h1>
            <p className="mt-6 text-pretty text-body-large text-calm-foreground">
              Browse our newest devotionals, Bible reflections, and ministry
              stories. Every article is labeled by category to help you discover
              a topic.
            </p>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="article-list-title" tone="white">
        <Container size="wide">
          <SectionHeading
            description={
              listing
                ? `${listing.pagination.total} ${
                    listing.pagination.total === 1 ? "article" : "articles"
                  }, ordered newest first.`
                : "Published articles will appear here when the connection is restored."
            }
            eyebrow="Latest writing"
            id="article-list-title"
            tone="white"
            title="Explore the articles"
          />

          <div className="mt-10">
            {articles.length > 0 ? (
              <>
                <ul className="space-y-8">
                  {articles.map((article) => (
                    <li key={article.id}>
                      <ArticleCard article={article} />
                    </li>
                  ))}
                </ul>
                <ArticlePagination
                  currentPage={listing?.pagination.page ?? requestedPage}
                  pageCount={listing?.pagination.pageCount ?? 0}
                />
              </>
            ) : listing ? (
              <EmptyState
                action={
                  requestedPage > 1 ? (
                    <LinkButton href="/articles">View first page</LinkButton>
                  ) : undefined
                }
                description={
                  requestedPage > 1
                    ? "That page does not contain any published articles. Return to the beginning to keep exploring."
                    : "Fresh encouragement is being prepared. New writing will appear here when it is published."
                }
                title={
                  requestedPage > 1
                    ? "No articles on this page"
                    : "New articles are coming"
                }
              />
            ) : (
              <EmptyState
                action={<LinkButton href="/articles">Try again</LinkButton>}
                description="We could not load the articles right now. Please try again in a little while."
                title="Articles are temporarily unavailable"
              />
            )}
          </div>
        </Container>
      </Section>
    </main>
  );
}
