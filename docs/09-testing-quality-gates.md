# Testing and Quality Gates

## Testing pyramid

### Unit tests
Use for:
- mappers
- validators
- date/status logic
- formatting/utilities
- business rules

### Component tests
Use for behavior that benefits from DOM-level testing:
- navigation
- cards with conditional fields
- search/filter controls
- form behavior
- empty/error states

### End-to-end tests
Keep a small, high-value suite:
- homepage loads and main navigation works
- article listing -> article detail
- event listing -> event detail
- sermon listing -> sermon detail
- join/contact path
- search returns/navigates to result
- 404 behavior

## Quality gates on pull requests

Required:
- install from lockfile
- lint
- TypeScript typecheck
- tests
- production build
- focused E2E where practical

Recommended:
- accessibility smoke checks
- bundle/performance regression visibility
- dependency/security scan

## Test data

- Use deterministic fixtures/factories.
- Do not rely on production CMS.
- Do not embed real personal/sensitive information.
- Include malformed/missing optional CMS data cases.

## Regression rule

Every material bug fix should add a regression test when practical.

## Review rule

A test that only mirrors implementation details is low value.
Test public behavior, domain rules, and contracts.
