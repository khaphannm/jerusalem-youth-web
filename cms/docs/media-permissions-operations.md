# Media, Permissions, and Editorial Operations

## Production media

Production uses the official Strapi S3 upload provider. Development and tests use the local provider only; local files are disposable and must not be promoted to production.

Required production settings:

- `AWS_REGION`: service region, or the provider's documented region placeholder
- `AWS_BUCKET`: dedicated CMS asset bucket
- `CDN_URL`: public HTTPS origin used in persisted asset URLs

Optional provider settings:

- `AWS_ENDPOINT`: S3-compatible API endpoint; omit for AWS S3
- `AWS_FORCE_PATH_STYLE`: enable only when the provider requires path-style URLs
- `AWS_ACCESS_KEY_ID` and `AWS_ACCESS_SECRET`: configure both or neither; when omitted, the AWS SDK credential chain is used
- `AWS_ACL`: provider-specific; for the installed provider with AWS S3 Bucket
  owner enforced, use `bucket-owner-full-control`. Omitting this value currently
  lets the provider default to `public-read`, which can fail on ACL-disabled
  buckets. Do not assume omission disables ACL headers on other S3 vendors.
- `CDN_ROOT_PATH`: prefix all CMS-managed objects, for example `production`

Use a dedicated identity with access limited to the configured bucket and prefix. It needs only the equivalent list, read, create, replace, and delete object operations required by the Media Library. CDN visitors receive read-only asset access and never receive the CMS storage credentials.

For the AWS S3/CloudFront setup and the verified ACL compatibility caveat, follow
the [always-on alternative](../../docs/production-deployment-always-on.md).
The selected [free-first plan](../../docs/production-deployment-guide.md) uses
R2 plus a media Worker instead; its ACL-free upload handling and delivery are
pending implementation. Do not apply the AWS-specific ACL value to R2.

Configure bucket CORS to allow `GET` from the deployed Strapi admin origin. The CMS Content Security Policy automatically adds the configured `CDN_URL` origin for image and media previews. Use HTTPS for the CDN and production S3 endpoint.

Back up the PostgreSQL database and object storage together. Restores must preserve object keys and the public CDN base URL stored with media records.

## Upload constraints

Uploads are checked by Strapi before storage:

- maximum size per file: 10 MiB
- allowed images: AVIF, GIF, JPEG, PNG, and WebP
- allowed documents: PDF
- SVG, audio, video, archives, executables, and all unlisted MIME types are rejected

Large audio and video remain externally hosted for V1. Editors must provide meaningful alternative text for content images, confirm usage consent, remove embedded sensitive metadata where applicable, and optimize images before upload.

## Public Content API permissions

Application bootstrap synchronizes the Users & Permissions `Public` role to an exact read-only allowlist:

- collection types: `find` and `findOne` for Article, Author, Category, Event, Resource, Series, Sermon, and Story
- single types: `find` for About Page, Navigation, Site Settings, and Social Links

No public upload, create, update, delete, publish, authentication, user, or role action is granted. Public self-registration is disabled. Changes made manually to the Public role are replaced on the next CMS startup so permission drift fails closed.

Draft/publish-enabled content APIs return published entries to anonymous callers. Supporting taxonomy types do not use draft/publish and must contain only information approved for public display.

## Editorial administrator roles

Strapi stores administrator RBAC assignments in the database, so configure and verify them separately in every environment after the first administrator is created:

| Ministry role | Strapi role | Minimum access |
| --- | --- | --- |
| Contributor | Built-in Author | Create and manage own drafts; Media Library access/upload; no publish or system settings |
| Editor | Custom role duplicated from Author | Read and update all editorial content and taxonomy; Media Library access/upload/update; no publish, user administration, plugin settings, or Content-Type Builder |
| Publisher / Ministry Lead | Built-in Editor | Create, edit, and publish all approved content; manage taxonomy and media; no Super Admin assignment |
| Administrator | Built-in Super Admin | System administration only; not required for routine editorial work |

In **Settings → Administration panel → Roles**, create the custom Editor role and explicitly review collection types, single types, Media Library, plugins, and settings. Keep publish permission exclusive to the Publisher role. Test each role with a non-production account before assigning staff, review assignments quarterly, remove access promptly when responsibilities change, and include RBAC data in database backups.
