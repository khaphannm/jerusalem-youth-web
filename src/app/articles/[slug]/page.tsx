import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { RichText } from "@/components/content/rich-text";
import { Container } from "@/components/ui/container";
import { ContentImage } from "@/components/ui/content-image";
import { LinkButton } from "@/components/ui/link-button";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { loadArticleDetail } from "@/features/articles/data";
import {
  buildArticleStructuredData,
  serializeStructuredData,
} from "@/features/articles/structured-data";
import type { Article } from "@/lib/cms/domain";
import { formatPublicationDate } from "@/lib/format-date";

type ArticlePageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

const metadataImage = (article: Article, title: string) => {
  const image = article.seo?.socialImage ?? article.featuredImage;

  return {
    alt: image.alternativeText ?? title,
    height: image.height ?? undefined,
    url: image.url,
    width: image.width ?? undefined,
  };
};

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadArticleDetail(slug);

  if (result.status === "not-found") {
    return {
      description: "Không tìm thấy bài viết bạn yêu cầu.",
      robots: { follow: false, index: false },
      title: "Không tìm thấy bài viết",
    };
  }

  if (result.status === "error") {
    return {
      description: "Read articles and devotionals from our youth ministry.",
      robots: { follow: false, index: false },
      title: "Article",
    };
  }

  const { article } = result;
  const title = article.seo?.metaTitle ?? article.title;
  const description = article.seo?.metaDescription ?? article.excerpt;
  const image = metadataImage(article, title);
  const canonical =
    article.seo?.canonical ?? `/articles/${encodeURIComponent(article.slug)}`;

  return {
    alternates: { canonical },
    description,
    openGraph: {
      description,
      images: [image],
      publishedTime: article.publishedAt,
      title,
      type: "article",
      url: canonical,
    },
    robots: article.seo?.noIndex
      ? { follow: true, index: false }
      : undefined,
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [image.url],
      title,
    },
  };
}

function ArticleErrorState() {
  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <Section aria-labelledby="article-error-title" tone="calm">
        <Container size="reading">
          <p className="font-label text-label font-bold uppercase text-secondary">
            Articles
          </p>
          <h1
            className="motion-enter mt-5 text-balance font-display text-display font-extrabold"
            id="article-error-title"
          >
            This article is temporarily unavailable
          </h1>
          <p className="mt-6 text-pretty text-body-large text-calm-foreground">
            We could not load the article right now. Please return to the
            article library and try again in a little while.
          </p>
          <div className="mt-8">
            <LinkButton href="/articles">Browse all articles</LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const result = await loadArticleDetail(slug);

  if (result.status === "not-found") {
    notFound();
  }

  if (result.status === "error") {
    return <ArticleErrorState />;
  }

  const { article } = result;
  const structuredData = buildArticleStructuredData(article);
  const hasAuthorProfile = Boolean(article.author.avatar || article.author.bio);

  return (
    <main className="flex-1" id="main-content" tabIndex={-1}>
      <article>
        <script
          dangerouslySetInnerHTML={{
            __html: serializeStructuredData(structuredData),
          }}
          type="application/ld+json"
        />

        <Section aria-labelledby="article-title" tone="calm">
          <Container size="reading">
            <Link
              className="inline-flex min-h-11 items-center rounded-small py-2 font-label text-label font-bold text-secondary transition-colors duration-fast ease-standard hover:text-primary motion-reduce:transition-none"
              href="/articles"
            >
              <span aria-hidden="true">←</span>
              All articles
            </Link>
            <p className="mt-8 font-label text-label font-bold uppercase text-secondary">
              <span className="sr-only">Category: </span>
              <Link
                className="rounded-small underline decoration-calm-foreground/30 underline-offset-4 transition-colors duration-fast ease-standard hover:text-primary motion-reduce:transition-none"
                href={`/articles/category/${encodeURIComponent(
                  article.category.slug,
                )}`}
              >
                {article.category.name}
              </Link>
            </p>
            <h1
              className="motion-enter mt-5 text-balance font-display text-display font-extrabold"
              id="article-title"
            >
              {article.title}
            </h1>
            <p className="mt-6 text-pretty text-body-large text-calm-foreground">
              {article.excerpt}
            </p>
            <p className="mt-6 text-body-small text-calm-foreground">
              By {article.author.displayName}
              <span aria-hidden="true"> · </span>
              <time dateTime={article.publishedAt}>
                {formatPublicationDate(article.publishedAt)}
              </time>
            </p>
          </Container>
        </Section>

        <Section aria-label="Article image" spacing="compact" tone="white">
          <Container size="wide">
            <div className="motion-settle overflow-hidden rounded-large border border-border bg-surface sm:rounded-xlarge">
              <ContentImage
                asset={article.featuredImage}
                className="aspect-[16/9] h-auto w-full object-cover"
                sizes="(min-width: 1280px) 1152px, 100vw"
              />
            </div>
          </Container>
        </Section>

        <Section aria-label="Article content" tone="white">
          <Container size="reading">
            <RichText content={article.body} />

            {article.bibleReferences.length > 0 ? (
              <aside
                aria-labelledby="scripture-references-title"
                className="mt-12 border-t border-border pt-8"
              >
                <h2
                  className="font-heading text-heading-3 font-bold"
                  id="scripture-references-title"
                >
                  Scripture references
                </h2>
                <ul className="mt-4 flex flex-wrap gap-3">
                  {article.bibleReferences.map((reference) => (
                    <li
                      className="rounded-small border border-border bg-surface px-3 py-2 text-body-small font-semibold"
                      key={reference}
                    >
                      {reference}
                    </li>
                  ))}
                </ul>
              </aside>
            ) : null}

            {article.tags.length > 0 ? (
              <div className="mt-8" aria-label="Article tags">
                <ul className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <li
                      className="rounded-small bg-calm px-3 py-2 font-label text-label font-bold text-calm-foreground"
                      key={tag}
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {hasAuthorProfile ? (
              <aside
                aria-labelledby="article-author-title"
                className="motion-reveal mt-12 rounded-large border border-border bg-surface p-6 sm:rounded-xlarge sm:p-8"
              >
                <div className="flex items-start gap-5">
                  {article.author.avatar ? (
                    <div className="w-16 shrink-0 overflow-hidden rounded-medium">
                      <ContentImage
                        asset={article.author.avatar}
                        className="aspect-square h-full w-full object-cover"
                        sizes="64px"
                      />
                    </div>
                  ) : null}
                  <div>
                    <p className="font-label text-label font-bold uppercase text-primary">
                      Written by
                    </p>
                    <h2
                      className="mt-2 font-heading text-heading-3 font-bold"
                      id="article-author-title"
                    >
                      {article.author.displayName}
                    </h2>
                    {article.author.bio ? (
                      <p className="mt-3 whitespace-pre-line text-muted">
                        {article.author.bio}
                      </p>
                    ) : null}
                  </div>
                </div>
              </aside>
            ) : null}
          </Container>
        </Section>
      </article>

      <Section aria-labelledby="article-next-title" tone="calm">
        <Container size="reading">
          <SectionHeading
            description="Discover more devotionals, reflections, and stories for everyday faith."
            eyebrow="Keep reading"
            id="article-next-title"
            tone="calm"
            title="Explore more articles"
          />
          <div className="mt-8">
            <LinkButton href="/articles">Browse all articles</LinkButton>
          </div>
        </Container>
      </Section>
    </main>
  );
}
