# Free-first production deployment plan

Updated 31 October 2026. Selected direction for Jerusalem Youth's current low
traffic and infrequent editing. **Planning only: snapshot publishing and the R2
media Worker are not implemented.** Complete the
[execution plan](exec-plans/free-first-deployment.md) before using this as the
public launch workflow. Existing code still reads Strapi during requests/builds.

Target $0 monthly service charges within free allowances, then upgrade services
individually. Free tiers carry availability limits; no hosting resources have
been provisioned or billing plans changed by this documentation update.

## 1. Services and limits

| Part | Starting service | Limits / qualifications |
| --- | --- | --- |
| Next.js web and address | Netlify Free, `https://jylovegod.netlify.app` if available | Currently 300 credits/month; deploys, traffic and compute consume credits. Exhaustion can pause the site. [Pricing](https://www.netlify.com/pricing/) |
| Strapi editorial CMS | Render Free Node web service | Sleeps after 15 idle minutes; waking takes about a minute. Render advises against Free for production applications. Accept this for the noncritical editorial service only after resource testing. [Limits](https://render.com/docs/free) |
| PostgreSQL | Neon Free | Currently 1 GB storage and 100 CU-hours/month/project; compute can suspend on allowance exhaustion. Use a claimed permanent account, not an unclaimed temporary database. [Pricing](https://neon.com/pricing) |
| Images/PDFs | Cloudflare R2 Standard | Free allowance: 10 GB-month storage, 1 million Class A and 10 million Class B operations/month; excess is billable. [Pricing](https://developers.cloudflare.com/r2/pricing/) |
| Media delivery | Workers Free with an R2 binding | Separate request/CPU allowances; the proposed small read-only handler must fit these limits. [Pricing](https://developers.cloudflare.com/workers/platform/pricing/) |

The website address is a provider subdomain, not a registration of
`jylovegod.com`. Availability of the chosen name is unverified. See
[Netlify domains](https://docs.netlify.com/manage/domains/domains-fundamentals/understand-domains/).

The proposed media address is `https://<worker>.<account>.workers.dev`. Cloudflare
recommends a custom domain/route for production and describes `workers.dev` as
suitable for personal/hobby projects that are not business critical. This is an
initial availability compromise, to review before a high-profile launch. R2's
direct `r2.dev` URL is development-only and rate limited; it is not the selected
delivery endpoint. See [Worker domains](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/)
and [R2 public access](https://developers.cloudflare.com/r2/buckets/public-buckets/).

Free allowance is not an enforced zero-billing guarantee everywhere. R2 requires
a subscription and may require a payment method; confirm signup and overage
terms before activation. Set notifications, keep paid auto-recharge off where
supported, and monitor actual usage. Alerts are not hard spending caps. If
guaranteed zero charges are required, resolve a hard-cap media arrangement
before launch. See [R2 setup](https://developers.cloudflare.com/r2/get-started/).
Do not use Render Free PostgreSQL: it expires after 30 days. Store data in Neon.

## 2. Publishing architecture

```text
Publisher -> wake CMS -> edit/publish -> request content release
                                              |
                          export -> validate snapshot -> build/check
                                              |
                                      publish Netlify deploy

Visitor -> Next.js -> snapshot bundled with that deployment
        -> media Worker -> R2 images/PDFs
```

Snapshot mode must serve all public data without Strapi/Neon requests, including
metadata, layout/navigation, search, pagination, detail pages, structured data
and sitemap. Keep Next.js server capabilities; this is not a static-export
conversion. Media delivery remains a live dependency outside the snapshot.

The exporter runs only for a requested content release, after bounded CMS
warm-up/retries. The current eight-second CMS request timeout cannot reliably
cover a roughly one-minute wake-up. Do not make visitors wait for this operation
or add recurring keep-alive requests to defeat service sleep.

Each snapshot is a complete validated set of approved public fields, packaged
immutably with one web deployment. It is not a database backup or a public JSON
download. Exclude drafts, admin data and secrets. Keep it server-side so full
article bodies are not all shipped in client JavaScript.

## 3. Required implementation before deployment

Follow the [execution plan](exec-plans/free-first-deployment.md). Environment
changes alone do not enable this mode.

1. Build a published-content exporter with full pagination, existing validation,
   mapped relations and capture-consistency checks. Treat upstream errors as
   release failures, not empty content. Explicitly define required launch records
   and legitimate optional empty collections.
2. Implement a snapshot adapter behind the typed CMS boundary, preserving every
   existing query method and feature. Missing/incompatible snapshots must stop
   the candidate release; never silently fall back to live CMS in snapshot mode.
3. Implement and document source selection, artifact handling and release
   commands. No snapshot command or environment switch exists yet.
4. Add the read-only R2 Worker and test ACL-free S3 upload configuration. The
   installed provider can default to `public-read` when `AWS_ACL` is omitted;
   leaving it blank is not a verified R2 fix. Do not copy AWS S3's
   `bucket-owner-full-control` value to R2.
5. Review Strapi trusted-proxy configuration and verify HTTPS Admin login,
   refresh/logout and `Secure`/`HttpOnly` auth cookies. The current server config
   has no environment switch for proxy trust. See [Strapi server configuration](https://docs.strapi.io/cms/configurations/server).
6. Add a manual batch-release workflow: capture, validate, build, verify, then
   publish. Keep the previous deployment active on any failure. Serialize releases
   so an older run cannot overwrite a newer published snapshot.

The current `POST /api/revalidate` only expires live CMS cache tags. It cannot
export snapshots or publish a web deployment. Keep that endpoint documented for
live mode; a 200 response is not proof of snapshot publication. Automatic
publication is a later option requiring authentication, retries, debouncing and
ordering. Netlify supplies [build hooks](https://docs.netlify.com/build/configure-builds/build-hooks/),
but their secret URLs must not be exposed in browsers or Git.

## 4. Provisioning after implementation passes

Use ministry-controlled accounts, existing CI/review gates and the Node major
tested in CI (currently 24). Docker is optional. Start with manual production
publishing so provider auto-deploys cannot bypass validation or race schema changes.

1. Create Neon Free PostgreSQL. Keep the connection string with CMS and approved
   backup tooling; neither visitors nor the exporter need database credentials.
   Use Neon TLS with certificate verification, resolving URL SSL parameters/CA
   requirements with the repository's database options. Configure conservative
   pooling and confirm idle CMS activity lets database compute sleep.
2. Create an R2 Standard bucket with scoped CMS S3 credentials. Deploy the tested
   Worker with an R2 binding, safe object keys, GET/HEAD only, content metadata,
   CORS and cache handling. No public uploads, deletes, listing or arbitrary
   proxy targets. Use its HTTPS origin for persisted public media URLs.
3. Create a Render Free **Web Service**, root `cms`, build
   `npm ci --include=dev && npm run build`, start `npm run start`, health
   `/_health`. Use its assigned port and independent production Strapi secrets.
   Test actual build/runtime memory, wake-up and Admin behavior. If Strapi cannot
   run reliably on the free instance, upgrade CMS compute or revisit the plan;
   its suitability is an explicit launch gate, not an assumption.
4. Finish CORS/CSP using the allocated CMS origin. Upload approved media through
   Admin; verify previews, responsive variants and signed-out public URLs.
   Local records/uploads do not migrate through Git. Recreate approved launch
   content or use a separately verified transfer. Never bypass the review seed's
   production restriction.
5. Create the Netlify Next.js project at the repository root, retain the adapter
   and `.next` publish directory, and integrate the implemented release pipeline
   before `npm run build`. Snapshot export may need build credentials; serving
   the snapshot must not need CMS/database connectivity. Keep production secrets
   out of previews and scope them to authorized build/operator phases.
6. Capture the first snapshot while editors pause changes. Validate and verify
   the candidate before publication. Record web commit, CMS schema revision,
   snapshot identity/time and media origin. Do not launch with fallback content.

Current configuration is in `.env.example`, `cms/.env.example` and CMS config.
The S3 secret name in this repo is `AWS_ACCESS_SECRET`. R2 needs its S3 HTTPS
endpoint, bucket, region setting and public delivery origin; finalized values
and snapshot commands must be documented/tested during implementation. Copying
the old live-CMS environment is insufficient.

## 5. Publisher workflow after implementation

1. Open CMS Admin, allow it to wake, and publish the approved batch, including
   Site Settings/hero slides and supporting taxonomy where appropriate.
2. Pause editing during capture and request one content release using the
   operator workflow implementation will provide. CMS Publish alone does not
   change the public snapshot.
3. The release warms CMS, captures/validates all public records and references,
   builds the candidate and reports the deployed revision or failure.
4. Verify the actual public change after deployment. On failure, the previous
   website remains active; correct the issue and retry.

Unpublish/delete also require a successful new snapshot release. Until then,
old content remains public. For an urgent privacy removal, expedite a release;
if it fails, restrict the affected page/media at the host and purge retained
caches/deploy URLs as needed. CMS unpublish does not revoke old deployments or
public images automatically. Document an operator and escalation path.

Upcoming/past event classification and registration deadlines must continue to
use current server time with bounded cache freshness. Do not freeze status in
the snapshot or require daily full builds just for date transitions. Date/venue
edits still require a content release.

## 6. Launch verification and recovery

- [ ] Complete export, public-field validation, relation/media coverage and
      exclusion of drafts/secrets are tested.
- [ ] Timeouts, invalid records, truncated pagination and inconsistent capture
      fail before replacing the active release.
- [ ] With CMS stopped, both a fresh web instance and warm caches serve every
      public feature, metadata and sitemap; event/deadline transitions still work.
- [ ] Publish/edit/unpublish/delete and failed-release/rollback scenarios pass.
- [ ] Secure Admin/proxy behavior, least-privilege permissions, R2 uploads,
      Worker errors/cache policy and public media are verified.
- [ ] Mobile/gallery/a11y/SEO/performance checks pass. Verify preview protections:
      production-mode preview builds are not automatically noindex in this repo.
- [ ] Usage notifications, backup owner and an isolated restore test are recorded.

Keep database and media backups under ministry control; free restore windows
are not the backup policy. Record compatible commits, database/media recovery
points, preserved object keys and public origin, restore validation and cutover
steps in the operator's recovery record. Snapshots cannot restore the editable
CMS database. Do not delete media still needed by retained releases during
ordinary editing; an emergency privacy withdrawal overrides retention.

Rollback republishes the known-good artifact with its exact snapshot and
compatible configuration. Rebuilding the same Git commit against today's CMS
does not reproduce the prior release. Confirm old content is still approved
before rollback. Snapshot rollback cannot restore deleted R2 objects.

## 7. Upgrade triggers

| Trigger | Next action |
| --- | --- |
| Strapi does not fit/run on Free, wake delays disrupt editors, or availability matters | Upgrade CMS compute first; snapshots can stay |
| Frequent immediate updates or urgent removals become normal | Add authenticated release automation or intentionally restore live mode with always-on CMS |
| Netlify credits approach allowance, especially before an outreach event | Upgrade web allowance; review release frequency and payloads |
| Neon compute, transfer or storage approaches allowance | Upgrade database and review queries/pooling |
| R2/Worker allowance or media availability becomes limiting | Review paid delivery allowances and a custom media domain |

Visitor counts alone are insufficient: deployments, media requests, database
activity and editorial needs also matter. Preserve the
[always-on deployment guide](production-deployment-always-on.md) as an alternative,
without requiring every provider to change at once. Any media-host move must
preserve URLs or intentionally migrate persisted references.
