# Homepage landing-page plan

Date: 12 November 2026.
Status: Vietnamese implementation completed locally; English release pending.

## Follow-up record — 14 November 2026

- Layout and motion reworked to the landing-page direction now documented in
  `docs/04-design-system.md` ("Landing-page layout and motion"): centred hero
  above a full-width gallery, tiles, sticky section headings, CSS-only
  scroll-linked reveals and a sticky translucent header.
- Homepage copy moved to the new Home Page single type
  (`docs/03-content-model.md`); `src/features/home/copy.ts` is now the
  fallback. The invitation link is the Home Page `primaryCta`.
- Still to do on the live CMS: deploy the schema, add Home Page to the
  publication webhook, publish the entry. Not yet measured on production:
  LCP/INP/CLS, real-device touch scrolling, Safari and Firefox rendering.

## Implementation record — 13 November 2026

Application changes were made in the existing checkout at
`/Users/macbook/Desktop/Git Projects/jerusalem-youth-web`. The active Documents
workspace still contains only planning files; source was not moved or replaced.
The plan and copy-review document are copied here beside the implementation.

- Vietnamese introduction, community themes, combined gathering section,
  optional stories, combined teaching/articles, newcomer guidance and final
  Facebook invitation implemented in `src/app/page.tsx`.
- Published About Page mission is loaded through the typed CMS client; CMS
  article/story/event text, alt text and slide captions remain as authored.
- Existing hero slides are reused. With no configured slides, a published
  event/story/article or social image can supply a static hero. No new images
  were generated, and live CMS data was not written or published.
- Homepage cards/dates/slider controls are Vietnamese. Event times use
  `Asia/Ho_Chi_Minh`; other pages retain default English/UTC card behavior.
- Shared header/footer chrome uses Vietnamese with explicit `lang="vi"`;
  the landing main has the same language scope. Root `lang="en"` remains for
  existing English detail routes. Known English navigation labels are mapped;
  custom CMS labels remain under editorial control.
- The homepage uses the supplied Facebook URL regardless of an older unrelated
  CMS primary CTA. No message is sent automatically and no messaging embed loads.
- English copy exists in the review document. English routing, language switching
  and full CMS translations remain phase two and are not represented as live.

Verification commands:

Local results: typecheck and lint pass; 325 unit/component tests pass; all 19
foundation browser checks and both isolated populated-homepage checks pass.
Production build passes with CMS unavailable, exercising controlled fallbacks.
Screenshots use fixture content, not the live CMS or production measurements.

```bash
npm run typecheck
npm run lint
npm test
SITE_URL=https://youth.example.org npm run build
npx playwright test -c playwright.homepage.config.ts
SITE_URL=http://localhost:3000 npm run test:e2e
```

The isolated homepage browser fixture serves existing clearly labeled review
images and fictional test records, with no ministry database connection. Screenshots
are written to `test-results/` at 1440, 390 and 320 pixels. These fixture images
are not approval of generated artwork as real ministry photography. Public launch
still requires editorial review, real CMS verification and production performance
measurement; local implementation does not publish the website.

## Confirmed preferences

- Vietnamese is the first public language; an English translation follows.
  Prepare translated homepage wording now, with the English interface/language
  routing as a second implementation phase. Full CMS content translation is a
  separate editorial task, not an automatic consequence of translating headings.
- Draft wording for review before treating it as approved ministry content.
- Reuse existing images first. No new image generation or stock-photo search.
- Primary visitor action: open the official Facebook page to message the team:
  `https://www.facebook.com/jerusalemyouth20`.
- Primary button: **Nhắn tin qua Facebook**; English: **Message us on Facebook**.
  Link to the supplied official page without inventing a Messenger handle or
  claiming a message has been sent. Visitors choose Facebook's messaging action.
- Draft text and matching English translations are in
  [the copy review document](../content/homepage-copy-review.md).

## Goal

Make the Jerusalem Youth homepage a complete introduction for a first-time
visitor. In one page, answer: Who are you? What happens here? Can I come? When
and where do I go? How do I connect?

