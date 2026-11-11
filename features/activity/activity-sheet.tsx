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
          data={items}
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
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  separator: { height: StyleSheet.hairlineWidth, opacity: 0.4 },
});
