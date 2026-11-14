# Content Operations

A website is only successful if the ministry can operate it after launch.

## Editorial workflow

```text
Idea -> Draft -> Review -> Approve -> Publish -> Distribute -> Measure -> Archive/Update
```

## Roles

### Contributor
- create/edit own drafts
- no production publishing

### Editor
- review/edit content
- manage taxonomy
- prepare publication

### Publisher / Ministry Lead
- final approval/publish for sensitive or high-visibility content

### Administrator
- CMS/system administration
- not required for ordinary publishing

Use the CMS capability that best approximates these roles; do not grant broad access merely for convenience.

## Publishing checklist

Before publication:
- title clear
- excerpt useful
- body proofread
- correct author/category
- dates/times/timezone correct
- images licensed/approved and optimized
- alt text present
- links work
- SEO title/description reasonable
- social preview checked
- consent/privacy reviewed for people/stories/photos

## Event lifecycle

- Upcoming: prominently discoverable.
- Registration closed: clearly indicated if applicable.
- Past: retained in archive when useful, not presented as upcoming.
- Cancelled/changed: updated clearly and quickly.

## Content freshness

The selected [free-first publishing plan](production-deployment-guide.md) is
pending implementation. Once enabled, editors must publish in CMS **and request
a content release**; public changes, unpublish and delete take effect only after
a successful snapshot deployment. The workflow below describes the current
implemented live-CMS webhook behavior. Do not treat its successful response as
proof that a new snapshot reached visitors.

Assign recurring ownership for:
- upcoming events
- contact details
- leadership/about information
- broken external links
- resource downloads
- featured homepage content

Vision, mission, values, and the About-page action are maintained in the
published **About Page** single type. Ministry name and concise identity copy
remain in **Site Settings**. The content owner should review both records
together whenever ministry identity or leadership direction changes.

Publishing, unpublishing, or deleting public content triggers the authenticated
frontend revalidation webhook. Supporting Author, Category, and Series changes
also invalidate cached payloads that embed those records. Editors should treat
a non-2xx webhook delivery as a publication incident and notify the site owner.

Event reads have a five-minute cache fallback so upcoming/past transitions do
not depend solely on a content edit or webhook delivery. Frontend event status
must be derived from `startDateTime` and `endDateTime` using the current server
time; it must not be persisted as a duplicate CMS status field. Urgent event
changes should still be published immediately and the public result checked.

See `docs/cms-publication-revalidation.md` for configuration, response codes,
secret rotation, and multi-instance deployment requirements.

## Homepage copy

1. Deploy/restart the CMS with the Home Page single type **before** deploying
   the web release that reads it. Until an entry is published the website shows
   its built-in copy, so the order is safe either way.
2. In **Settings → Webhooks**, add **Home Page** to the entities sent by the
   publication webhook so edits appear without a redeploy.
3. Open **Content Manager → Home Page**. Each section has a small label
   (eyebrow), a heading and an optional description. Community themes (up to
   six) and newcomer steps (up to four) can be added, removed and reordered.
4. The call to action sets the label and link of every invitation button on
   the homepage. Use a site path such as `/join` or a full `https://` address.
5. Save and publish, then check the homepage on mobile and desktop. Keep
   headings short: they are displayed very large.

New installations get a draft Home Page with the current Vietnamese copy from
`npm run seed:launch`; rerunning the seed never overwrites an existing entry.
Hero photographs are managed separately, below.

## Homepage photographs

1. Deploy/restart the CMS with the `shared.hero-slide` component and updated
   Site Settings schema **before** deploying the web module that populates it.
2. Upload approved ministry photographs to the Media Library. Confirm consent,
   especially for minors, add descriptive alternative text, and use compressed
   images with responsive variants. Keep lettering out of photographs.
3. Open **Content Manager → Site Settings → heroSlides**. Add up to five
   components; three is a good starting point: Worship, Community, Serving.
4. Choose each image, enter a short label (up to 40 characters), optionally add
   a caption (up to 160 characters), and drag components into the desired order.
   The first photograph is the initial homepage image. Check its 16:9 crop
   on desktop and 4:3 crop on mobile.
5. Save and publish Site Settings. Check the homepage on mobile and desktop,
   test every control, and verify the existing primary CTA is correct. For
   production, verify the publication webhook succeeds using the
   [revalidation guide](cms-publication-revalidation.md).

Zero slides keeps the text hero; one displays a static image. Navigation is
manual and remaining images load only when selected. The launch seed adds three
clearly labeled review illustrations only when creating new Site Settings;
rerunning it does not overwrite existing settings. Existing installations must
add slides manually. Replace review illustrations and captions with approved
photography/copy before launch; do not present generated scenes as real events.

## Content seed for launch

Recommended minimum:
- complete About/Vision/Mission
- current contact/social links
- current upcoming events
- 5–10 articles/devotionals
- 5–10 sermons
- 3–5 stories/testimonies
- initial resources
- approved photography

The repository includes an idempotent, non-production review seed that meets
the recommended content volume without presenting fictional copy as approved
launch content. See [`docs/launch-content-seed-guide.md`](launch-content-seed-guide.md)
for the seed command, known review blockers, generated-image provenance, manual
content-entry steps, publication checklist, and safe removal procedure.
