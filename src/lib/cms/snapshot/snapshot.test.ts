import { describe, expect, it, vi } from "vitest";

import { createCmsClient } from "../client";
import { captureSnapshot, summarizeSnapshot } from "./capture";
import { createSnapshotFetch } from "./fetch";
import {
  computeSnapshotId,
  parseSnapshot,
  snapshotFormatVersion,
  type Snapshot,
} from "./format";

const publishedAt = "2026-11-01T00:00:00.000Z";

const media = (name: string, url = `https://media.example.test/${name}.webp`) => ({
  documentId: `media-${name}`,
  name: `${name}.webp`,
  url,
  mime: "image/webp",
  width: 1600,
  height: 900,
  size: 120,
});

const event = (
  slug: string,
  startDateTime: string,
  overrides: Record<string, unknown> = {},
) => ({
  documentId: `event-${slug}`,
  title: `Event ${slug}`,
  slug,
  summary: `Summary for ${slug}`,
  description: [
    { type: "paragraph", children: [{ type: "text", text: "Details" }] },
  ],
  banner: media(slug),
  startDateTime,
  endDateTime: null,
  locationName: "Youth Hall",
  gallery: [],
  featured: false,
  publishedAt,
  ...overrides,
});

const category = (index: number) => ({
  documentId: `category-${String(index).padStart(3, "0")}`,
  name: `Category ${index}`,
  slug: `category-${index}`,
});

const content = (overrides: Partial<Pick<Snapshot, "collections" | "singles">> = {}) => ({
  collections: {
    articles: [],
    authors: [],
    categories: [category(1), category(2)],
    events: [
      event("past", "2026-01-10T12:00:00.000Z"),
      event("ongoing", "2026-06-01T08:00:00.000Z", {
        endDateTime: "2026-06-01T14:00:00.000Z",
      }),
      event("later", "2026-09-05T11:00:00.000Z", { featured: true }),
      event("soon", "2026-06-20T19:00:00+07:00", {
        locationName: "Riverside Café",
      }),
    ],
    resources: [],
    series: [],
    sermons: [],
    stories: [],
    ...overrides.collections,
  },
  singles: {
    "about-page": null,
    "home-page": null,
    navigation: {
      documentId: "navigation",
      primaryItems: [{ label: "Sự kiện", url: "/events", openInNewTab: false }],
      utilityItems: [],
      footerItems: [],
      publishedAt,
    },
    "site-setting": {
      documentId: "site-setting",
      siteName: "Jerusalem Youth",
      siteDescription: "Cùng lớn lên trong đức tin.",
      publishedAt,
    },
    "social-links": null,
    ...overrides.singles,
  },
});

const snapshotOf = (value = content()): Snapshot =>
  parseSnapshot({
    formatVersion: snapshotFormatVersion,
    id: computeSnapshotId(value as Pick<Snapshot, "collections" | "singles">),
    capturedAt: "2026-11-16T00:00:00.000Z",
    sourceOrigin: "https://cms.example.test",
    ...value,
  });

const clientFor = (snapshot: Snapshot) =>
  createCmsClient({
    baseUrl: snapshot.sourceOrigin,
    fetch: createSnapshotFetch(snapshot),
  });

describe("snapshot file", () => {
  it("accepts valid content and keeps only schema fields", () => {
    const value = content();
    const withExtra = {
      ...value,
      collections: {
        ...value.collections,
        categories: [{ ...category(1), internalNote: "not public" }],
      },
    };
    const snapshot = parseSnapshot({
      formatVersion: snapshotFormatVersion,
      id: computeSnapshotId({
        ...value,
        collections: { ...value.collections, categories: [category(1)] },
      } as Pick<Snapshot, "collections" | "singles">),
      capturedAt: "2026-11-16T00:00:00.000Z",
      sourceOrigin: "https://cms.example.test/admin",
      ...withExtra,
    });

    expect(snapshot.sourceOrigin).toBe("https://cms.example.test");
    expect(snapshot.collections.categories[0]).not.toHaveProperty("internalNote");
  });

  it.each([
    [
      "an invalid record",
      () => content({ collections: { ...content().collections, events: [{ slug: "broken" }] } }),
      /events\[0\] is invalid/,
    ],
    [
      "a duplicate slug",
      () =>
        content({
          collections: {
            ...content().collections,
            categories: [category(1), { ...category(2), slug: "category-1" }],
          },
        }),
      /duplicate slug: category-1/,
    ],
    [
      "a missing required single type",
      () => content({ singles: { ...content().singles, "site-setting": null } }),
      /requires a published site-setting/,
    ],
  ])("rejects %s", (_name, build, message) => {
    expect(() => snapshotOf(build() as ReturnType<typeof content>)).toThrow(message);
  });

  it("rejects edited content and unsupported format versions", () => {
    const snapshot = snapshotOf();

    expect(() =>
      parseSnapshot({
        ...snapshot,
        collections: { ...snapshot.collections, categories: [category(9)] },
      }),
    ).toThrow(/does not match its identifier/);
    expect(() => parseSnapshot({ ...snapshot, formatVersion: 99 })).toThrow(
      /format 99 is not supported/,
    );
  });
});

