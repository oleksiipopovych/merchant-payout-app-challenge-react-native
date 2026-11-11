import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { Select } from '@/components/select';
import { TextField } from '@/components/text-field';
import type { Currency } from '@/types/api';

import {
  validatePayoutDraft,
  type PayoutDraft,
  type PayoutFormField,
  type PayoutFormValues,
} from './payout-draft';

const PAYOUT_CURRENCIES = ['GBP', 'EUR'] as const satisfies readonly Currency[];

type PayoutFormProps = {
  values: PayoutFormValues;
  onChange: (values: PayoutFormValues) => void;
  onConfirm: (draft: PayoutDraft) => void;
};

export function PayoutForm({ values, onChange, onConfirm }: PayoutFormProps) {
  const [touched, setTouched] = useState<Partial<Record<PayoutFormField, boolean>>>({});
  const validation = validatePayoutDraft(values);

  // Errors are revealed per field once it has been left, so nothing goes red mid-typing.
  const errorFor = (field: PayoutFormField) =>
    touched[field] && !validation.ok ? validation.errors[field] : undefined;
  const markTouched = (field: PayoutFormField) =>
    setTouched((current) => ({ ...current, [field]: true }));

  const setField = <K extends keyof PayoutFormValues>(field: K, value: PayoutFormValues[K]) =>
    onChange({ ...values, [field]: value });

  return (
    <View style={styles.form}>
      <View style={styles.row}>
        <View style={styles.amount}>
          <TextField
            label="Amount"
            value={values.amount}
            onChangeText={(amount) => setField('amount', amount)}
            onBlur={() => markTouched('amount')}
            error={errorFor('amount')}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>
        <Select
          label="Currency"
          value={values.currency}
          options={PAYOUT_CURRENCIES}
          onChange={(currency) => setField('currency', currency)}
        />
      </View>
      <TextField
        label="IBAN"
        value={values.iban}
        onChangeText={(iban) => setField('iban', iban)}
        onBlur={() => markTouched('iban')}
        error={errorFor('iban')}
        placeholder="GB29 NWBK 6016 1331 9268 19"
        hint="Enter the destination bank account IBAN"
        autoCapitalize="characters"
        autoCorrect={false}
        autoComplete="off"
      />
      <PrimaryButton
        title="Confirm"
        disabled={!validation.ok}
        onPress={() => validation.ok && onConfirm(validation.draft)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 24 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  amount: { flex: 1 },
});
