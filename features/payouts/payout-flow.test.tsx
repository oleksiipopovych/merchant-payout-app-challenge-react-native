import { fireEvent, screen } from 'expo-router/testing-library';

import { merchantFixture, respondWithMerchant, respondWithPayout } from '@/test/msw';
import { renderApp } from '@/test/render-app';

function fillForm({ amount = '400', currency = 'GBP', iban = 'GB29NWBK60161331926819' } = {}) {
  fireEvent.changeText(screen.getByLabelText('Amount'), amount);
  if (currency !== 'GBP') {
    fireEvent.press(screen.getByRole('combobox', { name: 'Currency' }));
    fireEvent.press(screen.getByRole('menuitem', { name: currency }));
  }
  fireEvent.changeText(screen.getByLabelText('IBAN'), iban);
  fireEvent.press(screen.getByRole('button', { name: 'Confirm' }));
}

function confirmPayout() {
  fireEvent.press(screen.getByRole('button', { name: 'Confirm payout' }));
}

describe('Payout flow', () => {
  it('summarises the Payout with a masked Destination IBAN before anything is sent', () => {
    renderApp('/payouts');

    fillForm({ amount: '1500.5', currency: 'EUR', iban: 'GB29 NWBK 6016 1331 9268 19' });

    expect(screen.getByRole('header', { name: 'Confirm Payout' })).toBeOnTheScreen();
    expect(screen.getByLabelText('Amount: €1,500.50')).toBeOnTheScreen();
    expect(screen.getByLabelText('Currency: EUR')).toBeOnTheScreen();
    expect(screen.getByLabelText('IBAN ending 6819')).toBeOnTheScreen();
    expect(screen.getByText('GB29 •••• 6819')).toBeOnTheScreen();
  });

  it('returns to the filled-in form when the merchant cancels the summary', () => {
    renderApp('/payouts');

    fillForm({ amount: '400', iban: 'GB29NWBK60161331926819' });
    fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('header', { name: 'Confirm Payout' })).not.toBeOnTheScreen();
    expect(screen.getByLabelText('Amount')).toHaveDisplayValue('400');
    expect(screen.getByLabelText('IBAN')).toHaveDisplayValue('GB29NWBK60161331926819');
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeEnabled();
  });

  it('sends the Payout in Minor Units and shows Completed with the amount and currency', async () => {
    const requests = respondWithPayout({ payoutStatus: 'completed' });
    renderApp('/payouts');

    fillForm({ amount: '400', iban: 'gb29 nwbk 6016 1331 9268 19' });
    confirmPayout();

    expect(await screen.findByRole('header', { name: 'Payout Completed' })).toBeOnTheScreen();
    expect(screen.getByText('Your payout of £400.00 has been processed successfully.')).toBeOnTheScreen();
    expect(requests).toEqual([{ amount: 40000, currency: 'GBP', iban: 'GB29NWBK60161331926819' }]);
  });

  it('shows Failed when the Payout was created but did not succeed', async () => {
    respondWithPayout({ payoutStatus: 'failed' });
    renderApp('/payouts');

    fillForm({ amount: '12.99' });
    confirmPayout();

    expect(await screen.findByRole('header', { name: 'Payout Failed' })).toBeOnTheScreen();
    expect(
      screen.getByText('Your payout of £12.99 could not be completed. No money has left your account.'),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeOnTheScreen();
  });

  it('explains Insufficient Funds when the Payout is Rejected for that reason', async () => {
    respondWithPayout({ httpStatus: 400, error: 'Insufficient funds' });
    renderApp('/payouts');

    fillForm({ amount: '888.88' });
    confirmPayout();

    expect(await screen.findByRole('header', { name: 'Unable to Process Payout' })).toBeOnTheScreen();
    expect(screen.getByText('Insufficient funds.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeOnTheScreen();
  });

  it.each([
    [503, 'Service temporarily unavailable', 'Service temporarily unavailable. Please try again later.'],
    [500, 'Internal Server Error', 'Service temporarily unavailable. Please try again later.'],
    [400, 'Invalid IBAN', "We couldn't process this payout. Please check the details and try again."],
    [422, 'Unprocessable', "We couldn't process this payout. Please check the details and try again."],
  ])('shows a general Rejected message for a %i', async (httpStatus, error, message) => {
    respondWithPayout({ httpStatus, error });
    renderApp('/payouts');

    fillForm({ amount: '999.99' });
    confirmPayout();

    expect(await screen.findByRole('header', { name: 'Unable to Process Payout' })).toBeOnTheScreen();
    expect(screen.getByText(message)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeOnTheScreen();
  });

  it('shows Unconfirmed when the network fails, steering the merchant to check Activity first', async () => {
    respondWithPayout({ networkError: true });
    renderApp('/payouts');

    fillForm({ amount: '400' });
    confirmPayout();

    expect(await screen.findByRole('header', { name: 'Payout Not Confirmed' })).toBeOnTheScreen();
    expect(
      screen.getByText(
        "We couldn't confirm whether your payout was sent. Check your recent activity before trying again.",
      ),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Back to Payout' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Try Again' })).not.toBeOnTheScreen();
  });

  it('returns to the form with the details intact after Try Again', async () => {
    respondWithPayout({ httpStatus: 503, error: 'Service temporarily unavailable' });
    renderApp('/payouts');

    fillForm({ amount: '999.99', currency: 'EUR', iban: 'GB29NWBK60161331926819' });
    confirmPayout();
    fireEvent.press(await screen.findByRole('button', { name: 'Try Again' }));

    expect(screen.getByLabelText('Amount')).toHaveDisplayValue('999.99');
    expect(screen.getByRole('combobox', { name: 'Currency' })).toHaveAccessibilityValue({ text: 'EUR' });
    expect(screen.getByLabelText('IBAN')).toHaveDisplayValue('GB29NWBK60161331926819');
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeEnabled();
  });

  it('clears the form and refreshes the balances after Create Another Payout', async () => {
    respondWithMerchant();
    respondWithPayout({ payoutStatus: 'completed' });
    renderApp('/');
    expect(await screen.findByLabelText('Available balance £5,000.00')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: /^Payouts, tab/ }));
    fillForm({ amount: '400' });
    confirmPayout();
    respondWithMerchant({ ...merchantFixture, available_balance: 460000 });
    fireEvent.press(await screen.findByRole('button', { name: 'Create Another Payout' }));

    expect(screen.getByLabelText('Amount')).toHaveDisplayValue('');
    expect(screen.getByLabelText('IBAN')).toHaveDisplayValue('');

    fireEvent.press(screen.getByRole('button', { name: /^Home, tab/ }));
    expect(await screen.findByLabelText('Available balance £4,600.00')).toBeOnTheScreen();
  });

  it('refreshes the balances after an Unconfirmed Payout, which may have gone through', async () => {
    respondWithMerchant();
    respondWithPayout({ networkError: true });
    renderApp('/');
    expect(await screen.findByLabelText('Available balance £5,000.00')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: /^Payouts, tab/ }));
    fillForm({ amount: '400' });
    respondWithMerchant({ ...merchantFixture, available_balance: 460000 });
    confirmPayout();
    await screen.findByRole('header', { name: 'Payout Not Confirmed' });

    fireEvent.press(screen.getByRole('button', { name: /^Home, tab/ }));
    expect(await screen.findByLabelText('Available balance £4,600.00')).toBeOnTheScreen();
  });

  it('locks the summary while sending so a double press sends one Payout', async () => {
    const requests = respondWithPayout({ payoutStatus: 'completed', delayMs: 50 });
    renderApp('/payouts');

    fillForm({ amount: '400' });
    const confirm = screen.getByRole('button', { name: 'Confirm payout' });
    fireEvent.press(confirm);
    fireEvent.press(confirm);

    expect(screen.getByRole('button', { name: 'Confirm payout' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Confirm payout' })).toBeBusy();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();

    expect(await screen.findByRole('header', { name: 'Payout Completed' })).toBeOnTheScreen();
    expect(requests).toHaveLength(1);
  });
});
