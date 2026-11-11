  # Spec: Merchant Payout App

Status: ready-for-agent

## Problem Statement

A merchant has money sitting in their account and no way, on their phone, to see how much they hold, what has recently moved in and out, or to send money out to their bank. When they do send money, they need confidence that the amount and Destination IBAN are right, that a large Payout can't be sent by whoever picks up their phone, that a screenshot of the Payout screen is a privacy risk they should know about, and that when something goes wrong they understand whether their money actually left.

## Solution

A two-tab mobile app (Home, Payouts):

- **Home** shows the Available Balance and Pending Balance in the Account Currency, plus the three most recent Activity Items, with a "show more" entry into a full, infinitely scrolling Activity list.
- **Payouts** lets the merchant enter an amount, pick a Payout Currency (GBP or EUR) and enter a Destination IBAN, review a confirmation summary, and send. A High-value Payout requires a Biometric Check first. Every Payout carries the device's Device ID when available. The merchant always ends on a clear outcome: Completed, Failed, Rejected (with a specific Insufficient Funds message), or Unconfirmed.
- While on the Payouts screen, taking a screenshot shows a non-intrusive reminder to keep financial data private.

## User Stories

### Home: balances

1. As a merchant, I want to see my Available Balance when I open the app, so that I know how much I can pay out right now.
2. As a merchant, I want to see my Pending Balance next to it, so that I know what money is on its way but not yet usable.
3. As a merchant, I want both balances shown with the Account Currency's symbol and two decimal places, so that I read amounts the way my bank shows them.
4. As a merchant, I want a loading indicator while my balances are being fetched, so that I don't mistake an empty screen for a zero balance.
5. As a merchant, I want a clear error message with a Retry button if my balances can't be loaded, so that I can recover without restarting the app.
6. As a merchant, I want to pull down on Home to refresh, so that I can see up-to-date balances and Activity on demand.

### Home: recent Activity

7. As a merchant, I want to see my three most recent Activity Items on Home, so that I get a quick sense of recent movements without leaving the screen.
8. As a merchant, I want each of those items on a single row showing only its description and amount, so that the summary stays scannable.
9. As a merchant, I want money coming in and going out to be visually distinct (sign and colour), so that I can tell deposits from payouts and fees at a glance.
10. As a merchant, I want a "show more" button under the recent Activity, so that I can open the full Activity list.

### Activity modal

11. As a merchant, I want "show more" to open the full Activity as a sheet over Home, so that I can dismiss it and return to where I was.
12. As a merchant, I want a "Done" button and swipe-down (iOS) / back (Android) to close the Activity sheet, so that closing it feels native on each platform.
13. As a merchant, I want each Activity Item to show its type, description, signed amount and date, so that I can identify every movement.
14. As a merchant, I want dates shown as day, short month name and year (e.g. 23 Jan 2026), so that dates are unambiguous regardless of locale.
15. As a merchant, I want each Activity Item to show its status (completed, pending, processing, failed), with non-completed statuses visually distinct, so that I notice anything that hasn't settled.
16. As a merchant, I want more Activity Items to load automatically as I scroll to the bottom, so that I can browse my full history without pressing "next page".
17. As a merchant, I want a loading indicator at the bottom of the list while the next page loads, so that I know more is coming.
18. As a merchant, I want the list to stop trying to load once I reach the end of my Activity, so that I'm not shown a spinner forever.
19. As a merchant, I want a full-screen error with Retry if the first page of Activity fails, so that I can recover.
20. As a merchant, I want a footer "Couldn't load more · Retry" if a later page fails, keeping the items already loaded, so that one failure doesn't wipe what I've already seen.
21. As a merchant, I want a loading state when the Activity sheet first opens, so that an empty list isn't mistaken for no Activity.

### Payout form

