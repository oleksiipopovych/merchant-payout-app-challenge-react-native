import { fireEvent, screen } from 'expo-router/testing-library';

import { renderApp } from '@/test/render-app';

function confirmButton() {
  return screen.getByRole('button', { name: 'Confirm' });
}

describe('Payout form', () => {
  it('enables Confirm only once the amount and Destination IBAN are valid', () => {
    renderApp('/payouts');

    expect(confirmButton()).toBeDisabled();

    fireEvent.changeText(screen.getByLabelText('Amount'), '400');
    expect(confirmButton()).toBeDisabled();

    fireEvent.changeText(screen.getByLabelText('IBAN'), 'GB29 NWBK 6016 1331 9268 19');
    expect(confirmButton()).toBeEnabled();
  });

  it.each([
    ['a zero amount', '0', 'GB29NWBK60161331926819'],
    ['an amount with too many decimals', '10.005', 'GB29NWBK60161331926819'],
    ["the README's invalid IBAN", '400', 'FR1212345123451234567A12310131231231231'],
    ['an IBAN with a bad checksum', '400', 'GB28NWBK60161331926819'],
  ])('keeps Confirm disabled for %s', (_case, amount, iban) => {
    renderApp('/payouts');

    fireEvent.changeText(screen.getByLabelText('Amount'), amount);
    fireEvent.changeText(screen.getByLabelText('IBAN'), iban);

    expect(confirmButton()).toBeDisabled();
  });

  it('shows a field error only after the merchant leaves the field', () => {
    renderApp('/payouts');
    const iban = screen.getByLabelText('IBAN');

    fireEvent.changeText(iban, 'FR1212345123451234567A12310131231231231');
    expect(screen.queryByText('A FR IBAN has 27 characters')).not.toBeOnTheScreen();

    fireEvent(iban, 'blur');
    expect(screen.getByText('A FR IBAN has 27 characters')).toBeOnTheScreen();

    fireEvent.changeText(iban, 'GB29NWBK60161331926819');
    expect(screen.queryByText('A FR IBAN has 27 characters')).not.toBeOnTheScreen();
  });

  it('does not flag an untouched field', () => {
    renderApp('/payouts');

    fireEvent.changeText(screen.getByLabelText('Amount'), '0');
    fireEvent(screen.getByLabelText('Amount'), 'blur');

    expect(screen.getByText('Amount must be more than zero')).toBeOnTheScreen();
    expect(screen.queryByText('Enter the destination IBAN')).not.toBeOnTheScreen();
  });

  it('defaults the Payout Currency to GBP and lets the merchant choose EUR', () => {
    renderApp('/payouts');

    const currency = screen.getByRole('combobox', { name: 'Currency' });
    expect(currency).toHaveAccessibilityValue({ text: 'GBP' });

    fireEvent.press(currency);
    fireEvent.press(screen.getByRole('menuitem', { name: 'EUR' }));

    expect(screen.getByRole('combobox', { name: 'Currency' })).toHaveAccessibilityValue({ text: 'EUR' });
    expect(screen.queryByRole('menuitem', { name: 'GBP' })).not.toBeOnTheScreen();
  });
});
