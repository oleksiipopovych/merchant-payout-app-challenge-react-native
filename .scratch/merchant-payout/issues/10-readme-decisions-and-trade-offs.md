# 10: README: Decisions & trade-offs

**What to build:** A reviewer reading the README understands how to run the app and why it deviates from the brief where it does. Add run instructions (dev build required; iOS and Android; running tests) and a "Decisions & trade-offs" section covering: dates as "23 Jan 2026" rather than literal "DD MM YYYY"; "−£219.70" rather than the reference's "£-219.70"; the README's invalid FR IBAN being blocked even though the reference screenshot lets it through; the static mock (balances and Activity don't change after a Payout); no screenshot warning below Android 14; no client-side funds check (ADR-0001); the Biometric Check contract (ADR-0002); Payouts without Device ID (ADR-0003); the missing "provided API client" that was built instead.

**Blocked by:** 04: Activity sheet: infinite scroll; 08: Biometric Check for High-value Payouts; 09: Screenshot warning on Payouts.

**Status:** ready-for-agent

- [x] Run instructions for iOS and Android dev builds and for tests
- [x] Each listed deviation is explained in one or two sentences
- [x] ADRs and GLOSSARY.md are linked
- [x] Instructions verified from a clean clone: `npm ci`, `npm test` (cold Jest cache), `npx tsc --noEmit` and `npm run lint` all exit 0. The native run (`npx expo run:ios` / `run:android`) was not part of this check.
- [x] The provided POST /api/payouts mock handler was given the same 500–2000ms latency as the GET handlers so the sending state is visible
- [x] Run instructions: the app needs a dev build (`npx expo run:ios` / `npx expo run:android`), not Expo Go, because of the local ScreenSecurity module
- [x] The screenshot warning uses a native Alert to match the reference (the spec originally chose a non-blocking banner; the README allows "a Toast or an Alert")
