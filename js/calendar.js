/**
 * calendar.js — Tax deadline calendar for UK tax year 2026/27
 * ES6 module
 */

export const DEADLINES = [
  {
    date: '2026-04-06',
    title: 'Tax Year 2026/27 Starts',
    description: 'The new UK tax year begins. Review your tax codes, allowances, and any changes to rates.',
    profiles: ['employed', 'self-employed', 'inside-ir35', 'outside-ir35', 'landlord', 'director', 'investor'],
    hmrcLink: 'https://www.gov.uk/income-tax-rates'
  },
  {
    date: '2026-04-19',
    title: 'Final PAYE/NI Submission 2025/26',
    description: 'Employers must submit final Full Payment Submission (FPS) for the 2025/26 tax year.',
    profiles: ['employed', 'director'],
    hmrcLink: 'https://www.gov.uk/running-payroll/reporting-to-hmrc'
  },
  {
    date: '2026-05-31',
    title: 'P60 Due from Employer',
    description: 'Your employer must provide your P60 end-of-year certificate for the 2025/26 tax year.',
    profiles: ['employed', 'inside-ir35'],
    hmrcLink: 'https://www.gov.uk/paye-forms-p45-p60-p11d/p60'
  },
  {
    date: '2026-07-05',
    title: 'MTD Quarterly Update #1',
    description: 'First quarterly update due under Making Tax Digital for Income Tax (April to June).',
    profiles: ['self-employed', 'landlord'],
    hmrcLink: 'https://www.gov.uk/guidance/use-making-tax-digital-for-income-tax'
  },
  {
    date: '2026-07-06',
    title: 'P11D Due',
    description: 'Employers must submit P11D forms reporting expenses and benefits for 2025/26.',
    profiles: ['employed', 'director'],
    hmrcLink: 'https://www.gov.uk/paye-forms-p45-p60-p11d/p11d'
  },
  {
    date: '2026-07-31',
    title: 'Second Payment on Account 2025/26',
    description: 'Second instalment of your 2025/26 Self Assessment tax bill is due.',
    profiles: ['self-employed', 'outside-ir35', 'landlord', 'director'],
    hmrcLink: 'https://www.gov.uk/understand-self-assessment-bill/payments-on-account'
  },
  {
    date: '2026-10-05',
    title: 'MTD Quarterly Update #2',
    description: 'Second quarterly update due under Making Tax Digital for Income Tax (July to September).',
    profiles: ['self-employed', 'landlord'],
    hmrcLink: 'https://www.gov.uk/guidance/use-making-tax-digital-for-income-tax'
  },
  {
    date: '2026-10-05',
    title: 'Register for Self Assessment',
    description: 'Deadline to register for Self Assessment if you need to file a tax return for 2026/27.',
    profiles: ['self-employed', 'landlord', 'investor'],
    hmrcLink: 'https://www.gov.uk/register-for-self-assessment'
  },
  {
    date: '2026-10-31',
    title: 'Paper SA Return Deadline',
    description: 'Deadline to submit a paper Self Assessment tax return for 2025/26.',
    profiles: ['self-employed', 'outside-ir35', 'landlord', 'director', 'investor'],
    hmrcLink: 'https://www.gov.uk/self-assessment-tax-returns/deadlines'
  },
  {
    date: '2027-01-05',
    title: 'MTD Quarterly Update #3',
    description: 'Third quarterly update due under Making Tax Digital for Income Tax (October to December).',
    profiles: ['self-employed', 'landlord'],
    hmrcLink: 'https://www.gov.uk/guidance/use-making-tax-digital-for-income-tax'
  },
  {
    date: '2027-01-31',
    title: 'Self Assessment Deadline',
    description: 'Online Self Assessment tax return and payment for 2025/26 must be submitted and paid.',
    profiles: ['self-employed', 'outside-ir35', 'landlord', 'director', 'investor'],
    hmrcLink: 'https://www.gov.uk/self-assessment-tax-returns/deadlines'
  },
  {
    date: '2027-01-31',
    title: 'Capital Gains Tax Payment',
    description: 'Any Capital Gains Tax due for 2025/26 must be paid (unless already reported via 60-day rule).',
    profiles: ['investor', 'director', 'landlord'],
    hmrcLink: 'https://www.gov.uk/capital-gains-tax/report-and-pay-capital-gains-tax'
  },
  {
    date: '2027-04-05',
    title: 'End of Tax Year / ISA Deadline',
    description: 'Last day to use your ISA allowance and make tax-efficient investments for 2026/27.',
    profiles: ['employed', 'self-employed', 'inside-ir35', 'outside-ir35', 'landlord', 'director', 'investor'],
    hmrcLink: 'https://www.gov.uk/individual-savings-accounts'
  },
  {
    date: '2027-04-05',
    title: 'MTD Quarterly Update #4',
    description: 'Fourth quarterly update due under Making Tax Digital for Income Tax (January to March).',
    profiles: ['self-employed', 'landlord'],
    hmrcLink: 'https://www.gov.uk/guidance/use-making-tax-digital-for-income-tax'
  },
  {
    date: 'monthly',
    title: 'Review Umbrella Payslip',
    description: 'Check your umbrella company payslip for correct tax, NI, and margin deductions each month.',
    profiles: ['inside-ir35'],
    hmrcLink: 'https://www.gov.uk/employment-status/umbrella-company'
  },
  {
    date: 'variable',
    title: 'Corporation Tax Payment',
    description: 'Corporation Tax is due 9 months and 1 day after your company accounting period ends.',
    profiles: ['outside-ir35', 'director'],
    hmrcLink: 'https://www.gov.uk/pay-corporation-tax'
  },
  {
    date: 'variable',
    title: 'Annual Accounts Filing',
    description: 'File annual accounts with Companies House within 9 months of your accounting period end.',
    profiles: ['outside-ir35', 'director'],
    hmrcLink: 'https://www.gov.uk/file-your-company-annual-accounts'
  },
  {
    date: 'variable',
    title: 'Confirmation Statement',
    description: 'File a confirmation statement with Companies House at least once every 12 months.',
    profiles: ['outside-ir35', 'director'],
    hmrcLink: 'https://www.gov.uk/file-a-confirmation-statement-with-companies-house'
  },
  {
    date: 'variable',
    title: 'VAT Return Submission',
    description: 'Submit your VAT return and payment, typically due quarterly based on your VAT period.',
    profiles: ['outside-ir35', 'self-employed'],
    hmrcLink: 'https://www.gov.uk/vat-returns'
  },
  {
    date: 'variable',
    title: 'CGT 60-Day Report Property',
    description: 'Report and pay Capital Gains Tax on UK property within 60 days of completion.',
    profiles: ['landlord', 'investor'],
    hmrcLink: 'https://www.gov.uk/report-and-pay-your-capital-gains-tax/if-you-sold-a-property-in-the-uk'
  }
];

