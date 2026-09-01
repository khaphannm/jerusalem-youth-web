import type { Article } from "@/lib/cms/domain";
export { serializeStructuredData } from "@/lib/seo/structured-data";

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
