/**
 * MileLog box: a small mileage calculator shown under the first result card.
 * MileLog is our own app, so the box carries an "Our app" label
 * (same disclosure as the Recommended Tools section in affiliate.js).
 */

import { formatCurrency } from './tax-engine.js';

// Cars and vans, from 6 April 2026 (GOV.UK approved mileage rates)
const RATE_FIRST = 0.55;   // first 10,000 business miles in the tax year
const RATE_ABOVE = 0.25;   // each business mile over 10,000
const THRESHOLD = 10000;

const APP_URL = 'https://apps.apple.com/gb/app/milelog/id6761419413?pt=128674269&mt=8&ct=';

/** Approved mileage amount for cars and vans at the 2026/27 rates. */
export function approvedMileage(miles) {
  const m = Math.max(0, miles || 0);
  return Math.min(m, THRESHOLD) * RATE_FIRST + Math.max(0, m - THRESHOLD) * RATE_ABOVE;
}

function readNumber(el) {
  return parseFloat(String(el.value).replace(/,/g, '')) || 0;
}

let box = null;
let current = null;

function build(config) {
  const column = document.querySelector('.results-column');
  const firstCard = column && column.querySelector('.result-section');
  if (!firstCard) return null;

  const el = document.createElement('details');
  el.className = 'mileage-box';
  el.id = 'mileageBox';

  const summary = document.createElement('summary');
  const title = document.createElement('span');
  title.textContent = '\u{1F697} ' + config.title;
  const badge = document.createElement('span');
  badge.className = 'affiliate-badge';
  badge.textContent = 'Our app';
  summary.append(title, badge);
  el.appendChild(summary);

  const body = document.createElement('div');
  body.className = 'mileage-box-body';

  const addInput = (id, label, value) => {
    const lab = document.createElement('label');
    lab.htmlFor = id;
    lab.textContent = label;
    const wrap = document.createElement('div');
    wrap.className = 'input-prefix';
    const input = document.createElement('input');
    input.type = 'text';
    input.id = id;
    input.inputMode = 'numeric';
    input.value = value;
    input.addEventListener('input', render);
    wrap.appendChild(input);
    body.append(lab, wrap);
    return input;
  };

  const miles = addInput('mileageMiles', 'Business miles this tax year', '8,000');
  const employerPence = config.withEmployerRate
    ? addInput('mileageEmployerPence', 'Your employer pays you (pence per mile, 0 if nothing)', '0')
    : null;

  const rows = document.createElement('div');
  rows.className = 'mileage-box-rows';
  body.appendChild(rows);

  const note = document.createElement('p');
  note.className = 'mileage-box-note';
  note.textContent = config.note;
  body.appendChild(note);

  const app = document.createElement('p');
  app.className = 'mileage-box-note';
  app.textContent = 'MileLog, our own £1.99 iPhone app, logs each trip at HMRC rates and exports a report for your records.';
  body.appendChild(app);

  const link = document.createElement('a');
  link.className = 'btn-primary btn-sm';
  link.href = APP_URL + 'uktaxcal-' + config.profile + '-box';
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = 'Get MileLog on the App Store →';
  body.appendChild(link);

  el.appendChild(body);
  firstCard.after(el);

  return { el, miles, employerPence, rows };
}

function render() {
  if (!box || !current) return;
  const miles = readNumber(box.miles);
  const pence = box.employerPence ? readNumber(box.employerPence) : 0;
  const lines = current.config.rows(miles, pence, current.context);

  box.rows.replaceChildren(...lines.map(({ label, amount }) => {
    const row = document.createElement('div');
    row.className = 'result-row';
    const l = document.createElement('span');
    l.className = 'label';
    l.textContent = label;
    const v = document.createElement('span');
    v.className = 'value';
    v.style.color = 'var(--green)';
    v.textContent = formatCurrency(Math.max(0, amount));
    row.append(l, v);
    return row;
  }));
}

/**
 * Show or update the box. Call from the page's calculation with the latest context.
 * config: { profile, title, note, withEmployerRate, rows(miles, employerPence, context) => [{ label, amount }] }
 */
export function renderMileageBox(config, context) {
  if (!box) box = build(config);
  current = { config, context };
  render();
}
