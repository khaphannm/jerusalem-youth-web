# Design System and Visual Direction

## Design objective

The website should feel youthful, warm, confident, modern, and authentic without looking like a generic startup template or a one-off event microsite.

## Visual principles

1. Real ministry photography is the primary visual language.
2. Strong editorial typography creates hierarchy.
3. Generous spacing creates calm and clarity.
4. One clear primary action per section.
5. Color supports hierarchy; it does not replace hierarchy.
6. Motion is restrained and meaningful.
7. Components are reusable but pages should not feel mechanically repetitive.

## Anti-patterns

Codex must not introduce:
- arbitrary gradients because a page feels "empty";
- neon/glassmorphism by default;
- excessive shadows;
- random border radii;
- decorative animation on every section;
- tiny low-contrast text;
- carousels when a static grid communicates better;
- stock-looking imagery if authentic imagery is available;
- multiple competing CTAs above the fold.

## Tokens

Implement design values as tokens/CSS variables. Do not scatter magic values.

Token categories:
- color: background, foreground, muted, primary, accent, border, destructive
- typography: display, heading, body, label
- spacing: consistent scale
- radius: small/medium/large
- shadow: minimal set
- container widths
- breakpoints
- motion durations/easing

The actual brand palette must be approved before Codex finalizes branded visual styling. Until then, use a neutral, easily replaceable token set.

## Typography

- Use `next/font` or framework-recommended font loading.
- Keep body text highly readable.
- Limit primary font families.
- Use fluid/responsive sizing where appropriate.
- Avoid ultra-light weights for body copy.

## Layout

- Mobile-first
- Consistent content container
- Clear vertical rhythm
- Avoid long full-width text lines
- Use grids that degrade naturally to one column
- Respect content density; do not force every page into identical card grids

## Images

- Use `next/image` where applicable.
- Always define meaningful dimensions/aspect ratios.
- Use appropriate `sizes`.
- Avoid loading high-resolution media unnecessarily.
- Hero/LCP image behavior must be intentional.
- Require useful alt text for meaningful images; decorative imagery uses empty alt.

## Motion

Use motion only to communicate:
- state change,
- navigation/context,
- hierarchy,
- direct interaction feedback.

Respect `prefers-reduced-motion`.
Do not add an animation library for effects achievable cleanly with CSS.

## Core components

Build and reuse:
- Button
- LinkButton
- Container
- Section
- SectionHeading
- Header
- MobileNavigation
- Footer
- ArticleCard
- EventCard
- SermonCard
- StoryCard
- ResourceCard
- MediaCard
- RichText renderer
- EmptyState
- ErrorState
- Pagination
- SearchInput
- Breadcrumbs where appropriate
- CTA section

## UX content rules

- Headings describe the content, not clever abstractions.
- CTA labels describe the action.
- Dates/times are localized consistently.
- Empty states should be human and useful.
- Never expose CMS/internal terminology to visitors.
# Approved Visual Identity V1

## Direction

**Modern Editorial Youth Ministry**

Visual personality:
- youthful: 8/10
- modern: 9/10
- energetic: 7/10
- warm: 8/10
- playful: 5/10
- formal: 4/10
- minimal: 7/10
- spiritual: 8/10

The site must feel like a long-lived ministry platform, not a one-off conference/event microsite.

## Approved color palette

| Semantic role | Name | Hex | Use |
|---|---|---:|---|
| background | Warm Ivory | `#FFF9F2` | Main page background |
| foreground | Midnight | `#111827` | Primary text/headings |
| surface | Soft Sand | `#F3F0EA` | Cards/alternate sections |
| primary | Electric Blue | `#3657F5` | Primary CTA, links, active state |
| secondary | Deep Navy | `#1F3A5F` | Strong sections, footer |
| accent | Warm Coral | `#FF6B4A` | Event energy, badges, highlights |
| calm | Soft Sage | `#A8C7A1` | Devotional/story/quiet sections |
| white | Pure White | `#FFFFFF` | Text/surfaces on dark backgrounds |
| border | Warm Gray | `#DEDAD3` | Borders/dividers |
| muted | Slate Gray | `#667085` | Secondary text where contrast passes |

