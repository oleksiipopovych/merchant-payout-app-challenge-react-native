import { useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { activityQueryKey } from '@/features/activity/use-activity-pages';
import { merchantQueryKey } from '@/features/home/use-merchant';

import { runBiometricCheck } from './biometric-check';
import { readDeviceId } from './device-id';
import { isHighValuePayout } from './high-value';
import { PayoutConfirmation } from './payout-confirmation';
import { initialPayoutFormValues, type PayoutDraft, type PayoutFormValues } from './payout-draft';
import { PayoutForm } from './payout-form';
import { PayoutResult } from './payout-result';
import { sendPayout, type PayoutOutcome } from './send-payout';
import { useScreenshotWarning } from './use-screenshot-warning';

type PayoutStep =
  | { step: 'editing' }
  | { step: 'confirming'; draft: PayoutDraft }
  | { step: 'submitting'; draft: PayoutDraft }
  | { step: 'result'; outcome: PayoutOutcome };

export function PayoutsScreen() {
  const [values, setValues] = useState<PayoutFormValues>(initialPayoutFormValues);
  const [flow, setFlow] = useState<PayoutStep>({ step: 'editing' });
  const queryClient = useQueryClient();
  useScreenshotWarning();
  // Guards against a second tap landing before the locked summary has re-rendered;
  // the API has no idempotency key, so this is the only protection against a duplicate Payout.
  const inFlight = useRef(false);

  const submit = async (draft: PayoutDraft) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setFlow({ step: 'submitting', draft });
    const outcome = await checkThenSend(draft);
    inFlight.current = false;
    setFlow({ step: 'result', outcome });
    if (outcome.kind === 'completed' || outcome.kind === 'failed' || outcome.kind === 'unconfirmed') {
      // A created (or possibly created) Payout changes balances and Activity.
      queryClient.invalidateQueries({ queryKey: merchantQueryKey });
      queryClient.invalidateQueries({ queryKey: activityQueryKey });
    }
  };

  const checkThenSend = async (draft: PayoutDraft): Promise<PayoutOutcome> => {
    if (isHighValuePayout(draft)) {
      const check = await runBiometricCheck();
      if (check === 'not-set-up') return { kind: 'not-sent', reason: 'biometrics-not-set-up' };
      if (check !== 'passed') return { kind: 'not-sent', reason: 'biometric-check-failed' };
    }
    return sendPayout(draft, await readDeviceId(queryClient));
  };

  const createAnother = () => {
    setValues(initialPayoutFormValues);
    setFlow({ step: 'editing' });
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.screen} edges={['top']}>
        <KeyboardAvoidingView
          style={styles.screen}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            <ThemedText type="title" accessibilityRole="header" style={styles.title}>
              {flow.step === 'result' ? 'Payout' : 'Send Payout'}
            </ThemedText>
            {flow.step === 'result' ? (
              <PayoutResult
                outcome={flow.outcome}
                onCreateAnother={createAnother}
                onBackToForm={() => setFlow({ step: 'editing' })}
              />
            ) : (
              <PayoutForm
                values={values}
                onChange={setValues}
                onConfirm={(draft) => setFlow({ step: 'confirming', draft })}
              />
            )}
          </ScrollView>
        </KeyboardAvoidingView>

      </SafeAreaView>

      {(flow.step === 'confirming' || flow.step === 'submitting') && (
        <PayoutConfirmation
          draft={flow.draft}
          submitting={flow.step === 'submitting'}
          onCancel={() => setFlow({ step: 'editing' })}
          onConfirm={() => submit(flow.draft)}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 48 },
  title: { marginBottom: 24 },
});
