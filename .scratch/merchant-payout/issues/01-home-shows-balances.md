# 01: Home shows balances

**What to build:** When the merchant opens the app, Home fetches merchant data and shows the Available Balance and Pending Balance formatted in the Account Currency. While loading, a loading indicator is shown; on failure, an error message with a Retry button that recovers; pulling down refreshes. This ticket lays the shared groundwork through a real feature: the typed API client (zod-parsed responses checked against the provided API types, errors classified into HTTP rejection / network failure / invalid response), the app-wide TanStack QueryClient, and the screen test harness (render real routes via the router testing helper, fresh QueryClient per test with retries off, per-test MSW handler overrides without the shared handlers' random latency).

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [x] Home shows Available Balance and Pending Balance with the Account Currency symbol and two decimals
- [x] A loading indicator shows until merchant data arrives
- [x] A failed merchant request shows an error with Retry; Retry re-fetches and shows balances on success
- [x] Pull-to-refresh re-fetches merchant data
- [x] API responses are validated at the client boundary; a malformed response surfaces as an error state, not broken UI
- [x] The provided API types remain the source of truth; schemas are checked against them at compile time
- [x] Screen tests (loading, success, error → Retry) pass using the existing MSW server with per-test overrides; shared handlers are unchanged
