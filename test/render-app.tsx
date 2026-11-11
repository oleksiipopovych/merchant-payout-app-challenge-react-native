/**
 * Renders the real app routes under a fresh QueryClient, starting at `initialUrl`.
 */
import { QueryClient } from '@tanstack/react-query';
import { renderRouter } from 'expo-router/testing-library';

import TabLayout from '@/app/(tabs)/_layout';
import HomeScreen from '@/app/(tabs)/index';
import PayoutsScreen from '@/app/(tabs)/payouts';
import ActivityRoute from '@/app/activity';
import { AppProviders } from '@/components/app-providers';
import { RootNavigator } from '@/components/root-navigator';

export function renderApp(initialUrl = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });

  function TestRootLayout() {
    return (
      <AppProviders queryClient={queryClient}>
        <RootNavigator />
      </AppProviders>
    );
  }

  return renderRouter(
    {
      _layout: TestRootLayout,
      '(tabs)/_layout': TabLayout,
      '(tabs)/index': HomeScreen,
      '(tabs)/payouts': PayoutsScreen,
      activity: ActivityRoute,
    },
    { initialUrl },
  );
}
