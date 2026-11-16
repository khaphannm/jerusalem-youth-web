import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ResolvingMetadata } from "next";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SermonNotFound from "@/app/sermons/[slug]/not-found";
import SermonPage, { generateMetadata } from "@/app/sermons/[slug]/page";
import type { MediaAsset, Sermon } from "@/lib/cms/domain";

const parentMetadata = Promise.resolve({}) as ResolvingMetadata;

const { loadSermonDetailMock, notFoundMock } = vi.hoisted(() => ({
  loadSermonDetailMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("@/features/sermons/data", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/features/sermons/data")>();

  return {
    ...original,
    loadSermonDetail: loadSermonDetailMock,
  };
});

const thumbnail = {
  id: "sermon-thumbnail",
  name: "hope.jpg",
  url: "https://media.example.test/hope.jpg",
  alternativeText: "A speaker sharing a message of hope",
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
  summary: "Discover a hope that remains steady in every season.",
  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  series: {
    id: "series-1",
    name: "Rooted",
    slug: "rooted",
    description: "Learning to build life on Jesus.",
    coverImage: null,
  },
  biblePassage: "Hebrews 6:19",
  audioUrl: "https://media.example.test/audio/hope.mp3",
  thumbnail,
  notesUrl: "https://media.example.test/notes/hope.pdf",
  seo: {
    metaTitle: "A hope that holds",
    metaDescription: "A youth sermon about lasting hope.",
    canonical: "https://youth.example.test/sermons/hope-that-holds",
    socialImage: null,
    noIndex: true,
  },
  publishedAt: "2026-08-31T00:00:00.000Z",
} satisfies Sermon;

const pageProps = {
  params: Promise.resolve({ slug: sermon.slug }),
};

describe("SermonPage", () => {
  beforeEach(() => {
    loadSermonDetailMock.mockReset();
    notFoundMock.mockClear();
  });

  it("renders sermon details and loads the supported video embed only after play", async () => {
    loadSermonDetailMock.mockResolvedValue({ sermon, status: "found" });

    render(await SermonPage(pageProps));

    expect(
      screen.getByRole("heading", { level: 1, name: "Hope that holds" }),
    ).toBeInTheDocument();
    expect(screen.getByText(sermon.summary)).toBeInTheDocument();
    expect(screen.getAllByText("Ministry Team")).toHaveLength(2);
    expect(screen.getAllByText("August 30, 2026")).toHaveLength(2);
    expect(screen.getByText("Hebrews 6:19")).toBeInTheDocument();
    expect(screen.getAllByText("Rooted")).toHaveLength(2);
    expect(
      screen.getByRole("img", { name: thumbnail.alternativeText }),
    ).toBeInTheDocument();
    expect(screen.queryByTitle(/on YouTube/)).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Play Hope that holds video" }),
    );

    expect(screen.getByTitle("Hope that holds on YouTube")).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0",
    );
    expect(screen.getByTitle("Hope that holds on YouTube")).toHaveAttribute(
      "loading",
      "lazy",
    );
    expect(screen.getByRole("link", { name: "Listen to audio" })).toHaveAttribute(
      "href",
      sermon.audioUrl,
    );
    expect(screen.getByRole("link", { name: "Open sermon notes" })).toHaveAttribute(
      "href",
      sermon.notesUrl,
    );

    const nextSection = screen.getByRole("region", {
      name: "Explore more sermons",
    });
    expect(
      within(nextSection).getByRole("link", { name: "Browse all sermons" }),
    ).toHaveAttribute("href", "/sermons");
  });

  it("omits optional detail fields and safely links an unsupported provider", async () => {
    const minimalSermon = {
      ...sermon,
      audioUrl: null,
      biblePassage: null,
      notesUrl: null,
      series: null,
      thumbnail: null,
      videoUrl: "https://video.example.test/watch/hope",
    } satisfies Sermon;
    loadSermonDetailMock.mockResolvedValue({
      sermon: minimalSermon,
      status: "found",
    });

    render(await SermonPage(pageProps));

    expect(screen.getByText("This video opens on the provider's website."))
      .toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Watch sermon video" })).toHaveAttribute(
      "href",
      minimalSermon.videoUrl,
    );
    expect(screen.queryByText("Bible passage")).not.toBeInTheDocument();
    expect(screen.queryByText("Listen to audio")).not.toBeInTheDocument();
    expect(screen.queryByText("Open sermon notes")).not.toBeInTheDocument();
  });

  it("builds sermon social metadata from validated SEO fields", async () => {
    loadSermonDetailMock.mockResolvedValue({ sermon, status: "found" });

    await expect(
      generateMetadata(pageProps, parentMetadata),
    ).resolves.toMatchObject({
      alternates: { canonical: sermon.seo.canonical },
      description: sermon.seo.metaDescription,
      openGraph: {
        images: [{ url: thumbnail.url }],
        title: sermon.seo.metaTitle,
        type: "website",
        url: sermon.seo.canonical,
      },
      robots: { follow: true, index: false },
      title: sermon.seo.metaTitle,
      twitter: {
        card: "summary_large_image",
        images: [thumbnail.url],
        title: sermon.seo.metaTitle,
      },
    });
  });

  it("uses the not-found boundary for an invalid or unpublished slug", async () => {
    loadSermonDetailMock.mockResolvedValue({ status: "not-found" });

    await expect(SermonPage(pageProps)).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledOnce();

    render(<SermonNotFound />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Không tìm thấy bài giảng" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Xem tất cả bài giảng" }),
    ).toHaveAttribute("href", "/sermons");
  });

  it("renders a controlled retry path when the CMS is unavailable", async () => {
    loadSermonDetailMock.mockResolvedValue({ status: "error" });

    render(await SermonPage(pageProps));

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "This sermon is temporarily unavailable",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Browse all sermons" }),
    ).toHaveAttribute("href", "/sermons");
  });

  it("prevents missing and failed detail states from being indexed", async () => {
    loadSermonDetailMock.mockResolvedValueOnce({ status: "not-found" });
    await expect(
      generateMetadata(pageProps, parentMetadata),
    ).resolves.toMatchObject({
      robots: { follow: false, index: false },
      title: "Không tìm thấy bài giảng",
    });

    loadSermonDetailMock.mockResolvedValueOnce({ status: "error" });
    await expect(
      generateMetadata(pageProps, parentMetadata),
    ).resolves.toMatchObject({
      robots: { follow: false, index: false },
      title: "Sermon",
    });
  });
});