22. As a merchant, I want a numeric amount field with a decimal keypad, so that entering money is quick and error-free.
23. As a merchant, I want to be able to type either "." or "," as the decimal separator, so that the form works with my device's regional keyboard.
24. As a merchant, I want amounts limited to two decimal places, so that I can't enter a fraction of a penny or cent.
25. As a merchant, I want to choose GBP or EUR as the Payout Currency from a dropdown, so that I can pay out in either currency regardless of my Account Currency.
26. As a merchant, I want the dropdown to show the current selection with a clear affordance and be operable by screen readers, so that everyone can change it.
27. As a merchant, I want to enter a Destination IBAN with spaces or lowercase letters and have it accepted, so that I can paste it in whatever format my bank gave me.
28. As a merchant, I want an IBAN with the wrong length for its country, invalid characters, or a bad checksum to be rejected with an explanatory message, so that I can't send money to a mistyped account.
29. As a merchant, I want validation errors to appear only after I've left a field, so that I'm not told off while I'm still typing.
30. As a merchant, I want the Confirm button disabled while the amount is empty, zero or negative, or while the IBAN is invalid, so that I can only proceed with a complete, valid Payout.
31. As a merchant, I want the form to remain fully usable when the keyboard is open (fields and Confirm reachable, tap outside to dismiss), so that the keyboard never traps me.
32. As a merchant using a screen reader, I want every field, error and button labelled, so that I can complete a Payout without seeing the screen.

### Confirmation

33. As a merchant, I want to see a summary of the amount, Payout Currency and Destination IBAN before anything is sent, so that I can catch mistakes.
34. As a merchant, I want the Destination IBAN masked on the summary (first four and last four characters), so that the full account number isn't exposed on screen.
35. As a screen-reader user, I want the masked IBAN read as "IBAN ending" plus its last four characters, so that I'm not read a string of bullets.
36. As a merchant, I want to Cancel from the summary back to my filled-in form, so that I can correct a detail without retyping everything.
37. As a merchant, I want the summary to lock (Confirm shows progress; Cancel and dismissal disabled) once I press Confirm, so that I can't accidentally send the same Payout twice.

### Biometric Check

38. As a merchant, I want a High-value Payout (strictly more than 1,000.00 in its Payout Currency) to require a Biometric Check before it is sent, so that someone else holding my phone can't send a large Payout.
39. As a merchant, I want a Payout of exactly 1,000.00 or less to go through without a Biometric Check, so that small Payouts stay quick.
40. As a merchant, I want the threshold applied in the Payout Currency without conversion (1,000.00 GBP or 1,000.00 EUR), so that the rule is predictable.
41. As a merchant, I want the Biometric Check to happen after I've seen the summary and pressed Confirm, so that my biometric approves exactly the Payout I reviewed.
42. As a merchant, I want a failed or cancelled Biometric Check to abort the Payout and leave me on the summary with an explanation, so that I can try again without re-entering the form.
43. As a merchant without biometrics set up, I want to be told to set up biometrics in Settings and have the Payout aborted, so that I know how to unblock myself.

### Device ID

44. As a merchant, I want my device's Device ID sent with every Payout, so that the provider can use it to protect my account.
45. As a merchant, I want my Payout still sent if the Device ID can't be read, so that a device quirk doesn't stop me getting paid.

### Outcomes

46. As a merchant, I want a Completed screen showing the amount and Payout Currency sent, so that I have confirmation the money is on its way.
47. As a merchant, I want a Failed screen when the Payout was created but did not succeed, so that I know the money didn't leave.
48. As a merchant, I want a specific Insufficient Funds message when the Payout is Rejected for that reason, so that I understand why and what to change.
49. As a merchant, I want a general Rejected message (e.g. service unavailable) that invites me to try again later, so that I know the problem isn't with my details.
50. As a merchant, I want an Unconfirmed message when the network fails mid-request, telling me to check my Activity before retrying, so that I don't send the same Payout twice.
51. As a merchant, I want "Done" on the Completed screen to reset the form and refresh my balances and Activity, so that the app reflects the Payout I just made.
52. As a merchant, I want to go back to the form from Failed/Rejected with my details intact, so that I can retry or adjust quickly.

### Screenshot warning

53. As a merchant, I want a non-intrusive banner reminding me to keep my financial data private when I take a screenshot on the Payouts screen, so that I'm aware of the risk without being interrupted.
54. As a merchant, I want no screenshot warning on other screens, so that the reminder stays meaningful.
55. As a merchant on an Android version older than 14, I want the app to work normally without the warning, so that the feature's absence never breaks anything.

### Theming & accessibility

56. As a merchant using dark mode, I want every screen readable with correct contrast, so that the app respects my system setting.
57. As a merchant, I want direction of money never conveyed by colour alone, so that colour-blind users can tell in from out.

