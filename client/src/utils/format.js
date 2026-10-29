// Change the currency for the whole app here.
const CURRENCY = 'USD';
const LOCALE = 'en-US';

const priceFormatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY });

/** 12.5 -> "$12.50" */
export function formatPrice(value) {
  return priceFormatter.format(Number(value) || 0);
}

/** ISO date -> "29 Oct 2026, 14:05" */
export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** MongoDB id -> short order number shown to people, e.g. "#A1B2C3" */
export function shortId(id = '') {
  return `#${String(id).slice(-6).toUpperCase()}`;
}
