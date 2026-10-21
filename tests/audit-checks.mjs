// Regression checks for the 21 Oct 2026 GOV.UK accuracy audit
// (docs/2026-10-21-govuk-accuracy-audit.md). Run: node tests/audit-checks.mjs
// Each check is tagged with its audit ID. Expected values are GOV.UK results.

import {
  calcIncomeTax,
  calcDividendTax,
} from '../js/tax-engine.js';

let passed = 0;
let failed = 0;

function check(id, label, actual, expected, tolerance = 0.005) {
  const ok = Math.abs(actual - expected) <= tolerance;
  if (ok) passed++; else failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id.padEnd(4)} ${label}: got ${actual}, expected ${expected}`);
}

// L1: 45% (Scotland 48%) starts above £125,140 of income after allowances
check('L1', 'rUK income tax, £50,000', calcIncomeTax(50000).tax, 7486);
check('L1', 'rUK income tax, £115,000', calcIncomeTax(115000).tax, 36432);
check('L1', 'rUK income tax, £120,000', calcIncomeTax(120000).tax, 39432);
check('L1', 'rUK income tax, £150,000', calcIncomeTax(150000).tax, 53703);
check('L1', 'Scottish income tax, £200,000', calcIncomeTax(200000, true).tax, 83634.35);

// L2: Scottish marginal rate in the £100,000 to £125,140 taper zone is 45% x 1.5
check('L2', 'Scottish marginal rate at £110,000', calcIncomeTax(110000, true).marginalRate, 0.675);
check('L2', 'rUK marginal rate at £110,000 (unchanged)', calcIncomeTax(110000).marginalRate, 0.60);

// L4: unused Personal Allowance covers dividends
check('L4', 'Dividends £30,000, no other income', calcDividendTax(30000, 0).tax, 1819.98);
check('L4', 'Salary £5,000 + dividends £40,000', calcDividendTax(40000, 5000).tax, 3432.48);
// L5: basic band fixed at £37,700, PA tapers on salary + dividends
// The engine rounds each band to the penny (existing convention); the audit rounded the total, hence 1p tolerance
check('L5', 'Salary £12,570 + dividends £120,000: dividend tax', calcDividendTax(120000, 12570).tax, 36831.23, 0.011);
check('L5', 'Salary £12,570 + dividends £120,000: salary income tax', calcIncomeTax(12570, false, 12570 + 120000).tax, 2514);
check('L5', 'Dividends £150,000, no other income', calcDividendTax(150000, 0).tax, 45041.21);
// L6: the £500 allowance uses up band space
check('L6', 'Salary £12,570 + dividends £50,000', calcDividendTax(50000, 12570).tax, 8396.25);
// Verified OK rows in the audit (must not change)
check('OK', 'Salary £12,570 + dividends £30,000', calcDividendTax(30000, 12570).tax, 3171.25);
check('OK', 'Dividends within allowance', calcDividendTax(500, 12570).tax, 0);
check('OK', 'Salary income tax, no dividends, default PA', calcIncomeTax(12570).tax, 0);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
