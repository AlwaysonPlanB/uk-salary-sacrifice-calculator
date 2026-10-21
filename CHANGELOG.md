# UKTaxCal changelog

Every change since the live backup `live-backup-2026-10-21` (commit d844f8a). IDs refer to `docs/2026-10-21-govuk-accuracy-audit.md`. Checks: `node tests/audit-checks.mjs`.

To undo everything, see `docs/REVERT-live-backup-2026-10-21.md`.

## Phase 1 (branch `fix/2026-10-govuk-accuracy`)

| ID | File | Change | Before | After (GOV.UK) |
|:-|:-|:-|:-|:-|
| L1 | js/tax-engine.js | 45% (Scotland 48%) now starts above £125,140 of income after allowances, not £112,570 | £120,000 salary: £39,675 income tax. £150,000: £54,331.50. Scotland £200,000: £84,011.45 | £39,432. £53,703. £83,634.35 |
| L2 | js/tax-engine.js | Scottish marginal rate in the £100,000 to £125,140 taper zone is 67.5% (45% advanced rate plus lost allowance), not 63% | Scottish £110,000: marginal 63%; EV salary sacrifice BIK tax on £40,000 P11D £1,008 | 67.5%; £1,080 |
| L4 | js/tax-engine.js | Unused Personal Allowance now covers dividends | Dividends £30,000, no other income: £3,171.25. Salary £5,000 + dividends £40,000: £4,696.25 | £1,819.98. £3,432.48 |
| L5 | js/tax-engine.js, profiles/director.html, profiles/outside-ir35.html | Basic band fixed at £37,700 after allowances for dividends; salary income tax now tapers the allowance on salary plus dividends (new optional 3rd argument to calcIncomeTax) | Salary £12,570 + dividends £120,000: income tax £0, dividend tax £33,545.74. Dividends £150,000: £41,755.72 | £2,514 and £36,831.24 (audit £36,831.23; engine rounds per band). £45,041.21 |
| L6 | js/tax-engine.js | The £500 dividend allowance is taxed at 0% but uses up band space | Salary £12,570 + dividends £50,000: £8,271.25 | £8,396.25 |
| L3, F16 | js/tax-engine.js, profiles/self-employed.html | Class 2 NI no longer charged (GOV.UK: treated as paid at profits of £7,105 or more; voluntary below). Result row kept, showing £0 "treated as paid", so titles and meta descriptions stay true and unchanged. Two explanatory notes corrected | Profit £40,000: Class 2 £189.80, total NI £1,835.60 | Class 2 £0, total NI £1,645.80 |
