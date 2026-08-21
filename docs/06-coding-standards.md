# Coding Standards

## TypeScript

- `strict` mode.
- Avoid `any`; if unavoidable, isolate and explain it.
- Prefer domain-specific types over broad dictionaries.
- Validate external data at runtime.
- Prefer discriminated unions for meaningful state variants.
- Do not use non-null assertions to hide data-contract problems.

## React / Next.js

- Prefer Server Components.
- Keep Client Components small and leaf-like.
- Keep data fetching out of presentational UI.
- Use framework routing/navigation APIs.
- Use framework image/font/metadata capabilities.
- Do not duplicate server and client sources of truth unnecessarily.

## Components

A component should have a clear responsibility.
Prefer:
- explicit props,
- composition,
- semantic HTML.

Avoid:
- giant "page components" containing unrelated concerns,
- prop booleans that create many hidden modes,
- premature abstraction,
- wrappers with no semantic or reuse value.

## Data access

All CMS requests go through the CMS layer.
Do not call Strapi directly from arbitrary components.

Required at boundary:
- timeout/error handling where supported,
- response validation,
- mapping to domain model,
- normalized errors,
- logging without secrets.

## Naming

- Components: PascalCase
- Functions/variables: camelCase
- Constants: camelCase or UPPER_SNAKE_CASE only when truly constant/config-like
- Files: follow the established project convention consistently
- Routes/slugs: lowercase kebab-case

Use domain language: `Event`, `Sermon`, `Article`, not generic names such as `ItemData`.

## Imports

- Prefer stable aliases for application imports.
- Avoid deep fragile relative paths.
- Prevent circular feature dependencies.

## Styling

- Use approved tokens/utilities.
- Avoid arbitrary values when a token exists.
- Avoid duplicated large utility strings; extract only when reuse/clarity warrants.
- Responsive behavior starts from mobile.

## Comments

Explain why, not what.
Do not narrate obvious code.
Document non-obvious business rules and compatibility constraints.

## Error handling

- Do not swallow errors.
- Do not leak internal errors to users.
- Preserve useful context for logs/monitoring.
- Distinguish expected not-found/empty states from system failures.

## Dependencies

Before adding a package, answer:
1. Can the platform/framework solve this?
2. Is there an existing dependency?
3. Is the maintenance/security cost justified?
4. Does it materially increase client bundle size?

If no, do not add it.
