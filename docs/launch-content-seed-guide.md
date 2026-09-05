# Launch Content Seed Guide

This guide helps a ministry friend load the Jerusalem Youth review seed, turn
the sample records into real content, and publish only after the launch facts
have been verified.

The seed is intentionally safe for editorial review:

- it runs only with an explicit confirmation flag;
- it refuses to run when `NODE_ENV=production`;
- it creates editorial records as drafts;
- it never overwrites an existing single type, slug, or seed image filename;
- fictional records use a `REVIEW SEED —` title, a `review-` slug, and
  `noIndex: true`;
- generated images say `Generated review placeholder` in their CMS caption.

## What the seed creates

| Content | Quantity | Initial state |
|---|---:|---|
| Site Settings, About Page, Navigation, Social Links | 1 each | Draft |
| Author | 1 | Supporting record; no draft/publish in this schema |
| Categories | 4 | Supporting records; no draft/publish in this schema |
| Sermon series | 1 | Supporting record; no draft/publish in this schema |
| Events | 1 | Draft |
| Articles/devotionals | 6 | Draft |
| Sermons | 5 | Draft |
| Stories/testimonies | 3 | Draft |
| Resources | 4 | Draft |
| Generated review images | 5 | Media Library |

This meets the recommended launch volume in
[`docs/11-content-operations.md`](11-content-operations.md), but it does not
make the site launch-ready. The review blockers below still need human work.

## Facts and review blockers

| Item | Seed treatment | Required review |
|---|---|---|
| Ministry name | `Jerusalem Youth` | Confirm spelling and capitalization. |
| Ministry address | `99 Trương Đăng Quế, phường Hạnh Thông, Gò Vấp` | Confirm this is the public contact address and add phone/email if desired. The seed does not invent them. |
| Facebook | `https://www.facebook.com/jerusalemyouth20` | Open it while signed out and confirm it is the official public page. |
| Site URL | Not seeded | `jylovegod` is not an absolute web origin. Before deployment, set `SITE_URL` to the confirmed full HTTPS origin, such as `https://your-domain.example`, with no path. |
| Event date | Provisional `2026-09-11` | The supplied `11/09` was interpreted as 11 September 2026 because this seed was prepared on 5 September 2026. Confirm the year. |
| Event time | Provisional 7:00–9:00 PM, UTC+07:00 | Replace with the official start/end time. |
| Event venue | `DINO Coffee` | Add the exact branch/address, map URL, registration details, and contact if applicable. |
| Articles | Fictional review copy | Rewrite or approve every paragraph and Bible reference. Remove all review labels. |
| Sermons | Fictional metadata and `example.com` URLs | Replace title, speaker, date, summary, passage, thumbnail, and working video/audio/notes links. |
| Stories | Explicit fictional composites | Replace with real approved stories. Record informed consent for names, quotations, images, and video before publication. |
| Resources | Fictional metadata and `example.com` URLs | Replace each URL/file and verify ownership, accuracy, and permissions. |
| Images | Generated editorial illustrations | Replace with approved ministry photography where possible, or explicitly approve the illustration. Review alt text and consent/privacy. |

Do not mark QLT-004 Content Readiness complete while any row above is still
unresolved.

## Load the review seed

### 1. Prepare the local CMS

From the repository root, install both applications if needed:

```bash
npm ci
npm --prefix cms ci
```

Copy the CMS development environment and start PostgreSQL as described in
[`cms/README.md`](../cms/README.md):

```bash
cp cms/.env.example cms/.env
```

The command uses the configured CMS database and media provider. Back up any
shared review database before running it.

### 2. Run the one-shot command

Read this guide first, then run:

```bash
npm run seed:launch -- --confirm-review-seed
```

The command compiles and loads Strapi, validates all five local images, creates
only missing seed records, prints created/skipped totals, and shuts Strapi down.
It does not start a long-running development server.

Running the command again with unchanged `review-` slugs and image filenames is
safe: matching records are skipped. Once an editor changes a seed slug or image
filename, do not rerun blindly; the old seed identifier is then available and
would be created again.

### 3. Open the CMS

