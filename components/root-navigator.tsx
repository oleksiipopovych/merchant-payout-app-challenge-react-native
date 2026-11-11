import { Stack } from 'expo-router';

export function RootNavigator() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="activity" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
