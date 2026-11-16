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
        name: "Những buổi gặp gỡ đáng để có mặt",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Thời gian hiển thị theo giờ Việt Nam\.$/),
    ).toBeInTheDocument();

    const upcomingSection = screen
      .getByRole("heading", { level: 2, name: "Sự kiện sắp tới" })
      .closest("section");
    const pastSection = screen
      .getByRole("heading", { level: 2, name: "Sự kiện đã qua" })
      .closest("section");

    expect(upcomingSection).not.toBeNull();
    expect(pastSection).not.toBeNull();
    expect(
      within(upcomingSection!).getByRole("link", { name: "Summer gathering" }),
    ).toHaveAttribute("href", "/events/summer-gathering");
    expect(within(upcomingSection!).getByText("Sắp diễn ra")).toBeInTheDocument();
    expect(within(upcomingSection!).getByText("Youth Hall")).toBeInTheDocument();
    expect(within(upcomingSection!).getByRole("img")).toHaveAttribute(
      "alt",
      "Young people gathering together",
    );
    expect(within(upcomingSection!).getByText(/tháng \d+, \d{4}$/)).toHaveAttribute(
      "datetime",
      upcomingEvent.startDateTime,
    );
    expect(
      within(pastSection!).getByRole("link", { name: "Service day" }),
    ).toBeInTheDocument();
    expect(within(pastSection!).getByText("Đã diễn ra")).toBeInTheDocument();
  });

  it("renders useful empty states for both event groups", async () => {
    loadEventListingMock.mockResolvedValue({
      groups: { past: [], upcoming: [] },
      status: "ready",
    });

    render(await EventsPage());

    expect(screen.getByText("Sự kiện tiếp theo sắp được công bố")).toBeInTheDocument();
    expect(screen.getByText("Chưa có sự kiện đã qua")).toBeInTheDocument();
  });

  it("distinguishes a CMS failure from valid empty groups", async () => {
    loadEventListingMock.mockResolvedValue({ status: "error" });

    render(await EventsPage());

    expect(
      screen.getByText("Tạm thời chưa xem được sự kiện"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Thử lại" })).toHaveAttribute(
      "href",
      "/events",
    );
    expect(
      screen.queryByRole("heading", { level: 2, name: "Sự kiện đã qua" }),
    ).not.toBeInTheDocument();
  });

  it("builds social metadata from Site Settings", async () => {
    loadEventSiteSettingsMock.mockResolvedValue(siteSettings);

    await expect(generateMetadata()).resolves.toMatchObject({
      description:
        "Xem các buổi gặp gỡ sắp tới của ban thanh niên, thời gian, địa điểm và những sự kiện đã diễn ra.",
      openGraph: {
        images: [{ url: banner.url }],
        siteName: "Jerusalem Youth",
        title: "Sự kiện | Jerusalem Youth",
        type: "website",
      },
      title: "Sự kiện",
      twitter: {
        card: "summary_large_image",
        title: "Sự kiện | Jerusalem Youth",
      },
    });
  });
});
