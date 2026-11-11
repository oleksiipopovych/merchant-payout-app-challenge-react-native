/**
 * The Payout form's single source of validity: raw input in, a Payout draft out.
 */
import { z } from 'zod';

import { currencySchema } from '@/api/schemas';
import { validateIban, type IbanError } from '@/lib/iban/iban';
import { parseAmount, type AmountError } from '@/lib/money/parse';
import type { Currency } from '@/types/api';

const AMOUNT_MESSAGES: Record<AmountError, string> = {
  empty: 'Enter an amount',
  invalid: 'Enter a valid amount, e.g. 125.50',
  'too-many-decimals': 'Use at most 2 decimal places',
  'not-positive': 'Amount must be more than zero',
};

function ibanMessage(error: IbanError): string {
  switch (error.reason) {
    case 'empty':
      return 'Enter the destination IBAN';
    case 'invalid-characters':
      return 'An IBAN contains only letters and numbers';
    case 'unsupported-country':
      return "This IBAN's country code isn't recognised";
    case 'wrong-length':
      return `A ${error.country} IBAN has ${error.expectedLength} characters`;
    case 'bad-checksum':
      return "This IBAN isn't valid. Check it for typos";
  }
}

export const payoutDraftSchema = z.object({
  amount: z.string().transform((input, ctx) => {
    const parsed = parseAmount(input);
    if (!parsed.ok) {
      ctx.addIssue({ code: 'custom', message: AMOUNT_MESSAGES[parsed.reason] });
      return z.NEVER;
    }
    return parsed.minorUnits;
  }),
  currency: currencySchema,
  iban: z.string().transform((input, ctx) => {
    const validated = validateIban(input);
    if (!validated.ok) {
      ctx.addIssue({ code: 'custom', message: ibanMessage(validated) });
      return z.NEVER;
    }
    return validated.iban;
  }),
});

export type PayoutFormValues = z.input<typeof payoutDraftSchema>;
export type PayoutDraft = z.output<typeof payoutDraftSchema>;
export type PayoutFormField = keyof PayoutFormValues;
export type PayoutFormErrors = Partial<Record<PayoutFormField, string>>;

export type ValidatedPayoutDraft =
  | { ok: true; draft: PayoutDraft }
  | { ok: false; errors: PayoutFormErrors };

export function validatePayoutDraft(values: PayoutFormValues): ValidatedPayoutDraft {
  const result = payoutDraftSchema.safeParse(values);
  if (result.success) return { ok: true, draft: result.data };

  const errors: PayoutFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as PayoutFormField;
    errors[field] ??= issue.message;
  }
  return { ok: false, errors };
}

export const initialPayoutFormValues: PayoutFormValues = {
  amount: '',
  currency: 'GBP' satisfies Currency,
  iban: '',
};
