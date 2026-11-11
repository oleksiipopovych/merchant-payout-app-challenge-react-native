/**
 * Sending a Payout: everything between the merchant confirming a Payout and its outcome.
 *
 * Interface: `useSendPayout()` → `{ send(draft) }`, where `send` never throws and guarantees:
 * - at most one Payout in flight: calling `send` while one is running returns that same promise;
 * - a High-value Payout is never sent without a passed Biometric Check;
 * - the Device ID is read once per session, and a Payout is sent without it if unavailable (ADR-0003);
 * - every Payout outcome is produced here;
 * - after a Payout that was (or may have been) created, a refresh of merchant data and Activity
 *   has started by the time the promise resolves (it doesn't wait for the refetch to finish).
 */
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

import { ApiError, createPayout } from '@/api/client';
import { activityQueryKey } from '@/features/activity/use-activity-pages';
import { merchantQueryKey } from '@/features/home/use-merchant';
import {
  BiometricErrorCode,
  getDeviceId,
  isBiometricAuthenticated,
} from '@/modules/screen-security';
import type { PayoutResponse } from '@/types/api';

import { isHighValuePayout } from './high-value';
import type { PayoutDraft } from './payout-draft';

export type PayoutOutcome =
  | { kind: 'completed'; payout: PayoutResponse }
  | { kind: 'failed'; payout: PayoutResponse }
  | { kind: 'rejected'; reason: 'insufficient-funds' | 'service-unavailable' | 'invalid-request' }
  | { kind: 'unconfirmed' }
  | { kind: 'not-sent'; reason: 'biometric-check-failed' | 'biometrics-not-set-up' };

export function useSendPayout() {
  const queryClient = useQueryClient();
  // Guards against a second tap landing before the locked summary has re-rendered; the API has
  // no idempotency key, so this is the only protection against a duplicate Payout.
  const inFlight = useRef<Promise<PayoutOutcome> | null>(null);

  const send = useCallback(
    (draft: PayoutDraft): Promise<PayoutOutcome> => {
      inFlight.current ??= checkThenSend(draft, queryClient).finally(() => {
        inFlight.current = null;
      });
      return inFlight.current;
    },
    [queryClient],
  );

  return { send };
}

async function checkThenSend(draft: PayoutDraft, queryClient: QueryClient): Promise<PayoutOutcome> {
  if (isHighValuePayout(draft)) {
    const check = await runBiometricCheck();
    if (check === 'not-set-up') return { kind: 'not-sent', reason: 'biometrics-not-set-up' };
    if (check === 'failed') return { kind: 'not-sent', reason: 'biometric-check-failed' };
  }

  const outcome = await sendToApi(draft, await readDeviceId(queryClient));

  if (outcome.kind === 'completed' || outcome.kind === 'failed' || outcome.kind === 'unconfirmed') {
    // A created (or possibly created) Payout changes balances and Activity. The refresh starts
    // here, before `send` resolves, but isn't awaited: the outcome shouldn't wait on a refetch.
    void queryClient.invalidateQueries({ queryKey: merchantQueryKey });
    void queryClient.invalidateQueries({ queryKey: activityQueryKey });
  }
  return outcome;
}

// --- Biometric Check ---------------------------------------------------------------------------

/** `not-set-up`: no biometrics enrolled, or none usable on this device. */
type BiometricCheckResult = 'passed' | 'failed' | 'not-set-up';

/** Never throws: anything unexpected counts as a failed check, so nothing is sent without a pass. */
async function runBiometricCheck(): Promise<BiometricCheckResult> {
  try {
    return (await isBiometricAuthenticated('Confirm this payout')) ? 'passed' : 'failed';
  } catch (error) {
    const code = codeOf(error);
    if (code === BiometricErrorCode.NotEnrolled || code === BiometricErrorCode.Unavailable) {
      return 'not-set-up';
    }
    return 'failed';
  }
}

function codeOf(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
    ? error.code
    : undefined;
}

// --- Device ID ---------------------------------------------------------------------------------

const deviceIdQueryKey = ['device-id'] as const;

/** Read from the native module at most once per session (per QueryClient). */
async function readDeviceId(queryClient: QueryClient): Promise<string | undefined> {
  try {
    const id = await queryClient.fetchQuery({
      queryKey: deviceIdQueryKey,
      queryFn: getDeviceId,
      staleTime: Infinity,
      gcTime: Infinity,
    });
    return id ?? undefined;
  } catch (error) {
    if (__DEV__) console.warn('Device ID unavailable; sending Payout without it.', error);
    return undefined;
  }
}

// --- Sending and classifying -------------------------------------------------------------------

async function sendToApi(draft: PayoutDraft, deviceId: string | undefined): Promise<PayoutOutcome> {
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
