import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ResourcesPage, { generateMetadata } from "@/app/resources/page";
import type {
  Category,
  MediaAsset,
  Resource,
  SiteSettings,
} from "@/lib/cms/domain";

const { loadResourceListingMock, loadResourceSiteSettingsMock } = vi.hoisted(
  () => ({
    loadResourceListingMock: vi.fn(),
    loadResourceSiteSettingsMock: vi.fn(),
  }),
);

vi.mock("@/features/resources/data", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/features/resources/data")>();

  return {
    ...original,
    loadResourceListing: loadResourceListingMock,
    loadResourceSiteSettings: loadResourceSiteSettingsMock,
  };
});

const thumbnail = {
  id: "resource-thumbnail",
  name: "guide.jpg",
  url: "https://media.example.test/guide.jpg",
  alternativeText: "An open group discussion guide",
  mimeType: "image/jpeg",
  width: 1_200,
  height: 900,
  sizeInKilobytes: 120,
  variants: [],
} satisfies MediaAsset;

const category = {
  id: "category-1",
  name: "Guides",
  slug: "guides",
  description: null,
} satisfies Category;

const fileResource = {
  id: "resource-1",
  title: "Small group guide",
  slug: "small-group-guide",
  description: "A practical guide for conversations about faith.",
  category,
  source: {
    kind: "file",
    asset: {
      ...thumbnail,
      id: "resource-file",
      name: "small-group-guide.pdf",
      url: "https://media.example.test/small-group-guide.pdf",
      alternativeText: null,
      mimeType: "application/pdf",
      width: null,
      height: null,
      variants: [],
    },
  },
  author: null,
  thumbnail,
  seo: null,
  publishedAt: "2026-08-31T00:00:00.000Z",
} satisfies Resource;

const externalResource = {
  ...fileResource,
  id: "resource-2",
  title: "Parent conversation toolkit",
  slug: "parent-conversation-toolkit",
  source: {
    kind: "external",
    url: "https://partner.example.test/parent-toolkit",
  },
  thumbnail: null,
} satisfies Resource;

const siteSettings = {
  siteName: "Jerusalem Youth",
  siteDescription: "A community growing in faith.",
  defaultSeo: null,
  defaultSocialImage: thumbnail,
  organizationContact: null,
  primaryCallToAction: null,
  footerContent: null,
} satisfies SiteSettings;

const renderPage = (page?: string) =>
  ResourcesPage({ searchParams: Promise.resolve({ page }) });

describe("ResourcesPage", () => {
  beforeEach(() => {
    loadResourceListingMock.mockReset();
    loadResourceSiteSettingsMock.mockReset();
  });

  it("renders category, title, description, type, and accessible destinations", async () => {
    loadResourceListingMock.mockResolvedValue({
      items: [fileResource, externalResource],
      pagination: { page: 1, pageCount: 2, pageSize: 9, total: 10 },
    });

    render(await renderPage());

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Resources for everyday faith",
      }),
    ).toBeInTheDocument();
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent("Guides · PDF");
    expect(
      within(cards[0]).getByText(fileResource.description),
    ).toBeInTheDocument();
    expect(
      within(cards[0]).getByRole("link", { name: "Small group guide" }),
    ).toHaveAttribute("href", "/resources/small-group-guide");
    expect(
      within(cards[0]).getByRole("link", {
        name: "Open PDF: Small group guide",
      }),
    ).toHaveAttribute("href", fileResource.source.asset.url);
    expect(cards[1]).toHaveTextContent("Guides · External link");
    expect(
      within(cards[1]).getByRole("link", {
        name: "Open external resource: Parent conversation toolkit",
      }),
    ).toHaveAttribute("href", externalResource.source.url);

    const pagination = screen.getByRole("navigation", {
      name: "Resource pages",
    });
    expect(within(pagination).getByText("Trang 1 / 2")).toBeInTheDocument();
  });

  it("renders first-page, later-page, and failure states", async () => {
    loadResourceListingMock.mockResolvedValueOnce({
      items: [],
      pagination: { page: 1, pageCount: 0, pageSize: 9, total: 0 },
    });
    const { rerender } = render(await renderPage());
    expect(screen.getByText("New resources are coming")).toBeInTheDocument();

    loadResourceListingMock.mockResolvedValueOnce({
      items: [],
      pagination: { page: 8, pageCount: 2, pageSize: 9, total: 10 },
    });
    rerender(await renderPage("8"));
    expect(screen.getByText("No resources on this page")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View first page" })).toHaveAttribute(
      "href",
      "/resources",
    );

    loadResourceListingMock.mockResolvedValueOnce(null);
    rerender(await renderPage());
    expect(
      screen.getByText("Resources are temporarily unavailable"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Try again" })).toHaveAttribute(
      "href",
      "/resources",
    );
  });

  it("builds unique paginated social metadata", async () => {
    loadResourceSiteSettingsMock.mockResolvedValue(siteSettings);

    await expect(
      generateMetadata({ searchParams: Promise.resolve({ page: "2" }) }),
    ).resolves.toMatchObject({
      openGraph: {
        images: [{ url: thumbnail.url }],
        siteName: "Jerusalem Youth",
        title: "Resources — Page 2 | Jerusalem Youth",
      },
      title: "Resources — Page 2",
      twitter: {
        card: "summary_large_image",
        images: [thumbnail.url],
      },
    });
  });
});
