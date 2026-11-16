import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SermonsPage, { generateMetadata } from "@/app/sermons/page";
import type { MediaAsset, Sermon, SiteSettings } from "@/lib/cms/domain";

const { loadSermonListingMock, loadSermonSiteSettingsMock } = vi.hoisted(
  () => ({
    loadSermonListingMock: vi.fn(),
    loadSermonSiteSettingsMock: vi.fn(),
  }),
);

vi.mock("@/features/sermons/data", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/features/sermons/data")>();

  return {
    ...original,
    loadSermonListing: loadSermonListingMock,
    loadSermonSiteSettings: loadSermonSiteSettingsMock,
  };
});

const media = {
  id: "image-1",
  name: "sermon.jpg",
  url: "https://media.example.test/sermon.jpg",
  alternativeText: "A speaker teaching at youth gathering",
  mimeType: "image/jpeg",
  width: 1_600,
  height: 900,
  sizeInKilobytes: 180,
  variants: [],
} satisfies MediaAsset;

const sermon = {
  id: "sermon-1",
  title: "Hope that holds",
  slug: "hope-that-holds",
  speaker: "Ministry Team",
  date: "2026-08-30",
  summary: "Discover a hope that remains steady.",
  videoUrl: "https://video.example.test/watch/hope",
  series: {
    id: "series-1",
    name: "Rooted",
    slug: "rooted",
    description: null,
    coverImage: null,
  },
  biblePassage: "Hebrews 6:19",
  audioUrl: null,
  thumbnail: media,
  notesUrl: null,
  seo: null,
  publishedAt: "2026-08-31T00:00:00.000Z",
} satisfies Sermon;

const secondSermon = {
  ...sermon,
  id: "sermon-2",
  title: "Faith in motion",
  slug: "faith-in-motion",
  speaker: "Youth Pastor",
  date: "2026-08-23",
  series: null,
  thumbnail: null,
  publishedAt: "2026-08-24T00:00:00.000Z",
} satisfies Sermon;

const siteSettings = {
  siteName: "Jerusalem Youth",
  siteDescription: "A community growing in faith.",
  defaultSeo: {
    metaTitle: null,
    metaDescription: null,
    canonical: null,
    socialImage: media,
    noIndex: false,
  },
  defaultSocialImage: null,
  organizationContact: null,
  primaryCallToAction: null,
  footerContent: null,
} satisfies SiteSettings;

const renderPage = (page?: string) =>
  SermonsPage({ searchParams: Promise.resolve({ page }) });

describe("SermonsPage", () => {
  beforeEach(() => {
    loadSermonListingMock.mockReset();
    loadSermonSiteSettingsMock.mockReset();
  });

  it("renders newest-first sermon cards with their available series and pagination", async () => {
    loadSermonListingMock.mockResolvedValue({
      items: [sermon, secondSermon],
      pagination: { page: 2, pageCount: 3, pageSize: 6, total: 14 },
    });

    render(await renderPage("2"));

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Messages for growing faith",
      }),
    ).toBeInTheDocument();
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(2);
    expect(
      within(cards[0]).getByRole("link", { name: "Hope that holds" }),
    ).toHaveAttribute("href", "/sermons/hope-that-holds");
    expect(within(cards[0]).getByText("Rooted")).toBeInTheDocument();
    expect(within(cards[0]).getByText("Ministry Team")).toBeInTheDocument();
    expect(within(cards[0]).getByText("August 30, 2026")).toBeInTheDocument();
    expect(within(cards[0]).getByRole("img")).toHaveAttribute(
      "alt",
      "A speaker teaching at youth gathering",
    );
    expect(within(cards[1]).queryByText("Rooted")).not.toBeInTheDocument();
    expect(within(cards[1]).getByText("Watch the message")).toBeInTheDocument();

    const pagination = screen.getByRole("navigation", {
      name: "Sermon pages",
    });
    expect(within(pagination).getByText("Trang 2 / 3")).toBeInTheDocument();
    expect(within(pagination).getByRole("link", { name: /Trước/ })).toHaveAttribute(
      "href",
      "/sermons",
    );
    expect(within(pagination).getByRole("link", { name: /Sau/ })).toHaveAttribute(
      "href",
      "/sermons?page=3",
    );
  });

  it("renders the first-page empty state", async () => {
    loadSermonListingMock.mockResolvedValue({
      items: [],
      pagination: { page: 1, pageCount: 0, pageSize: 6, total: 0 },
    });

    render(await renderPage());

    expect(screen.getByText("New sermons are coming")).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Sermon pages" }),
    ).not.toBeInTheDocument();
  });

  it("offers a route back from an empty later page", async () => {
    loadSermonListingMock.mockResolvedValue({
      items: [],
      pagination: { page: 9, pageCount: 2, pageSize: 6, total: 8 },
    });

    render(await renderPage("9"));

    expect(screen.getByText("No sermons on this page")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View first page" })).toHaveAttribute(
      "href",
      "/sermons",
    );
  });

  it("distinguishes a CMS failure from a valid empty collection", async () => {
    loadSermonListingMock.mockResolvedValue(null);

    render(await renderPage());

    expect(
      screen.getByText("Sermons are temporarily unavailable"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute(
      "href",
      "/sermons",
    );
  });

  it("builds unique paginated social metadata from Site Settings", async () => {
    loadSermonSiteSettingsMock.mockResolvedValue(siteSettings);

    await expect(
      generateMetadata({ searchParams: Promise.resolve({ page: "2" }) }),
    ).resolves.toMatchObject({
      description:
        "Watch and listen to recent sermons from Jerusalem Youth, with biblical teaching for growing faith and everyday life.",
      openGraph: {
        images: [{ url: media.url }],
        siteName: "Jerusalem Youth",
        title: "Sermons — Page 2 | Jerusalem Youth",
        type: "website",
      },
      title: "Sermons — Page 2",
      twitter: {
        card: "summary_large_image",
        title: "Sermons — Page 2 | Jerusalem Youth",
      },
    });
  });
});
