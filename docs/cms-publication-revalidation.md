# CMS Publication Revalidation

This document describes implemented **live-CMS mode**. The selected
[free-first deployment plan](production-deployment-guide.md) requires a separate,
not-yet-implemented snapshot release workflow. `POST /api/revalidate` does not
export snapshots or publish a deployment; continue using these instructions
only for live mode until that work is complete.

CMS-005 caches public Strapi reads with server-owned tags and exposes one
authenticated endpoint for Strapi publication events:

```text
POST /api/revalidate
```

The endpoint accepts native Strapi webhook payloads only. A caller cannot
provide a cache tag or site path to invalidate.

## Cache policy

- Local development CMS reads use `cache: "no-store"` so editors can see
  Strapi changes without carrying an indefinite data-cache entry across dev
  server restarts. Production keeps the tagged cache policy below.
- Stable content uses `cache: "force-cache"` and remains cached until its tag is
  expired by a valid webhook.
- Event reads also use tagged caching but have a 300-second fallback lifetime.
- `revalidateTag(tag, { expire: 0 })` is used because external webhook updates
  must expire matching data immediately. The next read fetches fresh Strapi
  data.
- Article and Resource requests carry Author and Category tags because those
  records are embedded in their payloads. Sermon requests carry the Series tag.
  Updating supporting content therefore expires every cached payload that
  embeds it without globally flushing unrelated content.

The fixed UID mapping covers every public V1 CMS type:

| Strapi UID | Cache tag |
| --- | --- |
| `api::about-page.about-page` | `cms:about-page` |
| `api::article.article` | `cms:articles` |
| `api::author.author` | `cms:authors` |
| `api::category.category` | `cms:categories` |
| `api::event.event` | `cms:events` |
| `api::home-page.home-page` | `cms:home-page` |
| `api::navigation.navigation` | `cms:navigation` |
| `api::resource.resource` | `cms:resources` |
| `api::sermon-series.sermon-series` | `cms:sermon-series` |
| `api::sermon.sermon` | `cms:sermons` |
| `api::site-setting.site-setting` | `cms:site-settings` |
| `api::social-links.social-links` | `cms:social-links` |
| `api::story.story` | `cms:stories` |

## Configure the shared secret

Generate an independent secret of at least 32 random bytes:

```bash
openssl rand -base64 32
```

Store the same value in both deployment systems:

1. Set `CMS_REVALIDATION_SECRET` in the frontend's server-only environment.
2. Add it to the Strapi webhook as the custom request header
   `Authorization: Bearer <secret>`.

Never commit the value, place it in a URL, use a `NEXT_PUBLIC_` prefix, or reuse
an admin/API token. Frontend startup requires the variable, and the route fails
closed if its value is shorter than 32 characters.

## Configure Strapi

In **Settings → Webhooks**, create a webhook with:

- Name: `Frontend publication revalidation`
- URL: `https://<frontend-origin>/api/revalidate`
- Header: `Authorization` = `Bearer <CMS_REVALIDATION_SECRET value>`
- Events: Entry create, update, delete, publish, and unpublish

Strapi sends `event`, `createdAt`, `model`, `uid`, and `entry`. The endpoint
validates the complete top-level payload and accepts only the public-content UID
allowlist.

Publishable types behave as follows:

- publish, unpublish, and delete expire the matching tag;
- create and update represent draft changes and return HTTP 202 without
  expiring public data.

Author, Category, and Series do not use draft/publish. Their create, update, and
delete events expire the matching tag. Publication events for these supporting
types are rejected as invalid.

## Endpoint responses

| Status | Meaning |
| --- | --- |
| `200` | Matching public cache tag expired |
| `202` | Valid draft-only event accepted without cache expiration |
| `400` | Malformed JSON, invalid payload, unknown UID, or invalid event/UID combination |
| `401` | Missing or incorrect bearer secret |
| `413` | Request body exceeds 16 KiB |
| `415` | Content type is not `application/json` |
| `500` | Frontend secret is missing or too short |

All responses use `Cache-Control: no-store`. Error responses do not echo the
secret, payload, arbitrary tags, paths, or upstream details.

## Verify the webhook

Use a non-production secret and a published Article UID fixture:

```bash
curl --fail-with-body \
  --request POST \
  --header "Authorization: Bearer $CMS_REVALIDATION_SECRET" \
  --header "Content-Type: application/json" \
  --data '{
    "event": "entry.publish",
    "createdAt": "2026-08-21T06:00:00.000Z",
    "model": "article",
    "uid": "api::article.article",
    "entry": { "documentId": "verification-entry" }
  }' \
  http://localhost:3000/api/revalidate
```

Expected response:

```json
{"revalidated":true,"tag":"cms:articles"}
```

Then confirm an incorrect secret returns HTTP 401 and an unknown UID returns
HTTP 400. Automated route and cache-policy tests run with:

```bash
npm test -- --run src/app/api/revalidate/route.test.ts src/lib/cms/client.test.ts
```

## Event/date freshness

Event classification is derived at render time from the stored start/end
instants and the current server time. It is never stored as a second CMS status.
The five-minute event cache lifetime bounds normal transition staleness even if
no editor publishes content. Webhook invalidation still handles title, date,
location, registration, cancellation, and other editorial changes immediately.

After an urgent event update, publish it and verify the public event page. Treat
failed Strapi webhook deliveries as operational incidents rather than waiting
for the fallback.

## Deployment and rotation

For a managed Next.js platform, confirm that tag invalidation is shared across
all serving instances. Self-hosted multi-instance deployments need a shared
cache/invalidation handler or must deliver the webhook to every instance;
otherwise one instance can continue serving stale entries.

To rotate the secret:

1. generate a new value;
2. update the frontend environment and deploy it;
3. immediately update the Strapi webhook header;
4. send a verification event;
5. remove the old value from the secret manager and deployment history where
   supported.

Monitor non-2xx deliveries in Strapi and retry the publication after correcting
configuration or availability problems.
