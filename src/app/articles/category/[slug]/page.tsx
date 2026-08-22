import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/content/article-card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/config/site";
import { ArticlePagination } from "@/features/articles/article-pagination";
import {
  loadArticleCategory,
  parseArticlePage,
} from "@/features/articles/data";
import type { Category } from "@/lib/cms/domain";

type ArticleCategoryPageProps = Readonly<{
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}>;

const categoryDescription = (category: Category) =>
  category.description ??
  `Explore published articles and devotionals in ${category.name}.`;

export async function generateMetadata({
  params,
  searchParams,
}: ArticleCategoryPageProps): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const page = parseArticlePage(query.page);
  const result = await loadArticleCategory(slug, page);

  if (result.status === "not-found") {
    return {
      description: "The requested article category could not be found.",
      robots: { follow: false, index: false },
      title: "Article category not found",
    };
  }

  if (result.status === "error") {
    return {
      description: "Browse articles and devotionals by category.",
      robots: { follow: false, index: false },
      title: "Article category",
    };
  }

  const { category, listing } = result;
  const title =
    page > 1
      ? `${category.name} articles — Page ${page}`
      : `${category.name} articles`;
  const socialTitle = `${title} | ${siteConfig.name}`;
  const description = categoryDescription(category);
  const socialImage = listing.items[0]?.featuredImage;
  const image = socialImage
    ? {
        alt: socialImage.alternativeText ?? socialTitle,
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
      title: socialTitle,
      type: "website",
    },
    title,
    twitter: {
      card: image ? "summary_large_image" : "summary",
      description,
      images: image ? [image.url] : undefined,
      title: socialTitle,
    },
  };
}

function ArticleCategoryError({ slug }: Readonly<{ slug: string }>) {
  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="category-error-title" tone="calm">
        <Container size="reading">
          <p className="font-label text-label font-bold uppercase text-secondary">
            Article category
          </p>
          <h1
            className="mt-5 text-balance font-display text-display font-extrabold"
            id="category-error-title"
          >
            This category is temporarily unavailable
          </h1>
          <p className="mt-6 text-pretty text-body-large text-calm-foreground">
            We could not load this category right now. Please try again or
            return to all articles.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <LinkButton
              href={`/articles/category/${encodeURIComponent(slug)}`}
            >
              Try again
            </LinkButton>
            <LinkButton href="/articles" variant="outline">
              Browse all articles
            </LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}

export default async function ArticleCategoryPage({
  params,
  searchParams,
}: ArticleCategoryPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const requestedPage = parseArticlePage(query.page);
  const result = await loadArticleCategory(slug, requestedPage);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "error") {
    return <ArticleCategoryError slug={slug} />;
  }

  const { category, listing } = result;
  const articles = listing.items;
  const basePath = `/articles/category/${encodeURIComponent(category.slug)}`;

  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="article-category-title" tone="calm">
        <Container size="wide">
          <div className="max-w-reading">
            <Link
              className="inline-flex min-h-11 items-center rounded-small py-2 font-label text-label font-bold text-secondary transition-colors duration-fast ease-standard hover:text-primary motion-reduce:transition-none"
              href="/articles"
            >
              <span aria-hidden="true">←</span>
              All articles
            </Link>
            <p className="mt-8 font-label text-label font-bold uppercase text-secondary">
              Article category
            </p>
            <h1
              className="mt-5 text-balance font-display text-display font-extrabold"
              id="article-category-title"
            >
              {category.name} articles
            </h1>
            <p className="mt-6 whitespace-pre-line text-pretty text-body-large text-calm-foreground">
              {categoryDescription(category)}
            </p>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="category-articles-title" tone="white">
        <Container size="wide">
          <SectionHeading
            description={`${listing.pagination.total} published ${
              listing.pagination.total === 1 ? "article" : "articles"
            } in this category, ordered newest first.`}
            eyebrow="Read and reflect"
            id="category-articles-title"
            tone="white"
            title={`Latest in ${category.name}`}
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
                  basePath={basePath}
                  currentPage={listing.pagination.page}
                  pageCount={listing.pagination.pageCount}
                />
              </>
            ) : (
              <EmptyState
                action={
                  requestedPage > 1 ? (
                    <LinkButton href={basePath}>View first page</LinkButton>
                  ) : (
                    <LinkButton href="/articles">Browse all articles</LinkButton>
                  )
                }
                description={
                  requestedPage > 1
                    ? "That page does not contain any published articles. Return to the first category page to keep exploring."
                    : `There are no published articles in ${category.name} yet. Browse all articles for more encouragement.`
                }
                title={
                  requestedPage > 1
                    ? "No articles on this page"
                    : "No published articles yet"
                }
              />
            )}
          </div>
        </Container>
      </Section>
    </main>
  );
}
