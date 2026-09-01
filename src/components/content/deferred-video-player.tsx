"use client";

import { useState } from "react";

import { ContentImage } from "@/components/ui/content-image";
import type { MediaAsset } from "@/lib/cms/domain";
import type { ExternalVideoEmbed } from "@/lib/video";

type DeferredVideoPlayerProps = Readonly<{
  contentTitle: string;
  embed: ExternalVideoEmbed;
  playLabel: string;
  thumbnail: MediaAsset | null;
}>;

export function DeferredVideoPlayer({
  contentTitle,
  embed,
  playLabel,
  thumbnail,
}: DeferredVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (isPlaying) {
    return (
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="aspect-video h-auto w-full border-0"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        src={embed.embedUrl}
        title={`${contentTitle} on ${embed.provider}`}
      />
    );
  }

  return (
    <button
      aria-label={`Play ${contentTitle} video`}
      className="group relative block aspect-video w-full overflow-hidden bg-secondary text-secondary-foreground"
      onClick={() => setIsPlaying(true)}
      type="button"
    >
      {thumbnail ? (
        <ContentImage
          asset={thumbnail}
          className="h-full w-full object-cover"
          sizes="(min-width: 1024px) 70vw, 100vw"
        />
      ) : (
        <span className="flex h-full items-center justify-center p-8 font-heading text-heading-3 font-bold">
          {contentTitle}
        </span>
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-foreground/40">
        <span className="rounded-small bg-primary px-5 py-3 font-label text-label font-bold text-primary-foreground transition-colors duration-fast ease-standard group-hover:bg-secondary motion-reduce:transition-none">
          {playLabel}
          <span aria-hidden="true"> ▶</span>
        </span>
      </span>
    </button>
  );
}
