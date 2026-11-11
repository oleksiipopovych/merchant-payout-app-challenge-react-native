import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { ErrorState } from '@/components/error-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { BalanceCard } from './balance-card';
import { RecentActivity } from './recent-activity';
import { useMerchant } from './use-merchant';

export function HomeScreen() {
  const merchant = useMerchant();
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsPullRefreshing(true);
    try {
      await merchant.refetch();
    } finally {
      setIsPullRefreshing(false);
    }
  }, [merchant]);

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        testID="home-scroll"
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isPullRefreshing} onRefresh={onRefresh} />}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Business Account</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Account Balance</ThemedText>
          {merchant.isPending && <ActivityIndicator accessibilityLabel="Loading balances" />}
          {merchant.isError && (
            <ErrorState
              message="We couldn't load your balances."
              onRetry={() => merchant.refetch()}
            />
          )}
          {merchant.data && (
            <BalanceCard
              availableBalance={merchant.data.available_balance}
              pendingBalance={merchant.data.pending_balance}
              currency={merchant.data.currency}
            />
          )}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Recent Activity</ThemedText>
          {merchant.data && (
            <RecentActivity
              activity={merchant.data.activity}
              onShowMore={() => router.push('/activity')}
            />
          )}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16 },
  header: { marginBottom: 24 },
  section: { marginBottom: 24, gap: 12 },
});