describe("CMS client reading a snapshot", () => {
  const client = clientFor(snapshotOf());

  it("lists events in start order across time-zone offsets with pagination", async () => {
    const first = await client.events.list({ page: 1, pageSize: 3 });
    const second = await client.events.list({ page: 2, pageSize: 3 });

    expect(first.items.map((item) => item.slug)).toEqual(["past", "ongoing", "soon"]);
    expect(first.pagination).toEqual({ page: 1, pageCount: 2, pageSize: 3, total: 4 });
    expect(second.items.map((item) => item.slug)).toEqual(["later"]);
  });

  it("selects upcoming events by end time, or by start time when there is none", async () => {
    const during = await client.events.upcoming({
      from: "2026-06-01T10:00:00.000Z",
      pageSize: 10,
    });
    const after = await client.events.upcoming({
      from: "2026-06-01T15:00:00.000Z",
      pageSize: 10,
    });
    const featured = await client.events.upcoming({
      featured: true,
      from: "2026-01-01T00:00:00.000Z",
    });

    expect(during.items.map((item) => item.slug)).toEqual(["ongoing", "soon", "later"]);
    expect(after.items.map((item) => item.slug)).toEqual(["soon", "later"]);
    expect(featured.items.map((item) => item.slug)).toEqual(["later"]);
  });

  it("finds by slug, searches case-insensitively and maps media", async () => {
    await expect(client.events.findBySlug("soon")).resolves.toMatchObject({
      banner: { url: "https://media.example.test/soon.webp" },
      locationName: "Riverside Café",
    });
    await expect(client.events.findBySlug("missing")).resolves.toBeNull();

    const results = await client.events.search("riverside");

    expect(results.items.map((item) => item.slug)).toEqual(["soon"]);
    await expect(client.events.search("nothing here")).resolves.toMatchObject({
      items: [],
      pagination: { total: 0, pageCount: 0 },
    });
  });

  it("reads single types and treats unpublished ones as absent", async () => {
    await expect(client.siteSettings()).resolves.toMatchObject({
      siteName: "Jerusalem Youth",
    });
    await expect(client.navigation()).resolves.toMatchObject({
      primaryItems: [{ label: "Sự kiện", url: "/events" }],
    });
    await expect(client.homePage()).resolves.toBeNull();
    await expect(client.aboutPage()).resolves.toBeNull();
  });

  it("answers every other query the website makes without error", async () => {
    await expect(
      Promise.all([
        client.articles.list(),
        client.articles.latest(),
        client.articles.listByCategory("category-1"),
        client.articles.search("faith"),
        client.authors.list(),
        client.categories.findBySlug("category-2"),
        client.resources.list(),
        client.resources.search("guide"),
        client.sermonSeries.list(),
        client.sermons.list(),
        client.sermons.latest(),
        client.sermons.search("hope"),
        client.stories.list(),
        client.stories.latest({ pageSize: 3 }),
        client.stories.search("story"),
        client.socialLinks(),
      ]),
    ).resolves.toHaveLength(16);
  });

  it("fails loudly for a query it does not understand", async () => {
    const snapshotFetch = createSnapshotFetch(snapshotOf());

    for (const url of [
      "https://cms.example.test/api/events?filters[title][$startsWith]=a",
      "https://cms.example.test/api/events?locale=vi",
      "https://cms.example.test/api/unknown",
      "https://cms.example.test/admin",
    ]) {
      expect((await snapshotFetch(url)).status).toBe(400);
    }
  });
});

