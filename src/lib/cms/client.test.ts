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
  formats: {
    small: {
      name: "small_retreat.jpg",
      url: "/uploads/small_retreat.jpg",
      width: 500,
      height: 281,
      size: 48.2,
    },
  },
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

const navigationFixture = {
  documentId: "navigation-1",
  primaryItems: [
    { label: "About", url: "/about", openInNewTab: false },
    {
      label: "Partner",
      url: "https://partner.example.test",
      openInNewTab: true,
    },
  ],
  utilityItems: [],
  footerItems: [],
  publishedAt: "2026-08-21T03:00:00.000Z",
};

const socialLinksFixture = {
  documentId: "social-links-1",
  links: [
    {
      platform: "YouTube",
      url: "https://youtube.example.test/youth",
      displayOrder: 2,
    },
    {
      platform: "Instagram",
      url: "https://instagram.example.test/youth",
      displayOrder: 1,
    },
  ],
  publishedAt: "2026-08-21T03:00:00.000Z",
};

const siteSettingsFixture = {
  documentId: "site-settings-1",
  siteName: "Jerusalem Youth",
  siteDescription: "A community growing in faith.",
  defaultSeo: null,
  defaultSocialImage: null,
  organizationContact: null,
  primaryCta: { label: "Plan your visit", url: "/join" },
  footerContent: null,
  publishedAt: "2026-08-21T03:00:00.000Z",
};

