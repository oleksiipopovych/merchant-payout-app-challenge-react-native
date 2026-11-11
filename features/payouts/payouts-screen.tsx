import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { PayoutConfirmation } from './payout-confirmation';
import { initialPayoutFormValues, type PayoutDraft, type PayoutFormValues } from './payout-draft';
import { PayoutForm } from './payout-form';
import { PayoutResult } from './payout-result';
import { useScreenshotWarning } from './use-screenshot-warning';
import { useSendPayout, type PayoutOutcome } from './use-send-payout';

type PayoutStep =
  | { step: 'editing' }
  | { step: 'confirming'; draft: PayoutDraft }
  | { step: 'submitting'; draft: PayoutDraft }
  | { step: 'result'; outcome: PayoutOutcome };

export function PayoutsScreen() {
  const [values, setValues] = useState<PayoutFormValues>(initialPayoutFormValues);
  const [flow, setFlow] = useState<PayoutStep>({ step: 'editing' });
  const { send } = useSendPayout();
  useScreenshotWarning();

  const submit = async (draft: PayoutDraft) => {
    setFlow({ step: 'submitting', draft });
    const outcome = await send(draft);
    setFlow({ step: 'result', outcome });
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
