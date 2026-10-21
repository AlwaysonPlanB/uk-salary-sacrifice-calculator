// Regression checks for the 21 Oct 2026 GOV.UK accuracy audit
// (docs/2026-10-21-govuk-accuracy-audit.md). Run: node tests/audit-checks.mjs
// Each check is tagged with its audit ID. Expected values are GOV.UK results.

import {
  calcIncomeTax,
  calcDividendTax,
  calcSelfEmployedNI,
  calcTaperedAA,
} from '../js/tax-engine.js';
import { getWarnings } from '../js/warnings.js';
import { calcSalarySacrifice, calcBiKTax } from '../js/salary-sacrifice.js';

const hasWarning = (w, id) => (w.some((x) => x.id === id) ? 1 : 0);

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

// L3: Class 2 is not payable at profits of £7,105 or more
check('L3', 'Self-employed NI on £40,000 profit: Class 2', calcSelfEmployedNI(40000).class2, 0);
check('L3', 'Self-employed NI on £40,000 profit: total', calcSelfEmployedNI(40000).total, 1645.80);

// L7: annual allowance taper needs threshold income over £200,000 AND adjusted income over £260,000
check('L7', 'AA, threshold £240,000, adjusted £285,000', calcTaperedAA(240000, 285000), 47500);
check('L7', 'AA, threshold £250,000, adjusted £250,000', calcTaperedAA(250000, 250000), 60000);
check('L7', 'AA, threshold £190,000, adjusted £300,000', calcTaperedAA(190000, 300000), 60000);
check('L7', 'AA, threshold and adjusted £400,000 (minimum)', calcTaperedAA(400000, 400000), 10000);
check('L7', 'Employed £240,000, employer pension £45,000: AA warning shown (1 = yes)', hasWarning(getWarnings({
  profile: 'employed', grossSalary: 240000, adjustedNetIncome: 240000, totalPensionContributions: 45000,
  employerPension: 45000, pensionThresholdIncome: 240000, pensionAdjustedIncome: 285000,
}), 'pension-aa'), 0);
check('L7', 'Salary sacrifice module AA, £240,000 salary, £45,000 employer', calcSalarySacrifice({ grossSalary: 240000, employerPension: 45000 }).pensionCheck.annualAllowance, 47500);

// L9: company car percentages 2026/27 (GOV.UK HMRC 480 appendix 2)
const bikPct = (co2, fuelType, electricRange = 0) => Math.round(calcBiKTax({ p11dValue: 10000, co2, fuelType, electricRange }, 0).bikRate * 100);
check('L9', 'Petrol 120 g/km', bikPct(120, 'petrol'), 30);
check('L9', 'Petrol 120 g/km, P11D £30,000, 40% taxpayer: tax', calcBiKTax({ p11dValue: 30000, co2: 120, fuelType: 'petrol', electricRange: 0 }, 0.4).bikTax, 3600);
check('L9', 'Hybrid 40 g/km, 75 mile range', bikPct(40, 'hybrid', 75), 7);
check('L9', 'Hybrid 40 g/km, 50 mile range', bikPct(40, 'hybrid', 50), 10);
check('L9', 'Hybrid 40 g/km, 130 mile range', bikPct(40, 'hybrid', 130), 4);
check('L9', 'Petrol-labelled car at 45 g/km, 20 mile range', bikPct(45, 'petrol', 20), 16);
check('L9', 'Petrol 54 g/km', bikPct(54, 'petrol'), 17);
check('L9', 'Petrol 55 g/km', bikPct(55, 'petrol'), 18);
check('L9', 'Petrol 77 g/km', bikPct(77, 'petrol'), 21);
check('L9', 'Petrol 154 g/km', bikPct(154, 'petrol'), 36);
check('L9', 'Petrol 155 g/km', bikPct(155, 'petrol'), 37);
check('L9', 'Electric', bikPct(0, 'electric'), 4);
check('U1', 'Diesel 120 g/km keeps existing 4% supplement (unverified, unchanged)', bikPct(120, 'diesel'), 34);

// L12: MTD warning uses qualifying income (turnover), not profit plus other income
const mtd = (q) => hasWarning(getWarnings({ profile: 'self-employed', grossSalary: 0, adjustedNetIncome: 0, qualifyingIncome: q }), 'mtd');
check('L12', 'Turnover £60,000, expenses £20,000: MTD warning (1 = yes)', mtd(60000), 1);
check('L12', 'Profit £30,000 + £25,000 employment, turnover £30,000: MTD warning still shown for 2027/28 rule', mtd(30000), 1);
check('L12', 'Turnover £15,000: no MTD warning', mtd(15000), 0);

// L16: the PA taper and Tax-Free Childcare apply over £100,000, not at exactly £100,000
const pa = (ani) => hasWarning(getWarnings({ profile: 'employed', grossSalary: ani, adjustedNetIncome: ani, hasChildcare: true }), 'pa-taper');
const cc = (ani) => hasWarning(getWarnings({ profile: 'employed', grossSalary: ani, adjustedNetIncome: ani, hasChildcare: true }), 'childcare-trap');
check('L16', 'ANI exactly £100,000: £100k trap warning (1 = yes)', pa(100000), 0);
check('L16', 'ANI £100,001: £100k trap warning', pa(100001), 1);
check('L16', 'ANI exactly £100,000: childcare lost warning', cc(100000), 0);
check('L16', 'ANI £100,001: childcare lost warning', cc(100001), 1);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
