import { QueryClient } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import 'react-native-reanimated';

import { AppProviders } from '@/components/app-providers';
import { RootNavigator } from '@/components/root-navigator';
import { useMSW } from '../mocks/useMSW';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  // Initialize MSW in development mode and wait for it to be ready
  const isMSWReady = useMSW();

  // Don't render the app until MSW is ready (in dev mode)
  if (!isMSWReady) {
    return null;
  }

  return (
    <AppProviders queryClient={queryClient}>
      <RootNavigator />
      <StatusBar style="auto" />
    </AppProviders>
  );
}
