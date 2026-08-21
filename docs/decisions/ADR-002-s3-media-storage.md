# ADR-002 — S3-Compatible Media Storage

Status: Accepted

## Context

The CMS must keep production assets off the application filesystem and deliver public images and documents through a media CDN. The selected storage must work with Strapi 5 and remain portable across managed object-storage vendors.

## Decision

Use Strapi's official `@strapi/provider-upload-aws-s3` provider for production assets. The provider targets AWS S3 or an S3-compatible service through an optional endpoint and publishes stable asset URLs through an HTTPS CDN origin.

Local development and automated unit tests continue to use Strapi's local upload provider. Production startup requires the S3 bucket, region, and CDN configuration.

Production assets are public website content. The bucket may remain private behind a CDN origin-access mechanism, but the resulting CDN URLs must be anonymously readable. CMS credentials remain server-only and receive only the bucket operations required to list, create, replace, and delete managed objects.

## Consequences

Positive:
- CMS instances remain stateless with respect to media;
- asset delivery is independent from application compute;
- the endpoint and path-style settings support multiple S3-compatible vendors;
- provider coupling remains isolated to Strapi configuration.

Tradeoffs:
- deployments must provision bucket access, CDN routing, CORS, and backups;
- migrations between providers require copying objects as well as the database;
- CDN URLs and object keys are durable content contracts and must be preserved during migration.

## Rejected alternatives

- Local production uploads: not durable across stateless deployments and bypass the required media CDN.
- Cloudinary: capable, but S3-compatible storage was selected for provider portability.
- Private signed URLs in the public content API: Strapi does not return provider-signed URLs through that API, and public V1 assets do not require per-visitor authorization.
