import { act, fireEvent, screen } from 'expo-router/testing-library';

import { renderApp } from '@/test/render-app';
import {
  respondWithMalformedMerchant,
  respondWithMerchant,
  respondWithMerchantError,
  merchantFixture,
} from '@/test/msw';

describe('Home', () => {
  it('shows the Available and Pending Balance in the Account Currency', async () => {
    respondWithMerchant({
      available_balance: 500000,
      pending_balance: 25000,
      currency: 'GBP',
      activity: [],
    });

    renderApp();

    expect(await screen.findByLabelText('Available balance £5,000.00')).toBeOnTheScreen();
    expect(screen.getByLabelText('Pending balance £250.00')).toBeOnTheScreen();
  });

  it('shows a loading indicator until the balances arrive', async () => {
    respondWithMerchant();

    renderApp();

    expect(screen.getByLabelText('Loading balances')).toBeOnTheScreen();
    expect(await screen.findByLabelText('Available balance £5,000.00')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Loading balances')).not.toBeOnTheScreen();
  });

  it('shows an error with Retry when the balances fail to load, and recovers on Retry', async () => {
    respondWithMerchantError(500);

    renderApp();

    expect(await screen.findByText("We couldn't load your balances.")).toBeOnTheScreen();

    respondWithMerchant();
    fireEvent.press(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByLabelText('Available balance £5,000.00')).toBeOnTheScreen();
    expect(screen.queryByText("We couldn't load your balances.")).not.toBeOnTheScreen();
  });

  it('shows the error state rather than broken figures when the response is malformed', async () => {
    respondWithMalformedMerchant();

    renderApp();

    expect(await screen.findByText("We couldn't load your balances.")).toBeOnTheScreen();
    expect(screen.queryByLabelText(/Available balance/)).not.toBeOnTheScreen();
  });

  it('refreshes the balances when the merchant pulls down', async () => {
    respondWithMerchant();
    renderApp();
    expect(await screen.findByLabelText('Available balance £5,000.00')).toBeOnTheScreen();

    respondWithMerchant({ ...merchantFixture, available_balance: 600000 });
    await act(() => screen.getByTestId('home-scroll').props.refreshControl.props.onRefresh());

    expect(await screen.findByLabelText('Available balance £6,000.00')).toBeOnTheScreen();
  });
});
