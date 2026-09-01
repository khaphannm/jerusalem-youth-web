import "server-only";

import { getEventStatus } from "@/features/events/dates";
import { getCmsClient } from "@/lib/cms";
import type { Event, SiteSettings } from "@/lib/cms/domain";

export const eventListingPageSize = 100;

export type EventGroups = Readonly<{
  past: readonly Event[];
  upcoming: readonly Event[];
}>;

export type EventListingData =
  | Readonly<{ groups: EventGroups; status: "ready" }>
  | Readonly<{ status: "error" }>;

export type EventDetailData =
  | Readonly<{ event: Event; status: "found" }>
  | Readonly<{ status: "not-found" }>
  | Readonly<{ status: "error" }>;

function logEventDataError(source: string, error: unknown) {
  const reason = error instanceof Error ? error.message : "Unknown error.";

  console.error(`Events ${source} could not be loaded: ${reason}`);
}

const compareEventStarts = (left: Event, right: Event) =>
  Date.parse(left.startDateTime) - Date.parse(right.startDateTime);

export function groupEventsByDate(
  events: readonly Event[],
  now: Date,
): EventGroups {
  const upcoming: Event[] = [];
  const past: Event[] = [];

  for (const event of events) {
    (getEventStatus(event, now) === "upcoming" ? upcoming : past).push(event);
  }

  return {
    past: past.sort((left, right) => compareEventStarts(right, left)),
    upcoming: upcoming.sort(compareEventStarts),
  };
}

export async function loadEventListing(
  now = new Date(),
): Promise<EventListingData> {
  try {
    const client = getCmsClient();
    const firstPage = await client.events.list({
      page: 1,
      pageSize: eventListingPageSize,
    });
    const remainingPages = await Promise.all(
      Array.from(
        { length: Math.max(firstPage.pagination.pageCount - 1, 0) },
        (_, index) =>
          client.events.list({
            page: index + 2,
            pageSize: eventListingPageSize,
          }),
      ),
    );
    const events = [
      ...firstPage.items,
      ...remainingPages.flatMap((page) => page.items),
    ];

    return {
      groups: groupEventsByDate(events, now),
      status: "ready",
    };
  } catch (error) {
    logEventDataError("listing", error);
    return { status: "error" };
  }
}

export async function loadEventSiteSettings(): Promise<SiteSettings | null> {
  try {
    return await getCmsClient().siteSettings();
  } catch (error) {
    logEventDataError("metadata", error);
    return null;
  }
}

export const isValidEventSlug = (slug: string) =>
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

export async function loadEventDetail(slug: string): Promise<EventDetailData> {
  if (!isValidEventSlug(slug)) {
    return { status: "not-found" };
  }

  try {
    const event = await getCmsClient().events.findBySlug(slug);

    return event ? { event, status: "found" } : { status: "not-found" };
  } catch (error) {
    logEventDataError("detail", error);
    return { status: "error" };
  }
}
