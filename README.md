# Merchant Payout App

My solution to the merchant payout challenge (Expo / React Native). The original brief is in [CHALLENGE.md](CHALLENGE.md).

The project's domain language is in [GLOSSARY.md](GLOSSARY.md), the key decisions are recorded as ADRs in [docs/adr/](docs/adr/), and the spec and tickets it was built from are in [.scratch/merchant-payout/](.scratch/merchant-payout/).

## Running it

You need Node 24 (see `.nvmrc`), plus Xcode for iOS and/or Android Studio with an emulator.

```bash
npm install
npx expo run:ios        # or: npx expo run:android
```

The app includes a local native module (`modules/screen-security`), so it needs a development build. **Expo Go won't work.** The mock API (MSW) starts automatically in development.

Checks:

```bash
npm test             # Jest + React Native Testing Library + MSW
npx tsc --noEmit
npm run lint
```

## Trying each feature

| Scenario | How |
| --- | --- |
| Completed payout | Any valid amount, e.g. `400`, with IBAN `GB29NWBK60161331926819` |
| Service unavailable (503) | Amount `999.99` |
| Insufficient funds (400) | Amount `888.88` |
| Failed payout (201 with `status: "failed"`) | Any other amount ending in `.99`, e.g. `12.99` |
| Invalid IBAN | `FR1212345123451234567A12310131231231231` (wrong length for FR) |
| Biometric Check | Any amount over `1,000.00`, e.g. `1500` |
| Network error / unreadable response | Covered by tests (MSW answers requests in-app, so it can't be triggered from the simulator) |

**Biometrics**

- iOS Simulator: Features → Face ID → Enrolled. When the prompt appears, Features → Face ID → Matching Face (or Non-matching Face). With Face ID not enrolled, the app tells the merchant to set it up in Settings.
- Android emulator: enrol a fingerprint in Settings → Security, then use Extended Controls (`…`) → Fingerprint → Touch sensor when prompted.

**Screenshot warning** (the Payouts tab must be open)

- iOS Simulator: Device → Trigger Screenshot. `Cmd + S` doesn't send the notification.
- Android: use an **Android 14 (API 34) or newer** emulator and run `adb shell input keyevent 120`. The emulator's camera button and `adb screencap` don't notify apps, so they won't show the warning.

## Requirement map

Each item from the brief, where it's handled, and the ticket it was built in. Native paths are under `modules/screen-security/`.

| Brief requirement | Where | Ticket |
| --- | --- | --- |
| **Step 1: Home screen** |  |  |
| Fetch balance data | `features/home/use-merchant.ts`, `api/client.ts` | [01](.scratch/merchant-payout/issues/01-home-shows-balances.md) |
| Available and pending balance with the currency symbol | `features/home/balance-card.tsx`, `lib/money/format.ts` | [01](.scratch/merchant-payout/issues/01-home-shows-balances.md) |
| 3 most recent activity items, description and amount on one row | `features/home/recent-activity.tsx` | [02](.scratch/merchant-payout/issues/02-home-shows-recent-activity.md) |
| "Show more" opens a modal with the full list | `features/home/recent-activity.tsx` → `app/activity.tsx` (modal in `components/root-navigator.tsx`) | [02](.scratch/merchant-payout/issues/02-home-shows-recent-activity.md), [03](.scratch/merchant-payout/issues/03-activity-sheet-first-page.md) |
| Loading and error states | `features/home/home-screen.tsx`, `components/error-state.tsx` | [01](.scratch/merchant-payout/issues/01-home-shows-balances.md) |
| **Step 2: Activity modal** |  |  |
| Type, description, amount and date | `features/activity/activity-row.tsx`, `features/activity/activity-amount.tsx`, `lib/date/format.ts` | [03](.scratch/merchant-payout/issues/03-activity-sheet-first-page.md) |
| Infinite scroll with cursor-based pagination | `features/activity/use-activity-pages.ts`, `features/activity/activity-sheet.tsx` | [04](.scratch/merchant-payout/issues/04-activity-sheet-infinite-scroll.md) |
| Loading and error states, including a failed next page | `features/activity/activity-sheet.tsx` | [03](.scratch/merchant-payout/issues/03-activity-sheet-first-page.md), [04](.scratch/merchant-payout/issues/04-activity-sheet-infinite-scroll.md) |
| **Step 3: Payout form and confirmation** |  |  |
| Numeric amount input | `features/payouts/payout-form.tsx` (`decimal-pad`), `lib/money/parse.ts` | [05](.scratch/merchant-payout/issues/05-payout-form-with-validation.md) |
| Currency dropdown (GBP or EUR) | `components/select.tsx`, `features/payouts/payout-form.tsx` | [05](.scratch/merchant-payout/issues/05-payout-form-with-validation.md) |
| IBAN validation (valid and invalid examples) | `lib/iban/iban.ts`, `features/payouts/payout-draft.ts` | [05](.scratch/merchant-payout/issues/05-payout-form-with-validation.md) |
| Usable with the keyboard open | `features/payouts/payouts-screen.tsx` | [05](.scratch/merchant-payout/issues/05-payout-form-with-validation.md) |
| Confirm disabled when empty, zero or negative | `features/payouts/payout-draft.ts`, `features/payouts/payout-form.tsx` | [05](.scratch/merchant-payout/issues/05-payout-form-with-validation.md) |
| Confirmation summary before sending | `features/payouts/payout-confirmation.tsx` | [06](.scratch/merchant-payout/issues/06-confirm-and-send-payout.md) |
| Success with amount and currency | `features/payouts/payout-result.tsx` | [06](.scratch/merchant-payout/issues/06-confirm-and-send-payout.md) |
| 4xx, 5xx, insufficient funds and network errors | `features/payouts/use-send-payout.ts`, `api/client.ts`, `features/payouts/payout-result.tsx` | [06](.scratch/merchant-payout/issues/06-confirm-and-send-payout.md) |
| **Step 4: Device identity** |  |  |
| `ScreenSecurity` native module | `modules/screen-security/` (`ios/ScreenSecurityModule.swift`, `android/.../ScreenSecurityModule.kt`, `index.ts`) | [07](.scratch/merchant-payout/issues/07-screensecurity-module-and-device-id.md) |
| `getDeviceId()`, sent with the payout as `device_id` | `modules/screen-security/index.ts`, `features/payouts/use-send-payout.ts` | [07](.scratch/merchant-payout/issues/07-screensecurity-module-and-device-id.md) |
| **Step 5: Biometrics over 1,000.00** |  |  |
| `isBiometricAuthenticated()` AsyncFunction | Both native files, `modules/screen-security/index.ts` | [08](.scratch/merchant-payout/issues/08-biometric-check-for-high-value-payouts.md) |
| Checked before `/api/payouts`; abort when `false` | `features/payouts/high-value.ts`, `features/payouts/use-send-payout.ts` | [08](.scratch/merchant-payout/issues/08-biometric-check-for-high-value-payouts.md) |
| Not set up: tell the user to enable it in Settings | `features/payouts/use-send-payout.ts` (`not-sent` outcome), `features/payouts/payout-result.tsx` | [08](.scratch/merchant-payout/issues/08-biometric-check-for-high-value-payouts.md) |
| **Step 6: Screenshot warning** |  |  |
| Emit `onScreenshotTaken` (iOS notification, Android `ScreenCaptureCallback`) | Both native files | [09](.scratch/merchant-payout/issues/09-screenshot-warning-on-payouts.md) |
| Warning on the Payout screen | `features/payouts/use-screenshot-warning.ts`, `features/payouts/payouts-screen.tsx` | [09](.scratch/merchant-payout/issues/09-screenshot-warning-on-payouts.md) |

## How it's built

### Structure

```
app/                       Expo Router routes: (tabs)/index, (tabs)/payouts, activity (modal)
features/home/             balances and the 3 most recent Activity Items
features/activity/         the Activity sheet with infinite scroll
features/payouts/          form, confirmation, sending (useSendPayout), results, screenshot warning
lib/                       pure rules: money parsing and formatting, IBAN, dates
api/                       typed fetch client and zod response schemas
components/                shared UI: text field, select, button, error state
modules/screen-security/   local Expo module (Swift and Kotlin)
test/                      fake bank API, app driver and render helpers for tests
```

### Key decisions

**Every response is validated.** `api/client.ts` parses each response with zod (`api/schemas.ts`). The schemas use `satisfies` against the provided types in `types/api.ts`, so the two can't drift apart. Callers only ever see well-formed data or an `ApiError`.

**Money never goes through floats.** The typed amount is parsed from the string into integer Minor Units (`"999.99"` → `99999`), accepting `.` or `,` as the decimal separator and at most 2 decimal places. Display uses `Intl.NumberFormat` with the currency from the API.

**IBAN validation** strips spaces, uppercases, then checks the characters, the country, the exact length for that country, and the mod-97 checksum, with a specific message for each failure. The confirmation shows a masked IBAN (`GB29 •••• 6819`).

**Every payout ends in one explicit outcome.** `useSendPayout` returns a `PayoutOutcome` union and never throws:

| Outcome | When |
| --- | --- |
| `completed` | 2xx with `status` other than `"failed"` |
| `failed` | 2xx with `status: "failed"`: the payout exists but didn't succeed |
| `rejected` | 400 insufficient funds, 5xx service unavailable, or another 4xx |
| `unconfirmed` | No response, or a response that can't be read. The payout **may** have been created, so the app says so and asks the merchant to check their activity rather than saying it failed |
| `not-sent` | The Biometric Check failed, or biometrics aren't set up |

**Payouts are never retried automatically,** and a second tap while a payout is sending reuses the request already in flight. The API has no idempotency key, so this is the only protection against sending twice. After any outcome where a payout was (or may have been) created, merchant data and Activity are refreshed.

**Biometric Check (Step 5).** Payouts strictly over 1,000.00 in the Payout Currency need a passed check, with no FX conversion. iOS uses `LocalAuthentication`. Android uses the **framework `BiometricPrompt`** (API 28+) with `BIOMETRIC_STRONG`, so there's no third-party or Jetpack dependency. `isBiometricAuthenticated()` resolves `false` when the merchant fails or cancels, and rejects with a coded error when biometrics aren't enrolled or available ([ADR-0002](docs/adr/0002-biometric-check-contract.md)).

**Device ID (Step 4)** is `identifierForVendor` on iOS and `ANDROID_ID` on Android, read once per session. If it's unavailable, the payout is still sent without `device_id` ([ADR-0003](docs/adr/0003-payout-without-device-id.md)).

**Screenshot warning (Step 6).** The Payouts screen listens only while it's focused, and the native code only observes the system while there's a listener. Android re-registers the callback when the app returns to the foreground. Only one alert shows at a time.

### Differences from the brief

- **Dates:** the brief's text says `DD MM YYYY`, but the reference screenshots show `23 Jan 2026`. I followed the screenshots, using fixed month names rather than `Intl` so the output is identical on iOS and Android.
- **Negative amounts** show as `-£219.70` (standard `Intl` formatting) rather than `£-219.70` as in the screenshots.
- **The brief's invalid FR IBAN is blocked,** although the reference confirmation screenshot shows it going through. It passes mod-97 but is 39 characters long, and French IBANs are 27.
- **No client-side funds check.** The payout currency can differ from the account currency and there are no exchange rates, so only the server decides insufficient funds ([ADR-0001](docs/adr/0001-no-client-side-funds-check.md)).
- **The mock is static:** balances and Activity don't change after a payout, even though the app refreshes them.
- **No screenshot warning below Android 14.** There's no screenshot-detection API before API 34. `FLAG_SECURE` on the Payouts screen would be the option for older versions, but it blocks screenshots rather than warning about them, which is a product decision.
- **The screenshot warning is a native Alert,** matching the reference screenshots. The brief allows a Toast or an Alert.
- **The "provided API client"** mentioned in the brief isn't in the starter repo, so I wrote `api/client.ts`.
- **No thousands separators in the amount.** `,` is accepted as a decimal separator for European keyboards, so `1,000` reads as 1.000 and is rejected ("Use at most 2 decimal places"). Type `1000`.
- **Android accepts strong biometrics only** (`BIOMETRIC_STRONG`), as suits payments. On a phone whose only biometric is face unlock rated as weak, the app treats biometrics as not set up.
- **One change to the provided mock:** `POST /api/payouts` now has the same 500–2000ms random latency as the GET handlers, so the sending state is visible.

## Testing

Tests run against the whole app where possible. `test/fake-bank.ts` replaces the API at the network boundary: each test sets only what it needs (e.g. `bank.payoutReply = { payoutStatus: 'failed' }`) and can inspect the requests sent. `test/app-driver.ts` drives the app the way a merchant would (`sendPayout({ amount: '400' })`), so tests read as merchant steps. The native module is replaced by a scriptable mock in `modules/screen-security/__mocks__/`. Pure rules (money, IBAN, dates, the high-value threshold) have their own unit tests.

## How I used AI

I built this with an AI coding agent (Claude Code) and [Matt Pocock's skills](https://github.com/mattpocock/skills), configured in [CLAUDE.md](CLAUDE.md):

1. Grilled the design until the open decisions were resolved, recording them in [GLOSSARY.md](GLOSSARY.md) and [docs/adr/](docs/adr/).
2. Wrote a spec with user stories and split it into 10 tickets with dependencies ([.scratch/merchant-payout/](.scratch/merchant-payout/)).
3. Implemented the tickets roughly one per commit, with tests for each (see the commit history).

## With more time

- A request timeout and an idempotency key for payouts, so an `unconfirmed` payout could be retried safely.
- `FLAG_SECURE` on the Payouts screen below Android 14.
- Pull-to-refresh in the Activity sheet.
- End-to-end tests with Maestro for the biometric and screenshot flows, which the Jest suite mocks.
- CI (typecheck, lint, tests).
- Hide payout details in the app-switcher snapshot.
