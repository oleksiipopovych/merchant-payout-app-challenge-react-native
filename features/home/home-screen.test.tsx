import { act, fireEvent, screen } from 'expo-router/testing-library';

import { renderApp } from '@/test/render-app';
import {
  respondWithMalformedMerchant,
  respondWithMerchant,
  respondWithMerchantError,
  merchantFixture,
  activityItem,
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

  it('lists the three most recent Activity Items with description and signed amount', async () => {
    respondWithMerchant({
      ...merchantFixture,
      activity: [
        activityItem({ id: 'oldest', date: '2026-01-19T09:00:00.000Z', description: 'Monthly service fee', type: 'fee', amount: -2500 }),
        activityItem({ id: 'newest', date: '2026-01-23T16:00:00.000Z', description: 'Refund to Customer MYK', type: 'refund', amount: -21970 }),
        activityItem({ id: 'third', date: '2026-01-21T12:00:00.000Z', description: 'Payment from Customer RIZ', amount: 17092 }),
        activityItem({ id: 'second', date: '2026-01-22T08:00:00.000Z', description: 'Payout to Bank Account ****0117', type: 'payout', amount: -187515 }),
      ],
    });

    renderApp();

    const rows = await screen.findAllByLabelText(/^Activity: /);
    expect(rows.map((row) => row.props.accessibilityLabel)).toEqual([
      'Activity: Refund to Customer MYK, -£219.70',
      'Activity: Payout to Bank Account ****0117, -£1,875.15',
      'Activity: Payment from Customer RIZ, £170.92',
    ]);
    expect(screen.queryByText('Monthly service fee')).not.toBeOnTheScreen();
  });

  it('offers a "show more" button under the recent Activity', async () => {
    respondWithMerchant({ ...merchantFixture, activity: [activityItem({ id: 'a' })] });

    renderApp();

    expect(await screen.findByRole('button', { name: 'Show more activity' })).toBeOnTheScreen();
  });
});
