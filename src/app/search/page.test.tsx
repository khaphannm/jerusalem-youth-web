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
      screen.getByRole("heading", { level: 1, name: "Tìm kiếm trên trang" }),
    ).toBeInTheDocument();
    const form = screen.getByRole("search", { name: "Tìm kiếm trong trang" });
    expect(form).toHaveAttribute("action", "/search");
    expect(form).toHaveAttribute("method", "get");
    const input = within(form).getByRole("searchbox", {
      name: "Bạn đang tìm gì?",
    });
    expect(input).toMatchObject({
      maxLength: maximumSearchQueryLength,
      minLength: 2,
      name: "q",
      required: true,
    });
    expect(within(form).getByRole("button", { name: "Tìm kiếm" })).toHaveAttribute(
      "type",
      "submit",
    );
    expect(
      screen.getByRole("heading", { name: "Bắt đầu tìm kiếm" }),
    ).toBeInTheDocument();
    expect(searchPublicContentMock).not.toHaveBeenCalled();
    expect(metadata).toMatchObject({
      robots: { follow: true, index: false },
      title: "Tìm kiếm",
    });
  });

  it("handles a short repeated query without contacting the CMS", async () => {
    render(await renderPage([" a\n", "ignored"]));

    expect(
      screen.getByRole("searchbox", { name: "Bạn đang tìm gì?" }),
    ).toHaveValue("a");
    expect(
      screen.getByRole("heading", {
        name: "Cần ít nhất hai ký tự để tìm",
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
              typeLabel: "Bài viết",
            },
          ],
          label: "Bài viết",
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
              typeLabel: "Sự kiện",
            },
          ],
          label: "Sự kiện",
          total: 1,
        },
      ],
      matchedTotal: 7,
      status: "ready",
      unavailableTypes: ["Câu chuyện"],
    });

    render(await renderPage("  faith\n journey "));

    expect(searchPublicContentMock).toHaveBeenCalledWith("faith journey");
    expect(screen.getByText("7 kết quả cho “faith journey”.")).toBeInTheDocument();
    expect(
      screen.getByRole("status"),
    ).toHaveTextContent("Một số kết quả tạm thời chưa xem được: Câu chuyện.");
    expect(
      screen.getByRole("heading", { level: 3, name: "Bài viết" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Hiển thị 1 trên 6")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Faith for Monday" }),
    ).toHaveAttribute("href", "/articles/faith-for-monday");
    expect(
      screen.getByRole("link", { name: "Friday gathering" }),
    ).toHaveAttribute("href", "/events/friday-gathering");
    expect(screen.getAllByText("Bài viết")).toHaveLength(2);
    expect(screen.getAllByText("Sự kiện")).toHaveLength(2);
  });

  it("renders a useful zero-result state", async () => {
    searchPublicContentMock.mockResolvedValue({
      groups: [],
      matchedTotal: 0,
      status: "ready",
      unavailableTypes: ["Sự kiện"],
    });

    render(await renderPage("unknown topic"));

    expect(
      screen.getByRole("heading", { name: "Không có kết quả cho “unknown topic”" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Một số kết quả tạm thời chưa xem được: Sự kiện.",
    );
  });

  it("distinguishes search failure from a valid empty result", async () => {
    searchPublicContentMock.mockResolvedValue({ status: "error" });

    render(await renderPage("faith"));

    expect(
      screen.getByRole("heading", {
        name: "Tạm thời chưa tìm kiếm được",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /Không có kết quả cho/ }),
    ).not.toBeInTheDocument();
  });
});
