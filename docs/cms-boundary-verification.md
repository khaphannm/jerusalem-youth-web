# CMS Boundary Verification

Use this process to verify the CMS-004 frontend boundary against a real Strapi
5 instance backed by PostgreSQL. It complements the deterministic unit tests;
it does not replace them.

The commands use disposable, non-production credentials. Never substitute or
commit production secrets.

## What the checks prove

- Strapi starts in production mode with PostgreSQL.
- Every public collection endpoint accepts the populate query used by the
  frontend client and returns a valid Strapi collection envelope.
- Uncreated single types return HTTP 404, which the frontend client normalizes
  to `null`; created and published single types return HTTP 200.
- The frontend tests validate representative payload mapping, malformed data,
  media URL resolution, empty/not-found behavior, and normalized failures.

An empty database verifies endpoint and envelope contracts, but not populated
record mapping. For a full content check, complete the optional content setup
below before calling the endpoints.

## Prerequisites

- Node.js and npm versions supported by the repository
- Docker
- project dependencies installed in both the repository root and `cms/`
- ports `1337` and `55437` available

## 1. Start disposable PostgreSQL

From the repository root:

```bash
docker run --name cms004-review-postgres \
  -e POSTGRES_DB=jerusalem_youth \
  -e POSTGRES_USER=strapi \
  -e POSTGRES_PASSWORD=cms004-review-only \
  -p 127.0.0.1:55437:5432 \
  -d postgres:17-alpine

docker exec cms004-review-postgres \
  pg_isready -U strapi -d jerusalem_youth
```

Expected result: PostgreSQL reports that it is accepting connections.

## 2. Start production-mode Strapi

From `cms/`:

```bash
env \
  NODE_ENV=production \
  HOST=127.0.0.1 \
  PORT=1337 \
  APP_KEYS=review-one,review-two,review-three,review-four \
  API_TOKEN_SALT=review-api-salt \
  ADMIN_JWT_SECRET=review-admin-secret \
  TRANSFER_TOKEN_SALT=review-transfer-salt \
  ENCRYPTION_KEY=review-encryption-key \
  JWT_SECRET=review-users-secret \
  DATABASE_CLIENT=postgres \
  DATABASE_HOST=127.0.0.1 \
  DATABASE_PORT=55437 \
  DATABASE_NAME=jerusalem_youth \
  DATABASE_USERNAME=strapi \
  DATABASE_PASSWORD=cms004-review-only \
  DATABASE_SSL=false \
  AWS_REGION=auto \
  AWS_BUCKET=review-bucket \
  AWS_ENDPOINT=https://s3.example.invalid \
  AWS_FORCE_PATH_STYLE=true \
  AWS_ACCESS_KEY_ID=review-access \
  AWS_ACCESS_SECRET=review-secret \
  CDN_URL=https://cdn.example.invalid \
  sh -c 'npm run build && npm run start'
```

Expected result: the startup log reports `Strapi started successfully` and a
PostgreSQL database. The placeholder S3 endpoint is sufficient for read-only
endpoint checks; do not attempt uploads with this configuration.

## 3. Verify collection endpoints

In a second terminal:

```bash
cms_url=http://127.0.0.1:1337/api

curl -g -sS -w '\nHTTP %{http_code}\n' \
  "$cms_url/articles?populate=featuredImage&populate=author.avatar&populate=category&populate=tags&populate=bibleReferences&populate=seo.socialImage&status=published&sort[0]=publishedAt:desc&pagination[page]=1&pagination[pageSize]=6"

curl -g -sS -w '\nHTTP %{http_code}\n' \
  "$cms_url/articles?populate=featuredImage&populate=author.avatar&populate=category&populate=tags&populate=bibleReferences&populate=seo.socialImage&status=published&filters[slug][$eq]=replace-with-a-published-slug&pagination[pageSize]=1"

curl -g -sS -w '\nHTTP %{http_code}\n' \
  "$cms_url/articles?populate=featuredImage&populate=author.avatar&populate=category&populate=tags&populate=bibleReferences&populate=seo.socialImage&status=published&filters[category][slug][$eq]=replace-with-a-category-slug&sort[0]=publishedAt:desc&pagination[page]=1&pagination[pageSize]=6"

curl -sS -w '\nHTTP %{http_code}\n' \
  "$cms_url/authors?populate=avatar"

curl -sS -w '\nHTTP %{http_code}\n' \
  "$cms_url/categories"

curl -sS -w '\nHTTP %{http_code}\n' \
  "$cms_url/events?populate=banner&populate=gallery&populate=seo.socialImage"

curl -sS -w '\nHTTP %{http_code}\n' \
  "$cms_url/resources?populate=category&populate=file&populate=author.avatar&populate=thumbnail&populate=seo.socialImage"

curl -sS -w '\nHTTP %{http_code}\n' \
  "$cms_url/series?populate=coverImage"

curl -sS -w '\nHTTP %{http_code}\n' \
  "$cms_url/sermons?populate=series.coverImage&populate=thumbnail&populate=seo.socialImage"

curl -sS -w '\nHTTP %{http_code}\n' \
  "$cms_url/stories?populate=featuredImage&populate=seo.socialImage"
```

