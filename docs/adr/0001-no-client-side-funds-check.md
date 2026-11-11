# No client-side Insufficient Funds check

The app does not compare a Payout's amount against the Available Balance before sending it; Insufficient Funds is decided only by the server. A Payout Currency can differ from the Account Currency and the app has no exchange rates, so any client check would be wrong for cross-currency Payouts (e.g. €4,800 against a £5,000 balance), and the server can reject for reasons the client can't see (the mock rejects £888.88 despite a £5,000 balance).
