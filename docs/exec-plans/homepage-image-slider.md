# Execution Plan — Homepage Image Slider

Status: Implemented; populated-CMS visual/performance and publication verification pending

## Goal

Give first-time visitors an immediate sense of Jerusalem Youth through a
distinctive photographic homepage hero. Help visitors understand the community
and take the next step to join. Engagement is a goal to measure after launch,
not a guaranteed result of adding a slider.

## Relevant files/docs

- `src/app/page.tsx`
- `src/features/home/data.ts`
- `src/components/ui/content-image.tsx`
- `src/lib/cms/{domain,schemas,mappers,client}.ts`
- `cms/src/api/site-setting/content-types/site-setting/schema.json`
- `docs/03-content-model.md`
- `docs/04-design-system.md`
- `docs/07-performance-seo-accessibility.md`
- `docs/cms-publication-revalidation.md`
- `docs/11-content-operations.md`

## Original behavior

The hero renders the ministry name, description, and primary CTA from Site
Settings, with local fallbacks. It has no hero image or slider. The remaining
homepage sections already cover events, articles, sermons, stories, and joining.
Site Settings has one default social image, but no ordered hero-image collection.

## Proposed visual direction

Working concept: **Life at Jerusalem Youth**.

- Desktop: an asymmetric editorial composition, with roughly two-fifths of the
  width for the welcome copy and three-fifths for a large photographic stage.
  Use the existing grid, spacing, and container tokens to implement the proportions.
- Keep the ministry name, description, and one primary CTA stable while images
  change. Suggested review headline: “Faith. Friendship. Life together.” Any
  final copy and language must be reviewed with the ministry.
- Give the image a bold crop, the approved large radius, and a navy caption
  strip underneath. Keep text off faces and busy image areas.
- Add a restrained coral index such as “01 / 03” and visible previous/next
  controls. Use theme labels such as “Worship”, “Community”, and “Serving” as
  slide selectors on desktop.
- Mobile: stack the ministry name and short welcome copy, image, compact
  controls, and CTA. Use a stable image ratio, avoid forcing a full-screen hero,
  and keep the next homepage section discoverable by scrolling.
- Use Warm Ivory, Deep Navy, Electric Blue, and selective Warm Coral through
  existing semantic tokens. Preserve the Modern Editorial Youth Ministry identity.

The slider is limited to this requested hero. The existing design guideline
against unnecessary carousels continues to apply to content listings.

## Image direction

Start with three images; permit at most five:

1. Worship together: an authentic wide gathering photograph that immediately
   conveys the ministry's identity. This should be the strongest first image.
2. Find community: candid friendship or small-group activity with clear subjects.
3. Serve together: ministry members taking part in an actual service activity.

Use approved ministry photographs and confirm consent, particularly for minors.
Keep text out of image files and provide descriptive alt text. Check each crop
at desktop and mobile sizes. Existing generated seed illustrations may be used
for review; they must remain identified as placeholders in editorial records.

## Interaction

- Default to manual navigation with previous/next buttons, direct slide
  selectors, and horizontal touch swipe that preserves vertical page scrolling.
- Use a short crossfade based on the existing motion tokens. Reduced-motion
  users get an immediate image change.
- Announce user-requested slide changes politely; keep focus on the activated
  control and remove inactive content from the accessibility tree/tab order.
- Controls have descriptive accessible names, visible focus, and generous
  touch targets. Indicate selection with more than color alone.
- If automatic rotation is later requested, add an explicit pause/play control,
  stop on keyboard focus, pause on hover and hidden tabs, and disable automatic
  rotation for reduced motion. Do not silently resume after the visitor stops it.

## Implementation steps

1. Review the proposed visual direction and CMS contract below. Record the
   approved hero treatment and fields in the design/content-model docs.
2. Add the optional hero-slide component to Site Settings, regenerate Strapi
   declarations, and document how an editor uploads, orders, saves, and publishes
   slides. Existing installations must continue to work with no slide data.
3. Extend the CMS domain, validation, population, and mapping for slides. Keep
   data fetching on the server and reuse the existing Site Settings request.
4. Build a feature-local hero in `src/features/home/`, with the interactive
   gallery as a small Client Component. Reuse existing buttons, containers,
   typography, and responsive image handling. No carousel dependency is planned.
