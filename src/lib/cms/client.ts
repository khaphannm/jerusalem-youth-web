import "server-only";

import type { z } from "zod";

import type {
  AboutPage,
  Article,
  Author,
  Category,
  CollectionOptions,
  CollectionResult,
  Event,
  Navigation,
  Resource,
  Sermon,
  SermonSeries,
  SiteSettings,
  SocialLinks,
  Story,
  UpcomingEventOptions,
} from "./domain";
import {
  cmsCacheTags,
  eventCacheLifetimeSeconds,
  type CmsCacheTag,
} from "./cache";
import { CmsError } from "./errors";
import {
  mapAboutPage,
  mapArticle,
  mapAuthor,
  mapCategory,
  mapEvent,
  mapNavigation,
  mapResource,
  mapSermon,
  mapSermonSeries,
  mapSiteSettings,
  mapSocialLinks,
  mapStory,
} from "./mappers";
import {
  aboutPageSchema,
  articleSchema,
  authorSchema,
  categorySchema,
  collectionEnvelopeSchema,
  eventSchema,
  navigationSchema,
  resourceSchema,
  sermonSchema,
  sermonSeriesSchema,
  singleEnvelopeSchema,
  siteSettingsSchema,
  socialLinksSchema,
  storySchema,
} from "./schemas";

type Fetch = typeof fetch;

type ClientConfiguration = Readonly<{
  baseUrl: string;
  fetch?: Fetch;
  timeoutMs?: number;
}>;

type CollectionDefinition<Raw, Domain> = Readonly<{
  cache: CachePolicy;
  endpoint: string;
  populate: readonly string[];
  schema: z.ZodType<Raw>;
  map: (value: Raw, cmsBaseUrl: string) => Domain;
}>;

type SingleDefinition<Raw, Domain> = Readonly<{
  cache: CachePolicy;
  endpoint: string;
  populate: readonly string[];
  schema: z.ZodType<Raw>;
  map: (value: Raw, cmsBaseUrl: string) => Domain;
}>;

type CachePolicy = Readonly<{
  revalidate: number | false;
  tags: readonly CmsCacheTag[];
}>;

type CollectionFilter = Readonly<{
  operator: "$eq" | "$gte" | "$null";
  path: readonly [string, ...string[]];
  value: boolean | string;
}>;

type CollectionQuery = CollectionOptions &
  Readonly<{
    filters?: readonly CollectionFilter[];
    orFilterBranches?: readonly (readonly CollectionFilter[])[];
    sort?: readonly string[];
    status?: "published";
  }>;

const defaultTimeoutMs = 8_000;

const populate = {
  aboutPage: ["values", "primaryCta"],
  article: [
    "featuredImage",
    "author.avatar",
    "category",
    "tags",
    "bibleReferences",
    "seo.socialImage",
  ],
  author: ["avatar"],
  event: ["banner", "gallery", "seo.socialImage"],
  navigation: ["primaryItems", "utilityItems", "footerItems"],
  resource: [
    "category",
    "file",
    "author.avatar",
    "thumbnail",
    "seo.socialImage",
  ],
  sermon: ["series.coverImage", "thumbnail", "seo.socialImage"],
  sermonSeries: ["coverImage"],
  siteSettings: [
    "defaultSeo.socialImage",
    "defaultSocialImage",
    "organizationContact",
    "primaryCta",
  ],
  socialLinks: ["links"],
  story: ["featuredImage", "seo.socialImage"],
} as const;

const isLocalHostname = (hostname: string) =>
  hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";

export const normalizeCmsBaseUrl = (
  value: string | undefined,
  environment = process.env.NODE_ENV,
) => {
  const normalized = value?.trim();

  if (!normalized) {
    throw new CmsError(
      "CONFIGURATION",
      "CMS_BASE_URL is required. See .env.example.",
    );
  }

  let url: URL;

  try {
    url = new URL(normalized);
  } catch (cause) {
    throw new CmsError(
      "CONFIGURATION",
      "CMS_BASE_URL must be a valid HTTP or HTTPS URL.",
      { cause },
    );
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new CmsError(
      "CONFIGURATION",
      "CMS_BASE_URL must be an HTTP or HTTPS base URL without credentials, query, or fragment.",
    );
  }

  if (
    environment === "production" &&
    url.protocol !== "https:" &&
    !isLocalHostname(url.hostname)
  ) {
    throw new CmsError(
      "CONFIGURATION",
      "CMS_BASE_URL must use HTTPS in production.",
    );
  }

  return url.toString().replace(/\/$/, "");
};

const validateCollectionOptions = (options: CollectionOptions) => {
  for (const [name, value] of [
    ["page", options.page],
    ["pageSize", options.pageSize],
  ] as const) {
    if (value !== undefined && (!Number.isInteger(value) || value <= 0)) {
      throw new CmsError(
        "CONFIGURATION",
        `${name} must be a positive integer.`,
      );
    }
  }
};

