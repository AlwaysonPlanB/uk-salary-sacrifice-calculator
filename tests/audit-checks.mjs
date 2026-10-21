// Regression checks for the 21 Oct 2026 GOV.UK accuracy audit
// (docs/2026-10-21-govuk-accuracy-audit.md). Run: node tests/audit-checks.mjs
// Each check is tagged with its audit ID. Expected values are GOV.UK results.

import {
  calcIncomeTax,
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

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
