import Link from "next/link";

import { ContentImage } from "@/components/ui/content-image";
import { SafeLink } from "@/components/ui/safe-link";
import { getResourcePresentation } from "@/features/resources/source";
import type { Resource } from "@/lib/cms/domain";

export function ResourceCard({ resource }: Readonly<{ resource: Resource }>) {
  const detailHref = `/resources/${encodeURIComponent(resource.slug)}`;
  const source = getResourcePresentation(resource);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-medium border border-border bg-background">
      {resource.thumbnail ? (
        <ContentImage
          asset={resource.thumbnail}
          className="aspect-[4/3] w-full object-cover"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex aspect-[4/3] items-end bg-secondary p-6 font-heading text-heading-3 font-bold text-secondary-foreground"
        >
          {source.typeLabel}
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <p className="font-label text-label font-bold uppercase text-primary">
          {resource.category.name}
          <span aria-hidden="true"> · </span>
          {source.typeLabel}
        </p>
        <h3 className="mt-4 font-heading text-heading-3 font-bold">
          <Link
            className="rounded-small transition-colors duration-fast ease-standard hover:text-primary motion-reduce:transition-none"
            href={detailHref}
          >
            {resource.title}
          </Link>
        </h3>
        <p className="mt-3 flex-1 text-body-small text-muted">
          {resource.description}
        </p>
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
          <Link
            className="inline-flex min-h-11 items-center rounded-small py-2 font-label text-label font-bold text-primary transition-colors duration-fast ease-standard hover:text-secondary motion-reduce:transition-none"
            href={detailHref}
          >
            View details
            <span aria-hidden="true">→</span>
          </Link>
          <SafeLink
            aria-label={`${source.actionLabel}: ${resource.title}`}
            className="inline-flex min-h-11 items-center rounded-small py-2 font-label text-label font-bold text-secondary transition-colors duration-fast ease-standard hover:text-primary motion-reduce:transition-none"
            href={source.destination}
          >
            {source.actionLabel}
            <span aria-hidden="true">↗</span>
          </SafeLink>
        </div>
      </div>
    </article>
  );
}
