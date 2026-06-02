/**
 * utils/storage.js
 *
 * Tiny wrapper around localStorage that:
 *   - Auto JSON.stringifies on set
 *   - Auto JSON.parses on get
 *   - Returns null on missing key (not undefined)
 *   - Catches QuotaExceeded / serialisation errors
 *
 * Use this everywhere instead of localStorage directly. Easier to swap for
 * sessionStorage or an in-memory store later.
 *
 * Common keys you'll use:
 *   "deskhub:token"   — auth token string
 *   "deskhub:user"    — current user object
 *   "deskhub:filters" — last applied tickets-list filters (stretch)
 *
 * TODO:
 *   [ ] get(key)            — returns parsed value, or null
 *   [ ] set(key, value)     — JSON.stringify, set, return true/false on success
 *   [ ] remove(key)
 *   [ ] clear()             — only clear keys with our "deskhub:" prefix (don't nuke other apps)
 */

// const PREFIX = "deskhub:";

// export function get(key) {
//   // TODO
// }

// export function set(key, value) {
//   // TODO
// }

// export function remove(key) {
//   // TODO
// }

// export function clear() {
//   // TODO
// }