## Implementation Decisions

### Architecture

- Organised by feature: Home, Activity, Payouts, each owning its components, hooks and tests. Shared pure domain logic lives in two library modules, **money** and **iban**. A thin typed **API client** module sits between features and the network. Route files contain no logic; they compose feature components.
- The template's themed text/view components and theme-colour hook are reused and extended with tokens for positive, negative, warning and disabled.

### Server state

- TanStack Query owns all server state: a query for merchant data (balances + recent Activity), an infinite query for paged Activity, and a mutation for creating a Payout. One QueryClient is provided at the app root.
- The Activity sheet pages through the dedicated paged Activity endpoint from a null cursor with a page size of 15, independently of the Activity embedded in the merchant response. The next cursor is the response's next cursor; paging stops when has-more is false.
- On a Completed Payout and the merchant pressing Done, the merchant and Activity queries are invalidated.

### API client

- A small fetch wrapper over the configured base URL exposing: get merchant, get Activity page (cursor, limit), create Payout (amount, currency, IBAN, optional Device ID).
- Every response body is parsed with a zod schema. Each schema is checked against the existing hand-written API types (the provided types remain the single source of truth; schemas must satisfy them). A parse failure surfaces as a typed client error, never as malformed data in the UI.
- Errors are classified into a small discriminated union the UI can switch on: HTTP rejection with status and server message (distinguishing Insufficient Funds by 400 + message), network failure (no response), and invalid response.

### Money module

- All amounts are integers in Minor Units end to end. User input is parsed from string to Minor Units without floating-point arithmetic; accepts "." or "," as decimal separator, at most two decimals, no thousands separators, no client-side upper cap.
- Formatting uses the platform's Intl number formatting with the currency code, producing a leading minus for negative amounts (e.g. −£219.70) and no plus for positive amounts.
- An Activity Item's amount is a signed movement; a Payout's amount is unsigned and positive.
- `isHighValue` answers whether a Payout's amount is strictly greater than 100,000 Minor Units in its Payout Currency; no FX conversion.

### IBAN module

- Normalise (strip whitespace, uppercase), validate against a per-country length table, then the ISO 13616 mod-97 checksum. Returns a normalised IBAN or a reason (unsupported country, wrong length, invalid characters, bad checksum).
- A masking function returns first four + fixed mask + last four for display, plus an accessible label "IBAN ending NNNN".

### Payout draft schema

- A zod schema over the raw form (amount string, Payout Currency, IBAN string) that transforms into a validated draft (Minor Units amount > 0, currency, normalised IBAN). It is the single source of the form's validity: Confirm is enabled iff the schema passes. Field errors are revealed per field after first blur.
- No form library; plain React state.

### Payout flow

- The Payouts screen is driven by a discriminated-union state machine with steps: editing → confirming (with draft) → submitting (biometric/POST in flight; locked) → result (Completed | Failed | Rejected | Unconfirmed). Confirming and result are shown in a React Native modal over the form. Cancel returns to editing with the draft preserved.
- On Confirm: if the draft is a High-value Payout, run the Biometric Check first. Passed → send. Failed/cancelled → back to confirming with an error. Not enrolled/unavailable → abort with a "set up biometrics in Settings" message.
- Mapping of responses: 201 with status completed → Completed; 201 with status failed → Failed; 4xx/5xx → Rejected (Insufficient Funds specialised); no response → Unconfirmed.
- Keyboard: form inside a scroll view that persists handled taps, wrapped in keyboard avoidance (padding on iOS).
- Currency dropdown is a small custom select component (pressable field with chevron opening a modal list), with combobox accessibility role; no picker dependency.
- No client-side Insufficient Funds check (ADR-0001).

### ScreenSecurity native module