const aboutPageFixture = {
  documentId: "about-page-1",
  vision: "Young people rooted in Jesus and alive with hope.",
  mission: "We gather, grow, and serve together.",
  values: [
    {
      title: "Faith",
      description: "We follow Jesus in every part of life.",
    },
    {
      title: "Belonging",
      description: "We make room for every young person.",
    },
  ],
  primaryCta: { label: "Join us", url: "/join" },
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
      body: [
        {
          type: "paragraph",
          children: [{ type: "text", text: "Hello" }],
        },
      ],
      tags: ["Retreat"],
      bibleReferences: ["Romans 12:5"],
      featuredImage: {
        id: "image-1",
        url: "https://cms.example.test/uploads/retreat.jpg",
        variants: [
          {
            height: 281,
            url: "https://cms.example.test/uploads/small_retreat.jpg",
            width: 500,
          },
        ],
      },
      author: { id: "author-1", displayName: "Ministry Team" },
      category: { id: "category-1", name: "Community" },
    });
    expect(result.items[0]).not.toHaveProperty("documentId");

    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestedUrl.pathname).toBe("/api/articles");
    expect(requestedUrl.searchParams.getAll("populate")).toContain(
      "featuredImage",
    );
    expect(requestedUrl.searchParams.get("pagination[page]")).toBe("1");
    expect(requestedUrl.searchParams.get("pagination[pageSize]")).toBe("10");
    expect(requestedUrl.searchParams.get("sort[0]")).toBe(
      "publishedAt:desc",
    );
    expect(requestedUrl.searchParams.get("status")).toBe("published");
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

    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestedUrl.searchParams.get("sort[0]")).toBe(
      "startDateTime:asc",
    );
    expect(requestedUrl.searchParams.get("status")).toBe("published");
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      cache: "force-cache",
      next: {
        revalidate: eventCacheLifetimeSeconds,
        tags: [cmsCacheTags.events],
      },
    });
  });

  it("builds curated homepage sort and event filter queries", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockImplementation(async () =>
      jsonResponse(collectionPayload([])),
    );
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await client.events.upcoming({
      featured: true,
      from: "2026-08-22T00:00:00.000Z",
      pageSize: 4,
    });
    await client.articles.latest();
    await client.sermons.latest();
    await client.stories.latest({ pageSize: 3 });

    const eventUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(eventUrl.searchParams.get("filters[startDateTime][$gte]")).toBe(
      "2026-08-22T00:00:00.000Z",
    );
    expect(eventUrl.searchParams.get("filters[featured][$eq]")).toBe("true");
    expect(eventUrl.searchParams.get("sort[0]")).toBe("startDateTime:asc");
    expect(eventUrl.searchParams.get("pagination[pageSize]")).toBe("4");
    expect(eventUrl.searchParams.get("status")).toBe("published");

    const articleUrl = new URL(String(fetchMock.mock.calls[1]?.[0]));
    expect(articleUrl.searchParams.get("sort[0]")).toBe("publishedAt:desc");
    expect(articleUrl.searchParams.get("pagination[pageSize]")).toBe("1");

    const sermonUrl = new URL(String(fetchMock.mock.calls[2]?.[0]));
    expect(sermonUrl.searchParams.getAll("sort[0]")).toEqual(["date:desc"]);
    expect(sermonUrl.searchParams.get("sort[1]")).toBe("publishedAt:desc");

    const storyUrl = new URL(String(fetchMock.mock.calls[3]?.[0]));
    expect(storyUrl.searchParams.get("sort[0]")).toBe("publishedAt:desc");
    expect(storyUrl.searchParams.get("pagination[pageSize]")).toBe("3");
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

  it("maps validated embedded Blocks images to absolute media URLs", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    const articleWithEmbeddedImage = {
      ...articleFixture,
      body: [
        ...articleFixture.body,
        {
          type: "image",
          children: [{ type: "text", text: "" }],
          image: {
            ...mediaFixture,
            hash: "embedded-image",
            caption: "Worship at retreat",
            url: "/uploads/embedded.jpg",
          },
        },
      ],
    };
    fetchMock.mockResolvedValue(
      jsonResponse(collectionPayload([articleWithEmbeddedImage])),
    );
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    const result = await client.articles.findBySlug("retreat-reflection");

    expect(result?.body[1]).toMatchObject({
      caption: "Worship at retreat",
      image: {
        id: "embedded-image",
        url: "https://cms.example.test/uploads/embedded.jpg",
      },
      type: "image",
    });
  });

  it.each([
    [
      "an unsafe rich-text link",
      [
        {
          type: "paragraph",
          children: [
            {
              type: "link",
              url: "javascript:alert(1)",
              children: [{ type: "text", text: "Unsafe" }],
            },
          ],
        },
      ],
    ],
    [
      "an unsupported rich-text block",
      [{ type: "video", url: "https://video.example.test/watch" }],
    ],
  ])("rejects an article containing %s", async (_name, body) => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(
      jsonResponse(collectionPayload([{ ...articleFixture, body }])),
    );
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(client.articles.findBySlug("retreat-reflection")).rejects
      .toMatchObject({
        code: "INVALID_RESPONSE",
        message: "CMS returned an invalid articles detail payload.",
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
    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestedUrl.searchParams.get("filters[slug][$eq]")).toBe(
      "missing",
    );
    expect(requestedUrl.searchParams.get("pagination[pageSize]")).toBe("1");
    expect(requestedUrl.searchParams.get("status")).toBe("published");
  });

  it("requests only published articles in the matching category", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(
      jsonResponse(collectionPayload([articleFixture], 6)),
    );
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    const result = await client.articles.listByCategory("community", {
      page: 2,
      pageSize: 6,
    });

    expect(result.items[0]?.category.slug).toBe("community");
    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestedUrl.searchParams.get("filters[category][slug][$eq]")).toBe(
      "community",
    );
    expect(requestedUrl.searchParams.get("pagination[page]")).toBe("2");
    expect(requestedUrl.searchParams.get("pagination[pageSize]")).toBe("6");
    expect(requestedUrl.searchParams.get("sort[0]")).toBe(
      "publishedAt:desc",
    );
    expect(requestedUrl.searchParams.get("status")).toBe("published");
  });

  it("rejects a blank article category slug before making a request", () => {
    const fetchMock = vi.fn<typeof fetch>();
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    expect(() => client.articles.listByCategory("  ")).toThrowError(
      "categorySlug must not be blank.",
    );
    expect(fetchMock).not.toHaveBeenCalled();
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

  it("validates and maps the About Page single type", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(jsonResponse({ data: aboutPageFixture }));
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(client.aboutPage()).resolves.toEqual({
      id: "about-page-1",
      vision: "Young people rooted in Jesus and alive with hope.",
      mission: "We gather, grow, and serve together.",
      values: [
        {
          title: "Faith",
          description: "We follow Jesus in every part of life.",
        },
        {
          title: "Belonging",
          description: "We make room for every young person.",
        },
      ],
      callToAction: { label: "Join us", url: "/join" },
      publishedAt: "2026-08-21T03:00:00.000Z",
    });

    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestedUrl.pathname).toBe("/api/about-page");
    expect(requestedUrl.searchParams.getAll("populate")).toEqual([
      "values",
      "primaryCta",
    ]);
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      cache: "force-cache",
      next: { revalidate: false, tags: [cmsCacheTags.aboutPage] },
    });
  });

  it("rejects incomplete About Page content", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(
      jsonResponse({ data: { ...aboutPageFixture, values: [] } }),
    );
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(client.aboutPage()).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
      message: "CMS returned an invalid about-page payload.",
    });
  });

  it("maps a safe site-wide primary action", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(jsonResponse({ data: siteSettingsFixture }));
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(client.siteSettings()).resolves.toMatchObject({
      primaryCallToAction: { label: "Plan your visit", url: "/join" },
    });
  });

  it("rejects an unsafe site-wide primary action URL", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(
      jsonResponse({
        data: {
          ...siteSettingsFixture,
          primaryCta: { label: "Unsafe", url: "javascript:alert(1)" },
        },
      }),
    );
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(client.siteSettings()).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
      message: "CMS returned an invalid site-setting payload.",
    });
  });

  it("maps safe internal and external navigation URLs", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(jsonResponse({ data: navigationFixture }));
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(client.navigation()).resolves.toMatchObject({
      primaryItems: [
        { label: "About", url: "/about", openInNewTab: false },
        {
          label: "Partner",
          url: "https://partner.example.test",
          openInNewTab: true,
        },
      ],
    });
  });

  it.each([
    "javascript:alert(1)",
    "//malicious.example.test",
    "/\\malicious.example.test",
  ])("rejects unsafe navigation URL %s", async (unsafeUrl) => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(
      jsonResponse({
        data: {
          ...navigationFixture,
          primaryItems: [
            {
              label: "Unsafe",
              url: unsafeUrl,
              openInNewTab: false,
            },
          ],
        },
      }),
    );
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(client.navigation()).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
      message: "CMS returned an invalid navigation payload.",
    });
  });

  it("maps safe social links in display order", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(jsonResponse({ data: socialLinksFixture }));
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(client.socialLinks()).resolves.toMatchObject({
      links: [
        {
          platform: "Instagram",
          url: "https://instagram.example.test/youth",
        },
        {
          platform: "YouTube",
          url: "https://youtube.example.test/youth",
        },
      ],
    });
  });

  it.each([
    "javascript:alert(1)",
    "ftp://social.example.test/youth",
    "https://user:secret@social.example.test/youth",
  ])("rejects unsafe social URL %s", async (unsafeUrl) => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(
      jsonResponse({
        data: {
          ...socialLinksFixture,
          links: [
            {
              platform: "Unsafe",
              url: unsafeUrl,
              displayOrder: 1,
            },
          ],
        },
      }),
    );
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(client.socialLinks()).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
      message: "CMS returned an invalid social-links payload.",
    });
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
