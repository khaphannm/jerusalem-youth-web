# Information Architecture

## Canonical routes

```text
/
├── /about
├── /events
│   └── /events/[slug]
├── /articles
│   ├── /articles/[slug]
│   └── /articles/category/[slug]
├── /sermons
│   └── /sermons/[slug]
├── /stories
│   └── /stories/[slug]
├── /media
├── /resources
│   └── /resources/[slug]
├── /join
├── /contact
└── /search
```

Route names are product contracts. Do not rename casually.

## Primary navigation

Recommended initial top-level navigation:
- About
- Events
- Articles
- Sermons
- Stories
- Resources
- Join Us

Contact may live in the utility/footer navigation if the header becomes crowded.

## Home information hierarchy

1. Hero: concise identity + primary action
2. Next gathering / featured event
3. Upcoming events
4. Latest article/devotional
5. Latest sermon
6. Stories/testimonies
7. Join/community call-to-action
8. Social/media preview
9. Footer

## Navigation principles

- A first-time visitor should not need ministry-specific knowledge to understand labels.
- Avoid overloaded menus.
- Every content detail page should provide a logical next action.
- Do not create dead-end pages.
- Preserve breadcrumbs where they materially improve orientation.
- Footer must contain key contact, social, legal, and navigation links.

## URL principles

- Human-readable slugs
- Stable after publication whenever possible
- Lowercase, hyphen-separated
- Avoid IDs in public URLs
- Redirect old URLs when canonical slugs change
