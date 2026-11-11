import { isHighValuePayout } from './high-value';

describe('isHighValuePayout', () => {
  it.each([
    [100000, 'GBP', false],
    [99999, 'GBP', false],
    [100001, 'GBP', true],
    [500000, 'GBP', true],
    [100000, 'EUR', false],
    [100001, 'EUR', true],
  ] as const)('%i Minor Units in %s → %s', (amount, currency, expected) => {
    expect(isHighValuePayout({ amount, currency })).toBe(expected);
  });
});
