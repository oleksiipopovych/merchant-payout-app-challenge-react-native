import { fireEvent, screen } from 'expo-router/testing-library';

import { activityItem, respondWithActivityError, respondWithActivityPage } from '@/test/msw';
import { renderApp } from '@/test/render-app';

describe('Activity sheet', () => {
  it('loads the first page of Activity and shows type, description, amount, date and status', async () => {
    const requests = respondWithActivityPage({
      items: [
        activityItem({
          id: 'act_1',
          type: 'refund',
          description: 'Refund to Customer MYK',
          amount: -21970,
          date: '2026-01-23T12:00:00.000Z',
          status: 'completed',
        }),
        activityItem({
          id: 'act_2',
          type: 'deposit',
          description: 'Payment from Customer RIZ',
          amount: 17092,
          date: '2026-01-22T12:00:00.000Z',
          status: 'pending',
        }),
      ],
      next_cursor: 'act_2',
      has_more: true,
    });

    renderApp('/activity');

    const rows = await screen.findAllByLabelText(/^Activity item: /);
    expect(rows.map((row) => row.props.accessibilityLabel)).toEqual([
      'Activity item: Refund, Refund to Customer MYK, -£219.70, 23 Jan 2026, Completed',
      'Activity item: Deposit, Payment from Customer RIZ, £170.92, 22 Jan 2026, Pending',
    ]);
    expect(requests).toHaveLength(1);
    expect(requests[0].searchParams.get('cursor')).toBeNull();
    expect(requests[0].searchParams.get('limit')).toBe('15');
  });

  it('shows a loading state until the first page arrives', async () => {
    respondWithActivityPage({ items: [activityItem({ id: 'a' })], next_cursor: null, has_more: false });

    renderApp('/activity');

    expect(screen.getByLabelText('Loading activity')).toBeOnTheScreen();
    expect(await screen.findAllByLabelText(/^Activity item: /)).toHaveLength(1);
    expect(screen.queryByLabelText('Loading activity')).not.toBeOnTheScreen();
  });

  it('shows a full-screen error with Retry when the first page fails, and recovers', async () => {
    respondWithActivityError(500);

    renderApp('/activity');

    expect(await screen.findByText("We couldn't load your activity.")).toBeOnTheScreen();

    respondWithActivityPage({ items: [activityItem({ id: 'a' })], next_cursor: null, has_more: false });
    fireEvent.press(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findAllByLabelText(/^Activity item: /)).toHaveLength(1);
    expect(screen.queryByText("We couldn't load your activity.")).not.toBeOnTheScreen();
  });
});
