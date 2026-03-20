/**
 * Salary Sacrifice & Benefit-in-Kind Calculator
 * Compares take-home pay with and without salary sacrifice arrangements.
 */

import { calcIncomeTax, calcEmployeeNI, RATES } from './tax-engine.js';
import { calcCombinedStudentLoans } from './student-loans.js';

/* ------------------------------------------------------------------ */
/*  Helper                                                            */
/* ------------------------------------------------------------------ */

function round2(x) {
  return Math.round(x * 100) / 100;
}

/* ------------------------------------------------------------------ */
/*  Pension Annual Allowance                                          */
/* ------------------------------------------------------------------ */

/**
 * Pension annual allowance: £60k, reduces £1 per £2 above £200k, min £10k.
 * Mirrors calcTaperedAA from tax-engine.
 */
function calcPensionAllowance(adjustedIncome) {
  if (adjustedIncome <= RATES.pension.taperedAAThreshold) {
    return RATES.pension.annualAllowance;
  }

  const reduction = Math.floor(
    (adjustedIncome - RATES.pension.taperedAAThreshold) / 2
  );

  return Math.max(
    RATES.pension.minimumTaperedAA,
    RATES.pension.annualAllowance - reduction
  );
}

/* ------------------------------------------------------------------ */
/*  Benefit-in-Kind Tax                                               */
/* ------------------------------------------------------------------ */

/**
 * Calculate BIK tax on a company car or other P11D benefit.
 *
 * @param {{ p11dValue: number, co2: number, fuelType: string, electricRange: number }} details
 * @param {number} marginalRate - Employee's marginal tax rate (decimal)
 * @returns {{ p11dValue, co2, fuelType, electricRange, bikRate, annualBiKValue, bikTax, monthlyBiKTax }}
 */
export function calcBiKTax(details, marginalRate) {
  const { p11dValue, co2, fuelType, electricRange } = details;
  let bikRate;

  if (fuelType === 'electric' || co2 === 0) {
    // Zero-emission: flat electric rate
    bikRate = RATES.bik.electric;
  } else if (fuelType === 'hybrid' && co2 <= 50) {
    // Plugin hybrid with CO2 <= 50: lookup by electric range
    const ranges = RATES.bik.pluginHybrid[0].ranges;
    const match = ranges.find((r) => electricRange >= r.minRange);
    bikRate = match ? match.rate : ranges[ranges.length - 1].rate;
  } else {
    // Petrol or diesel: lookup by CO2 emissions
    const band = RATES.bik.petrol.find((b) => co2 <= b.maxCO2);
    bikRate = band ? band.rate : RATES.bik.petrol[RATES.bik.petrol.length - 1].rate;

    // Diesel supplement, capped at maximum BIK rate
    if (fuelType === 'diesel') {
      bikRate = Math.min(bikRate + RATES.bik.dieselSupplement, RATES.bik.maxBikRate);
    }
  }

  const annualBiKValue = Math.round(p11dValue * bikRate);
  const bikTax = round2(annualBiKValue * marginalRate);
  const monthlyBiKTax = round2(bikTax / 12);

  return {
    p11dValue,
    co2,
    fuelType,
    electricRange,
    bikRate,
    annualBiKValue,
    bikTax,
    monthlyBiKTax,
  };
}

/* ------------------------------------------------------------------ */
/*  Salary Sacrifice Comparison                                       */
/* ------------------------------------------------------------------ */

/**
 * Compare take-home pay with salary sacrifice (Scenario A) vs without (Scenario B).
 *
 * @param {object} input
 * @param {number}   input.grossSalary
 * @param {number}   [input.personalPension=0]
 * @param {number}   [input.employerPension=0]
 * @param {number}   [input.cycleToWork=0]
 * @param {number}   [input.additionalPension=0]
 * @param {number}   [input.evLease=0]
 * @param {number}   [input.otherSacrifice=0]
 * @param {string[]} [input.studentLoanPlans=[]]
 * @param {boolean}  [input.isScottish=false]
 * @param {object}   [input.bikDetails=null]
 * @returns {object} { scenarioA, scenarioB, comparison, pensionCheck }
 */
export function calcSalarySacrifice(input) {
  const {
    grossSalary,
    personalPension = 0,
    employerPension = 0,
    cycleToWork = 0,
    additionalPension = 0,
    evLease = 0,
    otherSacrifice = 0,
    studentLoanPlans = [],
    isScottish = false,
    bikDetails = null,
  } = input;

  const totalSacrifice =
    personalPension + cycleToWork + additionalPension + evLease + otherSacrifice;

  /* ---- Scenario A: WITH salary sacrifice ---- */

  const reducedGross = grossSalary - totalSacrifice;

  const taxA = calcIncomeTax(reducedGross, isScottish);
  const niA = calcEmployeeNI(reducedGross);
  const studentLoanA = calcCombinedStudentLoans(grossSalary, studentLoanPlans);

  let bikTaxA = 0;
  let bikInfo = null;
  if (bikDetails?.p11dValue > 0) {
    bikInfo = calcBiKTax(bikDetails, taxA.marginalRate);
    bikTaxA = bikInfo.bikTax;
  }

  const takeHomeA = round2(
    reducedGross - taxA.tax - niA - studentLoanA.total - bikTaxA
  );

  /* ---- Scenario B: WITHOUT salary sacrifice ---- */

  const taxB = calcIncomeTax(grossSalary, isScottish);
  const niB = calcEmployeeNI(grossSalary);
  const studentLoanB = calcCombinedStudentLoans(grossSalary, studentLoanPlans);

  const postTaxDeductions =
    personalPension + additionalPension + cycleToWork + evLease + otherSacrifice;

  const takeHomeB = round2(
    grossSalary - taxB.tax - niB - studentLoanB.total - postTaxDeductions
  );

  /* ---- Comparison ---- */

  const annualBenefit = round2(takeHomeA - takeHomeB);
  const monthlyBenefit = round2(annualBenefit / 12);
  const taxSaving = round2(taxB.tax - taxA.tax);
  const niSaving = round2(niB - niA);

  /* ---- Pension Check ---- */

  const totalContributions = personalPension + employerPension + additionalPension;
  const annualAllowance = calcPensionAllowance(grossSalary);
  const exceeded = totalContributions > annualAllowance;

  /* ---- Return ---- */

  return {
    scenarioA: {
      grossSalary,
      totalSacrifice,
      reducedGross,
      personalAllowance: taxA.personalAllowance,
      incomeTax: taxA.tax,
      taxBreakdown: taxA.breakdown,
      nationalInsurance: niA,
      studentLoan: studentLoanA,
      bikTax: bikTaxA,
      bikInfo,
      takeHome: takeHomeA,
      takeHomeMonthly: round2(takeHomeA / 12),
      marginalRate: taxA.marginalRate,
      effectiveRate: taxA.effectiveRate,
    },
    scenarioB: {
      grossSalary,
      incomeTax: taxB.tax,
      taxBreakdown: taxB.breakdown,
      nationalInsurance: niB,
      studentLoan: studentLoanB,
      postTaxDeductions,
      takeHome: takeHomeB,
      takeHomeMonthly: round2(takeHomeB / 12),
      marginalRate: taxB.marginalRate,
      effectiveRate: taxB.effectiveRate,
    },
    comparison: {
      annualBenefit,
      monthlyBenefit,
      taxSaving,
      niSaving,
    },
    pensionCheck: {
      totalContributions,
      annualAllowance,
      exceeded,
    },
  };
}
