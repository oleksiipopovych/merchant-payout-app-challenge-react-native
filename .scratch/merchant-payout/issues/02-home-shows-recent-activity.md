# 02: Home shows recent Activity

**What to build:** Below the balances, Home lists the three most recent Activity Items, each in a single row showing only its description and signed amount. Money in and out is distinguished by sign and colour (never colour alone): e.g. −£500.00 in the negative colour, £1,500.00 in the positive colour. A "show more" button sits under the list (wired to open the Activity sheet in ticket 03). Introduces the money formatting functions and positive/negative theme tokens (light and dark).

**Blocked by:** 01: Home shows balances.

**Status:** ready-for-agent

- [ ] Exactly the three most recent Activity Items are shown, description and amount only
- [ ] Negative amounts render with a leading minus before the symbol (−£219.70); positive amounts have no plus
- [ ] Direction is conveyed by sign and colour; colours work in light and dark mode
- [ ] A "show more" button is present and accessible
- [ ] Unit tests cover money formatting for both currencies, negatives and zero
- [ ] Screen test asserts the three rows and their formatted amounts
