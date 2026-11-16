# Free hosting setup

Step-by-step setup for the free-first deployment: Neon (database), Cloudflare
R2 and a Worker (media), Render (Strapi) and Netlify (website). Background and
limits are in the [deployment plan](production-deployment-guide.md); how the
website serves a snapshot is in [snapshot publication](snapshot-publication.md).

**Status, 16 November 2026:** the configuration files and code below exist and
are unit-tested, but none of this has been run on the real services yet. Treat
each "check" as a gate: if one fails, stop and fix it before going on. Confirm
current free-plan limits on each provider before creating resources.

Use accounts the ministry controls, with recovery access and MFA. Keep every
secret in a password manager; nothing secret goes into Git.

## 1. Database — Neon

1. Create a project and a database in a region close to the Render region you
   will use.
2. Copy the **direct** (not pooled) connection string.
3. Remove the query string (`?sslmode=...&channel_binding=...`) from it. TLS is
   switched on by `DATABASE_SSL=true` with certificate verification, and a
   second SSL setting inside the URL can override that.

Check: you have a `postgresql://user:password@host/database` value for step 3.

## 2. Media — Cloudflare R2 and Worker

1. Create an R2 bucket, for example `jerusalem-youth-media`. Leave public
   access (`r2.dev`) off.
2. Create an R2 API token with **Object Read & Write** limited to that bucket.
   Note the access key ID, the secret access key and the S3 endpoint
   (`https://<account-id>.r2.cloudflarestorage.com`).
3. Set `name` and `bucket_name` in `infra/media-worker/wrangler.toml`, then:
   ```bash
   cd infra/media-worker
   npx wrangler login
   npx wrangler deploy
   ```
   Note the address it prints, `https://<name>.<account>.workers.dev`. That is
   the public media origin (`CDN_URL`).

The Worker (`infra/media-worker/src/index.js`) serves files from the bucket
with GET and HEAD only. It cannot upload, delete or list, and it rejects unsafe
paths. Files are cached by browsers for 30 days. Test it locally with
`npm run test:media-worker`.

Check: `curl -I https://<worker-address>/does-not-exist` answers `404`, and a
`POST` answers `405`.

## 3. CMS — Render

1. In Render choose **New → Blueprint** and select this repository. It reads
   `render.yaml` and creates the free web service `jerusalem-youth-cms`.
2. Fill in the values the blueprint asks for:

   | Variable | Value |
   | --- | --- |
   | `PUBLIC_URL` | The service address, `https://<service>.onrender.com` |
   | `APP_KEYS` | Four random values separated by commas |
   | `DATABASE_URL` | The Neon string from step 1 |
   | `AWS_ENDPOINT` | The R2 S3 endpoint |
   | `AWS_BUCKET` | The bucket name |
   | `AWS_ACCESS_KEY_ID`, `AWS_ACCESS_SECRET` | The R2 token |
   | `CDN_URL` | The Worker address from step 2 |

   The blueprint already sets `TRUST_PROXY=true`, `AWS_ACL=none` (R2 has no
   object ACLs), `AWS_REGION=auto`, `AWS_FORCE_PATH_STYLE=true`,
   `DATABASE_SSL=true` and a database pool of 0–5 connections so Neon can
   sleep when the CMS is idle.
3. Deploy. The first deploy creates the database tables.
4. Open `https://<service>.onrender.com/admin` and create the first
   administrator.

Checks, in order:
- The build and start finish within the free instance's memory. **This is the
  main risk of the free plan.** If the build is killed for memory, the CMS
  needs a paid instance; the rest of this setup is unaffected.
- Admin login works and survives a page refresh. If the browser reports that a
  secure cookie could not be set, `PUBLIC_URL` or `TRUST_PROXY` is wrong.
- Uploading an image in the Media Library succeeds and its preview shows. The
  file URL must start with the Worker address.
- Signed out, `https://<service>.onrender.com/api/site-setting` answers
  (404 before it is published is fine) and a `POST` to it answers `403`.

Then enter the content: run the import from
[content operations](11-content-operations.md) against this database or enter
it in the Admin, upload real photographs, and publish Site Settings and
Navigation at least. Local uploads do not move with Git.

## 4. Website — Netlify

1. Create a site from this repository. `netlify.toml` sets the build command
   (`npm run release:build`), Node 24 and `CMS_SOURCE=snapshot`.
2. Add two environment variables in the Netlify UI:

   | Variable | Value |
   | --- | --- |
   | `CMS_BASE_URL` | The Render CMS address |
   | `SITE_URL` | The website address, `https://<site>.netlify.app` |

   No secrets are needed: the build reads only the public API.
3. In **Build & deploy**, stop automatic production deploys on push if you
   want every release to be deliberate, and create a **build hook** named
   "Publish content". Keep its URL private.
4. Trigger the first deploy.

Each build wakes the CMS (waiting up to about five minutes), captures and
validates all published content, refuses media that is not on the Worker, then
builds. If any step fails the build fails and **the previous deploy stays
live**.

Checks:
- The deploy log shows `Snapshot <id> captured ...` and the same id from
  `next.config.ts`.
- With the Render service suspended, the homepage, an event page, search and
  `/sitemap.xml` on the Netlify address all still work and images load.

## 5. Publishing content afterwards

1. Open the CMS Admin (allow about a minute for it to wake), edit and publish.
2. Ask other editors to pause, then trigger a deploy: the **Trigger deploy**
   button in Netlify, or the build hook URL.
3. When the deploy finishes, check the change on the public site.

Publishing in Strapi alone changes nothing on the public site. Unpublishing
and deleting also need a new deploy.

- **Rollback:** in Netlify's deploy list, publish an earlier deploy. It carries
  the snapshot it was built with. Media deleted from R2 since then will be
  missing.
- **Urgent removal:** unpublish in Strapi, delete the file in the Media
  Library, trigger a deploy, and delete older Netlify deploys that still
  contain the content. Browsers may keep an image they already loaded for up
  to 30 days.

## 6. Still to do before launch

- Run every check above on the real services and record the results.
- Database backups under ministry control (for example a scheduled `pg_dump`)
  and one restore rehearsal. Neon's history is not a backup policy.
- Usage alerts on Netlify, Neon and Cloudflare.
- Decide whether deploy previews should be public; they are not marked
  noindex automatically.