## Color usage ratio

Guideline:
- ~60% neutral backgrounds: Ivory / White
- ~25% dark typography/sections: Midnight / Navy
- ~10% Primary Blue
- ~5% accent use: Coral / Sage

Do not give Blue, Coral, and Sage equal visual weight.

## Semantic token requirement

Codex MUST NOT scatter raw brand hex values in components.

Components must consume semantic tokens:
- `background`
- `foreground`
- `surface`
- `primary`
- `primary-foreground`
- `secondary`
- `secondary-foreground`
- `accent`
- `accent-foreground`
- `calm`
- `calm-foreground`
- `border`
- `muted`

New visible colors require an explicit design-system change.

## Suggested CSS variables

```css
:root {
  --background: #fff9f2;
  --foreground: #111827;
  --surface: #f3f0ea;

  --primary: #3657f5;
  --primary-foreground: #ffffff;

  --secondary: #1f3a5f;
  --secondary-foreground: #ffffff;

  --accent: #ff6b4a;
  --accent-foreground: #111827;

  --calm: #a8c7a1;
  --calm-foreground: #111827;

  --border: #dedad3;
  --muted: #667085;
}
```

## Section rhythm

The homepage alternates dark and light sections automatically. The hero is
Warm Ivory; the first section rendered after it is Deep Navy, the next light,
and so on. The pattern follows the sections that are actually shown, so
switching a section off in the CMS (or having no stories) never leaves two
dark or two light sections touching.

- Dark is always `secondary` (Deep Navy).
- Light uses the section's own tone: white for the vision, gathering, stories
  and newcomer sections, Soft Sand for the mission and closing invitation,
  Soft Sage for teaching.
- Each section must work in both tones: headings take the section tone, text
  links are white on navy and blue on light, the highlighter stroke is 55%
  on navy, and content cards set their own text colour so they never inherit
  white from a dark section.

## Accent semantics

### Coral
Use for:
- upcoming/new labels
- event highlights
- selective energetic details

Do not make Coral the default CTA color.

### Sage
Use for:
- devotionals
- Bible study
- testimonies
- reflective resources
- calm section backgrounds

Do not use Sage for destructive/status messaging.

## Typography direction

Use a modern editorial sans-serif system:
- strong display headings
- highly readable body copy
- limited font-family count
- responsive scale
- framework-optimized font loading
- no ultra-light body text
- no decorative body fonts

Until a final brand font is approved, prefer a high-quality open sans-serif family with strong Vietnamese coverage.

## Heading style

Major headings may use:
- bold/semibold weight
- tighter tracking
- compact line-height
- strong responsive scale

Avoid generic centered corporate hero treatment.

## Radius

Approved scale:
- small: 6px
- medium: 12px
- large: 20px
- xlarge: 28px (landing-page tiles and hero stage only)

Default card: medium.
Hero/featured media: large where appropriate.
Buttons: modest radius, not pill-shaped by default.

## Shadows

Create hierarchy primarily through:
- spacing
- border
- surface contrast
- typography

Use shadows sparingly.

## Photography direction

Prefer authentic ministry photography:
- worship
- fellowship
- camps
- serving
- missions
- small groups
- prayer
- real people
- real environments

Avoid generic stock-style youth imagery.

## Image treatment

Do not force all imagery into the same card style.

Recommended:
- hero: bold editorial crop
- events: larger energetic imagery
- articles: editorial thumbnail/card
- testimonies: more human portrait/story treatment
- resources: quieter utility-first treatment

## Buttons

Primary:
- background: `primary`
- text: `primary-foreground`

Secondary:
- transparent/surface
- foreground text
- visible border

Accent is not a default button variant.

## Homepage photographic hero

