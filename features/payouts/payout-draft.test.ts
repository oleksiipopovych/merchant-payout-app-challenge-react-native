import { validatePayoutDraft } from './payout-draft';

describe('validatePayoutDraft', () => {
  it('turns valid form input into a Payout draft in Minor Units with a normalised IBAN', () => {
    expect(
      validatePayoutDraft({ amount: '1000', currency: 'EUR', iban: 'gb29 nwbk 6016 1331 9268 19' }),
    ).toEqual({
      ok: true,
      draft: { amount: 100000, currency: 'EUR', iban: 'GB29NWBK60161331926819' },
    });
  });

  it.each([
    ['', 'Enter an amount'],
    ['abc', 'Enter a valid amount, e.g. 125.50'],
    ['1.005', 'Use at most 2 decimal places'],
    ['0', 'Amount must be more than zero'],
  ])('explains an invalid amount %j', (amount, message) => {
    expect(validatePayoutDraft({ amount, currency: 'GBP', iban: 'GB29NWBK60161331926819' })).toEqual({
      ok: false,
      errors: { amount: message },
    });
  });

  it.each([
    ['', 'Enter the destination IBAN'],
    ['GB29-NWBK', 'An IBAN contains only letters and numbers'],
    ['ZZ29NWBK60161331926819', "This IBAN's country code isn't recognised"],
    ['FR1212345123451234567A12310131231231231', 'A FR IBAN has 27 characters'],
    ['GB28NWBK60161331926819', "This IBAN isn't valid. Check it for typos"],
  ])('explains an invalid IBAN %j', (iban, message) => {
    expect(validatePayoutDraft({ amount: '10', currency: 'GBP', iban })).toEqual({
      ok: false,
      errors: { iban: message },
    });
  });

  it('reports every invalid field at once', () => {
    expect(validatePayoutDraft({ amount: '', currency: 'GBP', iban: '' })).toEqual({
      ok: false,
      errors: { amount: 'Enter an amount', iban: 'Enter the destination IBAN' },
    });
  });
});
