# ADR-003 — Snapshot publication for the free-first launch

Status: Accepted direction; implementation pending.
Date: 31 October 2026.

## Context

The ministry expects low traffic and infrequent editing, with free service
allowances initially and upgrades later. A sleeping CMS should not be a visitor
dependency: the existing eight-second timeout is shorter than Render Free wake-up.

## Decision

Capture a complete validated snapshot of approved public content during an
operator-triggered release. Bundle it with the Next.js deployment and use a
snapshot adapter behind the typed CMS boundary. Keep live-CMS development and
the always-on deployment alternative. Retain Next.js server capabilities for
search/pagination and current-time event behavior; no static-export redesign.

Start with Netlify Free, on-demand Render Strapi, Neon Free PostgreSQL and R2
Standard via a read-only Workers Free handler. This follows
[ADR-002](ADR-002-s3-media-storage.md): S3-compatible uploads and separate public
media delivery. The deployment plan records free-tier limits and compromises.

Validate the full candidate before replacing the live deployment; preserve the
old release on capture/build failure. Start with manual editorial batches.
Existing webhook tag expiration does not publish a snapshot.

## Consequences

Visitors can read content while CMS/database compute sleeps. Services can be
upgraded independently. Changes, unpublish and delete reach the public site only
after a successful release. Rollback needs the exact content artifact and
retained media. Old URLs/caches need explicit privacy withdrawal. Editable
database/media backups remain necessary, as do usage/overage controls.

This is not current implemented behavior. Follow the
[execution plan](../exec-plans/free-first-deployment.md) and
[deployment plan](../production-deployment-guide.md) before launch.
