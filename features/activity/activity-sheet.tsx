import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ErrorState } from '@/components/error-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

import { ActivityRow } from './activity-row';
import { useActivityPages } from './use-activity-pages';

export function ActivitySheet() {
  const tint = useThemeColor({}, 'tint');
  const separatorColor = useThemeColor({}, 'icon');
  const activity = useActivityPages();
  const items = activity.data?.pages.flatMap((page) => page.items) ?? [];

  // `cancelRefetch: false` makes repeated end-reached events reuse the running fetch
  // instead of cancelling it and requesting the same page again.
  const loadMore = () => {
    if (activity.hasNextPage) {
      activity.fetchNextPage({ cancelRefetch: false });
    }
  };

  // After a failed page, the footer swapping spinner → error changes the content height,
  // which can fire onEndReached again. Leave retrying to the explicit Retry button so a
  // persistent failure can't loop.
  const onEndReached = () => {
    if (!activity.isFetchNextPageError) {
      loadMore();
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.header}>
        <ThemedText type="title" accessibilityRole="header">
          Recent Activity
        </ThemedText>
        <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={12}>
          <ThemedText type="defaultSemiBold" style={{ color: tint }}>
            Done
          </ThemedText>
        </Pressable>
      </View>
      {activity.isPending ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" accessibilityLabel="Loading activity" />
        </View>
      ) : activity.isError && items.length === 0 ? (
        <View style={styles.centered}>
          <ErrorState
            message="We couldn't load your activity."
            onRetry={() => activity.refetch()}
          />
        </View>
      ) : (
        <FlatList
          testID="activity-list"
          data={items}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            activity.isFetchingNextPage ? (
              <ActivityIndicator style={styles.footer} accessibilityLabel="Loading more activity" />
            ) : activity.isFetchNextPageError ? (
              <View style={[styles.footer, styles.footerError]} accessibilityLiveRegion="polite">
                <ThemedText>Couldn&apos;t load more</ThemedText>
                <ThemedText> · </ThemedText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Retry loading more activity"
                  onPress={loadMore}
                  hitSlop={12}>
                  <ThemedText type="defaultSemiBold" style={{ color: tint }}>
                    Retry
                  </ThemedText>
                </Pressable>
              </View>
            ) : null
          }
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ActivityRow item={item} />}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: separatorColor }]} />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  footer: { paddingVertical: 16 },
  footerError: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  separator: { height: StyleSheet.hairlineWidth, opacity: 0.4 },
});
