import type { Article } from "@/lib/cms/domain";

export const buildArticleStructuredData = (article: Article) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  articleSection: article.category.name,
  datePublished: article.publishedAt,
  description: article.excerpt,
  headline: article.title,
  image: [article.featuredImage.url],
  ...(article.tags.length > 0 ? { keywords: article.tags } : {}),
  ...(article.seo?.canonical
    ? {
        mainEntityOfPage: article.seo.canonical,
        url: article.seo.canonical,
      }
    : {}),
});

export const serializeStructuredData = (value: unknown) =>
  JSON.stringify(value).replaceAll("<", "\\u003c");
