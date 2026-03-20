import { formatCurrency } from './tax-engine.js';

export function wireRealTimeCalc(containerSelector, calcFn) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const inputs = container.querySelectorAll('input, select');
  inputs.forEach((input) => {
    input.addEventListener('input', () => {
      try {
        calcFn();
      } catch (e) {
        // silently catch calculation errors during input
      }
    });
    input.addEventListener('change', () => {
      try {
        calcFn();
      } catch (e) {
        // silently catch calculation errors during change
      }
    });
  });

  try {
    calcFn();
  } catch (e) {
    // silently catch initial calculation errors
  }
}

export function setResult(id, value, options = {}) {
  const el = document.getElementById(id);
  if (!el) return;

  const { format, suffix = '' } = options;
  let text;

  switch (format) {
    case 'currency':
      text = formatCurrency(value);
      break;
    case 'currencyMonthly':
      text = formatCurrency(value) + '/mo';
      break;
    case 'percent':
      text = (value * 100).toFixed(1) + '%';
      break;
    case 'number':
      text = value.toLocaleString('en-GB');
      break;
    case 'text':
    default:
      text = String(value);
      break;
  }

  el.textContent = text + suffix;
}

export function getNumericInput(id, defaultVal = 0) {
  const el = document.getElementById(id);
  if (!el) return defaultVal;

  const cleaned = el.value.replace(/[£,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? defaultVal : parsed;
}

export function getSelectValue(id, defaultVal = '') {
  const el = document.getElementById(id);
  if (!el) return defaultVal;
  return el.value || defaultVal;
}

export function getCheckbox(id) {
  const el = document.getElementById(id);
  if (!el) return false;
  return el.checked;
}

export function renderWarnings(containerId, warnings) {
  const container = document.getElementById(containerId);
  if (!container) return;

  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  warnings.forEach((warning) => {
    const div = document.createElement('div');
    div.className = 'warning active ' + warning.severity;

    const strong = document.createElement('strong');
    strong.textContent = warning.title;
    div.appendChild(strong);

    const message = document.createTextNode(warning.message);
    div.appendChild(message);

    container.appendChild(div);
  });
}

export function showIf(id, condition) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = condition ? '' : 'none';
}

export function setupCollapsibles() {
  const headers = document.querySelectorAll('.collapsible-header');
  headers.forEach((header) => {
    header.addEventListener('click', () => {
      header.classList.toggle('open');
      const body = header.nextElementSibling;
      if (body && body.classList.contains('collapsible-body')) {
        body.classList.toggle('open');
      }
    });
  });
}

export function updateMobileSummary(yearlyTakeHome, monthlyTakeHome) {
  const summary = document.getElementById('mobileSummary');
  if (!summary) return;

  const yearly = summary.querySelector('.summary-yearly');
  const monthly = summary.querySelector('.summary-monthly');

  if (yearly) yearly.textContent = formatCurrency(yearlyTakeHome);
  if (monthly) monthly.textContent = formatCurrency(monthlyTakeHome);
}

export function setupTabs(tabContainerId, onTabChange) {
  const container = document.getElementById(tabContainerId);
  if (!container) return;

  const tabs = container.querySelectorAll('.tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      onTabChange(tab.dataset.tab);
    });
  });
}

export function setupTheme() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  toggle.textContent = saved === 'dark' ? 'Light Mode' : 'Dark Mode';

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    toggle.textContent = next === 'dark' ? 'Light Mode' : 'Dark Mode';
  });
}
