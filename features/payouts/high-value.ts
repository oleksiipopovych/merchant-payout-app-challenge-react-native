import type { Currency } from '@/types/api';

/** 1,000.00 in Minor Units. Applied in the Payout Currency itself; no FX conversion. */
const HIGH_VALUE_THRESHOLD = 100000;

/** A High-value Payout is strictly more than 1,000.00 in its Payout Currency and needs a Biometric Check. */
export function isHighValuePayout(payout: { amount: number; currency: Currency }): boolean {
  return payout.amount > HIGH_VALUE_THRESHOLD;
}
