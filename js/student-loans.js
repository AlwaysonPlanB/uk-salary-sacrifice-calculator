/**
 * Student Loan Repayment Calculator
 * Calculates repayments for UK student loan plans using post-sacrifice gross salary.
 */

import { RATES } from './tax-engine.js';

/* ------------------------------------------------------------------ */
/*  Helper                                                            */
/* ------------------------------------------------------------------ */

function round2(x) {
  return Math.round(x * 100) / 100;
}

/* ------------------------------------------------------------------ */
/*  Single Plan Calculation                                           */
/* ------------------------------------------------------------------ */

/**
 * Calculate student loan repayment for a single plan.
 * @param {number} grossSalary - Annual gross salary (post salary-sacrifice if applicable)
 * @param {string} planType - 'plan1','plan2','plan4','plan5','postgraduate', or 'none'
 * @returns {number} Annual repayment rounded to 2dp, or 0 if none/below threshold
 */
export function calcStudentLoan(grossSalary, planType) {
  if (planType === 'none' || !planType) {
    return 0;
  }

  const plan = RATES.studentLoan[planType];
  if (!plan) {
    return 0;
  }

  if (grossSalary <= plan.threshold) {
    return 0;
  }

  return round2((grossSalary - plan.threshold) * plan.rate);
}

/* ------------------------------------------------------------------ */
/*  Combined Plans Calculation                                        */
/* ------------------------------------------------------------------ */

/**
 * Calculate student loan repayments across multiple plans.
 *
 * @param {number} grossSalary - Annual gross salary (post salary-sacrifice if applicable)
 * @param {string[]} plans - Array of planType strings
 * @returns {{ total: number, monthly: number, breakdown: Array<{ plan: string, threshold: number, rate: number, annual: number, monthly: number }> }}
 */
export function calcCombinedStudentLoans(grossSalary, plans) {
  const breakdown = [];
  let total = 0;

  for (const planType of plans) {
    if (planType === 'none' || !planType) {
      continue;
    }

    const plan = RATES.studentLoan[planType];
    if (!plan) {
      continue;
    }

    const annual = calcStudentLoan(grossSalary, planType);

    breakdown.push({
      plan: planType,
      threshold: plan.threshold,
      rate: plan.rate,
      annual,
      monthly: round2(annual / 12),
    });

    total += annual;
  }

  total = round2(total);

  return {
    total,
    monthly: round2(total / 12),
    breakdown,
  };
}

/* ------------------------------------------------------------------ */
/*  Plan Metadata for UI                                              */
/* ------------------------------------------------------------------ */

/**
 * Returns array of student loan plan options for UI dropdowns.
 *
 * @returns {Array<{ value: string, label: string, threshold?: number }>}
 */
export function getStudentLoanPlans() {
  return [
    { value: 'none', label: 'None' },
    { value: 'plan1', label: 'Plan 1 (pre-2012 England/Wales, or NI)', threshold: RATES.studentLoan.plan1.threshold },
    { value: 'plan2', label: 'Plan 2 (post-2012 England/Wales)', threshold: RATES.studentLoan.plan2.threshold },
    { value: 'plan4', label: 'Plan 4 (Scotland)', threshold: RATES.studentLoan.plan4.threshold },
    { value: 'plan5', label: 'Plan 5 (post-2023 England)', threshold: RATES.studentLoan.plan5.threshold },
    { value: 'postgraduate', label: 'Postgraduate Loan', threshold: RATES.studentLoan.postgraduate.threshold },
  ];
}
