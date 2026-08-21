# Security and Privacy Review Prompt

Review `[SCOPE]` using `docs/08-security-privacy.md`.

Focus on:
- secrets exposure
- CMS permissions/tokens
- server/client boundary
- webhook authentication
- input validation
- unsafe rich content
- security headers
- external embeds/links
- dependency risk
- sensitive/personal information exposure

Do not claim a vulnerability without a concrete attack path or unsafe condition.
Do not output secret values.

For findings provide severity, evidence, impact, and smallest safe mitigation.
