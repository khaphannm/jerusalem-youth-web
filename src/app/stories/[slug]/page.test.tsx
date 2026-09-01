import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import StoryNotFound from "@/app/stories/[slug]/not-found";
import StoryPage, { generateMetadata } from "@/app/stories/[slug]/page";
import type { MediaAsset, Story } from "@/lib/cms/domain";

const { loadStoryDetailMock, notFoundMock } = vi.hoisted(() => ({
  loadStoryDetailMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("@/features/stories/data", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/features/stories/data")>();

  return {
    ...original,
    loadStoryDetail: loadStoryDetailMock,
  };
});

const featuredImage = {
  id: "story-image",
  name: "belonging.jpg",
  url: "https://media.example.test/belonging.jpg",
  alternativeText: "Friends spending time together after youth gathering",
  mimeType: "image/jpeg",
  width: 1_600,
  height: 900,
  sizeInKilobytes: 180,
  variants: [],
} satisfies MediaAsset;

const story = {
  id: "story-1",
  title: "Finding a place to belong",
  slug: "finding-a-place-to-belong",
  summary: "A story about finding faith and friendship in community.",
  body: [
    {
      type: "paragraph",
      children: [
        { type: "text", text: "I found friends who made room for me." },
      ],
    },
    {
      type: "heading",
      level: 2,
      children: [{ type: "text", text: "A new beginning" }],
    },
  ],
  featuredImage,
  personDisplayName: "Jordan",
  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  featured: true,
  seo: {
    metaTitle: "A place to belong",
    metaDescription: "Read Jordan's community story.",
    canonical: "https://youth.example.test/stories/finding-a-place-to-belong",
    socialImage: null,
    noIndex: true,
  },
  publishedAt: "2026-08-31T00:00:00.000Z",
} satisfies Story;

const pageProps = {
  params: Promise.resolve({ slug: story.slug }),
};

describe("StoryPage", () => {
  beforeEach(() => {
    loadStoryDetailMock.mockReset();
    notFoundMock.mockClear();
  });

  it("renders validated story content and defers a supported video", async () => {
    loadStoryDetailMock.mockResolvedValue({ status: "found", story });

    render(await StoryPage(pageProps));

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Finding a place to belong",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(story.summary)).toBeInTheDocument();
    expect(
      screen.getByText("I found friends who made room for me."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "A new beginning" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Jordan")).toBeInTheDocument();
    expect(screen.getByText("August 31, 2026")).toHaveAttribute(
      "datetime",
      story.publishedAt,
    );
    expect(
      screen.getAllByRole("img", { name: featuredImage.alternativeText }),
    ).toHaveLength(2);
    expect(screen.queryByTitle(/on YouTube/)).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Play Finding a place to belong video",
      }),
    );

    expect(
      screen.getByTitle("Finding a place to belong on YouTube"),
    ).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0",
    );

    const nextSection = screen.getByRole("region", {
      name: "Explore more stories",
    });
    expect(
      within(nextSection).getByRole("link", { name: "Browse all stories" }),
    ).toHaveAttribute("href", "/stories");
  });

  it("omits optional person and video sections when those fields are absent", async () => {
    loadStoryDetailMock.mockResolvedValue({
      status: "found",
      story: { ...story, personDisplayName: null, videoUrl: null },
    });

    render(await StoryPage(pageProps));

    expect(screen.queryByText("Jordan")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Watch the story" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Play .* video/ })).not
      .toBeInTheDocument();
  });

  it("links an unsupported safe video provider without embedding it", async () => {
    const externalVideoUrl = "https://video.example.test/watch/belonging";
    loadStoryDetailMock.mockResolvedValue({
      status: "found",
      story: { ...story, videoUrl: externalVideoUrl },
    });

    render(await StoryPage(pageProps));

    expect(
      screen.getByText("This video opens on the provider's website."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Watch story video" }),
    ).toHaveAttribute("href", externalVideoUrl);
    expect(screen.queryByRole("button", { name: /Play .* video/ })).not
      .toBeInTheDocument();
  });

  it("builds story social metadata from validated SEO fields", async () => {
    loadStoryDetailMock.mockResolvedValue({ status: "found", story });

    await expect(generateMetadata(pageProps)).resolves.toMatchObject({
      alternates: { canonical: story.seo.canonical },
      description: story.seo.metaDescription,
      openGraph: {
        images: [{ url: featuredImage.url }],
        publishedTime: story.publishedAt,
        title: story.seo.metaTitle,
        type: "article",
        url: story.seo.canonical,
      },
      robots: { follow: true, index: false },
      title: story.seo.metaTitle,
      twitter: {
        card: "summary_large_image",
        images: [featuredImage.url],
        title: story.seo.metaTitle,
      },
    });
  });

  it("uses the not-found boundary for an invalid or unpublished slug", async () => {
    loadStoryDetailMock.mockResolvedValue({ status: "not-found" });

    await expect(StoryPage(pageProps)).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledOnce();

    render(<StoryNotFound />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Story not found" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Browse all stories" }),
    ).toHaveAttribute("href", "/stories");
  });

  it("renders a controlled retry path when the CMS is unavailable", async () => {
    loadStoryDetailMock.mockResolvedValue({ status: "error" });

    render(await StoryPage(pageProps));

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "This story is temporarily unavailable",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Browse all stories" }),
    ).toHaveAttribute("href", "/stories");
  });

  it("prevents missing and failed detail states from being indexed", async () => {
    loadStoryDetailMock.mockResolvedValueOnce({ status: "not-found" });
    await expect(generateMetadata(pageProps)).resolves.toMatchObject({
      robots: { follow: false, index: false },
      title: "Story not found",
    });

    loadStoryDetailMock.mockResolvedValueOnce({ status: "error" });
    await expect(generateMetadata(pageProps)).resolves.toMatchObject({
      robots: { follow: false, index: false },
      title: "Story",
    });
  });
});
