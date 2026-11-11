import { fireEvent, screen } from 'expo-router/testing-library';

import { activityItem, bank } from '@/test/fake-bank';
import { renderApp } from '@/test/render-app';

const firstPage = {
  items: [activityItem({ id: 'act_1', description: 'First page item' })],
  next_cursor: 'act_1',
  has_more: true,
};
const secondPage = {
  items: [activityItem({ id: 'act_2', description: 'Second page item' })],
  next_cursor: null,
  has_more: false,
};

/** Cursors the app asked for, in order (`null` = first page). */
function requested() {
  return bank.requestsTo('GET /api/merchant/activity').map((url) => url.searchParams.get('cursor'));
}

async function scrollToEnd() {
  fireEvent(await screen.findByTestId('activity-list'), 'endReached');
}

describe('Activity sheet infinite scroll', () => {
  it('loads the next page with the returned cursor when the merchant reaches the end', async () => {
    bank.activityPages = [
      [null, firstPage],
      ['act_1', secondPage],
    ];

    renderApp('/activity');
    expect(await screen.findByText('First page item')).toBeOnTheScreen();

    await scrollToEnd();

    expect(await screen.findByText('Second page item')).toBeOnTheScreen();
    expect(screen.getByText('First page item')).toBeOnTheScreen();
    expect(requested()).toEqual([null, 'act_1']);
  });

  it('stops requesting once there is no more Activity', async () => {
    bank.activityPages = [
      [null, firstPage],
      ['act_1', secondPage],
    ];

    renderApp('/activity');
    await scrollToEnd();
    expect(await screen.findByText('Second page item')).toBeOnTheScreen();

    await scrollToEnd();
    await scrollToEnd();

    expect(requested()).toEqual([null, 'act_1']);
    expect(screen.queryByLabelText('Loading more activity')).not.toBeOnTheScreen();
  });

  it('shows a footer indicator while the next page loads', async () => {
    bank.activityPages = [
      [null, firstPage],
      ['act_1', secondPage],
    ];

    renderApp('/activity');
    await scrollToEnd();

    expect(await screen.findByLabelText('Loading more activity')).toBeOnTheScreen();
    expect(await screen.findByText('Second page item')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Loading more activity')).not.toBeOnTheScreen();
  });

  it('does not request the same page twice while it is still loading', async () => {
    bank.activityPages = [
      [null, firstPage],
      ['act_1', { ...secondPage, delayMs: 50 }],
    ];

    renderApp('/activity');
    const list = await screen.findByTestId('activity-list');
    fireEvent(list, 'endReached');
    fireEvent(list, 'endReached');
    fireEvent(list, 'endReached');

    expect(await screen.findByText('Second page item')).toBeOnTheScreen();
    expect(requested()).toEqual([null, 'act_1']);
  });

  it('keeps loaded items and offers a footer Retry when a later page fails', async () => {
    bank.activityPages = [
      [null, firstPage],
      ['act_1', { status: 500 }],
    ];

    renderApp('/activity');
    await scrollToEnd();

    expect(await screen.findByText("Couldn't load more")).toBeOnTheScreen();
    expect(screen.getByText('First page item')).toBeOnTheScreen();

    bank.activityPages = [
      [null, firstPage],
      ['act_1', secondPage],
    ];
    fireEvent.press(screen.getByRole('button', { name: 'Retry loading more activity' }));

    expect(await screen.findByText('Second page item')).toBeOnTheScreen();
    expect(screen.getByText('First page item')).toBeOnTheScreen();
    expect(screen.queryByText("Couldn't load more")).not.toBeOnTheScreen();
  });

  it('does not retry a failed page on its own when the end is reached again', async () => {
    bank.activityPages = [
      [null, firstPage],
      ['act_1', { status: 500 }],
    ];

    renderApp('/activity');
    await scrollToEnd();
    expect(await screen.findByText("Couldn't load more")).toBeOnTheScreen();

    await scrollToEnd();
    await scrollToEnd();

    expect(requested()).toEqual([null, 'act_1']);
    expect(screen.getByText("Couldn't load more")).toBeOnTheScreen();
  });
});
