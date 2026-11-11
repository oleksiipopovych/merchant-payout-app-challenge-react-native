# 10: README: Decisions & trade-offs

**What to build:** A reviewer reading the README understands how to run the app and why it deviates from the brief where it does. Add run instructions (dev build required; iOS and Android; running tests) and a "Decisions & trade-offs" section covering: dates as "23 Jan 2026" rather than literal "DD MM YYYY"; "−£219.70" rather than the reference's "£-219.70"; the README's invalid FR IBAN being blocked even though the reference screenshot lets it through; the static mock (balances and Activity don't change after a Payout); no screenshot warning below Android 14; no client-side funds check (ADR-0001); the Biometric Check contract (ADR-0002); Payouts without Device ID (ADR-0003); the missing "provided API client" that was built instead.

**Blocked by:** 04: Activity sheet: infinite scroll; 08: Biometric Check for High-value Payouts; 09: Screenshot warning on Payouts.

**Status:** ready-for-agent

- [ ] Run instructions for iOS and Android dev builds and for tests
- [ ] Each listed deviation is explained in one or two sentences
- [ ] ADRs and GLOSSARY.md are linked
- [ ] Instructions verified from a clean clone
