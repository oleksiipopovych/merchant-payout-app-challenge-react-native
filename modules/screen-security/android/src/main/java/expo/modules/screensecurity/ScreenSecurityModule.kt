package expo.modules.screensecurity

import android.annotation.SuppressLint
import android.app.Activity
import android.hardware.biometrics.BiometricManager
import android.hardware.biometrics.BiometricPrompt
import android.os.Build
import android.os.CancellationSignal
import android.provider.Settings
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.atomic.AtomicBoolean

class BiometricsNotEnrolledException :
  CodedException("E_BIOMETRICS_NOT_ENROLLED", "No fingerprint or face is enrolled on this device", null)

class BiometricsUnavailableException :
  CodedException("E_BIOMETRICS_UNAVAILABLE", "Biometric authentication is not available on this device", null)

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

    // Resolves true on a match, false when the merchant fails or cancels.
    // Rejects with a coded exception when biometrics can't be used at all (ADR-0002).
    // Uses the framework BiometricPrompt (API 28+), so no third-party or Jetpack dependency.
    AsyncFunction("isBiometricAuthenticated") { reason: String, promise: Promise ->
      val activity = appContext.currentActivity ?: throw Exceptions.MissingActivity()
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
        promise.reject(BiometricsUnavailableException())
        return@AsyncFunction
      }
      availabilityError(activity)?.let {
        promise.reject(it)
        return@AsyncFunction
      }
      authenticate(activity, reason, promise)
    }.runOnQueue(Queues.MAIN)
  }

  /** Pre-flight check on API 29+, where BiometricManager exists. API 28 relies on prompt errors. */
  private fun availabilityError(activity: Activity): CodedException? {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return null
    val manager = activity.getSystemService(BiometricManager::class.java)
      ?: return BiometricsUnavailableException()
    val status = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      manager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG)
    } else {
      @Suppress("DEPRECATION")
      manager.canAuthenticate()
    }
    return when (status) {
      BiometricManager.BIOMETRIC_SUCCESS -> null
      BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> BiometricsNotEnrolledException()
      else -> BiometricsUnavailableException()
    }
  }

  private fun authenticate(activity: Activity, reason: String, promise: Promise) {
    val executor = activity.mainExecutor
    // The prompt can call back more than once (e.g. error after cancel); settle the promise once.
    val settled = AtomicBoolean(false)
    fun settle(block: () -> Unit) {
      if (settled.compareAndSet(false, true)) block()
    }

    val builder = BiometricPrompt.Builder(activity)
      .setTitle("Confirm payout")
      .setSubtitle(reason)
      .setNegativeButton("Cancel", executor) { _, _ -> settle { promise.resolve(false) } }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      builder.setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG)
    }

    builder.build().authenticate(
      CancellationSignal(),
      executor,
      object : BiometricPrompt.AuthenticationCallback() {
        override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) =
          settle { promise.resolve(true) }

        override fun onAuthenticationError(errorCode: Int, errString: CharSequence) = settle {
          when (errorCode) {
            BiometricPrompt.BIOMETRIC_ERROR_NO_BIOMETRICS -> promise.reject(BiometricsNotEnrolledException())
            BiometricPrompt.BIOMETRIC_ERROR_HW_NOT_PRESENT,
            BiometricPrompt.BIOMETRIC_ERROR_HW_UNAVAILABLE -> promise.reject(BiometricsUnavailableException())
            // User cancel, lockout, timeout, …: a failed check.
            else -> promise.resolve(false)
          }
        }

        // onAuthenticationFailed (one non-matching attempt) is not overridden: the prompt stays
        // open for another try, and an eventual cancel or lockout arrives via onAuthenticationError.
      },
    )
  }
}