Each collection request, including the article detail and category-filtered
lookups, must return HTTP 200. On an empty database, when the detail slug does
not match a published article, or when a category has no published articles,
the expected shape is:

```json
{
  "data": [],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 0,
      "total": 0
    }
  }
}
```

An HTTP 400 indicates that the request query and the current Strapi schema no
longer agree. HTTP 401 or 403 indicates public-role permission drift.

## 4. Verify single-type endpoints

```bash
curl -sS -w '\nHTTP %{http_code}\n' \
  "$cms_url/about-page?populate=values&populate=primaryCta"

curl -sS -w '\nHTTP %{http_code}\n' \
  "$cms_url/navigation?populate=primaryItems&populate=utilityItems&populate=footerItems"

curl -sS -w '\nHTTP %{http_code}\n' \
  "$cms_url/site-setting?populate=defaultSeo.socialImage&populate=defaultSocialImage&populate=organizationContact&populate=primaryCta"

curl -sS -w '\nHTTP %{http_code}\n' \
  "$cms_url/social-links?populate=links"
```

Expected results:

- HTTP 404 when the single-type entry has not been created; the frontend client
  maps this state to `null`.
- HTTP 200 with a populated `data` object after the entry is created and
  published.
- HTTP 401 or 403 indicates public-role permission drift.

## 5. Confirm PostgreSQL usage

```bash
docker exec cms004-review-postgres \
  psql -U strapi -d jerusalem_youth \
  -c "select current_database(), current_user;"

docker exec cms004-review-postgres \
  psql -U strapi -d jerusalem_youth \
  -c "select count(*) from information_schema.tables where table_schema = 'public';"
```

The first query must report the `jerusalem_youth` database and `strapi` user.
The second must report a non-zero number of Strapi tables.

## 6. Run deterministic frontend contract tests

From the repository root:

```bash
npm test -- --run src/lib/cms/client.test.ts
```

These tests verify:

- a valid flattened Strapi payload maps to domain models without Strapi response
  nesting;
- relative media paths become absolute CMS URLs;
- valid Blocks content and embedded media map into the typed rich-content
  domain model;
- malformed payloads, unsupported Blocks, and unsafe rich-content links are
  rejected as `INVALID_RESPONSE`;
- missing slug records and uncreated single types return `null`;
- HTTP, network, and timeout failures become normalized `CmsError` values;
- upstream error response bodies are not exposed.

## Optional full-content verification

For populated response coverage, first replace the placeholder S3 settings with
a real non-production S3-compatible endpoint and bucket because several content
types require media. Then create an administrator at
`http://127.0.0.1:1337/admin`, then create the required supporting records and
one valid record for each public V1 type. Publish every draft/publish-enabled
entry. Repeat the endpoint checks and confirm:

- collection `data` arrays contain the expected entries;
- required relations and media are populated;
- single types return HTTP 200;
- draft entries are not returned anonymously.

Do not use the placeholder endpoint from this guide for media verification.

## Cleanup

Stop Strapi with `Ctrl+C`, then remove the disposable database:

```bash
docker rm -f cms004-review-postgres
```

The container is disposable; removing it deletes the verification database.
