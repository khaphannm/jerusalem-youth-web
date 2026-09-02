import Link from "next/link";

import { DeferredVideoPlayer } from "@/components/content/deferred-video-player";
import { ContentImage } from "@/components/ui/content-image";
import { LinkButton } from "@/components/ui/link-button";
import type { MediaItem } from "@/features/media/data";
import { getExternalVideoEmbed } from "@/lib/video";

export function MediaCard({ item }: Readonly<{ item: MediaItem }>) {
  const videoEmbed =
    item.kind === "video" ? getExternalVideoEmbed(item.videoUrl) : null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-medium border border-border bg-background">
      <div className="overflow-hidden bg-secondary">
        {item.kind === "image" ? (
          <ContentImage
            asset={item.asset}
            className="aspect-[4/3] w-full object-cover"
            loading="lazy"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : videoEmbed ? (
          <DeferredVideoPlayer
            contentTitle={item.title}
            embed={videoEmbed}
            playLabel="Play video"
            thumbnail={item.thumbnail}
          />
        ) : item.thumbnail ? (
          <div className="relative">
            <ContentImage
              asset={item.thumbnail}
              className="aspect-video w-full object-cover"
              loading="lazy"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/40 p-6">
              <LinkButton href={item.videoUrl} variant="secondary">
                Watch video
              </LinkButton>
            </div>
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center p-8 text-center text-secondary-foreground">
            <LinkButton href={item.videoUrl}>Watch video</LinkButton>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="font-label text-label font-bold uppercase text-primary">
          {item.kind === "image" ? "Photo" : "Video"}
          <span aria-hidden="true"> · </span>
          {item.contextLabel}
        </p>
        <h3 className="mt-3 font-heading text-body-large font-bold">
          <Link
            className="rounded-small transition-colors duration-fast ease-standard hover:text-primary motion-reduce:transition-none"
            href={item.detailHref}
          >
            {item.title}
          </Link>
        </h3>
        <p className="mt-3 flex-1 text-body-small text-muted">
          {item.description}
        </p>
        <Link
          className="mt-5 inline-flex min-h-11 w-fit items-center rounded-small py-2 font-label text-label font-bold text-primary transition-colors duration-fast ease-standard hover:text-secondary motion-reduce:transition-none"
          href={item.detailHref}
        >
          View {item.contextLabel.toLowerCase()}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
