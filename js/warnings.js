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
    dividendIncome = 0,
    rentalIncome = 0,
    hasChildcare,
    isScottish,
  } = input;

  const warnings = [];

  /* ------------------------------------------------------------------ */
  /*  1. PA Taper — £100k tax trap                                      */
  /* ------------------------------------------------------------------ */
  const paTaperProfiles = ['employed', 'self-employed', 'outside-ir35', 'director', 'landlord'];

  if (adjustedNetIncome >= 100000) {
    const paLoss = RATES.personalAllowance - calcPersonalAllowance(adjustedNetIncome);
    const pensionNeeded = adjustedNetIncome - 99999;
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
  } else if (adjustedNetIncome >= 95000 && adjustedNetIncome <= 99999) {
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

  if (adjustedNetIncome >= 100000 && hasChildcare) {
    warnings.push({
      id: 'childcare-trap',
      severity: 'red',
      title: 'Tax-Free Childcare Lost',
      message:
        `Adjusted net income above \u00A3100,000 means you lose access to Tax-Free Childcare ` +
        `(\u00A32,000/child/year, \u00A34,000 for disabled children). ` +
        `Note: the 30 hours free childcare entitlement is not affected by income. ` +
        `Pension contributions could bring you below the threshold.`,
      profiles: childcareProfiles,
    });
  } else if (adjustedNetIncome >= 95000 && adjustedNetIncome <= 99999 && hasChildcare) {
    warnings.push({
      id: 'childcare-trap-approaching',
      severity: 'amber',
      title: 'Approaching Tax-Free Childcare Cliff Edge',
      message:
        `Your adjusted net income of ${fmt(adjustedNetIncome)} is close to \u00A3100,000. ` +
        `Exceeding this threshold means losing Tax-Free Childcare (\u00A32,000/child/year). ` +
        `The 30 hours free childcare entitlement is not affected by income.`,
      profiles: childcareProfiles,
    });
  }

  /* ------------------------------------------------------------------ */
  /*  3. Pension Annual Allowance                                       */
  /* ------------------------------------------------------------------ */
  const pensionAAProfiles = ['employed', 'self-employed', 'outside-ir35', 'director', 'landlord'];
  const aaLimit = calcTaperedAA(adjustedNetIncome);

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
        `All income tax thresholds remain frozen until at least 2028.`,
      profiles: ['employed', 'self-employed', 'outside-ir35', 'inside-ir35', 'director', 'landlord'],
    });
  }

  /* ------------------------------------------------------------------ */
  /*  5. Making Tax Digital                                             */
  /* ------------------------------------------------------------------ */
  const mtdIncome =
    (profile === 'self-employed' ? grossSalary : 0) +
    (profile === 'landlord' ? rentalIncome : 0);

  if (
    (profile === 'self-employed' || profile === 'landlord') &&
    mtdIncome > 50000
  ) {
    warnings.push({
      id: 'mtd',
      severity: 'amber',
      title: 'Making Tax Digital \u2014 Mandatory from April 2026',
      message:
        `Self-employed and landlord income over \u00A350,000 must use MTD-compatible software ` +
        `for income tax from April 2026. Quarterly digital updates will be required.`,
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
      title: 'Umbrella Company \u2014 Joint & Several Liability (April 2026)',
      message:
        `From April 2026, end clients and agencies share joint and several liability for ` +
        `unpaid tax and NI where umbrella companies fail to remit PAYE. ` +
        `Ensure your umbrella provider is compliant.`,
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
        `Dividend tax rates have increased by 2% across all bands: basic rate 10.75%, ` +
        `higher rate 35.75%, additional rate 39.35%. ` +
        `The dividend allowance is now \u00A3500.`,
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
        `The \u00A36/week (\u00A3312/year) working from home tax relief is no longer available ` +
        `unless your employer requires you to work from home with no office available.`,
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
      title: 'Pension Salary Sacrifice NI Relief \u2014 Cap Coming 2029',
      message:
        `From 2029, employer NI savings from salary sacrifice pension contributions ` +
        `will be capped at \u00A32,000 per employee. ` +
        `Consider front-loading salary sacrifice arrangements before the cap.`,
      profiles: ssNIProfiles,
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Filter to current profile                                         */
  /* ------------------------------------------------------------------ */
  return warnings.filter((w) => w.profiles.includes(profile));
}
