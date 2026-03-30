/**
 * UK Tax Engine - 2026/27 HMRC Tax Rates & Pure Calculation Functions
 * Foundation module imported by all other calculator modules.
 */

export const TAX_YEAR = '2026/27';

export const RATES = {
  personalAllowance: 12570,
  paTaperThreshold: 100000,

  // England, Wales & NI income tax bands
  incomeTax: {
    basic:      { lower: 12571, upper: 50270,  rate: 0.20 },
    higher:     { lower: 50271, upper: 125140, rate: 0.40 },
    additional: { lower: 125141,               rate: 0.45 },
  },

  // Scottish income tax bands
  scottishTax: {
    starter:      { lower: 12571, upper: 16537,  rate: 0.19 },
    basic:        { lower: 16538, upper: 29526,  rate: 0.20 },
    intermediate: { lower: 29527, upper: 43662,  rate: 0.21 },
    higher:       { lower: 43663, upper: 75000,  rate: 0.42 },
    advanced:     { lower: 75001, upper: 125140, rate: 0.45 },
    top:          { lower: 125141,               rate: 0.48 },
  },

  nationalInsurance: {
    primaryThreshold: 12570,
    upperEarningsLimit: 50270,
    lowerRate: 0.08,
    upperRate: 0.02,
  },

  employerNI: {
    secondaryThreshold: 5000,
    rate: 0.15,
  },

  selfEmployedNI: {
    class2WeeklyRate: 3.65,
    class2Threshold: 12570,
    class4LowerProfit: 12570,
    class4UpperProfit: 50270,
    class4LowerRate: 0.06,
    class4UpperRate: 0.02,
  },

  studentLoan: {
    plan1:        { threshold: 26065, rate: 0.09 },
    plan2:        { threshold: 29385, rate: 0.09 },
    plan4:        { threshold: 32745, rate: 0.09 },
    plan5:        { threshold: 25000, rate: 0.09 },
    postgraduate: { threshold: 21000, rate: 0.06 },
  },

  dividends: {
    allowance: 500,
    basic: 0.1075,
    higher: 0.3575,
    additional: 0.3935,
  },

  capitalGains: {
    annualExempt: 3000,
    basicRate: 0.18,
    higherRate: 0.24,
    badr: 0.18,
    residential: { basic: 0.18, higher: 0.24 },
  },

  pension: {
    annualAllowance: 60000,
    taperedAAThreshold: 200000,
    taperedAAAdjustedThreshold: 260000,
    minimumTaperedAA: 10000,
    moneyPurchaseAA: 10000,
    salarySacrificeNICap2029: 2000,
  },

  corporationTax: {
    smallProfitsRate: 0.19,
    smallProfitsLimit: 50000,
    mainRate: 0.25,
    mainRateLimit: 250000,
  },

  bik: {
    electric: 0.04,
    pluginHybrid: [
      { maxCO2: 50, ranges: [
        { minRange: 130, rate: 0.04 },
        { minRange: 70,  rate: 0.08 },
        { minRange: 40,  rate: 0.12 },
        { minRange: 30,  rate: 0.14 },
        { minRange: 0,   rate: 0.16 },
      ]},
    ],
    petrol: [
      { maxCO2: 50,  rate: 0.18 },
      { maxCO2: 55,  rate: 0.19 },
      { maxCO2: 60,  rate: 0.20 },
      { maxCO2: 65,  rate: 0.21 },
      { maxCO2: 70,  rate: 0.22 },
      { maxCO2: 75,  rate: 0.23 },
      { maxCO2: 80,  rate: 0.24 },
      { maxCO2: 85,  rate: 0.25 },
      { maxCO2: 90,  rate: 0.26 },
      { maxCO2: 95,  rate: 0.27 },
      { maxCO2: 100, rate: 0.28 },
      { maxCO2: 105, rate: 0.29 },
      { maxCO2: 110, rate: 0.30 },
      { maxCO2: 115, rate: 0.31 },
      { maxCO2: 120, rate: 0.32 },
      { maxCO2: 125, rate: 0.33 },
      { maxCO2: 130, rate: 0.34 },
      { maxCO2: 135, rate: 0.35 },
      { maxCO2: 140, rate: 0.36 },
      { maxCO2: Infinity, rate: 0.37 },
    ],
    dieselSupplement: 0.04,
    maxBikRate: 0.37,
  },

  isa: {
    annualAllowance: 20000,
    cashIsaCap2027: 12000,
  },
};

