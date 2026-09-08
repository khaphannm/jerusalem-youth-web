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
   The first photograph is the initial homepage image. Check its 4:3 crop.
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
