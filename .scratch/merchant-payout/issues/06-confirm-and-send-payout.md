# 06: Confirm and send a Payout, with all outcomes

**What to build:** Pressing Confirm on a valid form opens a confirmation modal summarising amount, Payout Currency and the masked Destination IBAN (first four + fixed mask + last four; screen readers hear "IBAN ending NNNN"). Cancel returns to the form with the draft intact. Confirm sends the Payout and locks the modal (progress on Confirm; Cancel and dismissal disabled) until an outcome arrives, so a double press can't send twice. Outcomes: Completed (shows amount and Payout Currency), Failed (created but didn't succeed), Rejected with a specific Insufficient Funds message, Rejected generally (e.g. service unavailable), and Unconfirmed on network failure (check Activity before retrying). "Done" on Completed resets the form and refreshes merchant data and Activity; from Failed/Rejected/Unconfirmed the merchant returns to the form with details intact. No client-side funds check (ADR-0001).

**Blocked by:** 05: Payout form with validation.

**Status:** ready-for-agent

- [x] Confirmation shows amount, Payout Currency and masked IBAN; accessible label reads "IBAN ending NNNN"
- [x] Cancel returns to the form with all fields preserved
- [x] While sending, Confirm shows progress and Cancel/dismiss are disabled; a double press sends one request
- [x] 201 completed → Completed screen with amount and currency
- [x] 201 failed (e.g. 12.99) → Failed screen
- [x] 400 (888.88) → Insufficient Funds message
- [x] 503 (999.99) → general Rejected message
- [x] Network error → Unconfirmed message advising to check Activity before retrying
- [x] Done after Completed resets the form and refreshes merchant data and Activity
- [x] Screen tests cover every outcome, Cancel, and the double-press lock
