import { fireEvent, screen } from 'expo-router/testing-library';

import { activityItem, merchantFixture, respondWithActivityPage, respondWithMerchant } from '@/test/msw';
import { openActivitySheet } from '@/test/app-driver';
import { renderApp } from '@/test/render-app';

describe('Home → Activity sheet', () => {
  it('opens the Recent Activity sheet from "show more"', async () => {
    respondWithMerchant({ ...merchantFixture, activity: [activityItem({ id: 'a' })] });
    respondWithActivityPage({ items: [], next_cursor: null, has_more: false });

    renderApp();
    await openActivitySheet();

    expect(await screen.findByRole('header', { name: 'Recent Activity' })).toBeOnTheScreen();
    expect(screen).toHavePathname('/activity');
  });

  it('closes the sheet with Done and returns to Home', async () => {
    respondWithMerchant({ ...merchantFixture, activity: [activityItem({ id: 'a' })] });
    respondWithActivityPage({ items: [], next_cursor: null, has_more: false });

    renderApp();
    await openActivitySheet();
    fireEvent.press(await screen.findByRole('button', { name: 'Done' }));

    expect(screen).toHavePathname('/');
  });
});
