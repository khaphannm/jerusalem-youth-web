// Loads reviewed copy from a JSON file into Strapi single types.
// Usage: npm run import:content -- content/<file>.json --confirm-overwrite [--publish]
// Existing entries are overwritten field by field; fields missing from the
// file (for example hero photographs in Site Settings) are left untouched.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const CONFIRMATION_ARGUMENT = '--confirm-overwrite';
const PUBLISH_ARGUMENT = '--publish';
const ALLOWED_UIDS = new Set([
  'api::about-page.about-page',
  'api::home-page.home-page',
]);
const loadCommonJsModule = createRequire(import.meta.url);
const { compileStrapi, createStrapi } = loadCommonJsModule('@strapi/strapi');
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const appDirectory = path.resolve(scriptDirectory, '..');

const readEntries = async (file) => {
  const parsed = JSON.parse(await readFile(file, 'utf8'));
  const entries = Object.entries(parsed?.entries ?? {});

  if (entries.length === 0) {
    throw new Error('The content file has no "entries".');
  }

  for (const [uid, data] of entries) {
    if (!ALLOWED_UIDS.has(uid)) {
      throw new Error(`"${uid}" cannot be imported by this command.`);
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error(`"${uid}" must be an object of fields.`);
    }
  }

  return entries;
};

const run = async () => {
  const args = process.argv.slice(2);
  const fileArgument = args.find((argument) => !argument.startsWith('--'));
  const publish = args.includes(PUBLISH_ARGUMENT);

  if (!fileArgument) {
    throw new Error('Pass the content file, for example content/jerusalem-youth-2026.json.');
  }

  if (!args.includes(CONFIRMATION_ARGUMENT)) {
    throw new Error(
      `This command overwrites the Home Page and About Page drafts. Re-run with ${CONFIRMATION_ARGUMENT} once the wording is approved.`,
    );
  }

  // Resolve before chdir so a path relative to the caller still works.
  const candidates = [
    path.resolve(process.env.INIT_CWD ?? process.cwd(), fileArgument),
    path.resolve(appDirectory, fileArgument),
  ];
  let entries;
  let lastError;

  for (const candidate of candidates) {
    try {
      entries = await readEntries(candidate);
      break;
    } catch (error) {
      lastError = error;
      if (error?.code !== 'ENOENT') throw error;
    }
  }

  if (!entries) throw lastError;

  process.chdir(appDirectory);
  const appContext = await compileStrapi({ appDir: appDirectory });
  const strapi = createStrapi(appContext);

  try {
    await strapi.load();

    for (const [uid, data] of entries) {
      const documents = strapi.documents(uid);
      const existing = await documents.findFirst({ status: 'draft' });
      const saved = existing
        ? await documents.update({
            documentId: existing.documentId,
            data,
            status: 'draft',
          })
        : await documents.create({ data, status: 'draft' });

      if (publish) {
        await documents.publish({ documentId: saved.documentId });
      }

      strapi.log.info(
        `${uid}: ${existing ? 'updated' : 'created'}${publish ? ' and published' : ' as draft'}.`,
      );
    }
  } finally {
    await strapi.destroy();
  }
};

run().then(
  () => process.exit(0),
  (error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Content import failed: ${message}`);
    process.exit(1);
  },
);
