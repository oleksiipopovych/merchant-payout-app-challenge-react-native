# 08: Biometric Check for High-value Payouts

**What to build:** Extend `ScreenSecurity` with the `isBiometricAuthenticated()` AsyncFunction (iOS LocalAuthentication, Android BiometricPrompt; no third-party library). It resolves true on pass, false on failure or cancel, and rejects with `E_BIOMETRICS_NOT_ENROLLED` / `E_BIOMETRICS_UNAVAILABLE` when biometrics can't be used (ADR-0002). When the merchant presses Confirm on the confirmation step for a High-value Payout (strictly more than 1,000.00 in the Payout Currency, no conversion), the Biometric Check runs before the Payout is sent. Pass → send. Fail/cancel → stay on confirmation with an error and allow retry. Not enrolled / unavailable → abort with a message to set up biometrics in Settings.

**Blocked by:** 07: ScreenSecurity module and Device ID on Payouts.

**Status:** ready-for-agent

- [ ] Payouts of exactly 1,000.00 or less (GBP or EUR) send without a Biometric Check
- [ ] Payouts of 1,000.01 or more prompt for the Biometric Check before any request is sent
- [ ] Pass → Payout sent; fail/cancel → no request, error on confirmation, retry possible
- [ ] Not enrolled / unavailable → no request, message directing to Settings
- [ ] Works on iOS Simulator (Face ID enrolled / matching / non-matching) and Android Emulator (fingerprint) per README
- [ ] Unit tests for the High-value boundary; screen tests for pass, fail and not-enrolled via the module mock
