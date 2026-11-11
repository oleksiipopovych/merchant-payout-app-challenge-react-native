import type { TextStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatMoney } from '@/lib/money/format';
import type { ActivityItem } from '@/types/api';

type ActivityAmountProps = {
  item: Pick<ActivityItem, 'amount' | 'currency'>;
  style?: TextStyle;
};

/**
 * An Activity Item's signed movement. Direction is carried by the sign as well
 * as colour, so it never relies on colour alone.
 */
export function ActivityAmount({ item, style }: ActivityAmountProps) {
  const color = useThemeColor({}, item.amount < 0 ? 'negative' : 'positive');

  return (
    <ThemedText type="defaultSemiBold" style={[{ color }, style]}>
      {formatMoney(item.amount, item.currency)}
    </ThemedText>
  );
}
