import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EventsPage, { generateMetadata } from "@/app/events/page";
import type { Event, MediaAsset, SiteSettings } from "@/lib/cms/domain";

const { loadEventListingMock, loadEventSiteSettingsMock } = vi.hoisted(() => ({
  loadEventListingMock: vi.fn(),
  loadEventSiteSettingsMock: vi.fn(),
}));

vi.mock("@/features/events/data", () => ({
  loadEventListing: loadEventListingMock,
  loadEventSiteSettings: loadEventSiteSettingsMock,
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
  title: string,
  startDateTime: string,
): Event => ({
  id,
  title,
  slug: id,
  summary: "A youth ministry gathering.",
  description: [
    {
      type: "paragraph",
      children: [{ type: "text", text: "Event description" }],
    },
  ],
  banner,
  startDateTime,
  endDateTime: null,
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

const upcomingEvent = createEvent(
  "summer-gathering",
  "Summer gathering",
  "2026-09-01T10:00:00.000Z",
);
const pastEvent = createEvent(
  "service-day",
  "Service day",
  "2026-08-01T10:00:00.000Z",
);

const siteSettings = {
  siteName: "Jerusalem Youth",
  siteDescription: "A community growing in faith.",
  defaultSeo: {
    metaTitle: null,
    metaDescription: null,
    canonical: null,
    socialImage: banner,
    noIndex: false,
  },
  defaultSocialImage: null,
  organizationContact: null,
  primaryCallToAction: null,
  footerContent: null,
} satisfies SiteSettings;

describe("EventsPage", () => {
  beforeEach(() => {
    loadEventListingMock.mockReset();
    loadEventSiteSettingsMock.mockReset();
  });

  it("renders upcoming and past event cards in separate sections", async () => {
    loadEventListingMock.mockResolvedValue({
      groups: { past: [pastEvent], upcoming: [upcomingEvent] },
      status: "ready",
    });

    render(await EventsPage());

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Events worth showing up for",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/All event times are shown in UTC\.$/),
    ).toBeInTheDocument();

    const upcomingSection = screen
      .getByRole("heading", { level: 2, name: "Upcoming events" })
      .closest("section");
    const pastSection = screen
      .getByRole("heading", { level: 2, name: "Past events" })
      .closest("section");

    expect(upcomingSection).not.toBeNull();
    expect(pastSection).not.toBeNull();
    expect(
      within(upcomingSection!).getByRole("link", { name: "Summer gathering" }),
    ).toHaveAttribute("href", "/events/summer-gathering");
    expect(within(upcomingSection!).getByText("Youth Hall")).toBeInTheDocument();
    expect(within(upcomingSection!).getByRole("img")).toHaveAttribute(
      "alt",
      "Young people gathering together",
    );
    expect(within(upcomingSection!).getByText(/UTC$/)).toHaveAttribute(
      "datetime",
      upcomingEvent.startDateTime,
    );
    expect(
      within(pastSection!).getByRole("link", { name: "Service day" }),
    ).toBeInTheDocument();
  });

  it("renders useful empty states for both event groups", async () => {
    loadEventListingMock.mockResolvedValue({
      groups: { past: [], upcoming: [] },
      status: "ready",
    });

    render(await EventsPage());

    expect(screen.getByText("The next event is on the way")).toBeInTheDocument();
    expect(screen.getByText("No past events yet")).toBeInTheDocument();
  });

  it("distinguishes a CMS failure from valid empty groups", async () => {
    loadEventListingMock.mockResolvedValue({ status: "error" });

    render(await EventsPage());

    expect(
      screen.getByText("Events are temporarily unavailable"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute(
      "href",
      "/events",
    );
    expect(
      screen.queryByRole("heading", { level: 2, name: "Past events" }),
    ).not.toBeInTheDocument();
  });

  it("builds social metadata from Site Settings", async () => {
    loadEventSiteSettingsMock.mockResolvedValue(siteSettings);

    await expect(generateMetadata()).resolves.toMatchObject({
      description:
        "Find upcoming youth ministry gatherings, see when and where we meet, and revisit past events.",
      openGraph: {
        images: [{ url: banner.url }],
        siteName: "Jerusalem Youth",
        title: "Events | Jerusalem Youth",
        type: "website",
      },
      title: "Events",
      twitter: {
        card: "summary_large_image",
        title: "Events | Jerusalem Youth",
      },
    });
  });
});
