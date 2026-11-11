import type { Currency } from '@/types/api';

const formatters = new Map<Currency, Intl.NumberFormat>();

function formatterFor(currency: Currency): Intl.NumberFormat {
  let formatter = formatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-GB', { style: 'currency', currency });
    formatters.set(currency, formatter);
  }
  return formatter;
}

/** Formats an amount in Minor Units, e.g. 500000 GBP → "£5,000.00". */
export function formatMoney(minorUnits: number, currency: Currency): string {
  return formatterFor(currency).format(minorUnits / 100);
}
