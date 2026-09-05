import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';

import type { Core } from '@strapi/strapi';

import { seedLaunchReviewContent } from './launch';

type StoredDocument = {
  data: Record<string, unknown>;
  documentId: string;
  id: number;
  status?: 'draft';
};

const createStrapiDouble = () => {
  const documentsByUid = new Map<string, StoredDocument[]>();
  const media: { id: number; name: string }[] = [];
  let nextDocumentId = 1;
  let nextMediaId = 1;

  const documents = (uid: string) => ({
    findFirst: async (params: Record<string, unknown> = {}) => {
      const documentsForUid = documentsByUid.get(uid) ?? [];
      const filters = params.filters as
        | { slug?: { $eq?: string } }
        | undefined;
      const slug = filters?.slug?.$eq;

      return (
        documentsForUid.find((document) =>
          slug ? document.data.slug === slug : true,
        ) ?? null
      );
    },
    create: async ({
      data,
      status,
    }: {
      data: Record<string, unknown>;
      status?: 'draft';
    }) => {
      const id = nextDocumentId++;
      const document = {
        data,
        documentId: `document-${id}`,
        id,
        status,
      };
      const documentsForUid = documentsByUid.get(uid) ?? [];
      documentsForUid.push(document);
      documentsByUid.set(uid, documentsForUid);
      return document;
    },
  });

  const uploadService = {
    findMany: async (query: Record<string, unknown>) => {
      const filters = query.filters as { name?: { $eq?: string } } | undefined;
      return media.filter(({ name }) => name === filters?.name?.$eq).slice(0, 1);
    },
    upload: async ({
      files,
    }: {
      files: { originalFilename: string }[];
    }) =>
      files.map(({ originalFilename }) => {
        const uploaded = { id: nextMediaId++, name: originalFilename };
        media.push(uploaded);
        return uploaded;
      }),
  };

  const strapi = {
    documents,
    plugin: () => ({ service: () => uploadService }),
  } as unknown as Core.Strapi;

  return { documentsByUid, media, strapi };
};

test('launch review seed creates once and skips every matching record on rerun', async () => {
  const { documentsByUid, media, strapi } = createStrapiDouble();
  const options = {
    assetsDirectory: path.resolve(process.cwd(), 'seed', 'assets'),
    confirmed: true,
    environment: 'test',
  };

  const first = await seedLaunchReviewContent(strapi, options);
  assert.deepEqual(first, {
    assets: { created: 5, skipped: 0 },
    documents: { created: 29, skipped: 0 },
  });
  assert.equal(media.length, 5);

  const editorialUids = [
    'api::article.article',
    'api::event.event',
    'api::resource.resource',
    'api::sermon.sermon',
    'api::story.story',
  ];
  for (const uid of editorialUids) {
    for (const document of documentsByUid.get(uid) ?? []) {
      assert.equal(document.status, 'draft');
    }
  }

  const second = await seedLaunchReviewContent(strapi, options);
  assert.deepEqual(second, {
    assets: { created: 0, skipped: 5 },
    documents: { created: 0, skipped: 29 },
  });
  assert.equal(media.length, 5);
});

test('launch review seed rejects missing confirmation before writing', async () => {
  const { documentsByUid, media, strapi } = createStrapiDouble();

  await assert.rejects(
    () =>
      seedLaunchReviewContent(strapi, {
        assetsDirectory: path.resolve(process.cwd(), 'seed', 'assets'),
        confirmed: false,
        environment: 'test',
      }),
    /not confirmed/,
  );
  assert.equal(documentsByUid.size, 0);
  assert.equal(media.length, 0);
});
