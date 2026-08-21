# EPIC-10 — Quality and Launch

## QLT-001 Accessibility pass
Acceptance criteria:
- automated scan on critical pages
- keyboard walkthrough
- mobile navigation validated
- focus/contrast/form issues resolved
- no critical WCAG 2.2 AA blockers

## QLT-002 Performance pass
Acceptance criteria:
- representative production/preview pages measured
- LCP/INP/CLS targets reviewed
- largest regressions fixed
- image and third-party script audit
- client bundle hotspots reviewed

## QLT-003 Security/privacy pass
Acceptance criteria:
- secrets and public env reviewed
- CMS permissions reviewed
- security headers reviewed
- dependency findings reviewed
- privacy/content consent checklist completed

## QLT-004 Content readiness
Acceptance criteria:
- launch seed content present
- dates/contact/social links verified
- no placeholder/lorem ipsum
- images approved and alt text reviewed
- broken links fixed

## QLT-005 Production launch
Acceptance criteria:
- domain/DNS/HTTPS
- production CMS/database/storage
- backups verified
- analytics/error monitoring working
- sitemap/robots/metadata verified
- rollback path documented
- smoke E2E passes against production
