import { stat } from 'node:fs/promises';
import path from 'node:path';

import type { Core } from '@strapi/strapi';

import {
  assertLaunchSeedSafety,
  launchArticles,
  launchAssets,
  launchEvents,
  launchResources,
  launchSermons,
  launchSingles,
  launchStories,
  launchTaxonomy,
  type LaunchAsset,
  type LaunchAssetKey,
  type LaunchCollectionEntry,
} from './launch-content';

type SeedDocument = {
  documentId: string;
  id: number | string;
};

type SeedDocumentService = {
  create(params: {
    data: Record<string, unknown>;
    status?: 'draft';
  }): Promise<SeedDocument>;
  findFirst(params?: Record<string, unknown>): Promise<SeedDocument | null>;
};

type SeedMedia = {
  id: number | string;
  name: string;
};

type UploadInput = {
  filepath: string;
  mimetype: 'image/webp';
  originalFilename: string;
  size: number;
};

type UploadService = {
  findMany(query: Record<string, unknown>): Promise<SeedMedia[]>;
  upload(input: {
    data: Record<string, unknown>;
    files: UploadInput[];
  }): Promise<SeedMedia[]>;
};

type SeedSummary = {
  assets: { created: number; skipped: number };
  documents: { created: number; skipped: number };
};

type SeedOptions = {
  assetsDirectory: string;
  confirmed: boolean;
  environment?: string;
};

const MAX_ASSET_SIZE_BYTES = 10 * 1024 * 1024;

const getDocumentService = (strapi: Core.Strapi, uid: string) =>
  (
    strapi.documents as unknown as (
      contentTypeUid: string,
    ) => SeedDocumentService
  )(uid);

const getUploadService = (strapi: Core.Strapi) =>
  strapi.plugin('upload').service('upload') as unknown as UploadService;

const withoutSeedKeys = (
  data: Record<string, unknown>,
  keys: readonly string[],
) =>
  Object.fromEntries(
    Object.entries(data).filter(([key]) => !keys.includes(key)),
  );

const validateAssets = async (assetsDirectory: string) => {
  for (const asset of Object.values(launchAssets)) {
    const filePath = path.join(assetsDirectory, asset.fileName);
    const fileStats = await stat(filePath);

    if (!fileStats.isFile()) {
      throw new Error(`Launch seed asset is not a file: ${filePath}`);
    }

    if (fileStats.size > MAX_ASSET_SIZE_BYTES) {
      throw new Error(
        `Launch seed asset exceeds the 10 MB upload limit: ${filePath}`,
      );
    }
  }
};

const findOrUploadAsset = async ({
  asset,
  assetsDirectory,
  strapi,
}: {
  asset: LaunchAsset;
  assetsDirectory: string;
  strapi: Core.Strapi;
}): Promise<{ media: SeedMedia; skipped: boolean }> => {
  const uploadService = getUploadService(strapi);
  const [existing] = await uploadService.findMany({
    filters: { name: { $eq: asset.fileName } },
    pagination: { page: 1, pageSize: 1 },
  });

  if (existing) {
    return { media: existing, skipped: true };
  }

  const filePath = path.join(assetsDirectory, asset.fileName);
  const fileStats = await stat(filePath);
  const [uploaded] = await uploadService.upload({
    data: {
      fileInfo: {
        name: asset.fileName,
        alternativeText: asset.alternativeText,
        caption: asset.caption,
      },
    },
    files: [
      {
        filepath: filePath,
        mimetype: 'image/webp',
        originalFilename: asset.fileName,
        size: fileStats.size,
      },
    ],
  });

  if (!uploaded) {
    throw new Error(`Strapi did not return uploaded media for ${asset.fileName}.`);
  }

  return { media: uploaded, skipped: false };
};

const findOrCreateBySlug = async ({
  data,
  draft = false,
  slug,
  strapi,
  uid,
}: {
  data: Record<string, unknown>;
  draft?: boolean;
  slug: string;
  strapi: Core.Strapi;
  uid: string;
}): Promise<{ document: SeedDocument; skipped: boolean }> => {
  const service = getDocumentService(strapi, uid);
  const existing = await service.findFirst({
    filters: { slug: { $eq: slug } },
    ...(draft ? { status: 'draft' } : {}),
  });

  if (existing) {
    return { document: existing, skipped: true };
  }

  const document = await service.create({
    data,
    ...(draft ? { status: 'draft' as const } : {}),
  });

  return { document, skipped: false };
};

const findOrCreateSingle = async ({
  data,
  strapi,
  uid,
}: {
  data: Record<string, unknown>;
  strapi: Core.Strapi;
  uid: string;
}): Promise<{ document: SeedDocument; skipped: boolean }> => {
  const service = getDocumentService(strapi, uid);
  const existing = await service.findFirst({ status: 'draft' });

  if (existing) {
    return { document: existing, skipped: true };
  }

  const document = await service.create({ data, status: 'draft' });
  return { document, skipped: false };
};

const recordResult = (
  summary: SeedSummary,
  group: keyof SeedSummary,
  skipped: boolean,
) => {
  summary[group][skipped ? 'skipped' : 'created'] += 1;
};

