import Link from "next/link";

import { ContentImage } from "@/components/ui/content-image";
import type { Article } from "@/lib/cms/domain";
import { formatPublicationDate } from "@/lib/format-date";

export function ArticleCard({ article }: Readonly<{ article: Article }>) {
  const href = `/articles/${encodeURIComponent(article.slug)}`;

  return (
    <article className="overflow-hidden rounded-large border border-calm-foreground/20 bg-background md:grid md:grid-cols-2">
      <ContentImage
        asset={article.featuredImage}
        className="aspect-[4/3] h-full w-full object-cover"
        sizes="(min-width: 768px) 50vw, 100vw"
      />
      <div className="flex flex-col justify-center p-6 sm:p-10">
        <p className="font-label text-label font-bold uppercase text-secondary">
          <span className="sr-only">Category: </span>
          {article.category.name}
        </p>
        <h3 className="mt-4 font-heading text-heading-3 font-bold">
          <Link
            className="rounded-small transition-colors duration-fast ease-standard hover:text-primary motion-reduce:transition-none"
            href={href}
          >
            {article.title}
          </Link>
        </h3>
        <p className="mt-4 text-foreground">{article.excerpt}</p>
        <p className="mt-5 text-body-small text-muted">
          By {article.author.displayName}
          <span aria-hidden="true"> · </span>
          <time dateTime={article.publishedAt}>
            {formatPublicationDate(article.publishedAt)}
          </time>
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 w-fit items-center rounded-small py-2 font-label text-label font-bold text-primary transition-colors duration-fast ease-standard hover:text-secondary motion-reduce:transition-none"
          href={href}
        >
          Read article
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
