import { NativeModule, requireNativeModule } from 'expo';

export type ScreenSecurityEvents = {
  /** iOS: userDidTakeScreenshotNotification. Android 14+: Activity.ScreenCaptureCallback. */
  onScreenshotTaken: () => void;
};

declare class ScreenSecurityNativeModule extends NativeModule<ScreenSecurityEvents> {
  /** A stable identifier for this install, or null if the platform can't provide one yet. */
  getDeviceId(): Promise<string | null>;
  isBiometricAuthenticated(reason: string): Promise<boolean>;
}

export default requireNativeModule<ScreenSecurityNativeModule>('ScreenSecurity');
