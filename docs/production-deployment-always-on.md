# Always-on deployment alternative

Use this alternative when budget and availability requirements justify paid
CMS/database hosting. The selected starting direction is now the
[free-first deployment plan](production-deployment-guide.md), whose snapshot
publishing implementation is pending. This document describes the existing live
CMS integration; keep its webhook instructions specific to live-CMS mode.

For Jerusalem Youth maintainers. Provider documentation checked on 8 September
2026; confirm current limits and prices before creating billable resources.
This is a deployment runbook, not evidence that a live deployment has passed.

## 1. Choose the hosting arrangement

Use **Netlify for the web**, **Render for Strapi and PostgreSQL**, and **AWS S3
with CloudFront for media**. This follows the repository's existing architecture
and does not require Docker or a purchased domain.

| Part | Hosting | Address / cost expectation |
| --- | --- | --- |
| Public website | Netlify | `https://jylovegod.netlify.app`, if available; free plan within its limits |
| CMS admin and API | Render Node web service | Assigned HTTPS `*.onrender.com` address; budget for paid, always-on compute |
| Content database | Render PostgreSQL | Private connection; budget for a paid, non-expiring database and backups |
| Images and PDFs | S3 + CloudFront | Assigned HTTPS `*.cloudfront.net` address; storage/delivery charges depend on plan and usage |

