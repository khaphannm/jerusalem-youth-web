import Link from "next/link";

import { ContentImage } from "@/components/ui/content-image";
import type { Sermon } from "@/lib/cms/domain";
import { formatPublicationDate } from "@/lib/format-date";

export function SermonCard({ sermon }: Readonly<{ sermon: Sermon }>) {
  const href = `/sermons/${encodeURIComponent(sermon.slug)}`;

  return (
    <article className="overflow-hidden rounded-large border border-border bg-primary-foreground md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      {sermon.thumbnail ? (
        <ContentImage
          asset={sermon.thumbnail}
          className="aspect-video h-full w-full object-cover md:aspect-auto"
          sizes="(min-width: 768px) 40vw, 100vw"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex min-h-52 items-end bg-secondary p-6 text-heading-3 font-bold text-secondary-foreground"
        >
          Watch the latest message
        </div>
      )}
      <div className="flex flex-col justify-center p-6 sm:p-10">
        <p className="font-label text-label font-bold uppercase text-primary">
          <time dateTime={sermon.date}>
            {formatPublicationDate(sermon.date)}
          </time>
        </p>
        <h3 className="mt-4 font-heading text-heading-3 font-bold">
          <Link
            className="rounded-small transition-colors duration-fast ease-standard hover:text-primary motion-reduce:transition-none"
            href={href}
          >
            {sermon.title}
          </Link>
        </h3>
        <p className="mt-2 font-label text-label font-semibold text-secondary">
          {sermon.speaker}
        </p>
        <p className="mt-4 text-muted">{sermon.summary}</p>
        <Link
          className="mt-6 inline-flex min-h-11 w-fit items-center rounded-small py-2 font-label text-label font-bold text-primary transition-colors duration-fast ease-standard hover:text-secondary motion-reduce:transition-none"
          href={href}
        >
          Watch sermon
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