```bash
npm --prefix cms run develop
```

Open [http://localhost:1337/admin](http://localhost:1337/admin), sign in, and
look in Content Manager and Media Library. The seed records should still be
drafts and should be visibly labeled for review.

## Turn the seed into publishable content

Work through one record at a time. For each fictional editorial record:

1. Confirm the content owner and reviewer.
2. Replace facts, names, dates, links, and body copy with approved information.
3. Replace `Review Speaker` and `Review Contributor` labels with real approved
   display names, or omit the optional story display name.
4. Replace every `example.com/review-only/...` link with a working official URL.
5. Replace or explicitly approve the generated image. Add useful alt text that
   describes the final image in its content context.
6. Remove `REVIEW SEED —` from the title.
7. Change the `review-...` slug to the final lowercase, hyphenated slug before
   publication. Keep it stable afterward.
8. Remove `Review seed` notes from summaries, descriptions, and body copy.
9. Review the SEO title and description, then change `noIndex` to `false` only
   when the page is genuinely ready to appear in search.
10. Save the draft, ask another person to review it, and publish only after the
    publishing checklist in `docs/11-content-operations.md` passes.

Review Site Settings, About Page, Navigation, and Social Links as a group. The
seed does not overwrite an existing single type, so an established CMS may have
kept its earlier records instead of creating these drafts.

## Create new content manually

The seed follows the same order a person should use in Strapi.

### 1. Create supporting records

In Content Manager, create the Author and Category records first. Create a
Series before a sermon if the sermon belongs to one. These supporting types do
not have draft/publish in the current schema, so proofread them before saving.

### 2. Prepare the image

Use an approved JPEG, PNG, WebP, AVIF, or GIF under 10 MB. In Media Library:

1. Upload the image.
2. Give it a clear filename.
3. Add alternative text that communicates the meaningful visual content.
4. Add a caption for provenance or editorial notes when useful.
5. Check the crop at card and detail-page aspect ratios.

Never upload an image of a person without the required permission. Do not put
private consent details into public-facing alt text or captions.

### 3. Fill the required fields

- **Article:** title, final slug, excerpt, body, featured image, author,
  category, and featured status. Add tags, Bible references, and SEO when useful.
- **Event:** title, final slug, summary, description, banner, start date/time,
  location name, and featured status. Use an ISO 8601 time with an explicit
  offset such as `2026-09-11T19:00:00+07:00`; the optional end cannot precede
  the start.
- **Sermon:** title, final slug, speaker, sermon date, summary, and a working
  video URL. Add series, passage, audio, thumbnail, notes, and SEO where
  available.
- **Story/Testimony:** title, final slug, summary, body, featured image, and
  featured status. Add a display name or video only when consent covers it.
- **Resource:** title, final slug, description, and category. Provide exactly
  one source: either an uploaded file or an external URL, never both.

### 4. Review and publish

Preview the page at mobile and desktop widths. Check spelling, facts,
date/timezone, links, image rights, alt text, consent, and search/social metadata.
After an authorized publisher approves the draft, publish it and verify the
public page, search result, sitemap behavior, and relevant homepage card.

## Remove the review seed

There is intentionally no automatic delete command because a broad rollback
could remove editorial changes. If the review seed is no longer wanted:

1. Back up the database.
2. In each editorial collection, filter for titles beginning `REVIEW SEED —` or
   slugs beginning `review-`, inspect the results, then delete only those drafts.
3. Inspect the seed-created single-type drafts for `Review seed` copy before
   deleting them.
4. Delete supporting records only if they are unused:
   `jerusalem-youth-editorial-team`, `devotionals`, `community`,
   `faith-in-practice`, `resources`, and `foundations-for-everyday-faith`.
5. In Media Library, inspect and delete only the five `review-*.webp` files listed
   in [`cms/seed/assets/README.md`](../cms/seed/assets/README.md).

## Generated image provenance

The five assets live in [`cms/seed/assets`](../cms/seed/assets). They were
generated for this review seed on 5 September 2026. Their exact final prompts
and intended uses are recorded in
[`cms/seed/assets/README.md`](../cms/seed/assets/README.md).
