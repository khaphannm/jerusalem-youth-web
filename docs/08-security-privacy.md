# Security and Privacy

## Security principles

- Least privilege
- Server-side secrets
- Minimal data collection
- Safe defaults
- Dependency hygiene
- Defense in depth

## CMS

- Admin panel is not treated as a public API.
- Use role-based permissions.
- Public/anonymous API can read only published fields/content required by the site.
- Write operations are never exposed to anonymous visitors unless an approved feature requires them.
- Use strong admin authentication and MFA where the platform supports it.
- Keep CMS and plugins patched.
- Restrict upload types and sizes.
- Back up database and media according to operations policy.

## Tokens/secrets

Never:
- commit secrets,
- expose CMS admin/API write tokens in browser code,
- log tokens,
- place secrets in public environment variables.

Use separate credentials per environment.

## Webhooks

CMS revalidation webhook must:
- use a secret/signature;
- reject invalid requests;
- validate payloads;
- not become an arbitrary URL/revalidation endpoint.

## Browser security

Review and configure:
- HTTPS only
- security headers
- Content Security Policy appropriate to actual third parties
- frame policy
- referrer policy
- permissions policy as applicable

Do not paste a generic CSP that breaks legitimate embeds; derive it from the site's actual external dependencies.

## User input

V1 should prefer trusted external forms if forms are needed.
If native forms are introduced:
- validate server-side;
- rate-limit;
- protect against spam/abuse;
- escape/sanitize based on output context;
- do not store sensitive information without explicit product/privacy review.

## Privacy

Collect only analytics/data needed for the stated product purpose.
Do not publish:
- private contact details,
- sensitive testimonies,
- minors' personal data,
- private prayer/counseling information

without appropriate consent and governance.

## Dependency/security review

CI should include dependency/security visibility.
Critical/high vulnerabilities affecting reachable production code must be resolved or explicitly risk-accepted before release.
