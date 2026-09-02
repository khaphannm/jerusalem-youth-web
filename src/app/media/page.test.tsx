import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import MediaPage from "@/app/media/page";
import type { MediaItem } from "@/features/media/data";
import type { MediaAsset } from "@/lib/cms/domain";

const { loadMediaListingMock } = vi.hoisted(() => ({
  loadMediaListingMock: vi.fn(),
}));

vi.mock("@/features/media/data", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/features/media/data")>();

  return { ...original, loadMediaListing: loadMediaListingMock };
});

const image = {
  id: "image-1",
  name: "gathering.jpg",
  url: "https://media.example.test/gathering.jpg",
  alternativeText: "Young people talking after a gathering",
  mimeType: "image/jpeg",
  width: 1_600,
  height: 900,
  sizeInKilobytes: 180,
  variants: [
    {
      height: 450,
      url: "https://media.example.test/gathering-small.jpg",
      width: 800,
    },
  ],
} satisfies MediaAsset;

const imageItem = {
  id: "event:event-1:image:image-1",
  kind: "image",
  asset: image,
  contextLabel: "Event",
  title: "Friday night gathering",
  description: "An evening of worship and friendship.",
  detailHref: "/events/friday-night-gathering",
  publishedAt: "2026-08-30T00:00:00.000Z",
} satisfies MediaItem;

const videoItem = {
  id: "sermon:sermon-1:video",
  kind: "video",
  contextLabel: "Sermon",
  title: "Hope that holds",
  description: "Discover a hope that remains steady.",
  detailHref: "/sermons/hope-that-holds",
  publishedAt: "2026-09-01T00:00:00.000Z",
  thumbnail: image,
  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
} satisfies MediaItem;

describe("MediaPage", () => {
  beforeEach(() => {
    loadMediaListingMock.mockReset();
  });

  it("renders responsive lazy media and defers supported video embeds", async () => {
    loadMediaListingMock.mockResolvedValue({
      items: [videoItem, imageItem],
      unavailableSourceCount: 0,
    });

    render(await MediaPage());

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Moments from our community",
      }),
    ).toBeInTheDocument();
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent("Video · Sermon");
    expect(cards[1]).toHaveTextContent("Photo · Event");
    expect(
      within(cards[1]).getByRole("img", { name: image.alternativeText }),
    ).toHaveAttribute("loading", "lazy");
    expect(screen.queryByTitle(/on YouTube/)).not.toBeInTheDocument();

    fireEvent.click(
      within(cards[0]).getByRole("button", {
        name: "Play Hope that holds video",
      }),
    );
    expect(screen.getByTitle("Hope that holds on YouTube")).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0",
    );
  });

  it("shows partial, empty, and unavailable states", async () => {
    loadMediaListingMock.mockResolvedValueOnce({
      items: [imageItem],
      unavailableSourceCount: 1,
    });
    const { rerender } = render(await MediaPage());
    expect(
      screen.getByText("Some published media is temporarily unavailable."),
    ).toHaveAttribute("role", "status");

    loadMediaListingMock.mockResolvedValueOnce({
      items: [],
      unavailableSourceCount: 0,
    });
    rerender(await MediaPage());
    expect(screen.getByText("Media moments are coming")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Read community stories" }),
    ).toHaveAttribute("href", "/stories");

    loadMediaListingMock.mockResolvedValueOnce(null);
    rerender(await MediaPage());
    expect(screen.getByText("Media is temporarily unavailable")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute(
      "href",
      "/media",
    );
  });
});
