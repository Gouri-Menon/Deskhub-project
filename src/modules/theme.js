import { get, set } from "../utils/storage.js";

const KEY = "theme";

/** @returns {"dark" | "light"} */
export function getStoredTheme() {
  const t = get(KEY);
  if (t === "light" || t === "dark") return t;
  return "dark";
}

/** @param {"dark" | "light"} mode */
export function applyTheme(mode) {
  document.documentElement.dataset.theme = mode;
}

/** @param {"dark" | "light"} mode */
export function persistTheme(mode) {
  set(KEY, mode);
  applyTheme(mode);
}

/** Apply saved theme before first paint (best-effort after module load). */
export function initTheme() {
  applyTheme(getStoredTheme());
}

function titleForCurrentTheme() {
  return document.documentElement.dataset.theme === "light"
    ? "Switch to dark theme"
    : "Switch to light theme";
}

function moonIconHtml() {
  return `<svg class="theme-toggle-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
}

function sunIconHtml() {
  return `<svg class="theme-toggle-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
}

/** Moon when light (go dark); sun when dark (go light). */
function renderThemeToggleButton(btn) {
  const isLight = document.documentElement.dataset.theme === "light";
  btn.innerHTML = isLight ? moonIconHtml() : sunIconHtml();
  const t = titleForCurrentTheme();
  btn.title = t;
  btn.setAttribute("aria-label", t);
}

/**
 * Floating toggle on every page. Persists to localStorage (`deskhub:theme`).
 */
export function mountThemeToggle() {
  initTheme();

  if (document.getElementById("theme-toggle-btn")) return;

  const btn = document.createElement("button");
  btn.id = "theme-toggle-btn";
  btn.type = "button";
  btn.className = "theme-toggle-btn";
  btn.addEventListener("click", () => {
    const next =
      document.documentElement.dataset.theme === "light" ? "dark" : "light";
    persistTheme(next);
    renderThemeToggleButton(btn);
  });

  renderThemeToggleButton(btn);
  document.body.appendChild(btn);
}
