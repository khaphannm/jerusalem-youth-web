# Snapshot publication

Implements steps 1 and 2 of the
[free-first deployment plan](exec-plans/free-first-deployment.md) and
[ADR-003](decisions/ADR-003-snapshot-publication.md): a complete export of
published content, and a website mode that serves it without the CMS.
Hosting, media delivery and the one-command release workflow (steps 3–5) are
not built yet.

## Two content sources

| `CMS_SOURCE` | Reads from | Use for |
| --- | --- | --- |
| unset or `live` | Strapi over HTTP on every request | Local development, an always-on CMS |
| `snapshot` | `content-snapshot/public-content.json` bundled with the build | A deployment that must work while the CMS sleeps |

Snapshot mode never falls back to the live CMS. It needs only `SITE_URL`;
`CMS_BASE_URL` and `CMS_REVALIDATION_SECRET` are not read.

## Capture

Requires Node 22.18 or newer (the script runs TypeScript directly).

```bash
# CMS_BASE_URL comes from the environment or .env.local
npm run snapshot:capture
npm run snapshot:capture -- --strict-media   # production captures
```

The capture:

1. Waits for the CMS, retrying while a sleeping host starts (up to 8 attempts,
   10 seconds apart).
2. Reads every page of every public collection (articles, authors, categories,
   events, resources, series, sermons, stories) and every single type, with
   `status=published` and no cache.
3. Validates each record with the same schemas as the live client and keeps
   only the fields those schemas define.
4. Rejects HTTP errors, invalid records, duplicate identifiers or slugs,
   incomplete pagination, and a missing Site Settings or Navigation entry.
   About Page, Home Page and Social Links may be unpublished; every collection
   may be empty.
5. Reads everything a second time and fails if anything differs, so an edit
   made mid-capture cannot produce a mixed snapshot. Ask editors to pause.
6. Writes the file only after all of the above, replacing the previous one in
   a single rename. A failed capture leaves the previous snapshot untouched.

`--strict-media` also fails when any media file is not on an HTTPS media host.
Media served from the CMS origin would make visitors depend on the CMS being
awake, so use it for every production capture.

The file records a format version, the capture time, the CMS origin and an
identifier that is a hash of the content. The folder is ignored by git: a
snapshot belongs to one release, not to the repository.

## Build and run

```bash
CMS_SOURCE=snapshot SITE_URL=https://example.org npm run build
CMS_SOURCE=snapshot SITE_URL=https://example.org npm run start
```

- `next.config.ts` loads and validates the snapshot before the build starts
  and prints its identifier. A missing, edited, invalid or
  wrong-format-version file stops the build, so a broken capture cannot
  replace a working site with an empty one.
- The snapshot is traced into the server output and read from disk on the
  server only. It is never part of a browser bundle or a public download.
- `POST /api/revalidate` answers `409` in snapshot mode. A webhook cannot
  publish a snapshot deployment; only a new release does.

## How reads work

`getCmsClient()` returns the same typed client in both modes. In snapshot mode
its `fetch` is replaced by `createSnapshotFetch`, which answers the Strapi REST
queries the client builds: `$eq`, `$gte`, `$null`, `$containsi`, `$or`
branches, nested paths, multi-field sort and pagination. Validation, mapping
and every feature loader are unchanged, so listing, search, category pages,
slug lookups and single types behave as they do live. A query the adapter does
not understand answers `400` and surfaces as a CMS error rather than wrong
content: when a new filter or operator is added to the client, add it to
`src/lib/cms/snapshot/fetch.ts` and its tests.

Differences from live Strapi to be aware of:

- Search is a case-insensitive substring match in JavaScript. Accents must
  match, as they do in PostgreSQL.
- Records with equal sort values keep capture order (by `id`).

## Time-dependent pages

Upcoming versus past events depends on the current time, not on content. The
homepage and the events listing re-render at most every five minutes
(`revalidate = 300`), event detail pages render per request, and the sitemap
already revalidated every five minutes. No daily rebuild is needed.

## Changing the content model

When a schema change makes older snapshot files unsafe, raise
`snapshotFormatVersion` in `src/lib/cms/snapshot/format.ts`. Deployments then
refuse files captured before the change. New content types must be added to
`src/lib/cms/snapshot/manifest.ts` or they will not be exported.

## Release build

`npm run release:build` runs `snapshot:capture -- --strict-media` and then
`next build`. Netlify uses it as its build command (`netlify.toml`), so one
deploy is one capture plus one build, and a failure in either keeps the
previous deploy live. Setup is in [free hosting setup](free-hosting-setup.md).

## Not done yet

- Not run against a real Strapi instance or on Netlify.
- Database backups, usage alerts and a restore rehearsal.
- Content changes, unpublishing and deletion reach visitors only with the
  next release.
