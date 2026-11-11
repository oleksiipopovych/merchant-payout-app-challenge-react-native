/** Codes `isBiometricAuthenticated` rejects with when biometrics can't be used at all (ADR-0002). */
export const BiometricErrorCode = {
  NotEnrolled: 'E_BIOMETRICS_NOT_ENROLLED',
  Unavailable: 'E_BIOMETRICS_UNAVAILABLE',
} as const;
