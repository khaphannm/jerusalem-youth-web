import { render, screen, within } from "@testing-library/react";
import type { ResolvingMetadata } from "next";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ResourceNotFound from "@/app/resources/[slug]/not-found";
import ResourcePage, {
  generateMetadata,
} from "@/app/resources/[slug]/page";
import type { MediaAsset, Resource } from "@/lib/cms/domain";

const parentMetadata = Promise.resolve({}) as ResolvingMetadata;

const { loadResourceDetailMock, notFoundMock } = vi.hoisted(() => ({
  loadResourceDetailMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({ notFound: notFoundMock }));

vi.mock("@/features/resources/data", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/features/resources/data")>();

  return {
    ...original,
    loadResourceDetail: loadResourceDetailMock,
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

const resource = {
  id: "resource-1",
  title: "Small group guide",
  slug: "small-group-guide",
  description: "A practical guide for conversations about faith.",
  category: {
    id: "category-1",
    name: "Guides",
    slug: "guides",
    description: null,
  },
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
  author: {
    id: "author-1",
    displayName: "Ministry Team",
    slug: "ministry-team",
    avatar: null,
    bio: null,
  },
  thumbnail,
  seo: {
    metaTitle: "Small group faith guide",
    metaDescription: "A practical small group discussion resource.",
    canonical: "https://youth.example.test/resources/small-group-guide",
    socialImage: null,
    noIndex: true,
  },
  publishedAt: "2026-08-31T00:00:00.000Z",
} satisfies Resource;

const pageProps = { params: Promise.resolve({ slug: resource.slug }) };

describe("ResourcePage", () => {
  beforeEach(() => {
    loadResourceDetailMock.mockReset();
    notFoundMock.mockClear();
  });

  it("renders description and a source link without forcing download behavior", async () => {
    loadResourceDetailMock.mockResolvedValue({ resource, status: "found" });

    render(await ResourcePage(pageProps));

    const title = screen.getByRole("heading", {
      level: 1,
      name: "Small group guide",
    });
    expect(title).toBeInTheDocument();
    expect(screen.getByText(resource.description)).toBeInTheDocument();
    expect(title.closest("section")).toHaveTextContent("Guides · PDF");
    expect(screen.getByText("By Ministry Team")).toBeInTheDocument();
    expect(screen.getByText("August 31, 2026")).toHaveAttribute(
      "datetime",
      resource.publishedAt,
    );
    expect(
      screen.getByText(
        "This resource is provided as a file. Your browser will decide whether it opens or saves the file.",
      ),
    ).toBeInTheDocument();
    const sourceLink = screen.getByRole("link", { name: "Open PDF" });
    expect(sourceLink).toHaveAttribute("href", resource.source.asset.url);
    expect(sourceLink).not.toHaveAttribute("download");
    expect(sourceLink).not.toHaveAttribute("target");

    const nextSection = screen.getByRole("region", {
      name: "Explore more resources",
    });
    expect(
      within(nextSection).getByRole("link", { name: "Browse all resources" }),
    ).toHaveAttribute("href", "/resources");
  });

  it("handles an external source and absent optional fields", async () => {
    const externalResource = {
      ...resource,
      author: null,
      thumbnail: null,
      seo: null,
      source: {
        kind: "external",
        url: "https://partner.example.test/guide",
      },
    } satisfies Resource;
    loadResourceDetailMock.mockResolvedValue({
      resource: externalResource,
      status: "found",
    });

    render(await ResourcePage(pageProps));

    expect(
      screen.getByText("This resource is hosted on another website."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open external resource" }),
    ).toHaveAttribute("href", externalResource.source.url);
    expect(screen.queryByText(/By Ministry Team/)).not.toBeInTheDocument();
  });

  it("builds social metadata from SEO and thumbnail fields", async () => {
    loadResourceDetailMock.mockResolvedValue({ resource, status: "found" });

    await expect(
      generateMetadata(pageProps, parentMetadata),
    ).resolves.toMatchObject({
      alternates: { canonical: resource.seo.canonical },
      description: resource.seo.metaDescription,
      openGraph: {
        images: [{ url: thumbnail.url }],
        title: resource.seo.metaTitle,
        url: resource.seo.canonical,
      },
      robots: { follow: true, index: false },
      title: resource.seo.metaTitle,
      twitter: {
        card: "summary_large_image",
        images: [thumbnail.url],
      },
    });
  });

  it("uses not found for an invalid or unpublished slug", async () => {
    loadResourceDetailMock.mockResolvedValue({ status: "not-found" });

    await expect(ResourcePage(pageProps)).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledOnce();

    render(<ResourceNotFound />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Resource not found" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Browse all resources" }),
    ).toHaveAttribute("href", "/resources");
  });

  it("renders an error path and noindex metadata for unavailable states", async () => {
    loadResourceDetailMock.mockResolvedValue({ status: "error" });
    render(await ResourcePage(pageProps));
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "This resource is temporarily unavailable",
      }),
    ).toBeInTheDocument();

    loadResourceDetailMock.mockResolvedValueOnce({ status: "not-found" });
    await expect(
      generateMetadata(pageProps, parentMetadata),
    ).resolves.toMatchObject({
      robots: { follow: false, index: false },
      title: "Resource not found",
    });

    loadResourceDetailMock.mockResolvedValueOnce({ status: "error" });
    await expect(
      generateMetadata(pageProps, parentMetadata),
    ).resolves.toMatchObject({
      robots: { follow: false, index: false },
      title: "Resource",
    });
  });
});
