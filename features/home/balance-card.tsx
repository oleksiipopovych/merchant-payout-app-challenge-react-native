import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { formatMoney } from '@/lib/money/format';
import type { Currency } from '@/types/api';

type BalanceCardProps = {
  availableBalance: number;
  pendingBalance: number;
  currency: Currency;
};

export function BalanceCard({ availableBalance, pendingBalance, currency }: BalanceCardProps) {
  return (
    <View style={styles.row}>
      <BalanceFigure
        label="Available"
        accessibilityName="Available balance"
        amount={formatMoney(availableBalance, currency)}
      />
      <BalanceFigure
        label="Pending"
        accessibilityName="Pending balance"
        amount={formatMoney(pendingBalance, currency)}
      />
    </View>
  );
}

type BalanceFigureProps = {
  label: string;
  /** Fuller name for screen readers than the short visible label. */
  accessibilityName: string;
  amount: string;
};

function BalanceFigure({ label, accessibilityName, amount }: BalanceFigureProps) {
  return (
    <View style={styles.figure} accessible accessibilityLabel={`${accessibilityName} ${amount}`}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText type="subtitle">{amount}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 16 },
  figure: { flex: 1, gap: 4 },
  label: { opacity: 0.7 },
});
