# ADR-001 — Platform Baseline

Status: Accepted baseline, subject to product-owner/engineering-owner approval before implementation.

## Context

V1 needs a public content-heavy website, strong SEO/performance, a friendly editorial CMS, and an architecture that remains maintainable as content and traffic grow.

## Decision

Use:
- Next.js App Router + TypeScript strict for frontend
- Strapi 5 for headless CMS
- PostgreSQL for CMS persistence
- object storage/media CDN for assets
- server-side typed CMS adapter between Strapi and UI
- CDN/cached rendering for public content
- GitHub-based CI/CD

Use current stable package versions at initialization rather than encoding versions in this ADR.

## Why

- Good fit for server-rendered/cached public content.
- Rich CMS experience without building administration from scratch.
- PostgreSQL is mature and portable.
- Vendor coupling is constrained to the CMS adapter.
- Independent frontend/CMS scaling.
- Clear path to richer workflows later.

## Consequences

Positive:
- content team can work independently;
- frontend remains optimized for visitors;
- future CMS replacement is feasible.

Tradeoffs:
- two deployable applications/services;
- CMS upgrades/backups need operational ownership;
- preview/revalidation integration requires care.

## Rejected for V1

- Building a custom CMS: too much non-differentiating work.
- Microservices: unnecessary operational complexity.
- Hosting large video files ourselves: poor cost/performance tradeoff.
