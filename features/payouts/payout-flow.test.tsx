import { fireEvent, screen } from 'expo-router/testing-library';

import { bank, merchantFixture } from '@/test/fake-bank';
import {
  confirmPayout,
  fillPayoutForm,
  goToTab,
  reviewPayout,
  sendPayout,
} from '@/test/app-driver';
import { renderApp } from '@/test/render-app';

describe('Payout flow', () => {
  it('summarises the Payout with a masked Destination IBAN before anything is sent', () => {
    renderApp('/payouts');

    fillPayoutForm({ amount: '1500.5', currency: 'EUR', iban: 'GB29 NWBK 6016 1331 9268 19' });
    reviewPayout();

    expect(screen.getByRole('header', { name: 'Confirm Payout' })).toBeOnTheScreen();
    expect(screen.getByLabelText('Amount: €1,500.50')).toBeOnTheScreen();
    expect(screen.getByLabelText('Currency: EUR')).toBeOnTheScreen();
    expect(screen.getByLabelText('IBAN ending 6819')).toBeOnTheScreen();
    expect(screen.getByText('GB29 •••• 6819')).toBeOnTheScreen();
  });

  it('returns to the filled-in form when the merchant cancels the summary', () => {
    renderApp('/payouts');

    fillPayoutForm({ amount: '400', iban: 'GB29NWBK60161331926819' });
    reviewPayout();
    fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('header', { name: 'Confirm Payout' })).not.toBeOnTheScreen();
    expect(screen.getByLabelText('Amount')).toHaveDisplayValue('400');
    expect(screen.getByLabelText('IBAN')).toHaveDisplayValue('GB29NWBK60161331926819');
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeEnabled();
  });

  it('sends the Payout in Minor Units and shows Completed with the amount and currency', async () => {
    bank.payoutReply = { payoutStatus: 'completed' };
    const requests = bank.requestsTo('POST /api/payouts');
    renderApp('/payouts');

    sendPayout({ amount: '400', iban: 'gb29 nwbk 6016 1331 9268 19' });

    expect(await screen.findByRole('header', { name: 'Payout Completed' })).toBeOnTheScreen();
    expect(
      screen.getByText('Your payout of £400.00 has been processed successfully.'),
    ).toBeOnTheScreen();
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      amount: 40000,
      currency: 'GBP',
      iban: 'GB29NWBK60161331926819',
    });
  });

  it('shows Failed when the Payout was created but did not succeed', async () => {
    bank.payoutReply = { payoutStatus: 'failed' };
    renderApp('/payouts');

    sendPayout({ amount: '12.99' });

    expect(await screen.findByRole('header', { name: 'Payout Failed' })).toBeOnTheScreen();
    expect(
      screen.getByText(
        'Your payout of £12.99 could not be completed. No money has left your account.',
      ),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeOnTheScreen();
  });

  it('explains Insufficient Funds when the Payout is Rejected for that reason', async () => {
    bank.payoutReply = { status: 400, error: 'Insufficient funds' };
    renderApp('/payouts');

    sendPayout({ amount: '888.88' });

    expect(
      await screen.findByRole('header', { name: 'Unable to Process Payout' }),
    ).toBeOnTheScreen();
    expect(screen.getByText('Insufficient funds.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeOnTheScreen();
  });

  it.each([
    [
      503,
      'Service temporarily unavailable',
      'Service temporarily unavailable. Please try again later.',
    ],
    [500, 'Internal Server Error', 'Service temporarily unavailable. Please try again later.'],
    [
      400,
      'Invalid IBAN',
      "We couldn't process this payout. Please check the details and try again.",
    ],
    [
      422,
      'Unprocessable',
      "We couldn't process this payout. Please check the details and try again.",
    ],
  ])('shows a general Rejected message for a %i', async (httpStatus, error, message) => {
    bank.payoutReply = { status: httpStatus, error };
    renderApp('/payouts');

    sendPayout({ amount: '999.99' });

    expect(
      await screen.findByRole('header', { name: 'Unable to Process Payout' }),
    ).toBeOnTheScreen();
    expect(screen.getByText(message)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeOnTheScreen();
  });

  it('shows Unconfirmed when the network fails, steering the merchant to check Activity first', async () => {
    bank.payoutReply = { networkError: true };
    renderApp('/payouts');

    sendPayout({ amount: '400' });

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
    bank.payoutReply = { status: 503, error: 'Service temporarily unavailable' };
    renderApp('/payouts');

    sendPayout({ amount: '999.99', currency: 'EUR', iban: 'GB29NWBK60161331926819' });
    fireEvent.press(await screen.findByRole('button', { name: 'Try Again' }));

    expect(screen.getByLabelText('Amount')).toHaveDisplayValue('999.99');
    expect(screen.getByRole('combobox', { name: 'Currency' })).toHaveAccessibilityValue({
      text: 'EUR',
    });
    expect(screen.getByLabelText('IBAN')).toHaveDisplayValue('GB29NWBK60161331926819');
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeEnabled();
  });

  it('clears the form and refreshes the balances after Create Another Payout', async () => {
    bank.payoutReply = { payoutStatus: 'completed' };
    renderApp('/');
    expect(await screen.findByLabelText('Available balance £5,000.00')).toBeOnTheScreen();

    goToTab('Payouts');
    sendPayout({ amount: '400' });
    bank.merchant = { ...merchantFixture, available_balance: 460000 };
    fireEvent.press(await screen.findByRole('button', { name: 'Create Another Payout' }));

    expect(screen.getByLabelText('Amount')).toHaveDisplayValue('');
    expect(screen.getByLabelText('IBAN')).toHaveDisplayValue('');

    goToTab('Home');
    expect(await screen.findByLabelText('Available balance £4,600.00')).toBeOnTheScreen();
  });

  it('refreshes the balances after an Unconfirmed Payout, which may have gone through', async () => {
    bank.payoutReply = { networkError: true };
    renderApp('/');
    expect(await screen.findByLabelText('Available balance £5,000.00')).toBeOnTheScreen();

    goToTab('Payouts');
    fillPayoutForm({ amount: '400' });
    reviewPayout();
    bank.merchant = { ...merchantFixture, available_balance: 460000 };
    confirmPayout();
    await screen.findByRole('header', { name: 'Payout Not Confirmed' });

    goToTab('Home');
    expect(await screen.findByLabelText('Available balance £4,600.00')).toBeOnTheScreen();
  });

  it('locks the summary while sending so a double press sends one Payout', async () => {
    bank.payoutReply = { payoutStatus: 'completed', delayMs: 50 };
    const requests = bank.requestsTo('POST /api/payouts');
    renderApp('/payouts');

    fillPayoutForm({ amount: '400' });
    reviewPayout();
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
