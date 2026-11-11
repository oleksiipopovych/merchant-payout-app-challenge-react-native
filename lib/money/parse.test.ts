import { parseAmount } from './parse';

describe('parseAmount', () => {
  it.each([
    ['400', 40000],
    ['999.99', 99999],
    ['888.88', 88888],
    ['1000', 100000],
    ['1000.01', 100001],
    ['1,5', 150],
    ['0,01', 1],
    ['12.3', 1230],
    ['12.', 1200],
    ['.5', 50],
    ['  42.10  ', 4210],
    ['1.10', 110],
    ['0.29', 29],
  ])('parses %j to %i Minor Units', (input, minorUnits) => {
    expect(parseAmount(input)).toEqual({ ok: true, minorUnits });
  });

  it.each([
    ['', 'empty'],
    ['   ', 'empty'],
    ['abc', 'invalid'],
    ['-5', 'invalid'],
    ['1.2.3', 'invalid'],
    ['1 000', 'invalid'],
    ['1e3', 'invalid'],
    ['99999999999999999999', 'invalid'],
    ['1.005', 'too-many-decimals'],
    ['1,000', 'too-many-decimals'],
    ['0', 'not-positive'],
    ['0.00', 'not-positive'],
  ])('rejects %j as %s', (input, reason) => {
    expect(parseAmount(input)).toEqual({ ok: false, reason });
  });
});