/* ------------------------------------------------------------------ */
/*  Helper                                                            */
/* ------------------------------------------------------------------ */

function round2(x) {
  return Math.round(x * 100) / 100;
}

/* ------------------------------------------------------------------ */
/*  Personal Allowance                                                */
/* ------------------------------------------------------------------ */

/**
 * Effective personal allowance after taper.
 * Reduces by £1 for every £2 above £100,000.
 */
export function calcPersonalAllowance(grossIncome) {
  if (grossIncome <= RATES.paTaperThreshold) {
    return RATES.personalAllowance;
  }
  const reduction = Math.floor((grossIncome - RATES.paTaperThreshold) / 2);
  return Math.max(0, RATES.personalAllowance - reduction);
}

/* ------------------------------------------------------------------ */
/*  Income Tax                                                        */
/* ------------------------------------------------------------------ */

/**
 * Progressive income tax for England/Wales/NI or Scotland.
 * Returns { tax, effectiveRate, marginalRate, personalAllowance, breakdown[] }
 */
export function calcIncomeTax(taxableIncome, isScottish = false) {
  const pa = calcPersonalAllowance(taxableIncome);
  const incomeAfterPA = Math.max(0, taxableIncome - pa);

  const bands = isScottish ? RATES.scottishTax : RATES.incomeTax;
  const breakdown = [];
  let totalTax = 0;
  let remaining = incomeAfterPA;
  let marginalRate = 0;

  for (const [name, band] of Object.entries(bands)) {
    if (remaining <= 0) break;

    // Width of this band: from (band.lower - PA offset) to band.upper
    // We work on income-after-PA, so bands are relative to 0.
    const bandStart = band.lower - RATES.personalAllowance - 1; // offset from 0
    const bandWidth = band.upper
      ? band.upper - band.lower + 1
      : Infinity;

    const taxableInBand = Math.min(remaining, bandWidth);
    const taxForBand = round2(taxableInBand * band.rate);

    if (taxableInBand > 0) {
      breakdown.push({
        band: name,
        rate: band.rate,
        taxableAmount: round2(taxableInBand),
        tax: taxForBand,
      });
      totalTax += taxForBand;
      marginalRate = band.rate;
    }

    remaining -= taxableInBand;
  }

  totalTax = round2(totalTax);

  // Detect 60% effective marginal rate in PA taper zone (£100k-£125,140)
  if (
    taxableIncome > RATES.paTaperThreshold &&
    taxableIncome <= 125140
  ) {
    // In the taper zone the effective marginal rate is ~60% for rUK (40% tax + 20% lost PA)
    // or ~63% for Scotland (42% higher + 21% lost PA)
    if (isScottish) {
      // Find the Scottish rate that applies at the taper zone income level
      marginalRate = 0.63; // 42% + 21% effective from PA taper
    } else {
      marginalRate = 0.60; // 40% + 20% effective from PA taper
    }
  }

  const effectiveRate = taxableIncome > 0
    ? round2((totalTax / taxableIncome) * 100) / 100
    : 0;

  return {
    tax: totalTax,
    effectiveRate,
    marginalRate,
    personalAllowance: pa,
    breakdown,
  };
}

/* ------------------------------------------------------------------ */
/*  Employee National Insurance                                       */
/* ------------------------------------------------------------------ */

/**
 * Employee NI: 8% on £12,570-£50,270, 2% above £50,270.
 */
export function calcEmployeeNI(niableIncome) {
  if (niableIncome <= RATES.nationalInsurance.primaryThreshold) {
    return 0;
  }

  const { primaryThreshold, upperEarningsLimit, lowerRate, upperRate } =
    RATES.nationalInsurance;

  let ni = 0;

  const mainBand = Math.min(niableIncome, upperEarningsLimit) - primaryThreshold;
  ni += Math.max(0, mainBand) * lowerRate;

  if (niableIncome > upperEarningsLimit) {
    ni += (niableIncome - upperEarningsLimit) * upperRate;
  }

  return round2(ni);
}

