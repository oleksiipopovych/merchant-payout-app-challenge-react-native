/**
 * Jest stand-in for the native module (Seam 2). Each function is a jest.fn that tests
 * can script per case; defaults are restored before every test in jest.setup.js.
 */
export { BiometricErrorCode } from '../src/constants';

export const getDeviceId = jest.fn<Promise<string | null>, []>();

export const isBiometricAuthenticated = jest.fn<Promise<boolean>, [string]>();

const screenshotListeners = new Set<() => void>();

export const addScreenshotListener = jest.fn((listener: () => void) => {
  screenshotListeners.add(listener);
  return { remove: () => screenshotListeners.delete(listener) };
});

/** How many screenshot listeners are currently subscribed (to catch leaked subscriptions). */
export function activeScreenshotListenerCount() {
  return screenshotListeners.size;
}

/** Simulates the OS reporting a screenshot to every current listener. */
export function emitScreenshotTaken() {
  screenshotListeners.forEach((listener) => listener());
}

export function resetScreenSecurityMock() {
  screenshotListeners.clear();
  addScreenshotListener.mockClear();
  getDeviceId.mockReset().mockResolvedValue('test-device-id');
  isBiometricAuthenticated.mockReset().mockResolvedValue(true);
}
