import { ApiError, createPayout } from '@/api/client';
import type { PayoutResponse } from '@/types/api';

import type { PayoutDraft } from './payout-draft';

export type PayoutOutcome =
  | { kind: 'completed'; payout: PayoutResponse }
  | { kind: 'failed'; payout: PayoutResponse }
  | { kind: 'rejected'; reason: 'insufficient-funds' | 'service-unavailable' | 'invalid-request' }
  | { kind: 'unconfirmed' }
  /** Stopped on the device before sending, e.g. a failed Biometric Check. */
  | { kind: 'not-sent'; reason: 'biometric-check-failed' | 'biometrics-not-set-up' };

/** Sends a Payout and classifies the answer into a Payout outcome. Never throws. */
export async function sendPayout(
  draft: PayoutDraft,
  deviceId: string | undefined,
): Promise<PayoutOutcome> {
  let payout: PayoutResponse;
  try {
    payout = await createPayout(deviceId ? { ...draft, device_id: deviceId } : draft);
  } catch (error) {
    return classifyError(error);
  }
  // The API returns a final status immediately; status polling is out of scope.
  return payout.status === 'failed' ? { kind: 'failed', payout } : { kind: 'completed', payout };
}

function classifyError(error: unknown): PayoutOutcome {
  if (
    error instanceof ApiError &&
    error.reason.kind === 'http' &&
    error.reason.status === 400 &&
    /insufficient funds/i.test(error.reason.message)
  ) {
    return { kind: 'rejected', reason: 'insufficient-funds' };
  }
  if (error instanceof ApiError && error.reason.kind === 'http') {
    return {
      kind: 'rejected',
      reason: error.reason.status >= 500 ? 'service-unavailable' : 'invalid-request',
    };
  }
  // No answer, or an answer we can't read: the Payout may or may not have been created.
  return { kind: 'unconfirmed' };
}
