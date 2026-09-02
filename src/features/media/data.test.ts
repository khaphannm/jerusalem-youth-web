import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildMediaItems,
  loadMediaListing,
  maximumMediaImageWidth,
  mediaSourcePageSize,
} from "@/features/media/data";
import type { Event, MediaAsset, Sermon, Story } from "@/lib/cms/domain";

const { eventsListMock, sermonsListMock, storiesListMock } = vi.hoisted(() => ({
  eventsListMock: vi.fn(),
  sermonsListMock: vi.fn(),
  storiesListMock: vi.fn(),
}));

vi.mock("@/lib/cms", () => ({
  getCmsClient: () => ({
    events: { list: eventsListMock },
    sermons: { list: sermonsListMock },
    stories: { list: storiesListMock },
  }),
}));

const image = {
  id: "image-1",
  name: "gathering.jpg",
  url: "https://media.example.test/gathering.jpg",
  alternativeText: "Young people talking after a gathering",
  mimeType: "image/jpeg",
  width: 1_600,
  height: 900,
  sizeInKilobytes: 180,
  variants: [
    {
      height: 450,
      url: "https://media.example.test/gathering-small.jpg",
      width: 800,
    },
  ],
} satisfies MediaAsset;

const event = {
  id: "event-1",
  title: "Friday night gathering",
  slug: "friday-night-gathering",
  summary: "An evening of worship and friendship.",
  description: [
    { type: "paragraph", children: [{ type: "text", text: "Join us." }] },
  ],
  banner: image,
  startDateTime: "2026-09-04T11:30:00.000Z",
  endDateTime: null,
  locationName: "Youth Hall",
  address: null,
  mapUrl: null,
  registrationUrl: null,
  registrationDeadline: null,
  contactName: null,
  contactLink: null,
  gallery: [
    {
      ...image,
      id: "unapproved-image",
      url: "https://media.example.test/no-alt.jpg",
      alternativeText: null,
    },
  ],
  featured: true,
  seo: null,
  publishedAt: "2026-08-30T00:00:00.000Z",
} satisfies Event;

const sermon = {
  id: "sermon-1",
  title: "Hope that holds",
  slug: "hope-that-holds",
  speaker: "Ministry Team",
  date: "2026-08-30",
  summary: "Discover a hope that remains steady.",
  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  series: null,
  biblePassage: null,
  audioUrl: null,
  thumbnail: image,
  notesUrl: null,
  seo: null,
  publishedAt: "2026-09-01T00:00:00.000Z",
} satisfies Sermon;

const story = {
  id: "story-1",
  title: "Finding a place to belong",
  slug: "finding-a-place-to-belong",
  summary: "A story about friendship and community.",
  body: [
    { type: "paragraph", children: [{ type: "text", text: "Welcome." }] },
  ],
  featuredImage: {
    ...image,
    id: "story-image",
    url: "https://media.example.test/story.jpg",
  },
  personDisplayName: null,
  videoUrl: sermon.videoUrl,
  featured: true,
  seo: null,
  publishedAt: "2026-08-31T00:00:00.000Z",
} satisfies Story;

describe("media data", () => {
  beforeEach(() => {
    eventsListMock.mockReset();
    sermonsListMock.mockReset();
    storiesListMock.mockReset();
  });

  it("builds newest-first media from approved images and videos", () => {
    const items = buildMediaItems({
      events: [event],
      sermons: [sermon],
      stories: [story],
    });

    expect(items.map(({ kind, title }) => `${kind}:${title}`)).toEqual([
      "video:Hope that holds",
      "image:Finding a place to belong",
      "image:Friday night gathering",
    ]);
    expect(
      items.some((item) =>
        item.kind === "image"
          ? item.asset.url.includes("no-alt")
          : false,
      ),
    ).toBe(false);
    expect(items.filter(({ kind }) => kind === "video")).toHaveLength(1);
    expect(
      items
        .filter((item) => item.kind === "image")
        .every((item) => (item.asset.width ?? Infinity) <= maximumMediaImageWidth),
    ).toBe(true);
  });

  it("omits an oversized original that has no bounded responsive source", () => {
    const oversizedEvent = {
      ...event,
      banner: {
        ...image,
        height: 4_500,
        variants: [],
        width: 8_000,
      },
      gallery: [],
    } satisfies Event;

    expect(
      buildMediaItems({
        events: [oversizedEvent],
        sermons: [],
        stories: [],
      }),
    ).toEqual([]);
  });

  it("loads each published source concurrently with a bounded page size", async () => {
    eventsListMock.mockResolvedValue({ items: [event] });
    sermonsListMock.mockResolvedValue({ items: [sermon] });
    storiesListMock.mockResolvedValue({ items: [story] });

    const result = await loadMediaListing();

    expect(result?.items).toHaveLength(3);
    expect(result?.unavailableSourceCount).toBe(0);
    expect(eventsListMock).toHaveBeenCalledExactlyOnceWith({
      pageSize: mediaSourcePageSize,
    });
    expect(sermonsListMock).toHaveBeenCalledExactlyOnceWith({
      pageSize: mediaSourcePageSize,
    });
    expect(storiesListMock).toHaveBeenCalledExactlyOnceWith({
      pageSize: mediaSourcePageSize,
    });
  });

  it("keeps available published media when one source fails", async () => {
    eventsListMock.mockRejectedValue(new Error("Events offline"));
    sermonsListMock.mockResolvedValue({ items: [sermon] });
    storiesListMock.mockResolvedValue({ items: [] });
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(loadMediaListing()).resolves.toMatchObject({
      unavailableSourceCount: 1,
    });
    expect(errorSpy).toHaveBeenCalledWith(
      "Media events could not be loaded: Events offline",
    );
  });

  it("returns a controlled failure only when every source is unavailable", async () => {
    eventsListMock.mockRejectedValue(new Error("offline"));
    sermonsListMock.mockRejectedValue(new Error("offline"));
    storiesListMock.mockRejectedValue(new Error("offline"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(loadMediaListing()).resolves.toBeNull();
  });
});