5. Replace the current hero section only. Preserve the other homepage sections,
   one semantic H1, metadata, and primary CTA source.
6. Validate behavior, visual layout, editorial publishing, and mobile performance
   using the checks below. Record screenshots and measured results.

## Data/API changes — approved through implementation request

Add an optional ordered `heroSlides` repeatable component to Site Settings,
limited to five entries. Each slide contains:

- `image`: required image media, using its existing alt text and dimensions;
- `label`: required short selector label;
- `caption`: optional short description.

CMS component order defines slide order. Use the existing Site Settings
`siteName`, `siteDescription`, and `primaryCta` for the fixed hero copy and action.
No new public route, token, environment variable, or per-slide CTA is proposed.
The suggested headline is a copy option, not an extra schema field.

Slide changes publish with Site Settings and reuse `cms:site-settings`
invalidation. Production requires the existing publication webhook; development
continues to read CMS data without persistent caching.

## Fallbacks and performance

- No slides or CMS unavailable: retain the current text-and-CTA hero.
- One valid slide: render a static image without slider controls.
- Broken image: preserve layout and the CTA, allow navigation to other valid
  slides, and avoid a broken-image icon becoming the primary visual.
- Render the first image and welcome copy in the initial HTML; the page remains
  useful without JavaScript. Show interactive controls only when functional.
- Reserve image dimensions to prevent layout shift. Prioritize only the first
  hero image; defer other full-size images until needed and prefetch the next
  slide after the initial page load when appropriate.
- Reuse CMS responsive variants/CDN delivery. Inspect the installed Next.js
  image documentation before selecting preload/fetch-priority APIs.
- Measure the production build on representative mobile hardware/network:
  target LCP <= 2.5 seconds, INP <= 200 ms, and CLS <= 0.1. Check the network
  waterfall to ensure hidden slides do not compete with the initial hero image.

## Validation plan

- CMS/adapter: old Site Settings payload without slides, ordered valid slides,
  missing optional captions, invalid media, and publication invalidation.
- UI: zero/one/multiple slides, navigation and wraparound, direct selection,
  keyboard focus, accessible announcements, reduced motion, and image failure.
- Browser: swipe/vertical scroll, no-JavaScript fallback, narrow mobile and
  desktop screenshots, text zoom/reflow, and clear CTA visibility.
- Publish a slide change in a review CMS and confirm the frontend updates via
  the webhook under production caching.
- Run lint, typecheck, applicable tests, production builds, and relevant browser
  checks. Compare image payload, client JavaScript, and performance with baseline.
- If analytics is configured at launch, compare join-CTA clicks and continuation
  to the next section; slide interactions alone do not establish success.

## Editorial risks

The implementation uses the approved CMS fields, manual navigation, and three
starting slides for newly seeded Site Settings. Real
photography and final copy remain editorial inputs; generated seed artwork is
available for review. Too many slides, aggressive cropping, and loading every
image eagerly could undermine the intended experience.

## Completion note

Implemented the gallery, optional CMS component, generated declarations, typed
adapter, and new-install review seed slides. Existing Site Settings are not
overwritten. Editorial setup is in `docs/11-content-operations.md` under
“Homepage photographs”; deploy/restart CMS before the web module.

Verification:
- Web lint/typecheck, web unit tests, CMS typecheck/tests, and both production
  builds pass. The web build used `SITE_URL=https://youth.example.org` and exercised
  the CMS-unavailable fallback.
- Two Chromium homepage checks pass (application shell and mobile overflow)
  with CMS unavailable. Gallery unit tests cover initial server HTML, deferred
  image mounting, navigation/focus, swipe discrimination, and failure states.
- Remaining release checks: populated-gallery desktop/mobile screenshots,
  real touch scrolling, text zoom, reduced-motion browser review, production
  webhook publishing, image/network payload and LCP/INP/CLS measurements against
  baseline. These are not established by unit tests or fallback browser checks.

Only visited slides mount; speculative next-slide prefetch is intentionally
omitted until network measurements justify it. No new dependencies or imagery
were needed; the seed reuses explicitly labeled review illustrations.

Move this plan to `docs/exec-plans/completed/` after outstanding validation and merge.
