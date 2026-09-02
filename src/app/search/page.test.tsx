import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SearchPage, { metadata } from "@/app/search/page";
import { maximumSearchQueryLength } from "@/lib/search-query";

const { searchPublicContentMock } = vi.hoisted(() => ({
  searchPublicContentMock: vi.fn(),
}));

vi.mock("@/features/search/data", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/features/search/data")>();

  return {
    ...original,
    searchPublicContent: searchPublicContentMock,
  };
});

const renderPage = (q?: string | string[]) =>
  SearchPage({ searchParams: Promise.resolve({ q }) });

describe("SearchPage", () => {
  beforeEach(() => {
    searchPublicContentMock.mockReset();
  });

  it("renders an accessible bounded GET search without querying on the initial page", async () => {
    render(await renderPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Search the site" }),
    ).toBeInTheDocument();
    const form = screen.getByRole("search", { name: "Site search" });
    expect(form).toHaveAttribute("action", "/search");
    expect(form).toHaveAttribute("method", "get");
    const input = within(form).getByRole("searchbox", {
      name: "What are you looking for?",
    });
    expect(input).toMatchObject({
      maxLength: maximumSearchQueryLength,
      minLength: 2,
      name: "q",
      required: true,
    });
    expect(within(form).getByRole("button", { name: "Search" })).toHaveAttribute(
      "type",
      "submit",
    );
    expect(
      screen.getByRole("heading", { name: "Start with a search" }),
    ).toBeInTheDocument();
    expect(searchPublicContentMock).not.toHaveBeenCalled();
    expect(metadata).toMatchObject({
      robots: { follow: true, index: false },
      title: "Search",
    });
  });

  it("handles a short repeated query without contacting the CMS", async () => {
    render(await renderPage([" a\n", "ignored"]));

    expect(
      screen.getByRole("searchbox", { name: "What are you looking for?" }),
    ).toHaveValue("a");
    expect(
      screen.getByRole("heading", {
        name: "Search needs at least two characters",
      }),
    ).toBeInTheDocument();
    expect(searchPublicContentMock).not.toHaveBeenCalled();
  });

  it("renders grouped result types and a partial availability notice", async () => {
    searchPublicContentMock.mockResolvedValue({
      groups: [
        {
          id: "articles",
          items: [
            {
              context: "Faith",
              href: "/articles/faith-for-monday",
              id: "article-1",
              summary: "Following Jesus in ordinary life.",
              title: "Faith for Monday",
              typeLabel: "Article",
            },
          ],
          label: "Articles",
          total: 6,
        },
        {
          id: "events",
          items: [
            {
              context: "Youth Hall",
              href: "/events/friday-gathering",
              id: "event-1",
              summary: "Worship and friendship.",
              title: "Friday gathering",
              typeLabel: "Event",
            },
          ],
          label: "Events",
          total: 1,
        },
      ],
      matchedTotal: 7,
      status: "ready",
      unavailableTypes: ["Stories"],
    });

    render(await renderPage("  faith\n journey "));

    expect(searchPublicContentMock).toHaveBeenCalledWith("faith journey");
    expect(screen.getByText("7 results for “faith journey”.")).toBeInTheDocument();
    expect(
      screen.getByRole("status"),
    ).toHaveTextContent("Some results are temporarily unavailable: Stories.");
    expect(
      screen.getByRole("heading", { level: 3, name: "Articles" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Showing 1 of 6")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Faith for Monday" }),
    ).toHaveAttribute("href", "/articles/faith-for-monday");
    expect(
      screen.getByRole("link", { name: "Friday gathering" }),
    ).toHaveAttribute("href", "/events/friday-gathering");
    expect(screen.getByText("Article")).toBeInTheDocument();
    expect(screen.getByText("Event")).toBeInTheDocument();
  });

  it("renders a useful zero-result state", async () => {
    searchPublicContentMock.mockResolvedValue({
      groups: [],
      matchedTotal: 0,
      status: "ready",
      unavailableTypes: ["Events"],
    });

    render(await renderPage("unknown topic"));

    expect(
      screen.getByRole("heading", { name: "No results for “unknown topic”" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Some results are temporarily unavailable: Events.",
    );
  });

  it("distinguishes search failure from a valid empty result", async () => {
    searchPublicContentMock.mockResolvedValue({ status: "error" });

    render(await renderPage("faith"));

    expect(
      screen.getByRole("heading", {
        name: "Search is temporarily unavailable",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /No results for/ }),
    ).not.toBeInTheDocument();
  });
});
