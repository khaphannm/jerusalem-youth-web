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

const eventFixture = {
  documentId: "event-1",
  title: "Friday night gathering",
  slug: "friday-night-gathering",
  summary: "An evening of worship and friendship.",
  description: [
    {
      type: "paragraph",
      children: [{ type: "text", text: "Come and join us." }],
    },
  ],
  banner: mediaFixture,
  startDateTime: "2026-09-04T11:30:00.000Z",
  endDateTime: "2026-09-04T13:30:00.000Z",
  locationName: "Youth Hall",
  address: "123 Community Street",
  mapURL: "https://maps.example.test/youth-hall",
  registrationURL: "https://register.example.test/friday-night",
  registrationDeadline: "2026-09-03T11:30:00.000Z",
  contactName: "Youth Team",
  contactLink: "mailto:youth@example.test",
  gallery: [],
  featured: true,
  seo: null,
  publishedAt: "2026-08-21T03:00:00.000Z",
};

const sermonFixture = {
  documentId: "sermon-1",
  title: "Hope that holds",
  slug: "hope-that-holds",
  speaker: "Ministry Team",
  date: "2026-08-30",
  summary: "Discover a hope that remains steady.",
  videoURL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  series: {
    documentId: "series-1",
    name: "Rooted",
    slug: "rooted",
    description: null,
    coverImage: null,
  },
  biblePassage: "Hebrews 6:19",
  audioURL: "https://media.example.test/audio/hope.mp3",
  thumbnail: mediaFixture,
  notesURL: "https://media.example.test/notes/hope.pdf",
  seo: null,
  publishedAt: "2026-08-31T00:00:00.000Z",
};

const storyFixture = {
  documentId: "story-1",
  title: "Finding a place to belong",
  slug: "finding-a-place-to-belong",
  summary: "A story about finding faith and friendship in community.",
  body: [
    {
      type: "paragraph",
      children: [{ type: "text", text: "There was room for me here." }],
    },
  ],
  featuredImage: mediaFixture,
  personDisplayName: "Jordan",
  videoURL: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  featured: true,
  seo: null,
  publishedAt: "2026-08-31T00:00:00.000Z",
};

