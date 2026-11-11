package expo.modules.screensecurity

import android.annotation.SuppressLint
import android.provider.Settings
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ScreenSecurityModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ScreenSecurity")

    // ANDROID_ID is scoped to the app signing key, user and device (API 26+), and survives
    // reinstalls with the same key. It needs no permission.
    AsyncFunction("getDeviceId") {
      val context = appContext.reactContext ?: throw Exceptions.ReactContextLost()
      @SuppressLint("HardwareIds")
      val id: String? = Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
      id
    }
  }
}