/**
 * Filters deadlines by profile and adds urgency colour.
 * Sorts: fixed dates first (chronologically), then monthly, then variable.
 * @param {string} profile
 * @returns {Array} filtered and sorted deadline objects with `urgency` field
 */
export function getProfileDeadlines(profile) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = DEADLINES
    .filter(d => d.profiles.includes(profile))
    .map(d => {
      let urgency = 'green';

      if (d.date !== 'monthly' && d.date !== 'variable') {
        const deadlineDate = new Date(d.date + 'T00:00:00');
        const diffMs = deadlineDate - today;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
          urgency = 'red';
        } else if (diffDays <= 7) {
          urgency = 'red';
        } else if (diffDays <= 30) {
          urgency = 'amber';
        } else {
          urgency = 'green';
        }
      }

      return { ...d, urgency };
    });

  filtered.sort((a, b) => {
    const order = (date) => {
      if (date === 'monthly') return 1;
      if (date === 'variable') return 2;
      return 0;
    };

    const aOrder = order(a.date);
    const bOrder = order(b.date);

    if (aOrder !== bOrder) return aOrder - bOrder;

    if (aOrder === 0) {
      return a.date.localeCompare(b.date);
    }

    return 0;
  });

  return filtered;
}

/**
 * Renders the deadline calendar into a container element using safe DOM methods.
 * @param {string} profile
 * @param {string} containerId
 */
export function renderCalendar(profile, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Clear existing content safely
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  const deadlines = getProfileDeadlines(profile);

  if (deadlines.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'No deadlines found for this profile.';
    empty.className = 'calendar-empty';
    container.appendChild(empty);
    return;
  }

  const list = document.createElement('ul');
  list.className = 'deadline-list';

  for (const deadline of deadlines) {
    const item = document.createElement('li');
    item.className = 'deadline-item';

    // Date badge
    const badge = document.createElement('span');
    badge.className = 'deadline-badge deadline-badge--' + deadline.urgency;

    if (deadline.date === 'monthly') {
      badge.textContent = 'Monthly';
    } else if (deadline.date === 'variable') {
      badge.textContent = 'Variable';
    } else {
      const dateObj = new Date(deadline.date + 'T00:00:00');
      badge.textContent = dateObj.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }

    item.appendChild(badge);

    // Title
    const title = document.createElement('strong');
    title.className = 'deadline-title';
    title.textContent = deadline.title;
    item.appendChild(title);

    // Description
    const desc = document.createElement('p');
    desc.className = 'deadline-description';
    desc.textContent = deadline.description;
    item.appendChild(desc);

    // HMRC Link
    const link = document.createElement('a');
    link.className = 'deadline-link';
    link.href = deadline.hmrcLink;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'HMRC Guidance';
    item.appendChild(link);

    list.appendChild(item);
  }

  container.appendChild(list);
}
