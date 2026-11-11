/**
 * ScreenSecurity: the app's native bridge for device identity (Step 4), biometrics (Step 5)
 * and screenshot events (Step 6).
 */
import type { EventSubscription } from 'expo-modules-core';

import ScreenSecurityModule from './src/ScreenSecurityModule';

export { BiometricErrorCode } from './src/constants';

/**
 * iOS: identifierForVendor. Android: Settings.Secure.ANDROID_ID.
 * Resolves null when the platform can't provide an ID (e.g. iOS before first unlock).
 */
export function getDeviceId(): Promise<string | null> {
  return ScreenSecurityModule.getDeviceId();
}

/**
 * Prompts for Face ID / Touch ID / fingerprint. Resolves true on a match and false when the
 * merchant fails or cancels. Rejects with a coded error when biometrics can't be used at all
 * (see BiometricErrorCode, ADR-0002).
 */
export function isBiometricAuthenticated(reason: string): Promise<boolean> {
  return ScreenSecurityModule.isBiometricAuthenticated(reason);
}

/**
 * Calls `listener` whenever the merchant takes a screenshot. Remove the returned
 * subscription when no longer needed. No-op on Android below 14 (API 34).
 */
export function addScreenshotListener(listener: () => void): EventSubscription {
  return ScreenSecurityModule.addListener('onScreenshotTaken', listener);
}
