# 03: Activity sheet: first page

**What to build:** Pressing "show more" on Home opens a "Recent Activity" sheet (iOS page sheet; Android modal) with a Done action, swipe-down on iOS and back on Android to close. It loads the first page of Activity from the paged Activity endpoint (null cursor, page size 15), independent of Home's data. Each row shows type, description, signed coloured amount, date as day / short month / year (e.g. 23 Jan 2026), and status, with non-completed statuses visually distinct. Shows a loading state on open and a full-screen error with Retry if the first page fails. Replaces the template's placeholder modal route.

**Blocked by:** 02: Home shows recent Activity.

**Status:** ready-for-agent

- [ ] "show more" opens the sheet; Done, swipe-down (iOS) and back (Android) close it
- [x] First page loads from the paged Activity endpoint, not from Home's merchant data
- [x] Rows show type, description, signed amount, date as "23 Jan 2026", and status
- [ ] Pending / processing / failed statuses are visually distinct from completed
- [x] Loading state on open; first-page failure shows full-screen error with working Retry
- [x] The template's placeholder modal route is removed
- [x] Screen tests cover open-from-Home, row content, loading, and error → Retry
