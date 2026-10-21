import { RATES, calcPersonalAllowance, calcTaperedAA } from './tax-engine.js';

const fmt = (n) => '\u00A3' + Math.round(n).toLocaleString('en-GB');

/**
 * Returns an array of warning objects relevant to the current profile.
 */
export function getWarnings(input) {
  const {
    profile,
    grossSalary,
    adjustedNetIncome,
    totalPensionContributions,
    employerPension,
    pensionThresholdIncome = adjustedNetIncome,
    pensionAdjustedIncome = adjustedNetIncome,
    dividendIncome = 0,
    rentalIncome = 0,
    qualifyingIncome = 0,
    hasChildcare,
    isScottish,
  } = input;

  const warnings = [];

  /* ------------------------------------------------------------------ */
  /*  1. PA Taper — £100k tax trap                                      */
  /* ------------------------------------------------------------------ */
  const paTaperProfiles = ['employed', 'self-employed', 'outside-ir35', 'inside-ir35', 'director', 'landlord'];

  if (adjustedNetIncome > 100000) {
    const paLoss = RATES.personalAllowance - calcPersonalAllowance(adjustedNetIncome);
    const pensionNeeded = adjustedNetIncome - 100000;
    warnings.push({
      id: 'pa-taper',
      severity: 'red',
      title: '\u00A3100k Tax Trap \u2014 Effective 60% Marginal Rate',
      message:
        `Your adjusted net income of ${fmt(adjustedNetIncome)} exceeds \u00A3100,000, ` +
        `reducing your Personal Allowance by ${fmt(paLoss)}. ` +
        `This creates an effective 60% marginal tax rate in the \u00A3100k\u2013\u00A3125,140 band. ` +
        `A pension contribution of ${fmt(pensionNeeded)} would bring you below the threshold.`,
      profiles: paTaperProfiles,
    });
  } else if (adjustedNetIncome >= 95000 && adjustedNetIncome <= 100000) {
    warnings.push({
      id: 'pa-taper-approaching',
      severity: 'amber',
      title: 'Approaching \u00A3100k Tax Trap',
      message:
        `Your adjusted net income of ${fmt(adjustedNetIncome)} is close to \u00A3100,000. ` +
        `Exceeding this threshold triggers the Personal Allowance taper, creating an effective 60% marginal rate. ` +
        `Consider pension contributions or Gift Aid to stay below.`,
      profiles: paTaperProfiles,
    });
  }

  /* ------------------------------------------------------------------ */
  /*  2. Childcare trap                                                 */
  /* ------------------------------------------------------------------ */
  const childcareProfiles = ['employed', 'self-employed', 'director'];

  if (adjustedNetIncome > 100000 && hasChildcare) {
    warnings.push({
      id: 'childcare-trap',
      severity: 'red',
      title: 'Tax-Free Childcare Lost',
      message:
        `Adjusted net income above \u00A3100,000 means you lose access to Tax-Free Childcare ` +
        `(\u00A32,000/child/year, \u00A34,000 for disabled children). ` +
        `You also lose 30 hours free childcare if you or your partner's adjusted net income is over \u00A3100,000. ` +
        `Pension contributions could bring you below the threshold.`,
      profiles: childcareProfiles,
    });
  } else if (adjustedNetIncome >= 95000 && adjustedNetIncome <= 100000 && hasChildcare) {
    warnings.push({
      id: 'childcare-trap-approaching',
      severity: 'amber',
      title: 'Approaching Tax-Free Childcare Cliff Edge',
      message:
        `Your adjusted net income of ${fmt(adjustedNetIncome)} is close to \u00A3100,000. ` +
        `Going over \u00A3100,000 means losing Tax-Free Childcare (\u00A32,000/child/year) ` +
        `and 30 hours free childcare.`,
      profiles: childcareProfiles,
    });
  }

  /* ------------------------------------------------------------------ */
  /*  3. Pension Annual Allowance                                       */
  /* ------------------------------------------------------------------ */
  const pensionAAProfiles = ['employed', 'self-employed', 'outside-ir35', 'director', 'landlord'];
  const aaLimit = calcTaperedAA(pensionThresholdIncome, pensionAdjustedIncome);

  if (totalPensionContributions > aaLimit) {
    const excess = totalPensionContributions - aaLimit;
    warnings.push({
      id: 'pension-aa',
      severity: 'red',
      title: 'Pension Annual Allowance Exceeded',
      message:
        `Total pension contributions of ${fmt(totalPensionContributions)} exceed your Annual Allowance ` +
        `of ${fmt(aaLimit)} by ${fmt(excess)}. The excess will be added to your taxable income ` +
        `and taxed at your marginal rate.`,
      profiles: pensionAAProfiles,
    });
  } else if (totalPensionContributions > aaLimit * 0.85) {
    warnings.push({
      id: 'pension-aa-approaching',
      severity: 'amber',
      title: 'Approaching Pension Annual Allowance',
      message:
        `Total pension contributions of ${fmt(totalPensionContributions)} are above 85% of your ` +
        `Annual Allowance of ${fmt(aaLimit)}. Exceeding the limit triggers a tax charge on the excess.`,
      profiles: pensionAAProfiles,
    });
  }

  /* ------------------------------------------------------------------ */
  /*  4. Fiscal Drag — Frozen Thresholds                                */
  /* ------------------------------------------------------------------ */
  if (grossSalary > 12570) {
    warnings.push({
      id: 'fiscal-drag',
      severity: 'blue',
      title: 'Fiscal Drag \u2014 Frozen Thresholds',
      message:
        `The Personal Allowance has been frozen at \u00A312,570 since 2021. If indexed to inflation ` +
        `it would be ~\u00A315,000, costing you ~\u00A3486 in extra tax per year. ` +
        `Income tax thresholds are frozen until 5 April 2031.`,
      profiles: ['employed', 'self-employed', 'outside-ir35', 'inside-ir35', 'director', 'landlord'],
    });
  }

  /* ------------------------------------------------------------------ */
  /*  5. Making Tax Digital                                             */
  /* ------------------------------------------------------------------ */
  // Qualifying income is turnover from self-employment and property, before expenses (GOV.UK)
  if (
    (profile === 'self-employed' || profile === 'landlord') &&
    qualifyingIncome > 20000
  ) {
    warnings.push({
      id: 'mtd',
      severity: 'amber',
      title: 'Making Tax Digital for Income Tax',
      message:
        `Your qualifying income here (turnover before expenses) is ${fmt(qualifyingIncome)}. ` +
        `MTD applies from 6 April 2026 if it was over \u00A350,000 in 2024/25, from 6 April 2027 ` +
        `if over \u00A330,000 in 2025/26, and from 6 April 2028 if over \u00A320,000 in 2026/27. ` +
        `It means keeping digital records and sending quarterly updates.`,
      profiles: ['self-employed', 'landlord'],
    });
  }

  /* ------------------------------------------------------------------ */
  /*  6. Umbrella Company — JSL                                         */
  /* ------------------------------------------------------------------ */
  if (profile === 'inside-ir35') {
    warnings.push({
      id: 'umbrella-jsl',
      severity: 'amber',
      title: 'Umbrella Company PAYE Rules (April 2026)',
      message:
        `From 6 April 2026, the agency that contracts with the end client (or the end client, ` +
        `if there is no agency) is responsible for PAYE being operated correctly on umbrella ` +
        `workers' pay, and HMRC can recover underpaid PAYE from them. Check your umbrella company is compliant.`,
      profiles: ['inside-ir35'],
    });
  }

  /* ------------------------------------------------------------------ */
  /*  7. Dividend Tax Increase                                          */
  /* ------------------------------------------------------------------ */
  const dividendProfiles = ['outside-ir35', 'director', 'investor'];

  if (dividendIncome > 500 && dividendProfiles.includes(profile)) {
    warnings.push({
      id: 'dividend-tax-increase',
      severity: 'blue',
      title: 'Dividend Tax Rates Increased (April 2026)',
      message:
        `From 6 April 2026 the basic and higher dividend rates rose by 2 percentage points, ` +
        `to 10.75% and 35.75%. The additional rate is unchanged at 39.35%. ` +
        `The dividend allowance is \u00A3500.`,
      profiles: dividendProfiles,
    });
  }

  /* ------------------------------------------------------------------ */
  /*  8. Working from Home Relief Removed                               */
  /* ------------------------------------------------------------------ */
  if (profile === 'employed') {
    warnings.push({
      id: 'wfh-removed',
      severity: 'blue',
      title: 'Working from Home Tax Relief Removed',
      message:
        `From 6 April 2026, employees cannot claim tax relief for working from home ` +
        `(previously \u00A36 a week). You can still claim for the 4 previous tax years if you were eligible.`,
      profiles: ['employed'],
    });
  }

  /* ------------------------------------------------------------------ */
  /*  9. BADR CGT Increase                                              */
  /* ------------------------------------------------------------------ */
  const badrProfiles = ['director', 'investor', 'outside-ir35'];

  if (badrProfiles.includes(profile)) {
    warnings.push({
      id: 'badr-cgt',
      severity: 'blue',
      title: 'Business Asset Disposal Relief \u2014 CGT Now 18%',
      message:
        `The CGT rate under Business Asset Disposal Relief has risen from 14% to 18%, ` +
        `aligning with the main lower CGT rate. The \u00A31m lifetime limit still applies.`,
      profiles: badrProfiles,
    });
  }

  /* ------------------------------------------------------------------ */
  /*  10. ISA Cash Cap                                                  */
  /* ------------------------------------------------------------------ */
  if (profile === 'investor') {
    warnings.push({
      id: 'isa-cash-cap',
      severity: 'amber',
      title: 'ISA Cash Cap Coming April 2027',
      message:
        `From April 2027, under-65s will be limited to \u00A312,000 in Cash ISAs ` +
        `(within the overall \u00A320,000 ISA allowance). ` +
        `Consider maximising Cash ISA contributions before the cap takes effect.`,
      profiles: ['investor'],
    });
  }

  /* ------------------------------------------------------------------ */
  /*  11. Pension Salary Sacrifice NI Cap                               */
  /* ------------------------------------------------------------------ */
  const ssNIProfiles = ['employed', 'inside-ir35', 'outside-ir35', 'director'];

  if (grossSalary > 0 && ssNIProfiles.includes(profile)) {
    warnings.push({
      id: 'pension-ss-ni-cap',
      severity: 'blue',
      title: 'Pension Salary Sacrifice NI Limit from April 2029',
      message:
        `From 6 April 2029, pension contributions made through salary sacrifice above ` +
        `\u00A32,000 a year will pay employee and employer National Insurance.`,
      profiles: ssNIProfiles,
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Filter to current profile                                         */
  /* ------------------------------------------------------------------ */
  return warnings.filter((w) => w.profiles.includes(profile));
}