describe("snapshot capture", () => {
  const manyCategories = Array.from({ length: 120 }, (_, index) => category(index + 1));
  const source = () =>
    snapshotOf(
      content({ collections: { ...content().collections, categories: manyCategories } }),
    );
  const quiet = { sleep: async () => undefined, wakeDelayMs: 0 };

  it("reads every page of every public type and reproduces the content", async () => {
    const upstream = source();
    const fetchMock = vi.fn(createSnapshotFetch(upstream));
    const captured = await captureSnapshot({
      baseUrl: "https://cms.example.test/",
      fetch: fetchMock,
      now: () => new Date("2026-11-16T09:00:00.000Z"),
      ...quiet,
    });

    expect(captured.id).toBe(upstream.id);
    expect(captured.capturedAt).toBe("2026-11-16T09:00:00.000Z");
    expect(captured.collections.categories).toHaveLength(120);
    expect(summarizeSnapshot(captured)).toMatchObject({
      collections: { categories: 120, events: 4 },
      relativeMedia: 0,
      singles: { "home-page": "missing", "site-setting": "published" },
    });
    expect(parseSnapshot(JSON.parse(JSON.stringify(captured)))).toEqual(captured);

    const requested = fetchMock.mock.calls.map(([url]) => new URL(String(url)));

    expect(
      requested.every((url) => url.origin === "https://cms.example.test"),
    ).toBe(true);
    expect(
      requested.some(
        (url) =>
          url.pathname === "/api/categories" &&
          url.searchParams.get("pagination[page]") === "2",
      ),
    ).toBe(true);
    expect(
      requested
        .filter((url) => url.pathname === "/api/events")
        .every((url) => url.searchParams.get("status") === "published"),
    ).toBe(true);
  });

  it("waits for a sleeping CMS and gives up after the allowed attempts", async () => {
    const upstream = createSnapshotFetch(source());
    let calls = 0;
    const waking: typeof fetch = async (input, init) => {
      calls += 1;

      if (calls <= 2) throw new TypeError("connection refused");

      return upstream(input, init);
    };

    await expect(
      captureSnapshot({ baseUrl: "https://cms.example.test", fetch: waking, ...quiet }),
    ).resolves.toMatchObject({ formatVersion: snapshotFormatVersion });
    await expect(
      captureSnapshot({
        baseUrl: "https://cms.example.test",
        fetch: async () => new Response("starting", { status: 503 }),
        wakeAttempts: 3,
        ...quiet,
      }),
    ).rejects.toThrow(/did not become available after 3 attempts/);
  });

  it("refuses content that changes during the capture", async () => {
    const before = createSnapshotFetch(source());
    const after = createSnapshotFetch(
      snapshotOf(
        content({
          collections: {
            ...content().collections,
            categories: manyCategories.map((item, index) =>
              index === 0 ? { ...item, name: "Edited" } : item,
            ),
          },
        }),
      ),
    );
    let siteSettingReads = 0;
    const changing: typeof fetch = async (input, init) => {
      if (new URL(String(input)).pathname === "/api/social-links") {
        siteSettingReads += 1;
      }

      return (siteSettingReads >= 1 ? after : before)(input, init);
    };

    await expect(
      captureSnapshot({ baseUrl: "https://cms.example.test", fetch: changing, ...quiet }),
    ).rejects.toThrow(/changed during the capture/);
  });

  it("refuses invalid records, failed reads and CMS-hosted media when strict", async () => {
    const upstream = createSnapshotFetch(source());
    const failing: typeof fetch = async (input, init) =>
      new URL(String(input)).pathname === "/api/stories"
        ? new Response("{}", { status: 500 })
        : upstream(input, init);
    const invalid: typeof fetch = async (input, init) =>
      new URL(String(input)).pathname === "/api/site-setting"
        ? Response.json({ data: { documentId: "site-setting" } })
        : upstream(input, init);
    const local = createSnapshotFetch(
      snapshotOf(
        content({
          collections: {
            ...content().collections,
            events: [
              event("local", "2026-06-20T12:00:00.000Z", {
                banner: media("local", "/uploads/local.webp"),
              }),
            ],
          },
        }),
      ),
    );
    const capture = (fetchImplementation: typeof fetch, strict = false) =>
      captureSnapshot({
        baseUrl: "https://cms.example.test",
        fetch: fetchImplementation,
        requireAbsoluteMedia: strict,
        ...quiet,
      });

    await expect(capture(failing)).rejects.toThrow(/stories page 1 failed with status 500/);
    await expect(capture(invalid)).rejects.toThrow(/site-setting is invalid/);
    await expect(capture(local, true)).rejects.toThrow(/1 media file\(s\) are not served/);
    await expect(capture(local)).resolves.toMatchObject({
      collections: { events: [{ slug: "local" }] },
    });
  });
});
