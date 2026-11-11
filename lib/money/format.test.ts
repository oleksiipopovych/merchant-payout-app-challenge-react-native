import { formatMoney } from './format';

describe('formatMoney', () => {
  it.each([
    [500000, 'GBP', '£5,000.00'],
    [25000, 'GBP', '£250.00'],
    [99999, 'GBP', '£999.99'],
    [150000, 'EUR', '€1,500.00'],
    [-21970, 'GBP', '-£219.70'],
    [-2500, 'EUR', '-€25.00'],
    [0, 'GBP', '£0.00'],
    [1, 'GBP', '£0.01'],
  ] as const)('formats %i %s Minor Units as %s', (minorUnits, currency, expected) => {
    expect(formatMoney(minorUnits, currency)).toBe(expected);
  });
});
