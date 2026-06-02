/**
 * utils/formatDate.js
 *
 * Format ISO date strings into human-friendly versions.
 *
 * Use built-in Intl APIs — no library needed:
 *   - new Intl.DateTimeFormat("en-IN", { ... })
 *   - new Intl.RelativeTimeFormat("en", { numeric: "auto" })
 *
 * Examples to aim for:
 *   formatDate("2026-05-07T09:14:00Z")    →  "7 May 2026"
 *   formatDateTime("2026-05-07T09:14:00Z") →  "7 May 2026, 2:44 pm"   (IST)
 *   formatRelative("2026-05-07T09:14:00Z") →  "2 hours ago"
 *
 * TODO:
 *   [ ] formatDate(iso)
 *   [ ] formatDateTime(iso)
 *   [ ] formatRelative(iso) — calculate diff in ms, pick best unit (sec/min/hour/day)
 *
 * Hint: Intl.RelativeTimeFormat with `numeric: "auto"` gives "yesterday" instead of "1 day ago"
 */

// export function formatDate(iso) {
//   // TODO
// }

// export function formatDateTime(iso) {
//   // TODO
// }

// export function formatRelative(iso) {
//   // TODO
// }
