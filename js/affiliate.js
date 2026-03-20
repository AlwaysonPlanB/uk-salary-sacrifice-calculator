const AFFILIATES = {
  freeagent: {
    name: 'FreeAgent',
    description: 'MTD-compatible accounting',
    url: '#freeagent',
    icon: '📊',
    category: 'accounting'
  },
  xero: {
    name: 'Xero',
    description: 'Cloud accounting MTD compliant',
    url: '#xero',
    icon: '📊',
    category: 'accounting'
  },
  quickbooks: {
    name: 'QuickBooks',
    description: 'Self-employed accounting MTD ready',
    url: '#quickbooks',
    icon: '📊',
    category: 'accounting'
  },
  pensionbee: {
    name: 'PensionBee',
    description: 'Simple online pension',
    url: '#pensionbee',
    icon: '🏦',
    category: 'pension'
  },
  vanguardPension: {
    name: 'Vanguard SIPP',
    description: 'Low-cost SIPP',
    url: '#vanguard-sipp',
    icon: '🏦',
    category: 'pension'
  },
  hargreavesLansdown: {
    name: 'Hargreaves Lansdown',
    description: 'UK largest ISA platform',
    url: '#hl',
    icon: '💰',
    category: 'isa'
  },
  vanguardISA: {
    name: 'Vanguard ISA',
    description: 'Low-cost passive ISA',
    url: '#vanguard-isa',
    icon: '💰',
    category: 'isa'
  },
  ajBell: {
    name: 'AJ Bell',
    description: 'Award-winning ISA',
    url: '#ajbell',
    icon: '💰',
    category: 'isa'
  },
  electricCarScheme: {
    name: 'The Electric Car Scheme',
    description: 'Salary sacrifice EV leasing save up to 60%',
    url: '#ev-scheme',
    icon: '⚡',
    category: 'ev'
  },
  octopusEV: {
    name: 'Octopus EV',
    description: 'Salary sacrifice EV leasing',
    url: '#octopus-ev',
    icon: '⚡',
    category: 'ev'
  },
  qdos: {
    name: 'Qdos',
    description: 'IR35 contract reviews and tax investigation insurance',
    url: '#qdos',
    icon: '🛡️',
    category: 'insurance'
  },
  dinghy: {
    name: 'Dinghy',
    description: 'PI and PL insurance pay by day',
    url: '#dinghy',
    icon: '🛡️',
    category: 'insurance'
  },
  parasol: {
    name: 'Parasol',
    description: 'FCSA-accredited umbrella',
    url: '#parasol',
    icon: '☂️',
    category: 'umbrella'
  },
  brookson: {
    name: 'Brookson',
    description: 'Established umbrella FCSA member',
    url: '#brookson',
    icon: '☂️',
    category: 'umbrella'
  },
  starling: {
    name: 'Starling Business',
    description: 'Free business bank account',
    url: '#starling',
    icon: '🏦',
    category: 'banking'
  },
  tide: {
    name: 'Tide',
    description: 'Free business bank with invoicing',
    url: '#tide',
    icon: '🏦',
    category: 'banking'
  },
  accountant: {
    name: 'Find a Chartered Accountant',
    description: 'ICAEW directory',
    url: 'https://find.icaew.com/',
    icon: '👤',
    category: 'accountant'
  },
  contractorMortgage: {
    name: 'CMME Contractor Mortgages',
    description: 'Specialist contractor mortgage broker',
    url: '#cmme',
    icon: '🏠',
    category: 'mortgage'
  },
  landlordInsurance: {
    name: 'Simply Business',
    description: 'Landlord insurance',
    url: '#simply-business',
    icon: '🏠',
    category: 'property'
  },
  cyclescheme: {
    name: 'Cyclescheme',
    description: 'Save 25-39% on bike via salary sacrifice',
    url: '#cyclescheme',
    icon: '🚲',
    category: 'cycle'
  }
};

function makeRec(key, reason) {
  const affiliate = AFFILIATES[key];
  return {
    ...affiliate,
    key,
    reason
  };
}

