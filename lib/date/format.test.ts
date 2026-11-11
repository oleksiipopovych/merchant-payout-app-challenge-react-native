import { formatActivityDate } from './format';

describe('formatActivityDate', () => {
  it.each([
    ['2026-01-23T12:00:00.000Z', '23 Jan 2026'],
    ['2026-09-05T12:00:00.000Z', '05 Sep 2026'],
    ['2025-12-31T12:00:00.000Z', '31 Dec 2025'],
  ])('formats %s as %s', (iso, expected) => {
    expect(formatActivityDate(iso)).toBe(expected);
  });
});
