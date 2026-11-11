import ExpoModulesCore
import LocalAuthentication
import UIKit

final class BiometricsNotEnrolledException: Exception {
  override var code: String { "E_BIOMETRICS_NOT_ENROLLED" }
  override var reason: String { "No Face ID or Touch ID is enrolled on this device" }
}

final class BiometricsUnavailableException: Exception {
  override var code: String { "E_BIOMETRICS_UNAVAILABLE" }
  override var reason: String { "Biometric authentication is not available on this device" }
}

public class ScreenSecurityModule: Module {
  private var screenshotObserver: NSObjectProtocol?

  public func definition() -> ModuleDefinition {
    Name("ScreenSecurity")

    Events("onScreenshotTaken")

    // Observe screenshots only while JS has a listener for them.
    OnStartObserving("onScreenshotTaken") {
      guard self.screenshotObserver == nil else { return }
      self.screenshotObserver = NotificationCenter.default.addObserver(
        forName: UIApplication.userDidTakeScreenshotNotification,
        object: nil,
        queue: .main
      ) { [weak self] _ in
        self?.sendEvent("onScreenshotTaken")
      }
    }

    OnStopObserving("onScreenshotTaken") {
      if let observer = self.screenshotObserver {
        NotificationCenter.default.removeObserver(observer)
        self.screenshotObserver = nil
      }
    }

    // identifierForVendor is stable per install for apps from the same vendor. It can be nil
    // briefly after a device restart before first unlock, in which case JS receives null.
    AsyncFunction("getDeviceId") { () -> String? in
      UIDevice.current.identifierForVendor?.uuidString
    }.runOnQueue(.main)

    // Resolves true on a match, false when the merchant fails or cancels.
    // Rejects with a coded exception when biometrics can't be used at all (ADR-0002).
    AsyncFunction("isBiometricAuthenticated") { (reason: String, promise: Promise) in
      let context = LAContext()
      // Biometrics only: hide the "Enter Password" fallback button.
      context.localizedFallbackTitle = ""

      var availabilityError: NSError?
      guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &availabilityError) else {
        switch availabilityError.flatMap({ LAError.Code(rawValue: $0.code) }) {
        case .biometryNotEnrolled:
          promise.reject(BiometricsNotEnrolledException())
        case .biometryLockout:
          // Too many failed attempts; treat as a failed check rather than "not set up".
          promise.resolve(false)
        default:
          // biometryNotAvailable, passcodeNotSet, or anything else that blocks biometrics.
          promise.reject(BiometricsUnavailableException())
        }
        return
      }

      context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, _ in
        // Any evaluation error (userCancel, authenticationFailed, systemCancel, …) is a failed check.
        promise.resolve(success)
      }
    }
  }
}
