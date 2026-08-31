import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  eventListingPageSize,
  groupEventsByDate,
  loadEventListing,
} from "@/features/events/data";
import type { Event, MediaAsset } from "@/lib/cms/domain";

const { eventsListMock } = vi.hoisted(() => ({
  eventsListMock: vi.fn(),
}));

vi.mock("@/lib/cms", () => ({
  getCmsClient: () => ({
    events: { list: eventsListMock },
    siteSettings: vi.fn(),
  }),
}));

const banner = {
  id: "event-banner",
  name: "gathering.jpg",
  url: "https://media.example.test/gathering.jpg",
  alternativeText: "Young people gathering together",
  mimeType: "image/jpeg",
  width: 1_600,
  height: 900,
  sizeInKilobytes: 180,
  variants: [],
} satisfies MediaAsset;

const createEvent = (
  id: string,
  startDateTime: string,
  endDateTime: string | null = null,
): Event => ({
  id,
  title: `Event ${id}`,
  slug: `event-${id}`,
  summary: "A youth ministry gathering.",
  description: [
    {
      type: "paragraph",
      children: [{ type: "text", text: "Event description" }],
    },
  ],
  banner,
  startDateTime,
  endDateTime,
  locationName: "Youth Hall",
  address: null,
  mapUrl: null,
  registrationUrl: null,
  registrationDeadline: null,
  contactName: null,
  contactLink: null,
  gallery: [],
  featured: false,
  seo: null,
  publishedAt: "2026-08-01T00:00:00.000Z",
});

describe("event data", () => {
  beforeEach(() => {
    eventsListMock.mockReset();
  });

  it("keeps an in-progress event upcoming and orders both groups", () => {
    const groups = groupEventsByDate(
      [
        createEvent("future-later", "2026-09-03T12:00:00.000Z"),
        createEvent("past-older", "2026-08-20T12:00:00.000Z"),
        createEvent(
          "in-progress",
          "2026-08-31T10:00:00.000Z",
          "2026-08-31T14:00:00.000Z",
        ),
        createEvent("future-sooner", "2026-09-01T12:00:00.000Z"),
        createEvent("past-newer", "2026-08-30T12:00:00.000Z"),
      ],
      new Date("2026-08-31T12:00:00.000Z"),
    );

    expect(groups.upcoming.map((event) => event.id)).toEqual([
      "in-progress",
      "future-sooner",
      "future-later",
    ]);
    expect(groups.past.map((event) => event.id)).toEqual([
      "past-newer",
      "past-older",
    ]);
  });

  it("retrieves every CMS page before grouping the listing", async () => {
    const future = createEvent("future", "2026-09-01T12:00:00.000Z");
    const past = createEvent("past", "2026-08-01T12:00:00.000Z");
    const later = createEvent("later", "2026-09-02T12:00:00.000Z");
    eventsListMock
      .mockResolvedValueOnce({
        items: [future],
        pagination: {
          page: 1,
          pageCount: 3,
          pageSize: eventListingPageSize,
          total: 3,
        },
      })
      .mockResolvedValueOnce({
        items: [past],
        pagination: {
          page: 2,
          pageCount: 3,
          pageSize: eventListingPageSize,
          total: 3,
        },
      })
      .mockResolvedValueOnce({
        items: [later],
        pagination: {
          page: 3,
          pageCount: 3,
          pageSize: eventListingPageSize,
          total: 3,
        },
      });

    await expect(
      loadEventListing(new Date("2026-08-31T12:00:00.000Z")),
    ).resolves.toEqual({
      groups: {
        past: [past],
        upcoming: [future, later],
      },
      status: "ready",
    });
    expect(eventsListMock).toHaveBeenCalledTimes(3);
    expect(eventsListMock).toHaveBeenNthCalledWith(1, {
      page: 1,
      pageSize: eventListingPageSize,
    });
    expect(eventsListMock).toHaveBeenNthCalledWith(2, {
      page: 2,
      pageSize: eventListingPageSize,
    });
    expect(eventsListMock).toHaveBeenNthCalledWith(3, {
      page: 3,
      pageSize: eventListingPageSize,
    });
  });

  it("returns a controlled error state when any CMS page fails", async () => {
    eventsListMock.mockRejectedValue(new Error("Events offline"));
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(loadEventListing()).resolves.toEqual({ status: "error" });
    expect(errorSpy).toHaveBeenCalledWith(
      "Events listing could not be loaded: Events offline",
    );
  });
});
