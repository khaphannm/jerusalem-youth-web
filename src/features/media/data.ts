import "server-only";

import { getCmsClient } from "@/lib/cms";
import type {
  Event,
  MediaAsset,
  Sermon,
  Story,
} from "@/lib/cms/domain";

export const mediaSourcePageSize = 8;
export const mediaPageSize = 18;
export const maximumMediaImageWidth = 1_600;

type MediaItemBase = Readonly<{
  contextLabel: "Event" | "Sermon" | "Story";
  description: string;
  detailHref: string;
  id: string;
  publishedAt: string;
  title: string;
}>;

export type MediaImageItem = MediaItemBase &
  Readonly<{
    asset: MediaAsset;
    kind: "image";
  }>;

export type MediaVideoItem = MediaItemBase &
  Readonly<{
    kind: "video";
    thumbnail: MediaAsset | null;
    videoUrl: string;
  }>;

export type MediaItem = MediaImageItem | MediaVideoItem;

export type MediaListingData = Readonly<{
  items: readonly MediaItem[];
  unavailableSourceCount: number;
}> | null;

type MediaSources = Readonly<{
  events: readonly Event[];
  sermons: readonly Sermon[];
  stories: readonly Story[];
}>;

const prepareApprovedImage = (asset: MediaAsset): MediaAsset | null => {
  if (
    !asset.mimeType.toLowerCase().startsWith("image/") ||
    !asset.alternativeText?.trim()
  ) {
    return null;
  }

  const sources = [
    ...asset.variants.filter(
      ({ width }) => width <= maximumMediaImageWidth,
    ),
    ...(asset.width &&
    asset.height &&
    asset.width <= maximumMediaImageWidth
      ? [{ height: asset.height, url: asset.url, width: asset.width }]
      : []),
  ]
    .filter(
      (source, index, candidates) =>
        candidates.findIndex(({ width }) => width === source.width) === index,
    )
    .sort((left, right) => left.width - right.width);
  const largestSource = sources.at(-1);

  if (!largestSource) {
    return null;
  }

  return {
    ...asset,
    height: largestSource.height,
    url: largestSource.url,
    variants: sources.slice(0, -1),
    width: largestSource.width,
  };
};

export function buildMediaItems({
  events,
  sermons,
  stories,
}: MediaSources): readonly MediaItem[] {
  const candidates: MediaItem[] = [];

  for (const event of events) {
    const detailHref = `/events/${encodeURIComponent(event.slug)}`;
    const images = [event.banner, ...event.gallery];

    for (const asset of images) {
      const approvedAsset = prepareApprovedImage(asset);

      if (!approvedAsset) {
        continue;
      }
      candidates.push({
        asset: approvedAsset,
        contextLabel: "Event",
        description: event.summary,
        detailHref,
        id: `event:${event.id}:image:${asset.id}`,
        kind: "image",
        publishedAt: event.publishedAt,
        title: event.title,
      });
    }
  }

  for (const sermon of sermons) {
    const approvedThumbnail = sermon.thumbnail
      ? prepareApprovedImage(sermon.thumbnail)
      : null;

    candidates.push({
      contextLabel: "Sermon",
      description: sermon.summary,
      detailHref: `/sermons/${encodeURIComponent(sermon.slug)}`,
      id: `sermon:${sermon.id}:video`,
      kind: "video",
      publishedAt: sermon.publishedAt,
      thumbnail: approvedThumbnail,
      title: sermon.title,
      videoUrl: sermon.videoUrl,
    });
  }

  for (const story of stories) {
    const detailHref = `/stories/${encodeURIComponent(story.slug)}`;

    const approvedFeaturedImage = prepareApprovedImage(story.featuredImage);

    if (approvedFeaturedImage) {
      candidates.push({
        asset: approvedFeaturedImage,
        contextLabel: "Story",
        description: story.summary,
        detailHref,
        id: `story:${story.id}:image:${story.featuredImage.id}`,
        kind: "image",
        publishedAt: story.publishedAt,
        title: story.title,
      });
    }

    if (story.videoUrl) {
      candidates.push({
        contextLabel: "Story",
        description: story.summary,
        detailHref,
        id: `story:${story.id}:video`,
        kind: "video",
        publishedAt: story.publishedAt,
        thumbnail: approvedFeaturedImage,
        title: story.title,
        videoUrl: story.videoUrl,
      });
    }
  }

  const seenSources = new Set<string>();

  return candidates
    .sort(
      (left, right) =>
        Date.parse(right.publishedAt) - Date.parse(left.publishedAt),
    )
    .filter((item) => {
      const source =
        item.kind === "image" ? item.asset.url : item.videoUrl;
      const key = `${item.kind}:${source}`;

      if (seenSources.has(key)) {
        return false;
      }
      seenSources.add(key);
      return true;
    })
    .slice(0, mediaPageSize);
}

const logMediaDataError = (source: string, error: unknown) => {
  const reason = error instanceof Error ? error.message : "Unknown error.";

  console.error(`Media ${source} could not be loaded: ${reason}`);
};

export async function loadMediaListing(): Promise<MediaListingData> {
  const client = getCmsClient();
  const [events, sermons, stories] = await Promise.all([
    client.events
      .list({ pageSize: mediaSourcePageSize })
      .catch((error: unknown) => {
        logMediaDataError("events", error);
        return null;
      }),
    client.sermons
      .list({ pageSize: mediaSourcePageSize })
      .catch((error: unknown) => {
        logMediaDataError("sermons", error);
        return null;
      }),
    client.stories
      .list({ pageSize: mediaSourcePageSize })
      .catch((error: unknown) => {
        logMediaDataError("stories", error);
        return null;
      }),
  ]);

  const unavailableSourceCount = [events, sermons, stories].filter(
    (source) => source === null,
  ).length;

  if (unavailableSourceCount === 3) {
    return null;
  }

  return {
    items: buildMediaItems({
      events: events?.items ?? [],
      sermons: sermons?.items ?? [],
      stories: stories?.items ?? [],
    }),
    unavailableSourceCount,
  };
}