These are provider-owned **subdomains**, not a free registration of
`jylovegod.com`. `jylovegod` alone is not a complete website URL. Name availability
has not been checked or reserved. Netlify supplies a default subdomain without
requiring custom-domain DNS setup. See [Netlify domain basics](https://docs.netlify.com/manage/domains/domains-fundamentals/understand-domains/).

The free address does **not** make the whole system free:

- Netlify's current Free plan has 300 monthly credits. Deploys, traffic, and
  compute use credits; exhausting the allowance can pause the site until the
  next cycle. Monitor usage and arrange an upgrade before a major outreach
  event. See [Netlify pricing](https://www.netlify.com/pricing/).
- Render Free web services sleep after 15 idle minutes, and Free PostgreSQL
  expires after 30 days. Do not use that combination for this production CMS:
  a sleeping CMS can make content reads fail, and the database is temporary.
  See [Render free-service limits](https://render.com/docs/free).
- The CloudFront hostname avoids a domain purchase, but is not a promise of
  free storage or delivery. Review [CloudFront pricing](https://aws.amazon.com/cloudfront/pricing/)
  and [S3 pricing](https://aws.amazon.com/s3/pricing/), including backups, requests,
  and any usage outside allowances. Set billing alerts; alerts are not hard caps.

Vercel is another web-host option, but do not assume its Hobby plan covers an
organization's website: it is restricted to personal, non-commercial use.
Confirm eligibility with Vercel or budget for its paid plan before substituting
it. See [Vercel fair-use rules](https://vercel.com/docs/limits/fair-use-guidelines).

If the entire hosting budget must be zero, stop before provisioning paid
services. That is a different constraint from a free domain and needs a separate
hosting/reliability decision; this guide does not promise an always-on, entirely
free Strapi production stack.

## 2. Prepare the release and accounts

You need access to the Git repository, Netlify, Render, AWS, and a password
manager. Use ministry-controlled accounts with recovery access and MFA where
available. Have an engineer assist with database access and AWS permissions.

1. Review and commit the release code, including CMS schemas/components and
   generated declarations. Push the reviewed release through the normal PR
   process. A provider cannot deploy uncommitted local changes.
2. Require the existing GitHub Actions `quality` and `cms` jobs to pass. Follow
   [release policy](10-git-cicd-release.md) and the
   [Definition of Done](12-definition-of-done.md). A successful build alone does
   not verify content, images, or publication delivery.
3. Use the same Node major as `.github/workflows/ci.yml` (currently 24) for both
   services. Install with the checked-in lockfiles; do not upgrade packages as
   part of deployment.
4. Choose the public web name and record the eventual CMS and CDN origins.
   Every sample hostname and `<...>` value below must be replaced. Do not paste
   placeholder secrets into a deployment.
5. Keep `.env`, `.env.local`, database URLs, AWS credentials, and webhook secrets
   out of Git. Use provider environment settings, not a committed production
   `.env`. Never copy the development example secrets to production.
6. Configure production deployment controls during provider setup: keep Render
   automatic deploys and Netlify automatic production publishing disabled while
   coordinating this first release. Deploy/publish a specific reviewed commit
   manually after CI passes. Before enabling later automation, establish its CI
   gate and CMS-before-web ordering; connecting Git alone does not enforce either.

The order matters: **database and media → CMS → approved content → web → webhook
→ public verification**. Deploy the updated CMS before a web release that
populates new fields such as `heroSlides`.

## 3. Provision durable PostgreSQL

In Render, create a **paid PostgreSQL** database in the same region as the planned
CMS. Select a PostgreSQL major supported by Strapi and exercised in CI (currently
17), sufficient storage, and a backup/retention plan.

Copy the **Internal Database URL** into the password manager. Use it only from
the Render CMS in the same region; Netlify does not connect directly to the
database. Restrict external database access and use the provider's TLS/certificate
requirements. Internal and external endpoints are different; see
[Render PostgreSQL connections](https://render.com/docs/postgresql-creating-connecting).

In the CMS environment, set `DATABASE_URL` to that connection string instead of
copying local `DATABASE_HOST`, `DATABASE_USERNAME`, or password values. This repo
accepts the URL directly. Leave conflicting discrete connection variables unset.
For the same-workspace, same-region Render internal connection, use
`DATABASE_SSL=false` and no `sslmode` query parameter. This is specifically the
private-network path, not a setting for public database connections. For an
external endpoint, require TLS, verify the certificate, and reconcile any URL
SSL parameters with the explicit options so they do not override certificate
policy. See [Render internal versus external TLS](https://render.com/tutorials/postgres-on-render/connection-strings).

Before launch, restore a backup into an isolated database and confirm that it
opens correctly. Record who owns backups, their retention, and the recovery
procedure. Never perform a restore test over the live database.

## 4. Provision production images and documents

The CMS already uses its S3 upload provider in production. Uploading to the
application's local disk is not the production path.

1. Create a dedicated S3 bucket, preferably near the CMS. Keep **Block Public
   Access** enabled, use **Bucket owner enforced** ownership, and enable
   versioning plus a reviewed retention/backup policy.
2. Create a CloudFront distribution with that bucket's **S3 REST origin**, not
   its static-website endpoint. Configure Origin Access Control (OAC), request
   signing, and the generated bucket policy restricted to this distribution.
   Allow public viewer reads without signed viewer URLs, redirect HTTP to HTTPS,
   and leave the origin path empty. See [AWS OAC setup](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html).
3. Use the distribution's assigned hostname, such as
   `https://d123example.cloudfront.net`, as `CDN_URL`. No alternate/custom domain
   is needed. CloudFront assigns a hostname when the distribution is created.
   See [CloudFront distribution basics](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html).
4. Create a dedicated CMS AWS identity, not an AWS root access key. Limit its
   permissions to this bucket and the `production/` object prefix: object
   read/write/delete and necessary list/multipart operations. Review the policy
   with an AWS operator; do not attach account-wide S3 administrator permissions.
   Store its access key ID and secret only in Render.
5. Prepare CORS for media reads from the actual CMS admin origin, including
   `GET`/`HEAD`; ensure CloudFront's origin request/cache and response-header
   policies preserve the required CORS behavior. Do not enable anonymous upload
   permissions to solve an image-preview problem. Follow the existing
   [media operations guide](../cms/docs/media-permissions-operations.md).
   The CMS hostname is allocated in Section 5; return to finish this configuration
   with that exact origin before testing uploads. Do not use a guessed hostname.

### Important compatibility setting for this checkout

Set **`AWS_ACL=bucket-owner-full-control`** for this AWS setup. The installed
Strapi S3 provider defaults to `public-read` when the `ACL` property is absent,
and the repository omits that property when `AWS_ACL` is unset. That combination
can fail on a Bucket-owner-enforced bucket. This was verified in the installed
provider's `getConfig` implementation, not inferred from the environment example.

AWS accepts `bucket-owner-full-control` uploads even when ACLs are disabled;
access still comes from bucket/IAM policies. See
[S3 object ownership behavior](https://docs.aws.amazon.com/AmazonS3/latest/userguide/about-object-ownership.html).
Do not switch the bucket to public access as a workaround. Recheck this behavior
when updating the provider. This setting is specific to AWS S3; do not copy it
unreviewed to an S3-compatible vendor that rejects all ACL headers.

## 5. Deploy the CMS on Render

**Pre-launch engineering gate:** this checkout's `cms/config/server.ts` does not
configure `proxy.koa`. Render terminates HTTPS before forwarding HTTP to the app;
the installed Strapi admin derives its refresh-cookie `Secure` flag from whether
the request is recognized as secure. Have an engineer review trusted-proxy
configuration for this hosting boundary before staff use the production CMS.
There is no existing application environment switch for that setting: do not
invent a `PROXY` variable and assume it works. See
[Strapi server configuration](https://docs.strapi.io/cms/configurations/server)
and [Render HTTPS termination](https://render.com/docs/web-services).
After a reviewed configuration change and deployment, verify HTTPS admin login,
refresh/logout, and that auth cookies have `Secure` and `HttpOnly`. Missing
`Secure` is a release blocker, not something to bypass. This documentation task
does not change the server configuration or establish live cookie behavior.

Create a **Web Service** from the repository, not a Static Site. Choose the Node
runtime and a paid instance with enough memory for Strapi; verify build and
runtime memory usage before selecting the smallest tier.

| Setting | Value for this repository |
| --- | --- |
| Branch | Reviewed release branch, normally `main` |
| Root directory | `cms` |
| Build command | `npm ci --include=dev && npm run build` |
| Start command | `npm run start` |
| Health check path | `/_health` |
| Node selector | Provider setting `NODE_VERSION=24` to match current CI |

Commands are relative to `cms`; do not add another `cd cms`. Render documents
[subdirectory deployment](https://render.com/docs/monorepo-support),
[Node version selection](https://render.com/docs/node-version), and
[web service settings](https://render.com/docs/web-services).
Install development dependencies during the build because TypeScript and build
tools need them; production still runs `strapi start`, not `strapi develop`.

Generate a fresh value with this command for **each** secret:

```bash
openssl rand -base64 32
```

Run it four times for `APP_KEYS` and join those four distinct outputs with commas
and no spaces. Generate separate values for every other secret below. Save them
in the password manager; keep them stable across ordinary restarts/deployments.

Enter these values in Render's environment settings, available during build and
runtime. `NODE_VERSION` is a provider selector; the other names come from this
repository's configuration or the Node/Strapi runtime.

```dotenv
NODE_ENV=production
HOST=0.0.0.0
PORT=10000
APP_KEYS=<key-1>,<key-2>,<key-3>,<key-4>
API_TOKEN_SALT=<independent-random-value>
ADMIN_JWT_SECRET=<independent-random-value>
TRANSFER_TOKEN_SALT=<independent-random-value>
ENCRYPTION_KEY=<independent-random-value>
JWT_SECRET=<independent-random-value>

DATABASE_CLIENT=postgres
DATABASE_URL=<render-internal-postgresql-connection-string>
DATABASE_SCHEMA=public
DATABASE_SSL=false
DATABASE_SSL_REJECT_UNAUTHORIZED=true
DATABASE_POOL_MIN=0
DATABASE_POOL_MAX=5
DATABASE_CONNECTION_TIMEOUT=60000

AWS_REGION=<actual-s3-region>
AWS_BUCKET=<actual-bucket-name>
AWS_ACCESS_KEY_ID=<dedicated-cms-access-key-id>
AWS_ACCESS_SECRET=<dedicated-cms-secret-access-key>
AWS_ACL=bucket-owner-full-control
CDN_URL=https://<assigned-distribution>.cloudfront.net
CDN_ROOT_PATH=production
WEBHOOKS_POPULATE_RELATIONS=false
```

Render can supply `PORT`; use its assigned value if different. For ordinary AWS
S3, leave `AWS_ENDPOINT` unset and keep path-style addressing off. Note the repo
uses **`AWS_ACCESS_SECRET`**, not `AWS_SECRET_ACCESS_KEY`. If the database provider
requires an external TLS connection instead of this internal setup, enable
`DATABASE_SSL=true`, keep certificate verification enabled, and add
`DATABASE_SSL_CA` when its certificate chain requires it. Investigate failures
with the provider instead of guessing security overrides. Size the connection pool to
fit the database's limit across all CMS instances.

Deploy, record the assigned HTTPS CMS origin, and immediately create the first
administrator at `https://<cms-service>.onrender.com/admin`. Do not leave first
admin registration unattended. Create least-privilege editorial accounts using
the [role checklist](../cms/docs/media-permissions-operations.md).
Complete the deferred CORS configuration in Section 4 with this assigned origin.

Verify before continuing:

```bash
curl --fail --silent --show-error --output /dev/null --write-out '%{http_code}\n' \
  https://<cms-service>.onrender.com/_health
curl --fail --silent --show-error \
  'https://<cms-service>.onrender.com/api/articles?status=published'
```

Expect HTTP 204 for health and a JSON `data` array for articles (initially empty
is normal). Anonymous public reads are configured by bootstrap; do not grant
public write, upload, authentication, or admin permissions. Upload one approved
test photograph through the Media Library and open its persisted CloudFront URL
in a signed-out browser. Confirm the preview, responsive variants, and public
image all load over HTTPS. Resolve upload/permission failures before deploying web.

## 6. Create and publish approved content

A new production database does not contain the six articles or settings from
your laptop. Git deployment copies code, **not** PostgreSQL records or local
uploads. For a small launch, manually upload approved images and recreate the
approved content in production. A bulk migration needs a separately planned,
backed-up database/media transfer; do not point production at the local database.

Use [content operations](11-content-operations.md) to review and publish:

- Site Settings, ministry details, CTA, and default SEO/social image;
- Navigation, Social Links, About Page, and current contact information;
- approved articles, events, sermons, stories, and resources;
- Site Settings → `heroSlides`, ordered images with alt text and final captions.

Use Save **and Publish** for publishable content. The website requests published
entries only. The launch seed is explicitly non-production and must not be
enabled with a production bypass. Do not publish fictional review text or
generated scenes as real ministry activity. Review all placeholder hostnames,
SEO canonical overrides, `noIndex` flags, image consent, and event dates/timezones.

## 7. Deploy the web on Netlify

Import the repository through Netlify's Git integration and choose the web
package at the **repository root**, not `cms`. Set the project name to
`jylovegod` if available; otherwise choose an available alternative and use its
actual origin consistently below. A failed initial deploy can be retried after
the environment is set; do not announce the URL until validation passes.

| Setting | Value |
| --- | --- |
| Base / package directory | Repository root (leave blank or use `.`) |
| Framework | Next.js, with Netlify's automatically detected adapter |
| Build command | `npm run build` |
| Publish directory | `.next` (retain the Next.js preset) |
| Production branch | Reviewed `main` |
| Node version | Match current CI: 24 |

Netlify supports App Router, server rendering, route handlers, and tag-based
revalidation through its adapter. Keep the default adapter unless compatibility
testing requires otherwise. See [Next.js on Netlify](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/)
and [build configuration](https://docs.netlify.com/build/configure-builds/overview/).
Verify the build log uses the root lockfile. Do not run the CMS build here.

In Netlify environment settings, set the following for **Production**, available
to **Builds and Functions** (or all scopes if narrower scopes are unavailable):

```dotenv
CMS_BASE_URL=https://<cms-service>.onrender.com
SITE_URL=https://jylovegod.netlify.app
CMS_REVALIDATION_SECRET=<new-independent-random-secret-at-least-32-characters>
```

Use the actual allocated name, not the sample if it was taken. Origins must not
include `/admin`, `/api`, paths, credentials, query strings, or fragments. Generate
the webhook secret separately from Strapi's keys and salts. These three variables
are server-only: do **not** add `NEXT_PUBLIC_` prefixes. Netlify's Functions scope
is the relevant server execution scope, not its separately named Runtime scope.
See [Netlify environment settings](https://docs.netlify.com/build/environment-variables/overview/).

Deploy and check both the generated pages and server-rendered content routes.
Rebuild/redeploy after changing environment variables. The repo needs a server
for CMS reads, search, and `POST /api/revalidate`: do not use static export,
GitHub Pages, or drag-and-drop only a static output folder.

Keep production secrets out of deploy previews and untrusted PR builds. Use a
separate review CMS and secret if previews are enabled. Until that separation is
configured, disable preview/branch deployments. This repository's `robots.txt`
uses `NODE_ENV`, so a production-mode preview build is **not automatically**
non-indexable; verify host preview protections/noindex behavior rather than
assuming the development robots policy applies.

## 8. Connect publication to the web cache

In Strapi **Settings → Webhooks**, add:

| Field | Value |
| --- | --- |
| Name | Frontend publication revalidation |
| URL | `https://jylovegod.netlify.app/api/revalidate` (actual web origin) |
| Custom header name | `Authorization` |
| Custom header value | `Bearer <the exact Netlify CMS_REVALIDATION_SECRET>` |
| Events | Entry create, update, delete, publish, unpublish |

The secret is a webhook header configured in Strapi Admin, not a new CMS
environment variable. Keep the production endpoint reachable by the CMS; access
protection must not replace the endpoint's own bearer authentication.

On an approved test entry, publish a reversible title/caption edit. Inspect the
delivery result and then load the affected public page in a fresh browser
request. Expect HTTP **200** for publication. A draft-only save returns **202**
and intentionally does not update public content. Restore and republish the
approved value afterward. Test both an article and Site Settings hero slides.

Production stable-content reads are cached until the matching webhook expires
them; restarting your local dev server has no effect here. Event reads also
have a five-minute fallback, but articles/settings do not rely on that timer.
Full setup, response codes, replay, and rotation instructions are in
[publication revalidation](cms-publication-revalidation.md). A generic dashboard
test payload may be rejected; a real publication delivery is the meaningful test.

## 9. Launch checklist

Record the release commit, deployed URLs, date, operator, and results:

- [ ] CI web/CMS checks pass for the deployed commit.
- [ ] CMS health/admin work; trusted-proxy review and `Secure`/`HttpOnly` auth
      cookie verification pass; roles and anonymous read-only permissions verified.
- [ ] Production images survive a CMS restart and load without an admin session.
- [ ] Homepage, articles, event/sermon/story/resource detail pages, search, join,
      and contact show approved content, not just successful fallback pages.
- [ ] Publish/update/unpublish invalidate public content correctly; hero slide
      changes update without rebuilding web. No failed webhook deliveries remain.
- [ ] Mobile/desktop gallery crops, keyboard controls, touch scrolling, reduced
      motion, and image failure states reviewed. Measure production performance;
      see [performance/SEO/accessibility](07-performance-seo-accessibility.md).
- [ ] `/robots.txt` allows the public site; `/sitemap.xml` and canonical/Open
      Graph URLs use the real HTTPS origin. Review-seed canonical/noindex values
      are removed where content is approved to be public.
- [ ] HTTPS, security headers, console errors, and externally hosted embeds
      checked. No production credentials appear in browser assets or logs.
- [ ] Database/media restore tested, monitoring/billing alerts configured, and a
      named maintainer can perform the rollback below.

Then share the free web address. A page returning HTTP 200 while CMS fetches fail
is not evidence that the launch is ready.

## 10. Updates, rollback, and troubleshooting

For content edits, use CMS Save/Publish; no code deployment is normally needed.
For code, use reviewed PRs and passing CI. Coordinate schema changes manually:
backup first, deploy backward-compatible CMS changes, verify, then deploy web.
Do not let independent auto-deploys race a CMS/frontend contract change.

For a web-only regression, stop further auto-publishing and use the host's
previous known-good deploy or redeploy the known-good commit. Confirm its
environment, CMS compatibility, and content freshness; replay relevant
publication events if needed. For a CMS regression, first assess database/schema
compatibility. A Git rollback does not roll back PostgreSQL or uploaded files.
Use the tested restore procedure with a maintenance window when a restore is
required; never overwrite the live database casually. Re-run the launch checks.

Before signing off launch, the database/media operator must create a recovery
record in the ministry's controlled operations location and give the backup
maintainer access. This is required operational work, not a procedure already
implemented by this repository. Record:

- the known-good CMS commit and compatible web commit;
- the database backup identifier/time and corresponding media recovery point;
- the bucket, object prefix, preserved object keys, and persisted CDN origin;
- references to credentials in the password manager, never the values;
- exact provider restore steps tested into an isolated database/media target;
- how to validate content, admin roles, and public images in that isolated target;
- the approved maintenance/cutover procedure to switch the CMS database target
  and recover media while preserving URLs, plus how to undo the cutover;
- the test date, recovery duration, expected data-loss window, and responsible
  operator. Rehearse this before launch, not during the first outage.

| Symptom | Check / action |
| --- | --- |
| Build says a variable is missing | Set all three web values in Builds and Functions; CMS needs its separate secret/database/media values |
| Homepage loads but articles are empty | Check production `/api/articles?status=published`, publication state, production data entry, and web CMS errors; local content was not copied |
| API has content but web is stale | Verify real publish delivery, exact bearer header, and response code; correct configuration and republish |
| Webhook 401 / 202 / 400 | Respectively: mismatched secret; draft-only save; invalid event/payload/UID. See the revalidation guide |
| Hero still text-only | Updated CMS schema must be deployed; add images to production Site Settings → `heroSlides` and publish |
| `AccessControlListNotSupported` or upload access denied | Verify `AWS_ACL=bucket-owner-full-control`, bucket ownership, and scoped AWS policy; do not enable public bucket writes |
| Image returns 403 or is blocked in Admin | Verify OAC bucket policy, object key/prefix, HTTPS `CDN_URL`, CORS and CSP; do not use a signed/private viewer URL |
| Database certificate/connection error | Verify endpoint, network access, URL, CA and SSL settings; do not paste localhost settings or disable public TLS verification |
| CMS build killed / slow startup | Inspect memory and logs; increase instance/build resources if needed, and avoid sleeping free compute |
| Website pauses | Check Netlify credits and host billing status before changing application code |

If you later buy a domain, configure it on the web host, select it as the primary
domain, update `SITE_URL` and the CMS webhook URL, review CMS canonical overrides,
redeploy, and verify redirects, sitemap, metadata, and publication delivery.
Existing provider subdomains are not portable assets you own independently.