const buildUrl = (
  baseUrl: string,
  endpoint: string,
  populatePaths: readonly string[],
  options: CollectionQuery = {},
  slug?: string,
) => {
  validateCollectionOptions(options);
  const url = new URL(`api/${endpoint}`, `${baseUrl}/`);

  for (const path of populatePaths) {
    url.searchParams.append("populate", path);
  }

  if (options.page !== undefined) {
    url.searchParams.set("pagination[page]", String(options.page));
  }

  if (options.pageSize !== undefined) {
    url.searchParams.set("pagination[pageSize]", String(options.pageSize));
  }

  options.sort?.forEach((sort, index) => {
    url.searchParams.set(`sort[${index}]`, sort);
  });

  const setFilter = (
    prefix: string,
    { operator, path, value }: CollectionFilter,
  ) => {
    if (path.some((segment) => !/^[A-Za-z][A-Za-z0-9]*$/.test(segment))) {
      throw new CmsError(
        "CONFIGURATION",
        "CMS filter paths must contain valid field names.",
      );
    }

    const filterPath = path.map((segment) => `[${segment}]`).join("");
    url.searchParams.set(`${prefix}${filterPath}[${operator}]`, String(value));
  };

  options.filters?.forEach((filter) => {
    setFilter("filters", filter);
  });

  options.orFilterBranches?.forEach((branch, branchIndex) => {
    branch.forEach((filter) => {
      setFilter(`filters[$or][${branchIndex}]`, filter);
    });
  });

  if (options.status) {
    url.searchParams.set("status", options.status);
  }

  if (slug !== undefined) {
    const normalizedSlug = slug.trim();

    if (!normalizedSlug) {
      throw new CmsError("CONFIGURATION", "slug must not be blank.");
    }

    url.searchParams.set("filters[slug][$eq]", normalizedSlug);
    url.searchParams.set("pagination[pageSize]", "1");
  }

  return url;
};

const isAbortError = (error: unknown) =>
  error instanceof DOMException && error.name === "AbortError";

