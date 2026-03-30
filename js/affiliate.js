const AFFILIATES = {
  xero: {
    name: 'Xero',
    description: 'Cloud accounting — MTD compliant',
    url: 'https://referrals.xero.com/c1coeuntspow',
    icon: '📊',
    category: 'accounting'
  },
  wise: {
    name: 'Wise',
    description: 'Low-cost international transfers and multi-currency accounts',
    url: 'https://wise.com/invite/mic/venkatap179',
    icon: '💱',
    category: 'banking'
  },
  vitality: {
    name: 'Vitality Health Insurance',
    description: 'Business health insurance — we both get a £100 voucher when you sign up',
    url: 'https://tinyurl.com/yh49t2xu',
    icon: '🏥',
    category: 'insurance'
  },
  milelog: {
    name: 'MileLog',
    description: 'HMRC mileage tracker — log trips, calculate tax relief, export reports for your accountant. £2 on the App Store.',
    url: '#milelog',
    icon: '🚗',
    category: 'mileage'
  },
  accountant: {
    name: 'Find a Chartered Accountant',
    description: 'ICAEW directory — free search',
    url: 'https://find.icaew.com/',
    icon: '👤',
    category: 'accountant'
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
      recs.push(makeRec('xero', 'Track your payslips, pension contributions, and expenses — useful if you complete self-assessment alongside PAYE.'));
      if (grossSalary >= 50000) {
        recs.push(makeRec('wise', 'If you receive income or bonuses in foreign currency, Wise offers the real exchange rate with low fees.'));
      }
      recs.push(makeRec('vitality', 'Get private health cover for you and your family — some employers offer it as a salary sacrifice benefit. We both get a £100 voucher when you sign up.'));
      recs.push(makeRec('accountant', 'A chartered accountant can help with salary sacrifice planning, pension contributions, and the £100k tax trap.'));
      break;

    case 'self-employed':
      recs.push(makeRec('xero', 'MTD-compatible cloud accounting for self-employed — invoicing, expenses, and self-assessment in one place.'));
      recs.push(makeRec('wise', 'Accept payments from international clients at the real exchange rate — no hidden fees.'));
      recs.push(makeRec('milelog', 'Claim HMRC mileage allowance on business trips — log journeys, calculate tax relief at 45p/25p per mile, and export reports for your self-assessment.'));
      recs.push(makeRec('vitality', 'Protect yourself with health insurance — as a sole trader, you are your business. We both get a £100 voucher when you sign up.'));
      recs.push(makeRec('accountant', 'A chartered accountant can help optimise your self-employed tax position and ensure MTD compliance.'));
      break;

    case 'outside-ir35':
      recs.push(makeRec('xero', 'Cloud accounting for your limited company — manage invoices, corporation tax, and dividend records.'));
      recs.push(makeRec('wise', 'Multi-currency business account for international contracts — hold, send, and receive in 40+ currencies.'));
      recs.push(makeRec('milelog', 'Track business mileage through your Ltd company — log trips at HMRC rates and export reports straight to your accountant.'));
      recs.push(makeRec('vitality', 'Get health insurance through your Ltd company as a tax-efficient business expense. We both get a £100 voucher when you sign up.'));
      recs.push(makeRec('accountant', 'A specialist contractor accountant helps maximise tax efficiency through your limited company.'));
      break;

    case 'inside-ir35':
      recs.push(makeRec('wise', 'If your agency pays in a different currency, Wise gives you the real exchange rate on every transfer.'));
      recs.push(makeRec('milelog', 'Log your commute and business mileage — some umbrella companies let you claim HMRC mileage relief on qualifying journeys.'));
      recs.push(makeRec('vitality', 'As a contractor, you don\'t get employer sick pay — private health insurance keeps you covered. We both get a £100 voucher when you sign up.'));
      recs.push(makeRec('accountant', 'A chartered accountant can review your IR35 status and advise on pension strategies inside IR35.'));
      break;

    case 'landlord':
      recs.push(makeRec('xero', 'Track rental income, mortgage interest, and expenses — essential when MTD applies to your rental profits.'));
      recs.push(makeRec('milelog', 'Claim mileage for property visits, viewings, and maintenance trips — log journeys at HMRC rates and add to your rental expenses.'));
      recs.push(makeRec('vitality', 'Health insurance for you as a property business owner — protect your ability to manage your portfolio. We both get a £100 voucher when you sign up.'));
      recs.push(makeRec('accountant', 'A chartered accountant can advise on Section 24 mortgage interest relief, incorporation, and property tax planning.'));
      break;

    case 'director':
      recs.push(makeRec('xero', 'Cloud accounting for your company — manage payroll, corporation tax, dividends, and VAT in one platform.'));
      recs.push(makeRec('wise', 'Multi-currency business account — ideal if your company invoices or pays international suppliers.'));
      recs.push(makeRec('vitality', 'Offer health insurance as an employee benefit through your company — a tax-efficient perk for you and your team. We both get a £100 voucher when you sign up.'));
      recs.push(makeRec('accountant', 'A chartered accountant helps optimise your salary/dividend split and corporation tax planning.'));
      break;

    case 'investor':
      recs.push(makeRec('wise', 'Transfer funds internationally at the real exchange rate — useful for overseas investments and dividend income.'));
      recs.push(makeRec('vitality', 'Private health insurance to protect your most important asset — yourself. We both get a £100 voucher when you sign up.'));
      if (capitalGains > 3000) {
        recs.push(makeRec('accountant', 'With capital gains above the annual exempt amount, a chartered accountant can help with CGT planning and reliefs.'));
      } else {
        recs.push(makeRec('accountant', 'A chartered accountant can help with dividend tax planning, ISA strategy, and CGT reliefs.'));
      }
      break;
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
  disclosure.textContent = 'We are not sponsored by or associated with any of the tools listed below. If you sign up using these links, we may receive a commission at no extra cost to you.';
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
