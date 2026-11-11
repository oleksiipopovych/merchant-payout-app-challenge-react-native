# 05: Payout form with validation

**What to build:** The Payouts tab shows a form with an amount field (decimal keypad; accepts "." or "," as decimal separator; at most two decimals), a custom Payout Currency select (GBP / EUR; pressable field with chevron opening a list; combobox accessibility role), and a Destination IBAN field (accepts spaces and lowercase; validated by country length and mod-97 checksum). Validation errors appear for a field only after it has been blurred once. Confirm is enabled only when the whole draft passes the payout draft schema (amount > 0 in Minor Units, valid IBAN). The form stays usable with the keyboard open: fields and Confirm reachable, tapping outside dismisses. Pressing Confirm is wired in ticket 06.

**Blocked by:** 01: Home shows balances.

**Status:** ready-for-agent

- [x] Amount input parses exactly to Minor Units without floating-point maths ("1,5" → 150; "1.005" rejected)
- [x] Confirm is disabled for empty, zero or negative amounts and for an invalid IBAN
- [x] README valid example (GB29NWBK60161331926819) passes; README invalid example (FR1212345123451234567A12310131231231231) fails
- [x] IBAN errors explain the reason (unsupported country, wrong length, invalid characters, bad checksum)
- [x] Errors appear only after a field's first blur
- [x] Currency select works with touch and screen readers; default GBP
- [ ] Keyboard never hides the focused field or Confirm; tap outside dismisses
- [x] All fields, errors and buttons have accessible labels
- [x] Table-driven unit tests for money parsing, IBAN validation and the draft schema; screen test for Confirm enable/disable
