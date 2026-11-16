import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  parseSearchQuery,
  searchPublicContent,
  searchResultsPerType,
} from "@/features/search/data";
import { maximumSearchQueryLength } from "@/lib/search-query";

const {
  articleSearchMock,
  eventSearchMock,
  getCmsClientMock,
  resourceSearchMock,
  sermonSearchMock,
  storySearchMock,
} = vi.hoisted(() => ({
  articleSearchMock: vi.fn(),
  eventSearchMock: vi.fn(),
  getCmsClientMock: vi.fn(),
  resourceSearchMock: vi.fn(),
  sermonSearchMock: vi.fn(),
  storySearchMock: vi.fn(),
}));

vi.mock("@/lib/cms", () => ({
  getCmsClient: getCmsClientMock,
}));

const collection = (items: readonly unknown[], total = items.length) => ({
  items,
  pagination: {
    page: 1,
    pageCount: total > 0 ? 1 : 0,
    pageSize: searchResultsPerType,
    total,
  },
});

describe("search query parsing", () => {
  it("distinguishes empty, short, and ready queries", () => {
    expect(parseSearchQuery(undefined)).toEqual({ status: "empty", value: "" });
    expect(parseSearchQuery(" a ")).toEqual({
      status: "too-short",
      value: "a",
    });
    expect(parseSearchQuery("  everyday\n faith  ")).toEqual({
      status: "ready",
      value: "everyday faith",
    });
  });

  it("uses only the first value and bounds normalized Unicode input", () => {
    expect(parseSearchQuery(["Ｆａｉｔｈ", "ignored"])).toEqual({
      status: "ready",
      value: "Faith",
    });

    const parsed = parseSearchQuery("x".repeat(maximumSearchQueryLength + 20));
    expect(parsed.status).toBe("ready");
    expect([...parsed.value]).toHaveLength(maximumSearchQueryLength);
  });
});

describe("public content search", () => {
  beforeEach(() => {
    getCmsClientMock.mockReset();
    articleSearchMock.mockReset();
    eventSearchMock.mockReset();
    sermonSearchMock.mockReset();
    storySearchMock.mockReset();
    resourceSearchMock.mockReset();
    getCmsClientMock.mockReturnValue({
      articles: { search: articleSearchMock },
      events: { search: eventSearchMock },
      resources: { search: resourceSearchMock },
      sermons: { search: sermonSearchMock },
      stories: { search: storySearchMock },
    });
  });

  it("searches approved public types concurrently and maps meaningful result labels", async () => {
    articleSearchMock.mockResolvedValue(
      collection([
        {
          id: "article-1",
          title: "Faith for Monday",
          slug: "faith-for-monday",
          excerpt: "Following Jesus in ordinary life.",
          category: { name: "Faith" },
        },
      ]),
    );
    eventSearchMock.mockResolvedValue(
      collection([
        {
          id: "event-1",
          title: "Friday gathering",
          slug: "friday-gathering",
          summary: "Worship and friendship.",
          locationName: "Youth Hall",
        },
      ]),
    );
    sermonSearchMock.mockResolvedValue(collection([]));
    storySearchMock.mockResolvedValue(collection([]));
    resourceSearchMock.mockResolvedValue(collection([]));

    await expect(searchPublicContent("faith")).resolves.toMatchObject({
      groups: [
        {
          id: "articles",
          items: [
            {
              href: "/articles/faith-for-monday",
              title: "Faith for Monday",
              typeLabel: "Bài viết",
            },
          ],
          label: "Bài viết",
        },
        {
          id: "events",
          items: [
            {
              context: "Youth Hall",
              href: "/events/friday-gathering",
              typeLabel: "Sự kiện",
            },
          ],
          label: "Sự kiện",
        },
      ],
      matchedTotal: 2,
      status: "ready",
      unavailableTypes: [],
    });

    for (const searchMock of [
      articleSearchMock,
      eventSearchMock,
      sermonSearchMock,
      storySearchMock,
      resourceSearchMock,
    ]) {
      expect(searchMock).toHaveBeenCalledWith("faith", {
        page: 1,
        pageSize: searchResultsPerType,
      });
    }
  });

  it("preserves available results when one content type fails", async () => {
    articleSearchMock.mockRejectedValue(new Error("Articles offline"));
    eventSearchMock.mockResolvedValue(collection([]));
    sermonSearchMock.mockResolvedValue(collection([]));
    storySearchMock.mockResolvedValue(collection([]));
    resourceSearchMock.mockResolvedValue(collection([]));
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(searchPublicContent("faith")).resolves.toEqual({
      groups: [],
      matchedTotal: 0,
      status: "ready",
      unavailableTypes: ["Bài viết"],
    });
    expect(errorSpy).toHaveBeenCalledWith(
      "Search articles could not be loaded: Articles offline",
    );
  });

  it("returns a controlled error when every search source fails", async () => {
    for (const searchMock of [
      articleSearchMock,
      eventSearchMock,
      sermonSearchMock,
      storySearchMock,
      resourceSearchMock,
    ]) {
      searchMock.mockRejectedValue(new Error("CMS offline"));
    }
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    await expect(searchPublicContent("faith")).resolves.toEqual({
      status: "error",
    });
  });

  it("returns a controlled error when CMS client setup fails", async () => {
    getCmsClientMock.mockImplementation(() => {
      throw new Error("Missing configuration");
    });
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(searchPublicContent("faith")).resolves.toEqual({
      status: "error",
    });
    expect(errorSpy).toHaveBeenCalledWith(
      "Search CMS data could not be loaded: Missing configuration",
    );
  });
});
