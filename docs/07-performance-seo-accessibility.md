# Performance, SEO, and Accessibility

These are product requirements, not post-launch cleanup tasks.

## Performance budgets

Target representative mobile experience:
- LCP: <= 2.5 s
- INP: <= 200 ms
- CLS: <= 0.1

Additional engineering budgets:
- minimize JavaScript shipped to anonymous content visitors;
- avoid client-side fetching for content that can be rendered on the server;
- optimize all significant images;
- lazy-load below-the-fold media;
- avoid render-blocking third-party scripts;
- load heavy embeds on demand when practical.

Treat the budgets as regression guards. Measure rather than claim.

## Performance checklist

For every new page/feature:
- Is it a Server Component by default?
- Is client JavaScript necessary?
- Is the LCP element optimized?
- Are image width/height/aspect ratio stable?
- Is `sizes` correct for responsive images?
- Is third-party code deferred or avoided?
- Does the feature create N+1 CMS requests?
- Can requests be parallelized safely?
- Does caching match content freshness?

## SEO requirements

Every indexable content page:
- unique title
- meta description
- canonical URL policy
- Open Graph metadata
- share image policy
- crawlable semantic content
- meaningful heading structure

Platform:
- sitemap
- robots
- clean URLs
- redirect strategy
- not-found behavior
- structured data when it truthfully describes the page

Recommended structured data:
- Organization where appropriate
- Article for articles/stories
- Event for events
- VideoObject only when data is sufficient and accurate

Never emit fabricated structured-data fields.

## Accessibility target

Target WCAG 2.2 AA.

Minimum:
- semantic landmarks
- one clear page heading
- keyboard-accessible navigation and controls
- visible focus states
- accessible mobile menu
- sufficient contrast
- form labels and error association
- meaningful alt text
- no information conveyed by color alone
- reduced-motion support
- touch targets suitable for mobile

## Automated checks are not enough

Automated a11y tests should be supplemented with:
- keyboard walkthrough,
- screen-reader spot checks on critical flows,
- zoom/reflow check,
- mobile interaction review.
