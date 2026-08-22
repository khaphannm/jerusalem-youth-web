import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadHomePageData } from "@/features/home/data";
import type {
  CollectionResult,
  Event,
  MediaAsset,
  Story,
} from "@/lib/cms/domain";

const {
  articlesLatestMock,
  eventsUpcomingMock,
  sermonsLatestMock,
  siteSettingsMock,
  storiesLatestMock,
} = vi.hoisted(() => ({
  articlesLatestMock: vi.fn(),
  eventsUpcomingMock: vi.fn(),
  sermonsLatestMock: vi.fn(),
  siteSettingsMock: vi.fn(),
  storiesLatestMock: vi.fn(),
}));

vi.mock("@/lib/cms", () => ({
  getCmsClient: () => ({
    articles: { latest: articlesLatestMock },
    events: { upcoming: eventsUpcomingMock },
    sermons: { latest: sermonsLatestMock },
    siteSettings: siteSettingsMock,
    stories: { latest: storiesLatestMock },
  }),
}));

const media = {
  id: "image-1",
  name: "event.jpg",
  url: "https://media.example.test/event.jpg",
  alternativeText: "Youth gathering",
  mimeType: "image/jpeg",
  width: 1_600,
  height: 900,
  sizeInKilobytes: 100,
  variants: [],
} satisfies MediaAsset;

const event = {
  id: "event-1",
  title: "Youth Night",
  slug: "youth-night",
  summary: "A weekly gathering.",
  description: [{ type: "paragraph" }],
  banner: media,
  startDateTime: "2026-09-04T11:00:00.000Z",
  endDateTime: null,
  locationName: "Community Hall",
  address: null,
  mapUrl: null,
  registrationUrl: null,
  registrationDeadline: null,
  contactName: null,
  contactLink: null,
  gallery: [],
  featured: true,
  seo: null,
  publishedAt: "2026-08-20T00:00:00.000Z",
} satisfies Event;

const story = {
  id: "story-1",
  title: "A new beginning",
  slug: "a-new-beginning",
  summary: "A story from our community.",
  body: [{ type: "paragraph" }],
  featuredImage: media,
  personDisplayName: null,
  videoUrl: null,
  featured: false,
  seo: null,
  publishedAt: "2026-08-18T00:00:00.000Z",
} satisfies Story;

const collection = <T>(items: readonly T[]): CollectionResult<T> => ({
  items,
  pagination: {
    page: 1,
    pageCount: items.length > 0 ? 1 : 0,
    pageSize: Math.max(items.length, 1),
    total: items.length,
  },
});

describe("homepage data loading", () => {
  beforeEach(() => {
    articlesLatestMock.mockReset().mockResolvedValue(null);
    eventsUpcomingMock.mockReset();
    sermonsLatestMock.mockReset().mockResolvedValue(null);
    siteSettingsMock.mockReset().mockResolvedValue(null);
    storiesLatestMock.mockReset().mockResolvedValue(collection([]));
  });

  it("selects a featured event and removes it from the upcoming list", async () => {
    const otherEvent = {
      ...event,
      id: "event-2",
      title: "Serve Day",
      slug: "serve-day",
      featured: false,
    } satisfies Event;
    eventsUpcomingMock
      .mockResolvedValueOnce(collection([event]))
      .mockResolvedValueOnce(collection([event, otherEvent]));

    const result = await loadHomePageData(
      new Date("2026-08-22T00:00:00.000Z"),
    );

    expect(eventsUpcomingMock).toHaveBeenNthCalledWith(1, {
      featured: true,
      from: "2026-08-22T00:00:00.000Z",
      pageSize: 1,
    });
    expect(eventsUpcomingMock).toHaveBeenNthCalledWith(2, {
      from: "2026-08-22T00:00:00.000Z",
      pageSize: 4,
    });
    expect(result.featuredEvent).toBe(event);
    expect(result.upcomingEvents).toEqual([otherEvent]);
  });

  it("keeps successful sections when another CMS request fails", async () => {
    eventsUpcomingMock.mockResolvedValue(collection([]));
    articlesLatestMock.mockRejectedValue(new Error("Articles offline"));
    storiesLatestMock.mockResolvedValue(collection([story]));
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const result = await loadHomePageData(
      new Date("2026-08-22T00:00:00.000Z"),
    );

    expect(result.latestArticle).toBeNull();
    expect(result.stories).toEqual([story]);
    expect(errorSpy).toHaveBeenCalledWith(
      "Homepage latest article could not be loaded: Articles offline",
    );
  });
});
