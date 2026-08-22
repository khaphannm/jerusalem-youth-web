import Link from "next/link";

import { ContentImage } from "@/components/ui/content-image";
import type { Story } from "@/lib/cms/domain";

export function StoryCard({ story }: Readonly<{ story: Story }>) {
  const href = `/stories/${encodeURIComponent(story.slug)}`;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-medium border border-border bg-background">
      <ContentImage
        asset={story.featuredImage}
        className="aspect-[4/3] w-full object-cover"
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      />
      <div className="flex flex-1 flex-col p-5">
        {story.personDisplayName ? (
          <p className="font-label text-label font-bold uppercase text-secondary">
            {story.personDisplayName}
          </p>
        ) : null}
        <h3 className="mt-3 font-heading text-body-large font-bold">
          <Link
            className="rounded-small transition-colors duration-fast ease-standard hover:text-primary motion-reduce:transition-none"
            href={href}
          >
            {story.title}
          </Link>
        </h3>
        <p className="mt-3 flex-1 text-body-small text-muted">{story.summary}</p>
        <Link
          className="mt-5 inline-flex min-h-11 w-fit items-center rounded-small py-2 font-label text-label font-bold text-primary transition-colors duration-fast ease-standard hover:text-secondary motion-reduce:transition-none"
          href={href}
        >
          Read story
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