export const createCmsClient = ({
  baseUrl: unvalidatedBaseUrl,
  fetch: fetchImplementation = fetch,
  timeoutMs = defaultTimeoutMs,
}: ClientConfiguration) => {
  const baseUrl = normalizeCmsBaseUrl(unvalidatedBaseUrl);

  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new CmsError(
      "CONFIGURATION",
      "CMS request timeout must be a positive integer.",
    );
  }

  const request = async (
    url: URL,
    options: Readonly<{
      cache: CachePolicy;
      notFoundAsNull?: boolean;
    }>,
  ): Promise<unknown> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImplementation(url, {
        cache: "force-cache",
        headers: { Accept: "application/json" },
        next: {
          revalidate: options.cache.revalidate,
          tags: [...options.cache.tags],
        },
        signal: controller.signal,
      });

      if (response.status === 404 && options.notFoundAsNull) {
        return null;
      }

      if (!response.ok) {
        throw new CmsError(
          "HTTP",
          `CMS request failed with status ${response.status}.`,
          { status: response.status },
        );
      }

      try {
        return (await response.json()) as unknown;
      } catch (cause) {
        throw new CmsError(
          "INVALID_RESPONSE",
          "CMS returned a response that was not valid JSON.",
          { cause },
        );
      }
    } catch (error) {
      if (error instanceof CmsError) {
        throw error;
      }

      if (isAbortError(error)) {
        throw new CmsError("TIMEOUT", "CMS request timed out.", {
          cause: error,
        });
      }

      throw new CmsError("NETWORK", "CMS request could not be completed.", {
        cause: error,
      });
    } finally {
      clearTimeout(timeout);
    }
  };

  const readCollection = async <Raw, Domain>(
    definition: CollectionDefinition<Raw, Domain>,
    options: CollectionQuery = {},
  ): Promise<CollectionResult<Domain>> => {
    const payload = await request(
      buildUrl(baseUrl, definition.endpoint, definition.populate, options),
      { cache: definition.cache },
    );
    const result = collectionEnvelopeSchema(definition.schema).safeParse(payload);

    if (!result.success) {
      throw new CmsError(
        "INVALID_RESPONSE",
        `CMS returned an invalid ${definition.endpoint} collection payload.`,
        { cause: result.error },
      );
    }

    return {
      items: result.data.data.map((item) => definition.map(item, baseUrl)),
      pagination: result.data.meta.pagination,
    };
  };

  const findBySlug = async <Raw, Domain>(
    definition: CollectionDefinition<Raw, Domain>,
    slug: string,
    options: CollectionQuery = {},
  ): Promise<Domain | null> => {
    const payload = await request(
      buildUrl(baseUrl, definition.endpoint, definition.populate, options, slug),
      { cache: definition.cache },
    );
    const result = collectionEnvelopeSchema(definition.schema).safeParse(payload);

    if (!result.success) {
      throw new CmsError(
        "INVALID_RESPONSE",
        `CMS returned an invalid ${definition.endpoint} detail payload.`,
        { cause: result.error },
      );
    }

    const item = result.data.data[0];
    return item ? definition.map(item, baseUrl) : null;
  };

  const readLatest = async <Raw, Domain>(
    definition: CollectionDefinition<Raw, Domain>,
    sort: readonly string[],
  ): Promise<Domain | null> => {
    const result = await readCollection(definition, { pageSize: 1, sort });

    return result.items[0] ?? null;
  };

  const readSingle = async <Raw, Domain>(
    definition: SingleDefinition<Raw, Domain>,
  ): Promise<Domain | null> => {
    const payload = await request(
      buildUrl(baseUrl, definition.endpoint, definition.populate),
      { cache: definition.cache, notFoundAsNull: true },
    );

    if (payload === null) {
      return null;
    }
    const result = singleEnvelopeSchema(definition.schema).safeParse(payload);

    if (!result.success) {
      throw new CmsError(
        "INVALID_RESPONSE",
        `CMS returned an invalid ${definition.endpoint} payload.`,
        { cause: result.error },
      );
    }

    return result.data.data
      ? definition.map(result.data.data, baseUrl)
      : null;
  };

  const articles = {
    cache: {
      revalidate: false,
      tags: [
        cmsCacheTags.articles,
        cmsCacheTags.authors,
        cmsCacheTags.categories,
      ],
    },
    endpoint: "articles",
    populate: populate.article,
    schema: articleSchema,
    map: mapArticle,
  } satisfies CollectionDefinition<z.infer<typeof articleSchema>, Article>;
  const authors = {
    cache: { revalidate: false, tags: [cmsCacheTags.authors] },
    endpoint: "authors",
    populate: populate.author,
    schema: authorSchema,
    map: mapAuthor,
  } satisfies CollectionDefinition<z.infer<typeof authorSchema>, Author>;
  const categories = {
    cache: { revalidate: false, tags: [cmsCacheTags.categories] },
    endpoint: "categories",
    populate: [],
    schema: categorySchema,
    map: (category: z.infer<typeof categorySchema>) => mapCategory(category),
  } satisfies CollectionDefinition<z.infer<typeof categorySchema>, Category>;
  const events = {
    cache: {
      revalidate: eventCacheLifetimeSeconds,
      tags: [cmsCacheTags.events],
    },
    endpoint: "events",
    populate: populate.event,
    schema: eventSchema,
    map: mapEvent,
  } satisfies CollectionDefinition<z.infer<typeof eventSchema>, Event>;
  const resources = {
    cache: {
      revalidate: false,
      tags: [
        cmsCacheTags.resources,
        cmsCacheTags.authors,
        cmsCacheTags.categories,
      ],
    },
    endpoint: "resources",
    populate: populate.resource,
    schema: resourceSchema,
    map: mapResource,
  } satisfies CollectionDefinition<z.infer<typeof resourceSchema>, Resource>;
  const sermonSeries = {
    cache: { revalidate: false, tags: [cmsCacheTags.sermonSeries] },
    endpoint: "series",
    populate: populate.sermonSeries,
    schema: sermonSeriesSchema,
    map: mapSermonSeries,
  } satisfies CollectionDefinition<z.infer<typeof sermonSeriesSchema>, SermonSeries>;
  const sermons = {
    cache: {
      revalidate: false,
      tags: [cmsCacheTags.sermons, cmsCacheTags.sermonSeries],
    },
    endpoint: "sermons",
    populate: populate.sermon,
    schema: sermonSchema,
    map: mapSermon,
  } satisfies CollectionDefinition<z.infer<typeof sermonSchema>, Sermon>;
  const stories = {
    cache: { revalidate: false, tags: [cmsCacheTags.stories] },
    endpoint: "stories",
    populate: populate.story,
    schema: storySchema,
    map: mapStory,
  } satisfies CollectionDefinition<z.infer<typeof storySchema>, Story>;

  return {
    aboutPage: () =>
      readSingle({
        cache: { revalidate: false, tags: [cmsCacheTags.aboutPage] },
        endpoint: "about-page",
        populate: populate.aboutPage,
        schema: aboutPageSchema,
        map: (aboutPage) => mapAboutPage(aboutPage),
      } satisfies SingleDefinition<
        z.infer<typeof aboutPageSchema>,
        AboutPage
      >),
    articles: {
      list: (options?: CollectionOptions) =>
        readCollection(articles, {
          ...options,
          sort: ["publishedAt:desc"],
          status: "published",
        }),
      findBySlug: (slug: string) =>
        findBySlug(articles, slug, { status: "published" }),
      listByCategory: (
        categorySlug: string,
        options?: CollectionOptions,
      ) => {
        const normalizedCategorySlug = categorySlug.trim();

        if (!normalizedCategorySlug) {
          throw new CmsError(
            "CONFIGURATION",
            "categorySlug must not be blank.",
          );
        }

        return readCollection(articles, {
          ...options,
          filters: [
            {
              operator: "$eq",
              path: ["category", "slug"],
              value: normalizedCategorySlug,
            },
          ],
          sort: ["publishedAt:desc"],
          status: "published",
        });
      },
      latest: () => readLatest(articles, ["publishedAt:desc"]),
    },
    authors: {
      list: (options?: CollectionOptions) => readCollection(authors, options),
      findBySlug: (slug: string) => findBySlug(authors, slug),
    },
    categories: {
      list: (options?: CollectionOptions) => readCollection(categories, options),
      findBySlug: (slug: string) => findBySlug(categories, slug),
    },
    events: {
      list: (options?: CollectionOptions) =>
        readCollection(events, {
          ...options,
          sort: ["startDateTime:asc"],
          status: "published",
        }),
      findBySlug: (slug: string) =>
        findBySlug(events, slug, { status: "published" }),
      upcoming: ({
        featured,
        from,
        pageSize = 4,
      }: UpcomingEventOptions) => {
        const normalizedFrom = from.trim();

        if (!normalizedFrom || !Number.isFinite(Date.parse(normalizedFrom))) {
          throw new CmsError(
            "CONFIGURATION",
            "Upcoming event start date must be a valid date-time.",
          );
        }

        return readCollection(events, {
          filters: [
            ...(featured === undefined
              ? []
              : [
                  {
                    operator: "$eq" as const,
                    path: ["featured"] as const,
                    value: featured,
                  },
                ]),
          ],
          orFilterBranches: [
            [
              {
                operator: "$gte",
                path: ["endDateTime"],
                value: normalizedFrom,
              },
            ],
            [
              {
                operator: "$null",
                path: ["endDateTime"],
                value: true,
              },
              {
                operator: "$gte",
                path: ["startDateTime"],
                value: normalizedFrom,
              },
            ],
          ],
          pageSize,
          sort: ["startDateTime:asc"],
          status: "published",
        });
      },
    },
    resources: {
      list: (options?: CollectionOptions) => readCollection(resources, options),
      findBySlug: (slug: string) => findBySlug(resources, slug),
    },
    sermonSeries: {
      list: (options?: CollectionOptions) =>
        readCollection(sermonSeries, options),
      findBySlug: (slug: string) => findBySlug(sermonSeries, slug),
    },
    sermons: {
      list: (options?: CollectionOptions) =>
        readCollection(sermons, {
          ...options,
          sort: ["date:desc", "publishedAt:desc"],
          status: "published",
        }),
      findBySlug: (slug: string) =>
        findBySlug(sermons, slug, { status: "published" }),
      latest: () => readLatest(sermons, ["date:desc", "publishedAt:desc"]),
    },
    stories: {
      list: (options?: CollectionOptions) => readCollection(stories, options),
      findBySlug: (slug: string) => findBySlug(stories, slug),
      latest: (options: Pick<CollectionOptions, "pageSize"> = {}) =>
        readCollection(stories, {
          ...options,
          sort: ["publishedAt:desc"],
        }),
    },
    navigation: () =>
      readSingle({
        cache: { revalidate: false, tags: [cmsCacheTags.navigation] },
        endpoint: "navigation",
        populate: populate.navigation,
        schema: navigationSchema,
        map: (navigation) => mapNavigation(navigation),
      } satisfies SingleDefinition<
        z.infer<typeof navigationSchema>,
        Navigation
      >),
    siteSettings: () =>
      readSingle({
        cache: { revalidate: false, tags: [cmsCacheTags.siteSettings] },
        endpoint: "site-setting",
        populate: populate.siteSettings,
        schema: siteSettingsSchema,
        map: mapSiteSettings,
      } satisfies SingleDefinition<
        z.infer<typeof siteSettingsSchema>,
        SiteSettings
      >),
    socialLinks: () =>
      readSingle({
        cache: { revalidate: false, tags: [cmsCacheTags.socialLinks] },
        endpoint: "social-links",
        populate: populate.socialLinks,
        schema: socialLinksSchema,
        map: (socialLinks) => mapSocialLinks(socialLinks),
      } satisfies SingleDefinition<
        z.infer<typeof socialLinksSchema>,
        SocialLinks
      >),
  };
};

let defaultClient: ReturnType<typeof createCmsClient> | undefined;

export const getCmsClient = () => {
  defaultClient ??= createCmsClient({ baseUrl: process.env.CMS_BASE_URL ?? "" });
  return defaultClient;
};
