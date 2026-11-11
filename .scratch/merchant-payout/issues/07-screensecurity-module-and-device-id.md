# 07: ScreenSecurity module and Device ID on Payouts

**What to build:** Create the local Expo Module `ScreenSecurity` (Swift + Kotlin), switching the app to a development build. Expose `getDeviceId()`: iOS identifierForVendor, Android Settings.Secure.ANDROID_ID. The app reads it once per session, caches it, and sends it as `device_id` on every Payout. If it can't be read, the Payout is still sent without `device_id` (ADR-0003). Add a scriptable Jest mock of the module's JS boundary for screen tests (device ID / failure; extended by tickets 08 and 09).

**Blocked by:** 06: Confirm and send a Payout, with all outcomes.

**Status:** ready-for-agent

- [ ] The module builds and runs on iOS Simulator and Android Emulator via a dev build
- [ ] `getDeviceId()` returns a stable identifier per install on both platforms
- [x] Device ID is fetched at most once per app session
- [x] Payout request bodies include `device_id` when available
- [x] When the Device ID can't be read, the Payout is sent without `device_id` and the merchant sees no error
- [x] Screen tests assert `device_id` present / absent in the request body using the module mock
- [x] Run instructions for the dev build are noted for ticket 10