const seedCollection = async ({
  entries,
  getData,
  strapi,
  summary,
  uid,
}: {
  entries: readonly LaunchCollectionEntry[];
  getData: (entry: LaunchCollectionEntry) => Record<string, unknown>;
  strapi: Core.Strapi;
  summary: SeedSummary;
  uid: string;
}) => {
  for (const entry of entries) {
    const result = await findOrCreateBySlug({
      data: getData(entry),
      draft: true,
      slug: entry.slug,
      strapi,
      uid,
    });
    recordResult(summary, 'documents', result.skipped);
  }
};

export const seedLaunchReviewContent = async (
  strapi: Core.Strapi,
  options: SeedOptions,
): Promise<SeedSummary> => {
  assertLaunchSeedSafety({
    confirmed: options.confirmed,
    environment: options.environment,
  });
  await validateAssets(options.assetsDirectory);

  const summary: SeedSummary = {
    assets: { created: 0, skipped: 0 },
    documents: { created: 0, skipped: 0 },
  };
  const media = {} as Record<LaunchAssetKey, SeedMedia>;

  for (const [key, asset] of Object.entries(launchAssets) as [
    LaunchAssetKey,
    LaunchAsset,
  ][]) {
    const result = await findOrUploadAsset({
      asset,
      assetsDirectory: options.assetsDirectory,
      strapi,
    });
    media[key] = result.media;
    recordResult(summary, 'assets', result.skipped);
  }

  const authorResult = await findOrCreateBySlug({
    data: launchTaxonomy.author.data,
    slug: launchTaxonomy.author.slug,
    strapi,
    uid: 'api::author.author',
  });
  recordResult(summary, 'documents', authorResult.skipped);

  const categories = new Map<string, SeedDocument>();
  for (const category of launchTaxonomy.categories) {
    const result = await findOrCreateBySlug({
      data: category.data,
      slug: category.slug,
      strapi,
      uid: 'api::category.category',
    });
    categories.set(category.slug, result.document);
    recordResult(summary, 'documents', result.skipped);
  }

  const seriesResult = await findOrCreateBySlug({
    data: {
      ...launchTaxonomy.series.data,
      coverImage: media.worshipGathering.id,
    },
    slug: launchTaxonomy.series.slug,
    strapi,
    uid: 'api::sermon-series.sermon-series',
  });
  recordResult(summary, 'documents', seriesResult.skipped);

  const singleEntries = [
    {
      uid: 'api::site-setting.site-setting',
      data: {
        ...launchSingles.siteSetting,
        defaultSocialImage: media.communityGathering.id,
        heroSlides: [
          { image: media.worshipGathering.id, label: 'Worship', caption: 'Review illustration — worship together.' },
          { image: media.communityGathering.id, label: 'Community', caption: 'Review illustration — find your community.' },
          { image: media.carePackages.id, label: 'Serving', caption: 'Review illustration — serve together.' },
        ],
      },
    },
    {
      uid: 'api::about-page.about-page',
      data: launchSingles.aboutPage,
    },
    {
      uid: 'api::home-page.home-page',
      data: launchSingles.homePage,
    },
    {
      uid: 'api::navigation.navigation',
      data: launchSingles.navigation,
    },
    {
      uid: 'api::social-links.social-links',
      data: launchSingles.socialLinks,
    },
  ] as const;

  for (const single of singleEntries) {
    const result = await findOrCreateSingle({
      data: single.data,
      strapi,
      uid: single.uid,
    });
    recordResult(summary, 'documents', result.skipped);
  }

  await seedCollection({
    entries: launchArticles,
    strapi,
    summary,
    uid: 'api::article.article',
    getData: (entry) => {
      const categorySlug = String(entry.data.categorySlug);
      const category = categories.get(categorySlug);
      if (!category) {
        throw new Error(`Missing seed category: ${categorySlug}`);
      }

      return {
        ...withoutSeedKeys(entry.data, ['categorySlug']),
        featuredImage: media[entry.image].id,
        author: { documentId: authorResult.document.documentId },
        category: { documentId: category.documentId },
      };
    },
  });

  await seedCollection({
    entries: launchEvents,
    strapi,
    summary,
    uid: 'api::event.event',
    getData: (entry) => ({
      ...entry.data,
      banner: media[entry.image].id,
    }),
  });

  await seedCollection({
    entries: launchSermons,
    strapi,
    summary,
    uid: 'api::sermon.sermon',
    getData: (entry) => ({
      ...withoutSeedKeys(entry.data, ['seriesSlug']),
      thumbnail: media[entry.image].id,
      series: { documentId: seriesResult.document.documentId },
    }),
  });

  await seedCollection({
    entries: launchStories,
    strapi,
    summary,
    uid: 'api::story.story',
    getData: (entry) => ({
      ...entry.data,
      featuredImage: media[entry.image].id,
    }),
  });

  await seedCollection({
    entries: launchResources,
    strapi,
    summary,
    uid: 'api::resource.resource',
    getData: (entry) => {
      const categorySlug = String(entry.data.categorySlug);
      const category = categories.get(categorySlug);
      if (!category) {
        throw new Error(`Missing seed category: ${categorySlug}`);
      }

      return {
        ...withoutSeedKeys(entry.data, ['categorySlug']),
        thumbnail: media[entry.image].id,
        author: { documentId: authorResult.document.documentId },
        category: { documentId: category.documentId },
      };
    },
  });

  return summary;
};
