# UKTaxCal changelog

Every change since the live backup `live-backup-2026-10-21` (commit d844f8a). IDs refer to `docs/2026-10-21-govuk-accuracy-audit.md`. Checks: `node tests/audit-checks.mjs`.

To undo everything, see `docs/REVERT-live-backup-2026-10-21.md`.

## Phase 1 (branch `fix/2026-10-govuk-accuracy`)

| ID | File | Change | Before | After (GOV.UK) |
|:-|:-|:-|:-|:-|
| L1 | js/tax-engine.js | 45% (Scotland 48%) now starts above £125,140 of income after allowances, not £112,570 | £120,000 salary: £39,675 income tax. £150,000: £54,331.50. Scotland £200,000: £84,011.45 | £39,432. £53,703. £83,634.35 |