Interpret “youth service” as the youth ministry and its gatherings, including
worship, teaching, friendship and serving where those activities are confirmed
by the ministry. Do not imply that an unverified program or meeting exists.

Keep the detailed About, Events, Articles, Sermons, Stories, Media, Resources,
Join and Contact pages. The homepage introduces these destinations through a
coherent story; visitors should understand the ministry before opening them.

## Workspace and reference

The active workspace at `/Users/macbook/Documents/ChatGPT/jerusalem-youth-web`
contains no application source or commits at planning time. This plan is saved
there. The earlier application checkout at
`/Users/macbook/Desktop/Git Projects/jerusalem-youth-web` was inspected read-only.
The user has confirmed the project folder is open, but the execution session
still sees only the planning files in the active workspace. The earlier source
checkout remains available. Reconcile the tool's working directory with the
opened project before editing application files; do not overwrite either checkout.

Reference implementation: `src/app/page.tsx`, `src/features/home/data.ts`,
`src/features/home/hero-gallery.tsx`, About/Join pages, CMS domain contracts,
information architecture and the existing design system in the earlier checkout.

Its homepage currently has a hero gallery, featured gathering, separate upcoming
events, latest article, latest sermon, stories and a Join CTA. It does not yet
bring the ministry's purpose and first-visit introduction into that sequence.

## Proposed section order

| Order | Section | Purpose and content | Main action |
| --- | --- | --- | --- |
| 1 | Welcome to Jerusalem Youth | One clear headline, concise identity, existing ministry image slider, welcoming invitation | Nhắn tin qua Facebook → official page |
| 2 | Who we are | Short ministry introduction and a concise presentation of approved mission/vision | Learn about us → `/about` |
| 3 | Life in our community | Three brief themes describing confirmed activities, such as worship, growing in faith and friendship/service | See our gatherings → `/events` |
| 4 | Come to our next gathering | One featured upcoming event with date, local time, venue and clear practical details; up to two other upcoming events in the same section | View gathering → existing event detail |
| 5 | Stories from our youth | One prominent approved testimony and, when available, up to two supporting stories | Read the story → existing story detail |
| 6 | Grow throughout the week | Latest teaching and article in one compact section, with secondary access to resources | Watch/read → respective detail pages |
| 7 | Visiting for the first time | Simple next steps: check a gathering's details, ask the team through Facebook; use verified contact/location information | Nhắn tin qua Facebook → official page; `/join` as secondary guidance |
| 8 | Final invitation | Short welcoming close and a clear next step | Nhắn tin qua Facebook → official page |

Follow with the existing site footer. Keep the current global navigation; any
in-page navigation should be a small optional enhancement, not a replacement
for existing routes. Start without an extra sticky navigation bar on mobile.

## Content and CMS approach

- Keep Site Settings as the source of ministry name, description, primary CTA,
  hero slides and organization contact. Social Links supplies official channels.
  The requested primary CTA is the supplied Facebook URL. During implementation,
  use the existing validated CTA/social-link contract and document its editorial
  configuration. An unrelated current CMS CTA must not silently override this
  user choice. Do not write to or publish the live CMS during copy review.
- Load the existing published About Page for mission, vision and values. Use
  concise, reviewed excerpts or the existing short copy; do not cut rich content
  arbitrarily or create a second conflicting version of the ministry's purpose.
- Reuse existing upcoming-event selection and exclude the featured event from
  the supporting list. Preserve current-time event status and timezone formatting.
- Reuse existing Story, Article and Sermon content. Show only genuinely
  published material approved for public use.
- Activity labels and first-visit wording are proposed editorial copy. Confirm
  the actual activities before publishing. Do not turn About values into claims
  about programs without review. If these need independent CMS editing, propose
  the smallest explicit schema addition before implementing it.
- Do not introduce a generic page builder, an FAQ schema, fabricated attendance
  numbers, invented schedules, or additional collection types for this layout.
- Preserve existing CTA validation and internal/external link handling. Do not
  send a homepage CTA back to the homepage. Keep one visually primary action
  per section, with less prominent links for secondary destinations.

## Visual direction

