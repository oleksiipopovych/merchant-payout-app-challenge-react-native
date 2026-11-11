import { BiometricErrorCode, isBiometricAuthenticated } from '@/modules/screen-security';

/** `not-set-up`: no biometrics enrolled, or none usable on this device. */
export type BiometricCheckResult = 'passed' | 'failed' | 'not-set-up';

/**
 * Runs the Biometric Check for a High-value Payout. Never throws: anything unexpected
 * counts as a failed check, so a Payout is never sent without a pass.
 */
export async function runBiometricCheck(): Promise<BiometricCheckResult> {
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
