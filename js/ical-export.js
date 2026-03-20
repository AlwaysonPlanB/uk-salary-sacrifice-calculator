/**
 * ical-export.js — iCalendar export and Google Calendar integration
 * ES6 module
 */

import { getProfileDeadlines } from './calendar.js';

/**
 * Escapes a string for iCalendar format.
 * @param {string} str
 * @returns {string}
 */
function escapeICS(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Formats a date string (YYYY-MM-DD) as iCalendar DATE value (YYYYMMDD).
 * @param {string} dateStr
 * @returns {string}
 */
function formatICSDate(dateStr) {
  return dateStr.replace(/-/g, '');
}

/**
 * Returns the next day in YYYYMMDD format (for DTEND of all-day events).
 * @param {string} dateStr — YYYY-MM-DD
 * @returns {string}
 */
function nextDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + m + day;
}

/**
 * Generates an iCalendar timestamp for DTSTAMP.
 * @returns {string}
 */
function nowStamp() {
  const now = new Date();
  return now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Generates a valid .ics file string for the given profile.
 * Filters out monthly and variable deadlines (no fixed date).
 * @param {string} profile
 * @param {string} profileLabel — human-readable profile name for the calendar
 * @returns {string}
 */
export function generateICS(profile, profileLabel) {
  const deadlines = getProfileDeadlines(profile).filter(
    d => d.date !== 'monthly' && d.date !== 'variable'
  );

  const stamp = nowStamp();
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UKTaxCal//Tax Deadlines//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:UK Tax Deadlines - ' + escapeICS(profileLabel)
  ];

  for (const deadline of deadlines) {
    const uid = formatICSDate(deadline.date) + '-' + profile + '-' +
      deadline.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') +
      '@uktaxcal';

    const description = escapeICS(
      deadline.description + '\\n\\nHMRC: ' + deadline.hmrcLink
    );

    lines.push('BEGIN:VEVENT');
    lines.push('DTSTART;VALUE=DATE:' + formatICSDate(deadline.date));
    lines.push('DTEND;VALUE=DATE:' + nextDay(deadline.date));
    lines.push('DTSTAMP:' + stamp);
    lines.push('UID:' + uid);
    lines.push('SUMMARY:' + escapeICS(deadline.title));
    lines.push('DESCRIPTION:' + description);

    // Alarm: 7 days before
    lines.push('BEGIN:VALARM');
    lines.push('TRIGGER:-P7D');
    lines.push('ACTION:DISPLAY');
    lines.push('DESCRIPTION:' + escapeICS(deadline.title) + ' in 7 days');
    lines.push('END:VALARM');

    // Alarm: 1 day before
    lines.push('BEGIN:VALARM');
    lines.push('TRIGGER:-P1D');
    lines.push('ACTION:DISPLAY');
    lines.push('DESCRIPTION:' + escapeICS(deadline.title) + ' is tomorrow');
    lines.push('END:VALARM');

    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Creates and triggers a download of the .ics file.
 * @param {string} profile
 * @param {string} profileLabel
 */
export function downloadICS(profile, profileLabel) {
  const icsContent = generateICS(profile, profileLabel);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'uk-tax-deadlines-' + profile + '.ics';
  document.body.appendChild(anchor);
  anchor.click();

  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Returns a Google Calendar event creation URL for a single deadline.
 * @param {Object} deadline — a deadline object with date, title, description, hmrcLink
 * @returns {string|null} — URL string, or null if deadline has no fixed date
 */
export function googleCalendarLink(deadline) {
  if (deadline.date === 'monthly' || deadline.date === 'variable') {
    return null;
  }

  const dateFormatted = formatICSDate(deadline.date);
  const endFormatted = nextDay(deadline.date);
  const details = deadline.description + '\n\nHMRC Guidance: ' + deadline.hmrcLink;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: deadline.title,
    dates: dateFormatted + '/' + endFormatted,
    details: details
  });

  return 'https://calendar.google.com/calendar/render?' + params.toString();
}
