import { login } from "../api/auth.js";
import { set, get, clear } from "../utils/storage.js";

export function isAuthenticated() {
  return !!get("token");
}

export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = "/index.html";
    return false;
  }
  return true;
}

export function initLogin() {
  const form = document.getElementById("loginForm");
  const errorBanner = document.getElementById("errorBanner");

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (errorBanner) errorBanner.style.display = "none";

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
        errorBanner.style.display = "block";
      } else {
        alert(msg);
      }
    }
  });
}

export function doLogout() {
  clear();
  window.location.href = "/index.html";
}
