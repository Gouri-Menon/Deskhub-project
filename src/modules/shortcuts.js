import { promptLogoutAndRedirect } from "./auth.js";
import { dismissTopToast } from "./ui.js";

const AUTH_PAGES_LOGOUT_ESCAPE = new Set([
  "dashboard",
  "tickets-list",
  "ticket-detail",
]);

/**
 * Lightweight keyboard helpers (page-aware).
 * - `/` on tickets list: focus search (when not typing in a field).
 * - `Escape`: dismiss top toast, or on signed-in app pages ask to sign out (when no modal / menu).
 */
export function initShortcuts(page) {
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.defaultPrevented) return;

      const tag = e.target?.tagName;
      const inField =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        e.target?.isContentEditable;

      if (e.key === "Escape" && !inField && !document.body.dataset.uiModal) {
        if (document.querySelector(".comment-menu-wrap--open")) {
          return;
        }
        if (AUTH_PAGES_LOGOUT_ESCAPE.has(page)) {
          const hasToast = document.querySelector(
            "#toast-stack .toast.toast--visible"
          );
          if (hasToast) {
            dismissTopToast();
            return;
          }
          e.preventDefault();
          void promptLogoutAndRedirect();
          return;
        }
        dismissTopToast();
        return;
      }

      if (page === "tickets-list" && e.key === "/" && !inField) {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
      }
    },
    false
  );
}
