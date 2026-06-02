/**
 * utils/debounce.js
 *
 * Returns a function that delays calling `fn` until `delay` ms have passed
 * without it being called again.
 *
 * Use case: search input — don't fire a fetch on every keystroke.
 *
 *   const onSearch = debounce((q) => doSearch(q), 300);
 *   inputEl.addEventListener("input", (e) => onSearch(e.target.value));
 *
 * Day 27 callback — same as the debounce we built in the final session.
 *
 * TODO:
 *   [ ] export function debounce(fn, delay) { ... }
 *       - keep a `timer` in closure
 *       - on each call, clearTimeout the old one and start a new one
 *       - preserve `this` and pass through args
 */

// export function debounce(fn, delay) {
//   let timer;
//   return function (...args) {
//     // TODO
//   };
// }
