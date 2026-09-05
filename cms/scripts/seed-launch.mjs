import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const CONFIRMATION_ARGUMENT = '--confirm-review-seed';
const loadCommonJsModule = createRequire(import.meta.url);
const { compileStrapi, createStrapi } =
  loadCommonJsModule('@strapi/strapi');
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));

const run = async () => {
  if (!process.argv.includes(CONFIRMATION_ARGUMENT)) {
    throw new Error(
      `This command creates review-only CMS records. Re-run with ${CONFIRMATION_ARGUMENT} after reading docs/launch-content-seed-guide.md.`,
    );
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'The review seed is blocked in NODE_ENV=production. Use a local or staging CMS for editorial review.',
    );
  }

  const appDirectory = path.resolve(scriptDirectory, '..');
  process.chdir(appDirectory);

  const appContext = await compileStrapi({ appDir: appDirectory });
  const strapi = createStrapi(appContext);

  try {
    await strapi.load();

    const compiledSeedPath = path.join(
      appContext.distDir ?? appContext.appDir,
      'src',
      'seed',
      'launch.js',
    );
    const { seedLaunchReviewContent } = loadCommonJsModule(compiledSeedPath);
    const result = await seedLaunchReviewContent(strapi, {
      assetsDirectory: path.join(appDirectory, 'seed', 'assets'),
      confirmed: true,
      environment: process.env.NODE_ENV,
    });

    strapi.log.info(
      `Launch review seed complete: ${result.documents.created} documents created, ${result.documents.skipped} documents skipped, ${result.assets.created} assets uploaded, ${result.assets.skipped} assets skipped.`,
    );
  } finally {
    await strapi.destroy();
  }
};

run().then(
  () => process.exit(0),
  (error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Launch review seed failed: ${message}`);
    process.exit(1);
  },
);
