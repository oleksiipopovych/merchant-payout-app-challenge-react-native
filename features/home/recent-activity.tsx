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
  const tint = useThemeColor({}, 'tint');

  return (
    <View>
      {mostRecent(activity).map((item) => (
        <View
          key={item.id}
          style={styles.row}
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
        style={({ pressed }) => [styles.showMore, { opacity: pressed ? 0.6 : 1 }]}>
        <ThemedText style={{ color: tint }}>Show more</ThemedText>
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
    paddingVertical: 12,
  },
  description: { flex: 1 },
  showMore: { alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 16 },
});
