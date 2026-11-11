import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatMoney } from '@/lib/money/format';

import type { PayoutOutcome } from './use-send-payout';

type RejectionReason = Extract<PayoutOutcome, { kind: 'rejected' }>['reason'];

type ResultCopy = {
  tone: 'success' | 'error';
  title: string;
  message: string;
  action: 'create-another' | 'try-again' | 'back';
};

const REJECTION_MESSAGES: Record<RejectionReason, string> = {
  'insufficient-funds': 'Insufficient funds.',
  'service-unavailable': 'Service temporarily unavailable. Please try again later.',
  'invalid-request': "We couldn't process this payout. Please check the details and try again.",
};

function describe(outcome: PayoutOutcome): ResultCopy {
  switch (outcome.kind) {
    case 'completed': {
      const amount = formatMoney(outcome.payout.amount, outcome.payout.currency);
      return {
        tone: 'success',
        title: 'Payout Completed',
        message: `Your payout of ${amount} has been processed successfully.`,
        action: 'create-another',
      };
    }
    case 'failed': {
      const amount = formatMoney(outcome.payout.amount, outcome.payout.currency);
      return {
        tone: 'error',
        title: 'Payout Failed',
        message: `Your payout of ${amount} could not be completed. No money has left your account.`,
        action: 'try-again',
      };
    }
    case 'rejected':
      return {
        tone: 'error',
        title: 'Unable to Process Payout',
        message: REJECTION_MESSAGES[outcome.reason],
        action: 'try-again',
      };
    case 'not-sent':
      return outcome.reason === 'biometrics-not-set-up'
        ? {
            tone: 'error',
            title: 'Biometrics Not Set Up',
            message:
              'Payouts over 1,000.00 need Face ID, Touch ID or fingerprint. Set up biometrics in your device Settings, then try again.',
            action: 'back',
          }
        : {
            tone: 'error',
            title: 'Unable to Process Payout',
            message: 'Biometric authentication was cancelled.',
            action: 'try-again',
          };
    case 'unconfirmed':
      return {
        tone: 'error',
        title: 'Payout Not Confirmed',
        message:
          "We couldn't confirm whether your payout was sent. Check your recent activity before trying again.",
        action: 'back',
      };
  }
}

type PayoutResultProps = {
  outcome: PayoutOutcome;
  onCreateAnother: () => void;
  onBackToForm: () => void;
};

export function PayoutResult({ outcome, onCreateAnother, onBackToForm }: PayoutResultProps) {
  const positive = useThemeColor({}, 'positive');
  const negative = useThemeColor({}, 'negative');
  const onPrimary = useThemeColor({}, 'onPrimary');
  const copy = describe(outcome);
  const isSuccess = copy.tone === 'success';
  const toneColor = isSuccess ? positive : negative;

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <View
        style={[styles.icon, isSuccess && { backgroundColor: positive }]}
        importantForAccessibility="no-hide-descendants">
        <ThemedText style={[styles.iconGlyph, { color: isSuccess ? onPrimary : negative }]}>
          {isSuccess ? '✓' : '✕'}
        </ThemedText>
      </View>
      <ThemedText
        type="subtitle"
        accessibilityRole="header"
        style={[styles.title, !isSuccess && { color: toneColor }]}>
        {copy.title}
      </ThemedText>
      <ThemedText style={[styles.message, !isSuccess && { color: toneColor }]}>
        {copy.message}
      </ThemedText>
      <View style={styles.action}>
        {copy.action === 'create-another' ? (
          <PrimaryButton title="Create Another Payout" onPress={onCreateAnother} />
        ) : (
          <PrimaryButton
            title={copy.action === 'back' ? 'Back to Payout' : 'Try Again'}
            onPress={onBackToForm}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 20, paddingVertical: 48 },
  icon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  iconGlyph: { fontSize: 36, lineHeight: 40, fontWeight: '700' },
  title: { textAlign: 'center' },
  message: { textAlign: 'center', paddingHorizontal: 16 },
  action: { alignSelf: 'stretch', paddingHorizontal: 32, marginTop: 12 },
});
