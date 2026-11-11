# 09: Screenshot warning on Payouts

**What to build:** Extend `ScreenSecurity` to emit `onScreenshotTaken`: iOS via the user-did-take-screenshot notification; Android API 34+ via Activity screen-capture callback registered with the activity lifecycle; a silent no-op below API 34. While (and only while) the Payouts tab is focused, a screenshot shows a non-blocking banner or toast reminding the merchant to keep their financial data private. No modal alert.

**Blocked by:** 07: ScreenSecurity module and Device ID on Payouts.

**Status:** ready-for-agent

- [ ] Screenshot on the Payouts tab shows the privacy banner without blocking input
- [ ] Screenshots on Home or the Activity sheet show nothing
- [ ] Listener is removed when Payouts loses focus (no leaks, no duplicate banners)
- [ ] Verified on iOS Simulator (Device → Trigger Screenshot) and Android 14+ emulator (Power + Volume Down)
- [ ] Android below API 34 runs normally with no warning and no crash
- [ ] Screen tests emit the event via the module mock: banner when focused, none when not
