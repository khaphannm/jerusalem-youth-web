# Visual Consistency Review Prompt

Review `[PAGE/FEATURE]` for visual consistency.

Read:
- `docs/04-design-system.md`
- `docs/13-visual-consistency-checklist.md`
- `docs/14-design-token-implementation.md`
- shared design tokens/components
- current implementation at mobile and desktop widths

Do not redesign the product.

Evaluate:
1. approved color-token usage
2. typography hierarchy
3. spacing and section rhythm
4. CTA hierarchy
5. component consistency
6. photography/image treatment
7. radius/shadow discipline
8. responsive composition
9. accessibility/contrast
10. unnecessary animation/decorative effects

Flag:
- arbitrary raw colors
- arbitrary Tailwind palette colors
- generic SaaS/template appearance
- event-poster over-styling
- too many competing accents
- repeated rounded/shadowed cards without reason

For each finding:
- severity
- location
- visual/design reason
- smallest recommended change

If the page is already consistent, say so instead of proposing cosmetic churn.
