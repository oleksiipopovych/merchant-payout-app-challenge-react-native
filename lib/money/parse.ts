export type AmountError = 'empty' | 'invalid' | 'too-many-decimals' | 'not-positive';

export type ParsedAmount = { ok: true; minorUnits: number } | { ok: false; reason: AmountError };

// Digits with an optional "." or "," decimal part, or a bare decimal part (".5").
const AMOUNT_PATTERN = /^(?:(\d+)(?:[.,](\d*))?|[.,](\d+))$/;

/**
 * Parses what the merchant typed into Minor Units without floating-point maths,
 * so "999.99" is exactly 99999. Accepts "." or "," as the decimal separator.
 */
export function parseAmount(input: string): ParsedAmount {
  const text = input.trim();
  if (text === '') return { ok: false, reason: 'empty' };

  const match = AMOUNT_PATTERN.exec(text);
  if (!match) return { ok: false, reason: 'invalid' };

  const whole = match[1] ?? '0';
  const fraction = match[2] ?? match[3] ?? '';
  if (fraction.length > 2) return { ok: false, reason: 'too-many-decimals' };

  const minorUnits = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(minorUnits)) {
    return { ok: false, reason: 'invalid' };
  }
  if (minorUnits === 0) return { ok: false, reason: 'not-positive' };

  return { ok: true, minorUnits };
}
