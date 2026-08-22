import Link from "next/link";

import { ContentImage } from "@/components/ui/content-image";
import type { Event } from "@/lib/cms/domain";
import { formatEventDateTime } from "@/lib/format-date";

type EventCardProps = Readonly<{
  event: Event;
  featured?: boolean;
}>;

export function EventCard({ event, featured = false }: EventCardProps) {
  const href = `/events/${encodeURIComponent(event.slug)}`;
  const articleClasses = featured
    ? "overflow-hidden rounded-large border border-primary-foreground/20 bg-secondary text-secondary-foreground lg:grid lg:grid-cols-2"
    : "flex h-full flex-col overflow-hidden rounded-medium border border-border bg-background text-foreground";
  const imageClasses = featured
    ? "aspect-[4/3] h-full w-full object-cover lg:aspect-auto"
    : "aspect-[4/3] w-full object-cover";

  return (
    <article className={articleClasses}>
      <ContentImage
        asset={event.banner}
        className={imageClasses}
        sizes={featured ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
      />
      <div
        className={featured ? "flex flex-col justify-center p-6 sm:p-10" : "flex flex-1 flex-col p-5"}
      >
        <p className="w-fit rounded-small bg-accent px-2 py-1 font-label text-label font-bold uppercase text-accent-foreground">
          <time dateTime={event.startDateTime}>
            {formatEventDateTime(event.startDateTime)}
          </time>
        </p>
        <h3
          className={`${featured ? "mt-4 text-heading-3" : "mt-3 text-body-large"} font-heading font-bold`}
        >
          <Link
            className="rounded-small transition-colors duration-fast ease-standard hover:text-primary motion-reduce:transition-none"
            href={href}
          >
            {event.title}
          </Link>
        </h3>
        <p
          className={`mt-3 ${featured ? "text-secondary-foreground/80" : "text-muted"}`}
        >
          {event.summary}
        </p>
        <p
          className={`mt-4 font-label text-label font-semibold ${featured ? "text-calm" : "text-secondary"}`}
        >
          {event.locationName}
        </p>
        <Link
          className={`mt-6 inline-flex min-h-11 w-fit items-center rounded-small py-2 font-label text-label font-bold transition-colors duration-fast ease-standard motion-reduce:transition-none ${featured ? "text-primary-foreground hover:text-calm" : "text-primary hover:text-secondary"}`}
          href={href}
        >
          View event
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
