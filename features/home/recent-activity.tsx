import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ActivityAmount } from '@/features/activity/activity-amount';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatMoney } from '@/lib/money/format';
import type { ActivityItem } from '@/types/api';

const RECENT_COUNT = 3;

function mostRecent(activity: ActivityItem[], count = RECENT_COUNT): ActivityItem[] {
  return [...activity]
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, count);
}

type RecentActivityProps = {
  activity: ActivityItem[];
  onShowMore: () => void;
};

export function RecentActivity({ activity, onShowMore }: RecentActivityProps) {
  const separator = useThemeColor({}, 'border');
  const secondary = useThemeColor({}, 'secondary');
  const onSecondary = useThemeColor({}, 'onSecondary');

  return (
    <View>
      {mostRecent(activity).map((item) => (
        <View
          key={item.id}
          style={[styles.row, { borderBottomColor: separator }]}
          accessible
          accessibilityLabel={`Activity: ${item.description}, ${formatMoney(item.amount, item.currency)}`}>
          <ThemedText numberOfLines={1} style={styles.description}>
            {item.description}
          </ThemedText>
          <ActivityAmount item={item} />
        </View>
      ))}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Show more activity"
        onPress={onShowMore}
        style={({ pressed }) => [
          styles.showMore,
          { backgroundColor: secondary, opacity: pressed ? 0.7 : 1 },
        ]}>
        <ThemedText type="defaultSemiBold" style={[styles.showMoreText, { color: onSecondary }]}>
          Show More
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  description: { flex: 1 },
  showMore: {
    marginTop: 16,
    borderRadius: 12,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showMoreText: { fontSize: 18 },
});
