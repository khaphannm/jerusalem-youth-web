import Link from "next/link";

import { ContentImage } from "@/components/ui/content-image";
import type { Story } from "@/lib/cms/domain";

type StoryCardProps = Readonly<{
  featured?: boolean;
  story: Story;
  locale?: "en" | "vi";
}>;

export function StoryCard({
  featured = false,
  story,
  locale = "en",
}: StoryCardProps) {
  const href = `/stories/${encodeURIComponent(story.slug)}`;
  const articleClasses = featured
    ? "overflow-hidden rounded-large border border-border bg-background md:grid md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
    : "flex h-full flex-col overflow-hidden rounded-medium border border-border bg-background";
  const contentClasses = featured
    ? "flex flex-col justify-center p-6 sm:p-10"
    : "flex flex-1 flex-col p-5";

  return (
    <article className={articleClasses}>
      <ContentImage
        asset={story.featuredImage}
        className={
          featured
            ? "aspect-[4/3] h-full w-full object-cover md:aspect-auto"
            : "aspect-[4/3] w-full object-cover"
        }
        sizes={
          featured
            ? "(min-width: 1280px) 768px, (min-width: 768px) 60vw, 100vw"
            : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        }
      />
      <div className={contentClasses}>
        {story.personDisplayName ? (
          <p className="font-label text-label font-bold uppercase text-secondary">
            <span className="sr-only">
              {locale === "vi" ? "Chia sẻ bởi " : "Story shared by "}
            </span>
            {story.personDisplayName}
          </p>
        ) : null}
        <h3
          className={`mt-3 font-heading font-bold ${
            featured ? "text-heading-3" : "text-body-large"
          }`}
        >
          <Link
            className="rounded-small transition-colors duration-fast ease-standard hover:text-primary motion-reduce:transition-none"
            href={href}
          >
            {story.title}
          </Link>
        </h3>
        <p className="mt-3 flex-1 text-body-small text-muted">
          {story.summary}
        </p>
        <Link
          className="mt-5 inline-flex min-h-11 w-fit items-center rounded-small py-2 font-label text-label font-bold text-primary transition-colors duration-fast ease-standard hover:text-secondary motion-reduce:transition-none"
          href={href}
        >
          {locale === "vi" ? "Đọc câu chuyện" : "Read story"}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