The approved homepage exception to the carousel guidance is a manual,
photo-led gallery. Welcome copy is centred above it (eyebrow, display headline,
one supporting paragraph, one primary action and one text link); the gallery
spans the wide container beneath. Use a stable image stage (4:3 on mobile,
16:9 from `sm`), the `large` radius on mobile and `xlarge` from `sm`, and a
caption row beneath the image: label and caption on the left, controls on the
right. Controls are 44px round targets on `surface`: one dot per photograph
(the selected dot widens and uses `primary`, and is also exposed with
`aria-pressed`) plus previous/next arrows. Slides cross-fade with the slow
duration and emphasized easing. No autoplay, decorative gradients, text over
photographs, or additional carousel dependencies.

## Landing-page layout and motion

Approved for the homepage on 14 November 2026. The direction is a product
landing page: generous whitespace, centred section headings, one idea per
section, large rounded tiles, and motion tied to scrolling. It uses the
approved palette and typeface only.

Layout:
- Section headings are centred, except two-column sections, where the heading
  stays left and sticks below the header (`lg:sticky`) while its tiles scroll.
- A set of short parallel items (the mission) uses a bento grid: one column on
  mobile, two from `md`, and rows of three from `lg` with a short last row
  widened to fill it (five items read 3 + 2). Each tile has a small muted
  counter, a semibold title and small secondary copy.
- Small `muted` text must sit on white or `background`, not on `surface`,
  where it falls below AA contrast.
- Tiles use `surface` on white sections and white on `surface` sections, the
  `large` radius on mobile and `xlarge` (28px) from `sm`, no border and no
  shadow; white tiles may carry a `border/60` hairline. `xlarge` is reserved for landing-page tiles and the hero stage.
- The site header is sticky and translucent (`background` at 85% with a
  backdrop blur). This is the only approved use of a blurred surface.

Vision statement (`VisionStatement`, homepage introduction): the sentence is
set at display size, centred, with a pill eyebrow. Words go from 18% opacity
to full in reading order as the block scrolls towards mid-screen
(`statement-word`); an optional phrase then gets a flat `accent` stroke at 45%
under its lower third (`statement-mark`), and the description and link rise in
last (`statement-after`). Screen readers get one plain sentence. Use it once
per page, for one sentence.

Motion tokens: `--motion-slow` (700ms) and `--motion-ease-emphasized`, exposed
as `duration-slow` and `ease-emphasized`. Utilities in `globals.css`:

| Utility | Effect | Use |
| --- | --- | --- |
| `motion-enter` | Rise and fade once on load, staggered with `--motion-step` | Hero copy only |
| `motion-reveal` | Rise, fade and settle as the element scrolls into view | Section headings, tiles, cards |
| `motion-settle` | Scale from 90% to full size while scrolling into view | Hero image stage |
| `motion-recede` | Fade and lift slightly while scrolling out of view | Hero copy |

Rules:
- CSS only: no animation library and no scroll listeners. Scroll-linked
  utilities use view timelines and apply only where the browser supports them;
  elsewhere the content is simply visible.
- Every utility is disabled under `prefers-reduced-motion: reduce`. Content
  must be complete and readable with motion off and with JavaScript off.
- Animate `opacity` and `transform` only. Do not animate layout properties.
- Do not put `motion-reveal` and a hover transform on the same element; wrap
  the hover target instead.
- Do not fade in the hero image: it is the likely LCP element.
- Tiles may lift 4px on hover. Nothing loops, bounces, or plays automatically.

## Dark mode

Dark mode is not in V1 scope.

Token architecture may remain future-compatible, but Codex must not introduce a dark-mode toggle unless explicitly requested.

## Accessibility color rules

- Meet WCAG 2.2 AA contrast.
- Never communicate state by color alone.
- Check hover/focus/disabled states.
- Verify every text/background pairing rather than assuming brand colors are safe.

## Codex visual contract

Codex MUST NOT:
- invent new brand colors;
- use arbitrary Tailwind palette colors for visible brand UI;
- add gradients by default;
- add glassmorphism by default;
- make every card rounded and shadowed;
- add decorative motion without purpose;
- redesign information architecture;
- alter approved color semantics.

Any intentional deviation requires an explicit design-system update.