Continue the established Modern Editorial Youth Ministry identity, semantic
colors, typography, spacing, radii and button styles.

Use the existing photographic hero, followed by varied editorial layouts:
mission copy with generous whitespace, a concise three-theme section, a strong
gathering feature, a story-led community section and a compact teaching/article
pair. Avoid making every section a full-width grid of identical cards.

Use authentic, consented ministry photographs. Reuse approved assets where
appropriate; generated seed illustrations remain review placeholders. Keep text
off busy photographs and faces. Do not generate or publish new imagery as part
of this planning task.

On mobile, use one-column reading order, short paragraphs, comfortable controls
and visible next actions. Keep the manual slider, reduced-motion behavior and
first-image prioritization. No autoplay, scroll hijacking, video background,
animation library or compulsory full-screen sections.

## Missing content and first-visit accuracy

The homepage must remain a useful introduction when optional content is absent.
Omit empty optional story/teaching blocks or combine their fallback with a useful
next action. Avoid a long landing page of repeated “coming soon” panels.

If there is no upcoming event, show a compact invitation to check Events or
Contact; do not reuse an expired event as the next gathering. A general ministry
address is not automatically the next event venue. Show each only in its correct
context. Only include start time, recurring schedule, age guidance, accessibility
information or arrival instructions when confirmed; otherwise link to Contact.

Do not claim that a newcomer can attend alone, bring friends, needs no booking,
or will be met by a host unless the ministry confirms that guidance. A dedicated
FAQ can be added later if approved questions/answers become available.

## Implementation sequence

1. Reconcile the application checkout and review the drafted Vietnamese copy,
   actual ministry activities and existing imagery. Preserve the confirmed
   Facebook action. Deliver the Vietnamese homepage first.
2. Extend the homepage data loader to include published About Page and official
   channels through the existing typed boundary. Reuse existing contact/settings
   data; keep independent failures contained and avoid duplicate requests.
3. Implement the new introduction/community/first-visit sections using existing
   layout and content components. Extract feature-local sections only where it
   improves clarity; keep server rendering and a small interactive hero.
4. Combine the event sections and compact the article/sermon sections. Preserve
   links, existing detail pages, one H1, metadata and structured-data behavior.
5. Review full, sparse and unavailable-content states. Verify desktop and mobile
   screenshots with real or clearly identified review content.
6. Update homepage/data tests and relevant browser checks; run lint, typecheck,
   unit tests and production build. Verify current installed framework guidance
   before choosing APIs during implementation.
7. Document any approved content-contract or editorial changes. Keep compatibility
   with the chosen deployment data source: live CMS now, and the separately
   planned snapshot adapter if/when it is implemented.
8. Add the English homepage as phase two using reviewed translations. Choose
   language URLs, selector behavior, document language and canonical/hreflang
   rules explicitly before implementation. Preserve the Vietnamese default and
   existing routes; do not silently machine-translate CMS stories or events.

## Acceptance criteria

- A newcomer can understand the ministry, its confirmed activities and how to
  visit from the homepage without needing to browse multiple pages first.
- The page follows the proposed narrative, with one H1, descriptive section
  headings, functional CTAs and no repeated event listings.
- Existing routes, navigation, hero-gallery behavior, canonical metadata and
  public content/consent rules are preserved.
- Vietnamese wording, including navigation/controls/date labels within the
  homepage experience, reads naturally. Document language is accurate for the
  delivered page; shared English routes must not be mislabeled Vietnamese.
- The primary invitations open the supplied official Facebook page. No chat
  widget, tracking embed, native contact form or automatic message is added.
- Empty or unavailable sources never produce invented ministry claims, stale
  gathering dates, broken controls or a wall of placeholder panels.
- Keyboard navigation, visible focus, alt text, touch controls, reduced motion,
  text reflow and narrow mobile layouts are verified.
- The first hero image remains intentional for loading; below-fold images and
  optional embeds do not compete with it. No unnecessary client-side fetching
  or dependencies are introduced.
- The final handoff records checks and screenshots, plus any remaining copy,
  photography or data-model decisions. Planning does not imply these checks
  already pass or that the website has been changed.
