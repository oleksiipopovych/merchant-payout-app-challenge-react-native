import ExpoModulesCore
import UIKit

public class ScreenSecurityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ScreenSecurity")

    // identifierForVendor is stable per install for apps from the same vendor. It can be nil
    // briefly after a device restart before first unlock, in which case JS receives null.
    AsyncFunction("getDeviceId") { () -> String? in
      UIDevice.current.identifierForVendor?.uuidString
    }.runOnQueue(.main)
  }
}