/* ------------------------------------------------------------------ */
/*  Employer National Insurance                                       */
/* ------------------------------------------------------------------ */

/**
 * Employer NI: 15% above £5,000.
 */
export function calcEmployerNI(salary) {
  if (salary <= RATES.employerNI.secondaryThreshold) {
    return 0;
  }
  return round2(
    (salary - RATES.employerNI.secondaryThreshold) * RATES.employerNI.rate
  );
}

/* ------------------------------------------------------------------ */
/*  Self-Employed National Insurance                                  */
/* ------------------------------------------------------------------ */

/**
 * Self-employed NI: Class 2 + Class 4.
 * Returns { class2, class4, total }
 */
export function calcSelfEmployedNI(profit) {
  const se = RATES.selfEmployedNI;

  // Class 2: flat weekly rate if profit >= threshold
  const class2 =
    profit >= se.class2Threshold
      ? round2(se.class2WeeklyRate * 52)
      : 0;

  // Class 4: 6% on £12,570-£50,270, 2% above £50,270
  let class4 = 0;
  if (profit > se.class4LowerProfit) {
    const mainBand =
      Math.min(profit, se.class4UpperProfit) - se.class4LowerProfit;
    class4 += Math.max(0, mainBand) * se.class4LowerRate;

    if (profit > se.class4UpperProfit) {
      class4 += (profit - se.class4UpperProfit) * se.class4UpperRate;
    }
    class4 = round2(class4);
  }

  return {
    class2,
    class4,
    total: round2(class2 + class4),
  };
}

/* ------------------------------------------------------------------ */
/*  Corporation Tax                                                   */
/* ------------------------------------------------------------------ */

/**
 * Corporation tax with marginal relief.
 * 19% if profit <= £50k, 25% if >= £250k, marginal relief between.
 * Returns { tax, effectiveRate }
 */
export function calcCorporationTax(profit) {
  const { smallProfitsRate, smallProfitsLimit, mainRate, mainRateLimit } =
    RATES.corporationTax;

  if (profit <= 0) {
    return { tax: 0, effectiveRate: 0 };
  }

  let tax;

  if (profit <= smallProfitsLimit) {
    tax = round2(profit * smallProfitsRate);
  } else if (profit >= mainRateLimit) {
    tax = round2(profit * mainRate);
  } else {
    // Marginal relief band
    // HMRC formula: MR = (upper limit - profit) × 3/200
    // See: gov.uk/guidance/corporation-tax-marginal-relief
    const mainTax = profit * mainRate;
    const marginalRelief = (mainRateLimit - profit) * 3 / 200;
    tax = round2(mainTax - marginalRelief);
  }

  const effectiveRate = round2((tax / profit) * 100) / 100;

  return { tax, effectiveRate };
}

/* ------------------------------------------------------------------ */
/*  Dividend Tax                                                      */
/* ------------------------------------------------------------------ */

/**
 * Dividend tax considering other income already occupying bands.
 * Returns { tax, breakdown[] }
 */
