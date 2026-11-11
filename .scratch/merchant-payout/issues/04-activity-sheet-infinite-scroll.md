# 04: Activity sheet: infinite scroll

**What to build:** Scrolling to the bottom of the Activity sheet automatically loads the next page using the previous response's cursor, showing a footer loading indicator. When there are no more items, loading stops and no spinner remains. If a later page fails, a footer "Couldn't load more · Retry" appears and the already-loaded items stay on screen; Retry loads the missing page.

**Blocked by:** 03: Activity sheet: first page.

**Status:** ready-for-agent

- [x] Reaching the end of the list fetches the next page with the returned cursor
- [x] A footer indicator shows while a next page is loading
- [x] When has-more is false, no further requests are made and no spinner remains
- [x] A failed later page shows a footer Retry; loaded items are preserved; Retry appends the page
- [x] Duplicate fetches are not triggered while a page is already loading
- [x] Screen tests cover next page, end of list, and later-page failure → Retry