export function getRecommendations(input) {
  const {
    profile,
    grossSalary = 0,
    hasPension = false,
    hasEV = false,
    hasCycleToWork = false,
    dividendIncome = 0,
    capitalGains = 0,
    rentalIncome = 0
  } = input;

  const recs = [];

  switch (profile) {
    case 'employed':
      if (hasEV) {
        recs.push(makeRec('electricCarScheme', 'You indicated interest in an EV — salary sacrifice leasing can save up to 60% on a new electric car.'));
        recs.push(makeRec('octopusEV', 'Another salary sacrifice EV option to compare quotes and maximise your savings.'));
      }
      if (hasCycleToWork) {
        recs.push(makeRec('cyclescheme', 'You selected Cycle to Work — save 25-39% on a new bike through salary sacrifice.'));
      }
      recs.push(makeRec('pensionbee', 'Consolidate old workplace pensions into one simple online plan to track your retirement savings.'));
      if (grossSalary >= 50000) {
        recs.push(makeRec('vanguardISA', `With a salary of £${grossSalary.toLocaleString()}, a low-cost ISA helps shelter investment growth from tax.`));
      }
      break;

    case 'self-employed':
      if (grossSalary > 50000) {
        recs.push(makeRec('freeagent', `With turnover above £50k, MTD-compatible accounting software is essential for your self-assessment.`));
        recs.push(makeRec('xero', 'Cloud accounting that integrates with HMRC for Making Tax Digital compliance.'));
      }
      recs.push(makeRec('quickbooks', 'Straightforward MTD-ready accounting built for self-employed sole traders.'));
      recs.push(makeRec('starling', 'Keep business finances separate with a free business bank account — makes self-assessment easier.'));
      recs.push(makeRec('accountant', 'A chartered accountant can help optimise your self-employed tax position and ensure compliance.'));
      break;

    case 'outside-ir35':
      recs.push(makeRec('accountant', 'As an outside-IR35 contractor, a specialist accountant helps maximise tax efficiency through your limited company.'));
      recs.push(makeRec('qdos', 'Protect yourself with IR35 contract reviews and tax investigation insurance.'));
      recs.push(makeRec('dinghy', 'Flexible professional indemnity and public liability insurance — pay only for the days you work.'));
      recs.push(makeRec('starling', 'A dedicated business bank account is a requirement for your limited company.'));
      recs.push(makeRec('vanguardPension', 'A low-cost SIPP lets you make tax-efficient pension contributions through your company.'));
      break;

    case 'inside-ir35':
      recs.push(makeRec('parasol', 'An FCSA-accredited umbrella company handles your payroll and compliance inside IR35.'));
      recs.push(makeRec('brookson', 'An established FCSA-member umbrella — compare options to find the best fit.'));
      recs.push(makeRec('contractorMortgage', 'Specialist contractor mortgage brokers understand umbrella and contract income for mortgage applications.'));
      recs.push(makeRec('qdos', 'Get your IR35 status reviewed and protect yourself with tax investigation insurance.'));
      break;

    case 'landlord':
      if (rentalIncome > 50000) {
        recs.push(makeRec('freeagent', `With rental income above £50k, accounting software helps manage MTD obligations for your property portfolio.`));
        recs.push(makeRec('xero', 'Cloud accounting to track rental income, expenses and generate tax returns efficiently.'));
      }
      recs.push(makeRec('landlordInsurance', 'Protect your rental property with comprehensive landlord insurance.'));
      recs.push(makeRec('accountant', 'A chartered accountant can advise on property tax reliefs, incorporation and mortgage interest restrictions.'));
      break;

    case 'director':
      recs.push(makeRec('accountant', 'A chartered accountant helps optimise your salary/dividend split and corporation tax planning.'));
      recs.push(makeRec('vanguardPension', 'Make tax-efficient employer pension contributions through your company to reduce corporation tax.'));
      recs.push(makeRec('starling', 'A free business bank account for your limited company with easy bookkeeping integration.'));
      if (hasEV) {
        recs.push(makeRec('electricCarScheme', 'Lease an electric car through your company — one of the most tax-efficient benefits available to directors.'));
      }
      break;

    case 'investor':
      recs.push(makeRec('hargreavesLansdown', 'The UK\'s largest investment platform with a wide range of ISA and SIPP options.'));
      recs.push(makeRec('vanguardISA', 'Low-cost passive index funds inside a tax-free ISA wrapper.'));
      recs.push(makeRec('ajBell', 'An award-winning platform with competitive fees for ISA and SIPP investing.'));
      if (capitalGains > 3000) {
        recs.push(makeRec('accountant', `With £${capitalGains.toLocaleString()} in capital gains, a chartered accountant can help with CGT planning and reliefs.`));
      }
      break;
  }

  // Cross-profile: add vanguardPension if grossSalary >= 90000 and no pension rec already
  if (grossSalary >= 90000) {
    const hasPensionRec = recs.some(r => r.category === 'pension');
    if (!hasPensionRec) {
      recs.push(makeRec('vanguardPension', `With a salary of £${grossSalary.toLocaleString()}, pension contributions can reduce your effective tax rate and recover lost personal allowance.`));
    }
  }

  return recs;
}

export function renderAffiliates(containerId, recommendations) {
  const container = document.getElementById(containerId);
  if (!container || !recommendations || recommendations.length === 0) {
    return;
  }

  // Clear existing content
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  // Section header
  const header = document.createElement('h3');
  header.textContent = 'Recommended Tools';
  container.appendChild(header);

  // Affiliate disclosure label
  const disclosure = document.createElement('p');
  disclosure.className = 'affiliate-disclosure';
  disclosure.textContent = 'Affiliate links';
  container.appendChild(disclosure);

  // Cards container
  const grid = document.createElement('div');
  grid.className = 'affiliate-grid';
  container.appendChild(grid);

  for (const rec of recommendations) {
    const card = document.createElement('div');
    card.className = 'affiliate-card';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'affiliate-icon';
    iconSpan.textContent = rec.icon;
    card.appendChild(iconSpan);

    const nameEl = document.createElement('strong');
    nameEl.className = 'affiliate-name';
    nameEl.textContent = rec.name;
    card.appendChild(nameEl);

    const reasonEl = document.createElement('p');
    reasonEl.className = 'affiliate-reason';
    reasonEl.textContent = rec.reason;
    card.appendChild(reasonEl);

    const link = document.createElement('a');
    link.className = 'affiliate-link';
    link.href = rec.url;
    link.target = '_blank';
    link.rel = 'noopener sponsored';
    link.textContent = 'Learn more \u2192';
    card.appendChild(link);

    grid.appendChild(card);
  }
}
