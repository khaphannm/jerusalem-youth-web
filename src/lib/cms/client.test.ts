import { describe, expect, it, vi } from "vitest";

import { createCmsClient, normalizeCmsBaseUrl } from "./client";
import { cmsCacheTags, eventCacheLifetimeSeconds } from "./cache";

const mediaFixture = {
  documentId: "image-1",
  name: "retreat.jpg",
  url: "/uploads/retreat.jpg",
  alternativeText: "Students at the retreat",
  mime: "image/jpeg",
  width: 1600,
  height: 900,
  size: 245.5,
};

const articleFixture = {
  documentId: "article-1",
  title: "Retreat reflection",
  slug: "retreat-reflection",
  excerpt: "What we learned together.",
  body: [{ type: "paragraph", children: [{ type: "text", text: "Hello" }] }],
  featuredImage: mediaFixture,
  author: {
    documentId: "author-1",
    displayName: "Ministry Team",
    slug: "ministry-team",
    avatar: null,
    bio: null,
  },
  category: {
    documentId: "category-1",
    name: "Community",
    slug: "community",
    description: null,
  },
  tags: [{ name: "Retreat" }],
  bibleReferences: [{ reference: "Romans 12:5" }],
  featured: true,
  seo: {
    metaTitle: "Retreat reflection",
    metaDescription: null,
    canonical: null,
    socialImage: null,
    noIndex: false,
  },
  publishedAt: "2026-08-21T03:00:00.000Z",
};

const collectionPayload = (data: unknown[], pageSize = 25) => ({
  data,
  meta: {
    pagination: {
      page: 1,
      pageSize,
      pageCount: data.length ? 1 : 0,
      total: data.length,
    },
  },
});

const jsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("CMS client", () => {
  it("validates and maps a flattened Strapi article into the domain model", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(
      jsonResponse(collectionPayload([articleFixture], 10)),
    );
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    const result = await client.articles.list({ page: 1, pageSize: 10 });

    expect(result.pagination).toEqual({
      page: 1,
      pageSize: 10,
      pageCount: 1,
      total: 1,
    });
    expect(result.items[0]).toMatchObject({
      id: "article-1",
      title: "Retreat reflection",
      tags: ["Retreat"],
      bibleReferences: ["Romans 12:5"],
      featuredImage: {
        id: "image-1",
        url: "https://cms.example.test/uploads/retreat.jpg",
      },
      author: { id: "author-1", displayName: "Ministry Team" },
      category: { id: "category-1", name: "Community" },
    });
    expect(result.items[0]).not.toHaveProperty("documentId");

    const requestedUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(requestedUrl).toContain("api/articles?");
    expect(requestedUrl).toContain("populate=featuredImage");
    expect(requestedUrl).toContain("pagination%5Bpage%5D=1");
    expect(requestedUrl).toContain("pagination%5BpageSize%5D=10");
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      cache: "force-cache",
      next: {
        revalidate: false,
        tags: [
          cmsCacheTags.articles,
          cmsCacheTags.authors,
          cmsCacheTags.categories,
        ],
      },
    });
  });

  it("uses a five-minute fallback refresh for event reads", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(jsonResponse(collectionPayload([])));
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await client.events.list();

    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      cache: "force-cache",
      next: {
        revalidate: eventCacheLifetimeSeconds,
        tags: [cmsCacheTags.events],
      },
    });
  });

  it("rejects malformed CMS payloads with a normalized error", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    const malformedArticle = { ...articleFixture, featuredImage: null };
    fetchMock.mockResolvedValue(
      jsonResponse(collectionPayload([malformedArticle])),
    );
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(client.articles.list()).rejects.toMatchObject({
      name: "CmsError",
      code: "INVALID_RESPONSE",
      message: "CMS returned an invalid articles collection payload.",
    });
  });

  it("returns null for a valid empty slug lookup", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(jsonResponse(collectionPayload([])));
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(client.articles.findBySlug("missing")).resolves.toBeNull();
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      "filters%5Bslug%5D%5B%24eq%5D=missing",
    );
  });

  it("returns null when a single type has not been created", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(jsonResponse({ data: null }, 404));
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(client.siteSettings()).resolves.toBeNull();
  });

  it("normalizes HTTP errors without exposing the response body", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(
      new Response("upstream-secret-detail", { status: 503 }),
    );
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(client.articles.list()).rejects.toMatchObject({
      name: "CmsError",
      code: "HTTP",
      status: 503,
      message: "CMS request failed with status 503.",
    });
    await expect(client.articles.list()).rejects.not.toThrow(
      "upstream-secret-detail",
    );
  });

  it("normalizes network failures and request timeouts", async () => {
    const networkFetch = vi.fn<typeof fetch>();
    networkFetch.mockRejectedValue(new TypeError("connection details"));
    const networkClient = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: networkFetch,
    });

    await expect(networkClient.articles.list()).rejects.toMatchObject({
      code: "NETWORK",
      message: "CMS request could not be completed.",
    });

    const timeoutFetch = vi.fn<typeof fetch>();
    timeoutFetch.mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("aborted", "AbortError"));
          });
        }),
    );
    const timeoutClient = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: timeoutFetch,
      timeoutMs: 1,
    });

    await expect(timeoutClient.articles.list()).rejects.toMatchObject({
      code: "TIMEOUT",
      message: "CMS request timed out.",
    });
  });
});

describe("CMS endpoint configuration", () => {
  it("requires HTTPS for non-local production endpoints", () => {
    expect(() =>
      normalizeCmsBaseUrl("http://cms.example.test", "production"),
    ).toThrowError("CMS_BASE_URL must use HTTPS in production.");
    expect(
      normalizeCmsBaseUrl("http://localhost:1337/", "production"),
    ).toBe("http://localhost:1337");
  });

  it("rejects credentials embedded in the CMS URL", () => {
    expect(() =>
      normalizeCmsBaseUrl("https://user:secret@cms.example.test"),
    ).toThrowError(
      "CMS_BASE_URL must be an HTTP or HTTPS base URL without credentials, query, or fragment.",
    );
  });
});
