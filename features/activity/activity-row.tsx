import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatActivityDate } from '@/lib/date/format';
import { formatMoney } from '@/lib/money/format';
import type { ActivityItem, ActivityStatus, ActivityType } from '@/types/api';

import { ActivityAmount } from './activity-amount';

const TYPE_LABELS: Record<ActivityType, string> = {
  deposit: 'Deposit',
  payout: 'Payout',
  refund: 'Refund',
  fee: 'Fee',
};

const STATUS_LABELS: Record<ActivityStatus, string> = {
  completed: 'Completed',
  pending: 'Pending',
  processing: 'Processing',
  failed: 'Failed',
};

const STATUS_COLOR_TOKENS = {
  completed: 'icon',
  pending: 'warning',
  processing: 'warning',
  failed: 'negative',
} as const satisfies Record<ActivityStatus, string>;

export function ActivityRow({ item }: { item: ActivityItem }) {
  const statusColor = useThemeColor({}, STATUS_COLOR_TOKENS[item.status]);
  const mutedColor = useThemeColor({}, 'icon');
  const type = TYPE_LABELS[item.type];
  const date = formatActivityDate(item.date);
  const status = STATUS_LABELS[item.status];

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`Activity item: ${type}, ${item.description}, ${formatMoney(item.amount, item.currency)}, ${date}, ${status}`}>
      <View style={styles.details}>
        <ThemedText type="defaultSemiBold">{type}</ThemedText>
        <ThemedText numberOfLines={2}>{item.description}</ThemedText>
        <ThemedText style={[styles.small, { color: mutedColor }]}>{date}</ThemedText>
      </View>
      <View style={styles.trailing}>
        <ActivityAmount item={item} />
        <ThemedText
          style={[styles.small, { color: statusColor }, item.status !== 'completed' && styles.emphasis]}>
          {status}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 16,
  },
  details: { flex: 1, gap: 4 },
  trailing: { alignItems: 'flex-end', justifyContent: 'center', gap: 4 },
  small: { fontSize: 14 },
  emphasis: { fontWeight: '600' },
});
