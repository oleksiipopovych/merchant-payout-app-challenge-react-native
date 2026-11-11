import { maskIban, validateIban } from './iban';

describe('validateIban', () => {
  it.each([
    ['GB29NWBK60161331926819', 'GB29NWBK60161331926819'],
    ['gb29 nwbk 6016 1331 9268 19', 'GB29NWBK60161331926819'],
    ['DE89370400440532013000', 'DE89370400440532013000'],
    ['FR1420041010050500013M02606', 'FR1420041010050500013M02606'],
    ['NL91ABNA0417164300', 'NL91ABNA0417164300'],
    ['  IE29 AIBK 9311 5212 3456 78 ', 'IE29AIBK93115212345678'],
  ])('accepts %j as %s', (input, iban) => {
    expect(validateIban(input)).toEqual({ ok: true, iban });
  });

  it.each([
    ['', 'empty'],
    ['   ', 'empty'],
    ['FR1212345123451234567A12310131231231231', 'wrong-length'],
    ['GB29NWBK6016133192681', 'wrong-length'],
    ['GB29-NWBK-6016-1331-9268-19', 'invalid-characters'],
    ['ZZ29NWBK60161331926819', 'unsupported-country'],
    ['GB28NWBK60161331926819', 'bad-checksum'],
    ['GB29NWBK60161331926818', 'bad-checksum'],
    ['1229NWBK60161331926819', 'unsupported-country'],
  ])('rejects %j as %s', (input, reason) => {
    expect(validateIban(input)).toMatchObject({ ok: false, reason });
  });

  it('reports the expected length for the country', () => {
    expect(validateIban('GB29NWBK6016133192681')).toEqual({
      ok: false,
      reason: 'wrong-length',
      country: 'GB',
      expectedLength: 22,
    });
  });
});

describe('maskIban', () => {
  it('keeps the first and last four characters behind a fixed mask', () => {
    expect(maskIban('GB29NWBK60161331926819')).toEqual({
      display: 'GB29 •••• 6819',
      accessibilityLabel: 'IBAN ending 6819',
    });
  });
});
