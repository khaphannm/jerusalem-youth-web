import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import StoriesPage, { generateMetadata } from "@/app/stories/page";
import type { MediaAsset, SiteSettings, Story } from "@/lib/cms/domain";

const { loadStoryListingMock, loadStorySiteSettingsMock } = vi.hoisted(() => ({
  loadStoryListingMock: vi.fn(),
  loadStorySiteSettingsMock: vi.fn(),
}));

vi.mock("@/features/stories/data", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/features/stories/data")>();

  return {
    ...original,
    loadStoryListing: loadStoryListingMock,
    loadStorySiteSettings: loadStorySiteSettingsMock,
  };
});

const media = {
  id: "image-1",
  name: "community.jpg",
  url: "https://media.example.test/community.jpg",
  alternativeText: "Friends sharing a joyful moment after youth gathering",
  mimeType: "image/jpeg",
  width: 1_600,
  height: 1_200,
  sizeInKilobytes: 180,
  variants: [],
} satisfies MediaAsset;

const story = {
  id: "story-1",
  title: "Finding a place to belong",
  slug: "finding-a-place-to-belong",
  summary: "A story about friendship and growing in faith.",
  body: [
    {
      type: "paragraph",
      children: [{ type: "text", text: "Story body" }],
    },
  ],
  featuredImage: media,
  personDisplayName: null,
  videoUrl: null,
  featured: true,
  seo: null,
  publishedAt: "2026-08-30T00:00:00.000Z",
} satisfies Story;

const secondStory = {
  ...story,
  id: "story-2",
  title: "Learning to serve together",
  slug: "learning-to-serve-together",
  summary: "How serving shaped a group of friends.",
  featured: false,
  publishedAt: "2026-08-23T00:00:00.000Z",
} satisfies Story;

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
  StoriesPage({ searchParams: Promise.resolve({ page }) });

describe("StoriesPage", () => {
  beforeEach(() => {
    loadStoryListingMock.mockReset();
    loadStorySiteSettingsMock.mockReset();
  });

  it("renders a responsive editorial layout with image, title, and summary", async () => {
    loadStoryListingMock.mockResolvedValue({
      items: [story, secondStory],
      pagination: { page: 2, pageCount: 3, pageSize: 6, total: 14 },
    });

    render(await renderPage("2"));

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Stories of faith and belonging",
      }),
    ).toBeInTheDocument();
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveClass("md:grid");
    expect(cards[1]).toHaveClass("flex");
    expect(
      within(cards[0]).getByRole("img", { name: media.alternativeText }),
    ).toBeInTheDocument();
    expect(
      within(cards[0]).getByRole("link", {
        name: "Finding a place to belong",
      }),
    ).toHaveAttribute("href", "/stories/finding-a-place-to-belong");
    expect(within(cards[0]).getByText(story.summary)).toBeInTheDocument();
    expect(
      within(cards[1]).getByRole("link", {
        name: "Learning to serve together",
      }),
    ).toHaveAttribute("href", "/stories/learning-to-serve-together");

    const pagination = screen.getByRole("navigation", {
      name: "Story pages",
    });
    expect(within(pagination).getByText("Trang 2 / 3")).toBeInTheDocument();
    expect(within(pagination).getByRole("link", { name: /Trước/ })).toHaveAttribute(
      "href",
      "/stories",
    );
    expect(within(pagination).getByRole("link", { name: /Sau/ })).toHaveAttribute(
      "href",
      "/stories?page=3",
    );
  });

  it("renders the first-page empty state", async () => {
    loadStoryListingMock.mockResolvedValue({
      items: [],
      pagination: { page: 1, pageCount: 0, pageSize: 6, total: 0 },
    });

    render(await renderPage());

    expect(screen.getByText("Community stories are coming")).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Story pages" }),
    ).not.toBeInTheDocument();
  });

  it("offers a route back from an empty later page", async () => {
    loadStoryListingMock.mockResolvedValue({
      items: [],
      pagination: { page: 9, pageCount: 2, pageSize: 6, total: 8 },
    });

    render(await renderPage("9"));

    expect(screen.getByText("No stories on this page")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View first page" })).toHaveAttribute(
      "href",
      "/stories",
    );
  });

  it("distinguishes a CMS failure from a valid empty collection", async () => {
    loadStoryListingMock.mockResolvedValue(null);

    render(await renderPage());

    expect(
      screen.getByText("Stories are temporarily unavailable"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute(
      "href",
      "/stories",
    );
  });

  it("builds unique paginated social metadata from Site Settings", async () => {
    loadStorySiteSettingsMock.mockResolvedValue(siteSettings);

    await expect(
      generateMetadata({ searchParams: Promise.resolve({ page: "2" }) }),
    ).resolves.toMatchObject({
      description:
        "Read stories of faith, friendship, service, and belonging from the Jerusalem Youth community.",
      openGraph: {
        images: [{ url: media.url }],
        siteName: "Jerusalem Youth",
        title: "Stories — Page 2 | Jerusalem Youth",
        type: "website",
      },
      title: "Stories — Page 2",
      twitter: {
        card: "summary_large_image",
        title: "Stories — Page 2 | Jerusalem Youth",
      },
    });
  });
});
