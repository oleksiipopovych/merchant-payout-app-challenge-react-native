/**
 * ScreenSecurity: the app's native bridge for device identity (Step 4), biometrics (Step 5)
 * and screenshot events (Step 6).
 */
import ScreenSecurityModule from './src/ScreenSecurityModule';

/**
 * iOS: identifierForVendor. Android: Settings.Secure.ANDROID_ID.
 * Resolves null when the platform can't provide an ID (e.g. iOS before first unlock).
 */
export function getDeviceId(): Promise<string | null> {
  return ScreenSecurityModule.getDeviceId();
}