export function calcDividendTax(dividendIncome, otherTaxableIncome) {
  if (dividendIncome <= 0) {
    return { tax: 0, breakdown: [] };
  }

  const allowance = RATES.dividends.allowance;
  const taxableDividends = Math.max(0, dividendIncome - allowance);

  if (taxableDividends <= 0) {
    return { tax: 0, breakdown: [] };
  }

  const pa = calcPersonalAllowance(otherTaxableIncome + dividendIncome);
  const totalIncome = otherTaxableIncome + dividendIncome;

  // Basic rate band ceiling (income level, not taxable amount)
  const basicCeiling = RATES.incomeTax.basic.upper;   // 50270
  const higherCeiling = RATES.incomeTax.higher.upper;  // 125140

  // How much of the basic-rate band is already used by other income
  const otherAfterPA = Math.max(0, otherTaxableIncome - pa);
  const basicBandRemaining = Math.max(0, basicCeiling - pa - otherAfterPA);
  const higherBandRemaining = Math.max(
    0,
    higherCeiling - pa - Math.max(otherAfterPA, basicCeiling - pa)
  );

  const breakdown = [];
  let remaining = taxableDividends;
  let totalTax = 0;

  // Basic rate portion of dividends
  if (remaining > 0 && basicBandRemaining > 0) {
    const inBasic = Math.min(remaining, basicBandRemaining);
    const t = round2(inBasic * RATES.dividends.basic);
    breakdown.push({
      band: 'basic',
      rate: RATES.dividends.basic,
      taxableAmount: round2(inBasic),
      tax: t,
    });
    totalTax += t;
    remaining -= inBasic;
  }

  // Higher rate portion
  if (remaining > 0 && higherBandRemaining > 0) {
    const inHigher = Math.min(remaining, higherBandRemaining);
    const t = round2(inHigher * RATES.dividends.higher);
    breakdown.push({
      band: 'higher',
      rate: RATES.dividends.higher,
      taxableAmount: round2(inHigher),
      tax: t,
    });
    totalTax += t;
    remaining -= inHigher;
  }

  // Additional rate portion
  if (remaining > 0) {
    const t = round2(remaining * RATES.dividends.additional);
    breakdown.push({
      band: 'additional',
      rate: RATES.dividends.additional,
      taxableAmount: round2(remaining),
      tax: t,
    });
    totalTax += t;
  }

  return {
    tax: round2(totalTax),
    breakdown,
  };
}

/* ------------------------------------------------------------------ */
/*  Capital Gains Tax                                                 */
/* ------------------------------------------------------------------ */

/**
 * CGT with £3k annual exempt amount.
 * 18%/24% based on remaining basic rate band. BADR flat 18%.
 * Returns { tax }
 */
export function calcCapitalGainsTax(
  gains,
  otherTaxableIncome,
  isResidential = false,
  isBADR = false
) {
  if (gains <= 0) {
    return { tax: 0 };
  }

  const taxableGains = Math.max(0, gains - RATES.capitalGains.annualExempt);

  if (taxableGains <= 0) {
    return { tax: 0 };
  }

  // BADR: flat 18%
  if (isBADR) {
    return { tax: round2(taxableGains * RATES.capitalGains.badr) };
  }

  const pa = calcPersonalAllowance(otherTaxableIncome);
  const otherAfterPA = Math.max(0, otherTaxableIncome - pa);
  const basicBandRemaining = Math.max(
    0,
    RATES.incomeTax.basic.upper - pa - otherAfterPA
  );

  const basicRateAmount = Math.min(taxableGains, basicBandRemaining);
  const higherRateAmount = taxableGains - basicRateAmount;

  let basicRate, higherRate;
  if (isResidential) {
    basicRate = RATES.capitalGains.residential.basic;
    higherRate = RATES.capitalGains.residential.higher;
  } else {
    basicRate = RATES.capitalGains.basicRate;
    higherRate = RATES.capitalGains.higherRate;
  }

  const tax = round2(
    basicRateAmount * basicRate + higherRateAmount * higherRate
  );

  return { tax };
}

/* ------------------------------------------------------------------ */
/*  Tapered Annual Allowance (Pension)                                */
/* ------------------------------------------------------------------ */

/**
 * Pension annual allowance: £60k, reduces £1 per £2 above £200k, min £10k.
 */
export function calcTaperedAA(adjustedIncome) {
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
/*  Formatting Utilities                                              */
/* ------------------------------------------------------------------ */

/**
 * Format as currency, no pence for whole numbers. e.g. "£55,000"
 */
export function formatCurrency(amount) {
  const rounded = round2(amount);
  if (Number.isInteger(rounded)) {
    return '\u00A3' + rounded.toLocaleString('en-GB');
  }
  return (
    '\u00A3' +
    rounded.toLocaleString('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/**
 * Format as currency, always 2dp. e.g. "£55,000.00"
 */
export function formatCurrencyPence(amount) {
  return (
    '\u00A3' +
    round2(amount).toLocaleString('en-GB', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/**
 * Format a rate as percentage. e.g. 0.20 -> "20.0%"
 */
export function formatPercent(rate) {
  return (rate * 100).toFixed(1) + '%';
}
