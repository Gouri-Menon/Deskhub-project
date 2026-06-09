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

function labelForCurrentTheme() {
  return document.documentElement.dataset.theme === "light"
    ? "Dark mode"
    : "Light mode";
}

function titleForCurrentTheme() {
  return document.documentElement.dataset.theme === "light"
    ? "Switch to dark theme"
    : "Switch to light theme";
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
    btn.textContent = labelForCurrentTheme();
    btn.title = titleForCurrentTheme();
  });

  btn.textContent = labelForCurrentTheme();
  btn.title = titleForCurrentTheme();
  document.body.appendChild(btn);
}
