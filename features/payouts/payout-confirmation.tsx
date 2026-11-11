import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { maskIban } from '@/lib/iban/iban';
import { formatMoney } from '@/lib/money/format';

import type { PayoutDraft } from './payout-draft';

type PayoutConfirmationProps = {
  draft: PayoutDraft;
  /** While sending, Confirm shows progress and the summary can't be cancelled or dismissed. */
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function PayoutConfirmation({
  draft,
  submitting,
  onCancel,
  onConfirm,
}: PayoutConfirmationProps) {
  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'disabled');
  const border = useThemeColor({}, 'border');
  const amount = formatMoney(draft.amount, draft.currency);
  const iban = maskIban(draft.iban);

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={submitting ? () => {} : onCancel}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: background }]}>
          <ThemedText type="subtitle" accessibilityRole="header" style={styles.title}>
            Confirm Payout
          </ThemedText>

          <SummaryRow label="Amount" value={amount} borderColor={border} />
          <SummaryRow label="Currency" value={draft.currency} borderColor={border} />
          <SummaryRow
            label="IBAN"
            value={iban.display}
            accessibilityLabel={iban.accessibilityLabel}
            borderColor={border}
          />

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: submitting }}
              disabled={submitting}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.cancel,
                { backgroundColor: surface, opacity: submitting ? 0.5 : pressed ? 0.7 : 1 },
              ]}>
              <ThemedText type="defaultSemiBold">Cancel</ThemedText>
            </Pressable>
            <View style={styles.confirm}>
              <PrimaryButton
                title="Confirm"
                accessibilityLabel="Confirm payout"
                busy={submitting}
                onPress={onConfirm}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
  accessibilityLabel?: string;
  borderColor: string;
};

function SummaryRow({ label, value, accessibilityLabel, borderColor }: SummaryRowProps) {
  return (
    <View
      style={[styles.row, { borderBottomColor: borderColor }]}
      accessible
      accessibilityLabel={accessibilityLabel ?? `${label}: ${value}`}>
      <ThemedText style={styles.rowLabel}>{label}:</ThemedText>
      <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.rowValue}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  card: { borderRadius: 20, padding: 24, gap: 4 },
  title: { textAlign: 'center', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { opacity: 0.7 },
  rowValue: { flexShrink: 1, textAlign: 'right' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancel: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  confirm: { flex: 1 },
});
