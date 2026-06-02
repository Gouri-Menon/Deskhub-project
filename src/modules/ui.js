/**
 * modules/ui.js — UI Primitives (Toast, Modal, Loader)
 *
 * Reusable UI bits used across pages.
 *
 * Suggested approach: each function appends/manipulates a fixed-position element.
 * No framework — just create elements with document.createElement.
 *
 * TODO:
 *   [ ] showToast(message, type = "info")
 *       - types: "info", "success", "error", "warning"
 *       - auto-dismiss after 3 seconds
 *       - stack multiple if called rapidly
 *   [ ] openModal(contentNode | htmlString)
 *       - dim background, render modal in centre
 *       - close on Esc, click outside, or close button
 *       - return a promise that resolves on close (with whatever the modal returns)
 *   [ ] closeModal()
 *   [ ] showLoader() / hideLoader()
 *       - simple overlay or spinner; could be inline or full-screen
 *   [ ] confirmDialog(message) — returns a Promise<boolean>; uses your modal
 */

// export function showToast(message, type = "info") {
//   // TODO
// }

// export function openModal(content) {
//   // TODO
// }

// export function closeModal() {
//   // TODO
// }

// export function showLoader() {
//   // TODO
// }

// export function hideLoader() {
//   // TODO
// }

// export function confirmDialog(message) {
//   // TODO
// }
