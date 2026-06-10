import { login, logout as logoutRequest } from "../api/auth.js";
import { set, get, clear } from "../utils/storage.js";
import { showToast, confirmModal } from "./ui.js";

export function isAuthenticated() {
  return !!get("token");
}

/** Public home: send signed-in users straight to the app. */
export function initLanding() {
  if (isAuthenticated()) {
    window.location.href = "/dashboard.html";
  }
}

export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = "/login.html";
    return false;
  }
  return true;
}

export function initLogin() {
  const form = document.getElementById("loginForm");
  const errorBanner = document.getElementById("errorBanner");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBanner?.classList.remove("is-visible");

    const email = document.getElementById("email")?.value?.trim() ?? "";
    const password = document.getElementById("password")?.value ?? "";

    try {
      const data = await login(email, password);
      set("token", data.token);
      set("user", data.user);
      window.location.href = "/dashboard.html";
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Sign in failed. Try again.";
      if (errorBanner) {
        errorBanner.textContent = msg;
        errorBanner.classList.add("is-visible");
      } else {
        showToast(msg, { type: "error" });
      }
    }
  });
}

/** Ask for confirmation, then end the server session (best-effort) and clear local auth. */
export async function promptLogoutAndRedirect() {
  const ok = await confirmModal(
    "Do you want to sign out? You will need to log in again to use DeskHub.",
    {
      title: "Sign out?",
      confirmLabel: "Log out",
      cancelLabel: "Stay signed in",
      danger: true,
    }
  );
  if (!ok) return;
  try {
    await logoutRequest();
  } catch {
    /* still clear locally if the API is unreachable */
  }
  doLogout();
}

/** Attach logout confirmation to `#logout-btn` (idempotent). */
export function wireLogoutControls() {
  const btn = document.getElementById("logout-btn");
  if (!btn || btn.dataset.logoutWired === "1") return;
  btn.dataset.logoutWired = "1";
  btn.addEventListener("click", () => {
    void promptLogoutAndRedirect();
  });
}

export function doLogout() {
  clear();
  window.location.href = "/login.html";
}
