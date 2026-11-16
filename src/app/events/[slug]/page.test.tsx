import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EventNotFound from "@/app/events/[slug]/not-found";
import EventPage, { generateMetadata } from "@/app/events/[slug]/page";
import { buildEventStructuredData } from "@/features/events/structured-data";
import type { Event, MediaAsset } from "@/lib/cms/domain";
import { serializeStructuredData } from "@/lib/seo/structured-data";

const { loadEventDetailMock, notFoundMock } = vi.hoisted(() => ({
  loadEventDetailMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("@/features/events/data", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/features/events/data")>();

  return {
    ...original,
    loadEventDetail: loadEventDetailMock,
  };
});

const banner = {
  id: "event-banner",
  name: "gathering.jpg",
  url: "https://media.example.test/gathering.jpg",
  alternativeText: "Young people worshipping together",
  mimeType: "image/jpeg",
  width: 1_600,
  height: 900,
  sizeInKilobytes: 180,
  variants: [],
} satisfies MediaAsset;

const galleryImage = {
  ...banner,
  id: "gallery-image",
  name: "community.jpg",
  url: "https://media.example.test/community.jpg",
  alternativeText: "Friends talking after the gathering",
} satisfies MediaAsset;

const event = {
  id: "event-1",
  title: "Friday night gathering",
  slug: "friday-night-gathering",
  summary: "An evening of worship, friendship, and faith.",
  description: [
    {
      type: "paragraph",
      children: [{ type: "text", text: "Come as you are and bring a friend." }],
    },
    {
      type: "heading",
      level: 2,
      children: [{ type: "text", text: "What to expect" }],
    },
  ],
  banner,
  startDateTime: "2099-09-04T11:30:00.000Z",
  endDateTime: "2099-09-04T13:30:00.000Z",
  locationName: "Jerusalem Youth Hall",
  address: "123 Community Street",
  mapUrl: "https://maps.example.test/youth-hall",
  registrationUrl: "https://register.example.test/friday-night",
  registrationDeadline: "2099-09-03T11:30:00.000Z",
  contactName: "Youth Team",
  contactLink: "mailto:youth@example.test",
  gallery: [galleryImage],
  featured: true,
  seo: {
    metaTitle: "Friday gathering for young people",
    metaDescription: "Join the next Friday night youth gathering.",
    canonical: "https://youth.example.test/events/friday-night-gathering",
    socialImage: null,
    noIndex: true,
  },
  publishedAt: "2026-08-20T00:00:00.000Z",
} satisfies Event;

const pageProps = {
  params: Promise.resolve({ slug: event.slug }),
};

describe("EventPage", () => {
  beforeEach(() => {
    loadEventDetailMock.mockReset();
    notFoundMock.mockClear();
  });

  it("renders event content, practical details, registration, and gallery", async () => {
    loadEventDetailMock.mockResolvedValue({ event, status: "found" });

    render(await EventPage(pageProps));

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Friday night gathering",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Sắp diễn ra")).toBeInTheDocument();
    expect(
      screen.getByText("Come as you are and bring a friend."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "What to expect" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: banner.alternativeText }),
    ).toBeInTheDocument();
    expect(screen.getByText("Jerusalem Youth Hall")).toBeInTheDocument();
    expect(screen.getByText("123 Community Street")).toBeInTheDocument();
    expect(screen.getByText("18:30, 4 tháng 9, 2099")).toHaveAttribute(
      "datetime",
      event.startDateTime,
    );
    expect(screen.getByText("20:30, 4 tháng 9, 2099")).toHaveAttribute(
      "datetime",
      event.endDateTime,
    );
    expect(screen.getByRole("link", { name: "Xem bản đồ" })).toHaveAttribute(
      "href",
      event.mapUrl,
    );
    expect(
      screen.getByRole("link", { name: "Liên hệ Youth Team" }),
    ).toHaveAttribute("href", event.contactLink);
    expect(
      screen.getByRole("heading", { name: "Đang mở đăng ký" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Đăng ký tham gia" }),
    ).toHaveAttribute("href", event.registrationUrl);
    expect(
      screen.getByRole("img", { name: galleryImage.alternativeText }),
    ).toBeInTheDocument();

    const nextSection = screen.getByRole("region", {
      name: "Khám phá thêm sự kiện",
    });
    expect(
      within(nextSection).getByRole("link", { name: "Xem tất cả sự kiện" }),
    ).toHaveAttribute("href", "/events");
  });

  it("does not show a registration CTA without a configured URL", async () => {
    loadEventDetailMock.mockResolvedValue({
      event: { ...event, registrationUrl: null },
      status: "found",
    });

    render(await EventPage(pageProps));

    expect(
      screen.getByRole("heading", {
        name: "Không có đăng ký trực tuyến",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Đăng ký tham gia" }),
    ).not.toBeInTheDocument();
  });

  it("shows a passed registration deadline without a CTA", async () => {
    loadEventDetailMock.mockResolvedValue({
      event: {
        ...event,
        registrationDeadline: "2020-01-01T00:00:00.000Z",
      },
      status: "found",
    });

    render(await EventPage(pageProps));

    expect(
      screen.getByRole("heading", { name: "Đã đóng đăng ký" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Đã qua hạn đăng ký."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Đăng ký tham gia" }),
    ).not.toBeInTheDocument();
  });

  it("uses the shared event status for a past event", async () => {
    loadEventDetailMock.mockResolvedValue({
      event: {
        ...event,
        endDateTime: "2020-01-01T02:00:00.000Z",
        registrationDeadline: null,
        startDateTime: "2020-01-01T00:00:00.000Z",
      },
      status: "found",
    });

    render(await EventPage(pageProps));

    expect(screen.getByText("Đã diễn ra")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Đã đóng đăng ký" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Sự kiện này đã kết thúc.")).toBeInTheDocument();
  });

  it("builds event social metadata from validated SEO fields", async () => {
    loadEventDetailMock.mockResolvedValue({ event, status: "found" });

    await expect(generateMetadata(pageProps)).resolves.toMatchObject({
      alternates: { canonical: event.seo.canonical },
      description: event.seo.metaDescription,
      openGraph: {
        images: [{ url: banner.url }],
        title: event.seo.metaTitle,
        type: "website",
        url: event.seo.canonical,
      },
      robots: { follow: true, index: false },
      title: event.seo.metaTitle,
      twitter: {
        card: "summary_large_image",
        images: [banner.url],
        title: event.seo.metaTitle,
      },
    });
  });

  it("emits only Event facts supported by the CMS contract", async () => {
    loadEventDetailMock.mockResolvedValue({ event, status: "found" });

    const { container } = render(await EventPage(pageProps));
    const script = container.querySelector('script[type="application/ld+json"]');
    const structuredData = JSON.parse(script?.textContent ?? "{}");

    expect(structuredData).toEqual(buildEventStructuredData(event));
    expect(structuredData).not.toHaveProperty("eventAttendanceMode");
    expect(structuredData).not.toHaveProperty("eventStatus");
    expect(structuredData).not.toHaveProperty("offers");
    expect(serializeStructuredData({ name: "</script><script>" })).toBe(
      '{"name":"\\u003c/script>\\u003cscript>"}',
    );
  });

  it("uses the not-found boundary for an invalid or unpublished slug", async () => {
    loadEventDetailMock.mockResolvedValue({ status: "not-found" });

    await expect(EventPage(pageProps)).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledOnce();

    render(<EventNotFound />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Không tìm thấy sự kiện" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Xem tất cả sự kiện" }),
    ).toHaveAttribute("href", "/events");
  });

  it("renders a controlled retry path when the CMS is unavailable", async () => {
    loadEventDetailMock.mockResolvedValue({ status: "error" });

    render(await EventPage(pageProps));

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Tạm thời chưa xem được sự kiện này",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Xem tất cả sự kiện" }),
    ).toHaveAttribute("href", "/events");
  });

  it("prevents missing and failed detail states from being indexed", async () => {
    loadEventDetailMock.mockResolvedValueOnce({ status: "not-found" });
    await expect(generateMetadata(pageProps)).resolves.toMatchObject({
      robots: { follow: false, index: false },
      title: "Không tìm thấy sự kiện",
    });

    loadEventDetailMock.mockResolvedValueOnce({ status: "error" });
    await expect(generateMetadata(pageProps)).resolves.toMatchObject({
      robots: { follow: false, index: false },
      title: "Sự kiện",
    });
  });
});