- A local Expo Module (Swift + Kotlin) named ScreenSecurity, built in Step 4 and extended in Steps 5 and 6. The app therefore runs as a development build, not Expo Go.
- `getDeviceId()`: iOS identifierForVendor; Android Settings.Secure.ANDROID_ID. JS fetches it once per app session and caches it. If unavailable, the Payout is sent without `device_id` (ADR-0003).
- `isBiometricAuthenticated()` (AsyncFunction): resolves true on pass, false on failure/cancel; rejects with `E_BIOMETRICS_NOT_ENROLLED` or `E_BIOMETRICS_UNAVAILABLE` when biometrics can't be used (ADR-0002). Implemented with LocalAuthentication on iOS and BiometricPrompt on Android; no third-party biometric library. JS wraps it into `'passed' | 'failed' | 'not-enrolled'`.
- `onScreenshotTaken` event: iOS via the user-did-take-screenshot notification; Android API 34+ via Activity screen-capture callback registered/unregistered with the activity lifecycle; no-op below API 34.
- The Payouts screen subscribes only while focused and shows a non-blocking banner/toast, not a modal alert.

### Activity sheet

- An expo-router route presented as a modal (iOS page sheet), titled "Recent Activity" with a Done action; replaces the template's placeholder modal route.
- Rows show type, description, signed amount (colour + sign), date as day / short month / year (en-GB), and status.

## Testing Decisions

- **What makes a good test:** it exercises behaviour a merchant can observe (text, accessible roles/labels, presses, typing) and survives refactors of internals. No assertions on component state, hooks, query keys, or call order of internal functions.
- **Seam 1 (primary): screens over the network.** Render real routes with expo-router's testing-library helper, wrapped in a fresh QueryClient per test (retries off). The network is faked by the existing MSW node server already wired into the Jest setup with unhandled requests erroring. Tests override handlers per test to remove the shared handlers' random 500–2000ms latency and to force specific responses (500 on merchant, failing later Activity pages, 400/503/201-failed Payouts, network error). Shared handlers are not modified.
  - Home: loading → balances and three recent items; error → Retry recovers; "show more" opens the sheet.
  - Activity sheet: first page renders with formatted dates/amounts/status; scrolling to end loads the next page; end of list stops loading; first-page error and later-page footer Retry.
  - Payouts: Confirm disabled for empty/zero/invalid IBAN; summary shows masked IBAN; Cancel preserves draft; each outcome (Completed, Failed via an amount ending in 99p, Insufficient Funds via 888.88, Rejected via 999.99, Unconfirmed via network error); High-value Payout runs the Biometric Check and aborts on failure / not-enrolled; exactly 1,000.00 skips it; `device_id` present in the request body when available and absent when not; double-press sends one request; screenshot event shows the banner only while Payouts is focused.
- **Seam 2: ScreenSecurity JS boundary.** One manual Jest mock of the module, scriptable per test (biometric result, device ID or failure, emit screenshot event). Native Swift/Kotlin is verified manually on iOS Simulator and Android Emulator using the README's procedures.
- **Seam 3: pure domain functions.** Table-driven unit tests for money parsing/formatting (e.g. "1.005" rejected, "1,5" → 150, "0" invalid, negative invalid), `isHighValue` boundaries (100000 vs 100001), IBAN validation (README valid and invalid examples, wrong length, bad checksum, lowercase/spaced input), masking, and the payout draft schema.
- **Prior art:** no component tests exist yet; the only existing test infrastructure is the MSW node server and its listen/reset/close lifecycle in the Jest setup.

## Out of Scope

- Polling a Payout's status after creation (the mock returns a final status immediately).
- Currency conversion or FX rates; client-side affordability checks (ADR-0001).
- Idempotency keys or server-side duplicate protection.
- Blocking screenshots (e.g. secure-window flags); this spec only warns.
- Android screenshot detection below API 34.
- Changing the Account Currency from the UI.
- Authentication/login, multiple merchants, payee address book, saved IBANs.
- Native-code unit tests.
- Modifying the provided mock handlers or API types.

## Further Notes

- The README's "DD MM YYYY" is interpreted as the reference screenshot's "23 Jan 2026"; the reference's "£-219.70" is rendered as "−£219.70"; the reference lets the README's invalid FR IBAN reach confirmation, which this spec deliberately does not. Record all three in a "Decisions & trade-offs" README section along with: the mock is static (balances/Activity don't change after a Payout), Android < 14 has no screenshot warning, and the dev-build requirement.
- The README mentions a "provided API client" that does not exist in the repo; this spec builds one.
- Deliver on a feature branch with at least one commit per README step (1–6).
- Vocabulary follows GLOSSARY.md; decisions follow ADR-0001..0003.
