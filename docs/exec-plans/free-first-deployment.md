# Execution plan — Free-first deployment

Status: Direction approved; implementation not started.
Updated: 31 October 2026.

## Goal and scope

Serve the low-traffic website within free service allowances without depending
on sleeping editorial infrastructure. Use Netlify Free, Render Free Strapi,
Neon Free PostgreSQL, R2 Standard and a Workers Free media handler. See the
[deployment plan](../production-deployment-guide.md) for limits and compromises.

This task is documentation only. Live fetching, environments, webhook behavior
and media code remain unchanged. Export/release commands do not exist yet.

## Contracts to inspect before implementation

- `src/lib/cms/{client,domain,schemas,mappers,index}.ts`: read boundary and queries.
- `src/features/`, layouts and metadata: every CMS consumer, including search,
  sitemap, structured data, navigation and single types.
- `src/app/api/revalidate/route.ts`: live-mode semantics must stay explicit.
- `src/config/env.ts`, `.env.example`, `next.config.ts`: required configuration.
- CMS database/server/production upload configuration and media utilities:
  PostgreSQL TLS/pool, trusted proxy and S3 ACL handling.
- `.github/workflows/ci.yml`, package scripts and deployment configuration:
  quality gates, artifact isolation, retention and production publish controls.

## Design decisions

Keep existing domain contracts and Next.js server capabilities. Select the data
source behind the CMS boundary, with live mode available locally. Finalize and
test configuration names during implementation; do not pretend a snapshot
environment switch exists. Snapshot mode must not fall back to live CMS reads.

Package a versioned, server-only public-content snapshot with each deployment,
including identity, capture time and compatible schema revision. Capture while
editors pause changes; verify consistency and restart if the source changes.
Start with manual batch releases; automatic webhook publishing is later work.

## Implementation sequence

### 1. Complete published-content export

Reuse existing validation/mapping and fresh uncached published reads. Paginate
every collection and include taxonomy, nested relations, all single types, hero
slides, SEO and media references. Define required launch records and valid empty
collections. Reject HTTP errors, invalid data, duplicate identifiers/slugs,
incomplete pagination, incompatible versions and inconsistent capture. Export
only public fields; no database dump, drafts, admin data or secrets.

Add bounded wake-up/retry before export, separate from normal request timeouts.
Finish the complete artifact before any publish, with identity and validation
results recorded without sensitive data.

### 2. Snapshot adapter with query parity

Implement every current client query: latest/featured, filtering, sorting,
pagination, category/series, normalized search and ranking, slug lookup,
not-found/null and single types. Audit every CMS consumer, including global SEO,
Organization data and sitemap. Cover cold caches and fresh instances: no serving
path may reach Strapi in snapshot mode. Keep the snapshot out of public static
downloads and browser bundles.

Preserve current-time event/deadline behavior and bounded cache freshness without
CMS calls or daily full builds. Keep live-mode behavior/tests. Missing or invalid
snapshot/configuration must stop the candidate deployment rather than render an
apparently successful empty site.

### 3. Free editorial hosting and media

Test Neon TLS, certificate verification and conservative pooling, including idle
compute behavior. Verify Strapi build, memory and wake-up on Render Free; if it
cannot run reliably, upgrade/replan before launch. Review trusted proxy behavior
and verify secure Admin login/refresh/logout cookies.

Correct the provider's implicit ACL behavior with tests proving R2 requests omit
unsupported ACL headers. Add a read-only GET/HEAD R2 Worker with safe keys,
content metadata, CORS, conditional responses, cache policy and errors. Test
signed-out images, responsive variants and PDFs. Define object retention and
invalidation for replaced/withdrawn media. Document scoped credentials, bindings,
environment values and the `workers.dev` availability compromise.

### 4. Operator-triggered release

Implement wake, capture, validate, build/check and publish as one recorded
workflow. Pass the same snapshot through tests/build/deployment; no refetch while
building/serving. Isolate artifacts per run and serialize production publication
so an older run cannot replace a newer release. Preserve the previous site on
failure and retain exact artifacts for rollback. A retry must not silently reuse
unrelated stale content. Restrict secrets to trusted operator/build contexts;
previews receive no privileged production credentials.

Keep `POST /api/revalidate` specific to live-cache invalidation. It cannot report
snapshot publication simply because tags expired. Manual batch publishing comes
first; no draft-save rebuilds, webhook queue or new public trigger endpoint is
required for this phase.

### 5. Verification and handoff

- Test query parity, full pagination, optional emptiness, malformed/inconsistent
  records, publication filtering and secret exclusion.
- With CMS blocked after capture, test fresh/warm web instances, every public
  feature, SEO/sitemap and event/deadline clock advancement.
- Test successful additions/edits/unpublish/delete, failure preservation,
  retries, stale-run ordering and exact-artifact rollback.
- Verify CMS uploads, signed-out media and Worker cache/error behavior.
- Run relevant lint/typecheck/test/build/E2E gates and measure actual hosting
  resources, allowance usage, image payload and production performance.
- Rehearse database/media restore; document owner, expected publishing delay,
  failure reporting, privacy takedown, rollback and upgrade triggers.
- Replace pending steps in the deployment guide with the implemented commands,
  environment contracts and verified results before declaring it operational.

## Acceptance and risks

Launch is complete only when a fresh web deployment serves all public features
with CMS unavailable, invalid capture cannot replace the live release, editors
can publish a batch, and backup/rollback/urgent withdrawal are demonstrated.
Snapshots do not provide instant CMS-to-public updates or automatically revoke
old deployment URLs. Media/Netlify/Worker availability, billable R2 overages,
CMS memory, capture consistency and retained-media/privacy handling remain
operational concerns. No production-readiness claim is made by this plan.