const resourceFixture = {
  documentId: "resource-1",
  title: "Small group guide",
  slug: "small-group-guide",
  description: "A practical guide for conversations about faith.",
  category: {
    documentId: "category-2",
    name: "Guides",
    slug: "guides",
    description: null,
  },
  file: {
    ...mediaFixture,
    documentId: "resource-file-1",
    name: "small-group-guide.pdf",
    url: "/uploads/small-group-guide.pdf",
    alternativeText: null,
    mime: "application/pdf",
    width: null,
    height: null,
    formats: null,
  },
  externalURL: null,
  author: null,
  thumbnail: mediaFixture,
  seo: null,
  publishedAt: "2026-08-31T00:00:00.000Z",
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

  it("bypasses the persistent CMS cache during local development", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(jsonResponse(collectionPayload([])));
    const client = createCmsClient({
      baseUrl: "http://localhost:1337",
      environment: "development",
      fetch: fetchMock,
    });

    await client.articles.list({ page: 1, pageSize: 6 });

    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      cache: "no-store",
    });
    expect(fetchMock.mock.calls[0]?.[1]).not.toHaveProperty("next");
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

  it("loads only published sermons in newest-first pages", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(jsonResponse(collectionPayload([], 6)));
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await client.sermons.list({ page: 2, pageSize: 6 });

    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestedUrl.pathname).toBe("/api/sermons");
    expect(requestedUrl.searchParams.get("pagination[page]")).toBe("2");
    expect(requestedUrl.searchParams.get("pagination[pageSize]")).toBe("6");
    expect(requestedUrl.searchParams.get("sort[0]")).toBe("date:desc");
    expect(requestedUrl.searchParams.get("sort[1]")).toBe(
      "publishedAt:desc",
    );
    expect(requestedUrl.searchParams.get("status")).toBe("published");
    expect(requestedUrl.searchParams.getAll("populate")).toEqual(
      expect.arrayContaining(["series.coverImage", "thumbnail"]),
    );
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      cache: "force-cache",
      next: {
        revalidate: false,
        tags: [cmsCacheTags.sermons, cmsCacheTags.sermonSeries],
      },
    });
  });

  it("loads only published stories in newest-first pages", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(jsonResponse(collectionPayload([], 6)));
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await client.stories.list({ page: 2, pageSize: 6 });

    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestedUrl.pathname).toBe("/api/stories");
    expect(requestedUrl.searchParams.get("pagination[page]")).toBe("2");
    expect(requestedUrl.searchParams.get("pagination[pageSize]")).toBe("6");
    expect(requestedUrl.searchParams.get("sort[0]")).toBe(
      "publishedAt:desc",
    );
    expect(requestedUrl.searchParams.get("status")).toBe("published");
    expect(requestedUrl.searchParams.getAll("populate")).toEqual(
      expect.arrayContaining(["featuredImage", "seo.socialImage"]),
    );
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      cache: "force-cache",
      next: {
        revalidate: false,
        tags: [cmsCacheTags.stories],
      },
    });
  });

  it("loads only published resources in newest-first pages", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(jsonResponse(collectionPayload([], 6)));
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await client.resources.list({ page: 2, pageSize: 6 });

    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestedUrl.pathname).toBe("/api/resources");
    expect(requestedUrl.searchParams.get("pagination[page]")).toBe("2");
    expect(requestedUrl.searchParams.get("pagination[pageSize]")).toBe("6");
    expect(requestedUrl.searchParams.get("sort[0]")).toBe(
      "publishedAt:desc",
    );
    expect(requestedUrl.searchParams.get("status")).toBe("published");
    expect(requestedUrl.searchParams.getAll("populate")).toEqual(
      expect.arrayContaining(["category", "file", "thumbnail"]),
    );
  });

  it("searches approved fields on published collections without persistently caching queries", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock
      .mockResolvedValueOnce(jsonResponse(collectionPayload([articleFixture], 5)))
      .mockResolvedValueOnce(jsonResponse(collectionPayload([eventFixture], 5)))
      .mockResolvedValueOnce(jsonResponse(collectionPayload([sermonFixture], 5)))
      .mockResolvedValueOnce(jsonResponse(collectionPayload([storyFixture], 5)))
      .mockResolvedValueOnce(jsonResponse(collectionPayload([resourceFixture], 5)));
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await client.articles.search("  faith\njourney  ");
    await client.events.search("faith journey");
    await client.sermons.search("faith journey");
    await client.stories.search("faith journey");
    await client.resources.search("faith journey");

    const searches = [
      {
        fields: ["title", "excerpt"],
        path: "/api/articles",
      },
      {
        fields: ["title", "summary", "locationName"],
        path: "/api/events",
      },
      {
        fields: ["title", "summary", "speaker", "biblePassage"],
        path: "/api/sermons",
      },
      {
        fields: ["title", "summary"],
        path: "/api/stories",
      },
      {
        fields: ["title", "description"],
        path: "/api/resources",
      },
    ];

    searches.forEach(({ fields, path }, requestIndex) => {
      const requestedUrl = new URL(
        String(fetchMock.mock.calls[requestIndex]?.[0]),
      );
      expect(requestedUrl.pathname).toBe(path);
      expect(requestedUrl.searchParams.get("status")).toBe("published");
      expect(requestedUrl.searchParams.get("pagination[page]")).toBe("1");
      expect(requestedUrl.searchParams.get("pagination[pageSize]")).toBe("5");
      fields.forEach((field, fieldIndex) => {
        expect(
          requestedUrl.searchParams.get(
            `filters[$or][${fieldIndex}][${field}][$containsi]`,
          ),
        ).toBe("faith journey");
      });
      expect(fetchMock.mock.calls[requestIndex]?.[1]).toMatchObject({
        cache: "no-store",
      });
      expect(fetchMock.mock.calls[requestIndex]?.[1]).not.toHaveProperty("next");
    });
  });

  it("rejects a short search before making a CMS request", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(client.articles.search(" a ")).rejects.toMatchObject({
      code: "CONFIGURATION",
      message: "Search query must contain at least 2 characters.",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("loads only a published sermon matching the requested slug", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(
      jsonResponse(collectionPayload([sermonFixture], 1)),
    );
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(client.sermons.findBySlug("hope-that-holds")).resolves
      .toMatchObject({
        audioUrl: sermonFixture.audioURL,
        id: "sermon-1",
        notesUrl: sermonFixture.notesURL,
        series: { name: "Rooted" },
        slug: "hope-that-holds",
        videoUrl: sermonFixture.videoURL,
      });

    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestedUrl.searchParams.get("filters[slug][$eq]")).toBe(
      "hope-that-holds",
    );
    expect(requestedUrl.searchParams.get("pagination[pageSize]")).toBe("1");
    expect(requestedUrl.searchParams.get("status")).toBe("published");
  });

  it("loads only a published story matching the requested slug", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(
      jsonResponse(collectionPayload([storyFixture], 1)),
    );
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(
      client.stories.findBySlug("finding-a-place-to-belong"),
    ).resolves.toMatchObject({
      id: "story-1",
      personDisplayName: storyFixture.personDisplayName,
      slug: "finding-a-place-to-belong",
      videoUrl: storyFixture.videoURL,
    });

    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestedUrl.searchParams.get("filters[slug][$eq]")).toBe(
      "finding-a-place-to-belong",
    );
    expect(requestedUrl.searchParams.get("pagination[pageSize]")).toBe("1");
    expect(requestedUrl.searchParams.get("status")).toBe("published");
  });

  it("loads only a published resource matching the requested slug", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(
      jsonResponse(collectionPayload([resourceFixture], 1)),
    );
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(
      client.resources.findBySlug("small-group-guide"),
    ).resolves.toMatchObject({
      id: "resource-1",
      slug: "small-group-guide",
      source: {
        asset: {
          mimeType: "application/pdf",
          url: "https://cms.example.test/uploads/small-group-guide.pdf",
        },
        kind: "file",
      },
    });

    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestedUrl.searchParams.get("filters[slug][$eq]")).toBe(
      "small-group-guide",
    );
    expect(requestedUrl.searchParams.get("pagination[pageSize]")).toBe("1");
    expect(requestedUrl.searchParams.get("status")).toBe("published");
  });

  it.each([
    ["javascript:alert(1)"],
    ["ftp://resources.example.test/guide"],
    ["https://user:password@resources.example.test/guide"],
  ])("rejects an unsafe external resource URL %s", async (externalURL) => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(
      jsonResponse(
        collectionPayload(
          [
            {
              ...resourceFixture,
              externalURL,
              file: null,
            },
          ],
          1,
        ),
      ),
    );
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(
      client.resources.findBySlug("small-group-guide"),
    ).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
      message: "CMS returned an invalid resources detail payload.",
    });
  });

  it.each([
    ["an unsafe video URL", { videoURL: "javascript:alert(1)" }],
    [
      "a credential-bearing video URL",
      { videoURL: "https://user:password@video.example.test/story" },
    ],
    [
      "an unsafe rich-text link",
      {
        body: [
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
      },
    ],
  ])("rejects a story containing %s", async (_name, override) => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(
      jsonResponse(collectionPayload([{ ...storyFixture, ...override }], 1)),
    );
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(
      client.stories.findBySlug("finding-a-place-to-belong"),
    ).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
      message: "CMS returned an invalid stories detail payload.",
    });
  });

  it.each([
    ["videoURL", "javascript:alert(1)"],
    ["audioURL", "ftp://media.example.test/audio/hope.mp3"],
    ["notesURL", "https://user:password@media.example.test/notes/hope.pdf"],
  ])("rejects a sermon with an unsafe %s", async (field, value) => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(
      jsonResponse(
        collectionPayload([{ ...sermonFixture, [field]: value }], 1),
      ),
    );
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(client.sermons.findBySlug("hope-that-holds")).rejects
      .toMatchObject({
        code: "INVALID_RESPONSE",
        message: "CMS returned an invalid sermons detail payload.",
      });
  });

  it("loads only a published event matching the requested slug", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(
      jsonResponse(collectionPayload([eventFixture], 1)),
    );
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(
      client.events.findBySlug("friday-night-gathering"),
    ).resolves.toMatchObject({
      id: "event-1",
      mapUrl: eventFixture.mapURL,
      registrationUrl: eventFixture.registrationURL,
      slug: "friday-night-gathering",
    });

    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestedUrl.searchParams.get("filters[slug][$eq]")).toBe(
      "friday-night-gathering",
    );
    expect(requestedUrl.searchParams.get("pagination[pageSize]")).toBe("1");
    expect(requestedUrl.searchParams.get("status")).toBe("published");
  });

  it.each([
    ["registrationURL", "javascript:alert(1)"],
    ["mapURL", "ftp://maps.example.test/youth-hall"],
    ["contactLink", "javascript:alert(1)"],
  ])("rejects an event with unsafe %s", async (field, value) => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(
      jsonResponse(
        collectionPayload([{ ...eventFixture, [field]: value }], 1),
      ),
    );
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(client.events.findBySlug("friday-night-gathering")).rejects
      .toMatchObject({
        code: "INVALID_RESPONSE",
        message: "CMS returned an invalid events detail payload.",
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
    expect(
      eventUrl.searchParams.get(
        "filters[$or][0][endDateTime][$gte]",
      ),
    ).toBe("2026-08-22T00:00:00.000Z");
    expect(
      eventUrl.searchParams.get(
        "filters[$or][1][endDateTime][$null]",
      ),
    ).toBe("true");
    expect(
      eventUrl.searchParams.get(
        "filters[$or][1][startDateTime][$gte]",
      ),
    ).toBe(
      "2026-08-22T00:00:00.000Z",
    );
    expect(eventUrl.searchParams.has("filters[startDateTime][$gte]")).toBe(
      false,
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

  it("validates and maps the Home Page single type", async () => {
    const intro = (title: string) => ({ eyebrow: "", title, description: null });
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(
      jsonResponse({
        data: {
          documentId: "home-page-1",
          heroHeadline: "Grow together",
          heroDescription: "A place to belong.",
          primaryCta: { label: "Say hello", url: "https://social.example.test/" },
          introduction: {
            eyebrow: "Who we are",
            title: "Faith together",
            description: "We walk together.",
          },
          community: intro("Community"),
          communityThemes: [{ title: "Worship", description: "We worship." }],
          gathering: intro("Next gathering"),
          gatheringEmptyMessage: "Dates are coming soon.",
          stories: intro("Stories"),
          teaching: intro("Teaching"),
          newcomer: intro("First time?"),
          newcomerSteps: [{ title: "Ask", description: "Send a message." }],
          invitation: intro("Join us"),
          showStories: false,
          showTeaching: null,
          publishedAt: "2026-08-21T03:00:00.000Z",
        },
      }),
    );
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(client.homePage()).resolves.toMatchObject({
      heroHeadline: "Grow together",
      callToAction: { label: "Say hello", url: "https://social.example.test/" },
      introduction: {
        eyebrow: "Who we are",
        title: "Faith together",
        description: "We walk together.",
      },
      community: { eyebrow: null, title: "Community", description: null },
      communityThemes: [{ title: "Worship", description: "We worship." }],
      newcomerSteps: [{ title: "Ask", description: "Send a message." }],
      visibleSections: {
        introduction: true,
        community: true,
        gathering: true,
        stories: false,
        teaching: true,
        newcomer: true,
        invitation: true,
      },
    });

    const requestedUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestedUrl.pathname).toBe("/api/home-page");
    expect(requestedUrl.searchParams.getAll("populate")).toContain(
      "communityThemes",
    );
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      cache: "force-cache",
      next: { revalidate: false, tags: [cmsCacheTags.homePage] },
    });
  });

  it("returns null when the Home Page is unpublished and rejects unsafe invitation links", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: null }, 404));
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: {
          documentId: "home-page-1",
          heroHeadline: "Grow together",
          primaryCta: { label: "Say hello", url: "javascript:alert(1)" },
          publishedAt: "2026-08-21T03:00:00.000Z",
        },
      }),
    );
    const client = createCmsClient({
      baseUrl: "https://cms.example.test",
      fetch: fetchMock,
    });

    await expect(client.homePage()).resolves.toBeNull();
    await expect(client.homePage()).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
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
      heroSlides: [],
      primaryCallToAction: { label: "Plan your visit", url: "/join" },
    });
  });

  it("maps ordered hero slides and uses the Site Settings publication tag", async () => {
    const fetchMock = vi.fn<typeof fetch>();
    fetchMock.mockResolvedValue(jsonResponse({ data: {
      ...siteSettingsFixture,
      heroSlides: [
        { label: "Worship", image: mediaFixture },
        { label: "Community", caption: "Together", image: mediaFixture },
      ],
    } }));
    const client = createCmsClient({ baseUrl: "https://cms.example.test", fetch: fetchMock });
    const settings = await client.siteSettings();
    expect(settings?.heroSlides).toMatchObject([
      { label: "Worship", caption: null, image: { url: "https://cms.example.test/uploads/retreat.jpg" } },
      { label: "Community", caption: "Together" },
    ]);
    expect(new URL(String(fetchMock.mock.calls[0]?.[0])).searchParams.getAll("populate")).toContain("heroSlides.image");
    expect(fetchMock.mock.calls[0]?.[1]?.next?.tags).toContain(cmsCacheTags.siteSettings);
  });

  it.each([null, { ...mediaFixture, mime: "application/pdf" }, { ...mediaFixture, url: "javascript:alert(1)" }])(
    "rejects malformed hero media: %j", async (image) => {
      const fetchMock = vi.fn<typeof fetch>();
      fetchMock.mockResolvedValue(jsonResponse({ data: { ...siteSettingsFixture, heroSlides: [{ label: "Worship", image }] } }));
      const client = createCmsClient({ baseUrl: "https://cms.example.test", fetch: fetchMock });
      await expect(client.siteSettings()).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
    },
  );

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
