import { NativeModule, requireNativeModule } from 'expo';

declare class ScreenSecurityNativeModule extends NativeModule {
  /** A stable identifier for this install, or null if the platform can't provide one yet. */
  getDeviceId(): Promise<string | null>;
}

export default requireNativeModule<ScreenSecurityNativeModule>('ScreenSecurity');
