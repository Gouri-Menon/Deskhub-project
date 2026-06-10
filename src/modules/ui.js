/**
 * Global UI: toast queue, confirm modal, ref-counted loader (optional `deferMs`; `slow` full-screen).
 * Call initUi() once on boot (see main.js).
 */

const LOADER_MIN_VISIBLE_MS = 550;
const TOAST_MAX_VISIBLE = 4;
const TOAST_TYPES = new Set(["info", "success", "error", "warning"]);

/** @type {Array<{ message: string; options: Record<string, unknown> }>} */
let toastQueue = [];
/** @type {number} */
let toastActiveCount = 0;

let loaderEl = null;
let toastStackEl = null;
let loaderVisibleSince = null;
let loaderHideTimeoutId = null;
/** Nested logical operations (each showLoader call). */
let loaderNesting = 0;
/** Overlay is actually visible. */
let loaderVisible = false;
let loaderDeferTimer = null;

function escapeHtmlText(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function initUi() {
  if (!toastStackEl) {
    toastStackEl = document.createElement("div");
    toastStackEl.id = "toast-stack";
    toastStackEl.className = "toast-stack";
    toastStackEl.setAttribute("aria-label", "Notifications");
    document.body.appendChild(toastStackEl);
  }

  if (!loaderEl) {
    loaderEl = document.createElement("div");
    loaderEl.id = "global-loader";
    loaderEl.className = "global-loader is-hidden";
    loaderEl.setAttribute("role", "status");
    loaderEl.setAttribute("aria-busy", "false");
    loaderEl.setAttribute("aria-valuetext", "Loading");
    loaderEl.innerHTML = `
      <div class="global-loader__panel">
        <div class="global-loader__spinner" aria-hidden="true"></div>
        <p class="global-loader__text">Loading…</p>
      </div>
    `;
    document.body.appendChild(loaderEl);
  }
}

function defaultToastDuration(type) {
  if (type === "error") return 5200;
  return 3600;
}

function mountOneToast(message, options) {
  initUi();

  const type = TOAST_TYPES.has(options.type) ? options.type : "info";
  const duration =
    typeof options.duration === "number"
      ? options.duration
      : defaultToastDuration(type);

  const el = document.createElement("div");
  el.className = `toast toast--${type}`;
  el.setAttribute("role", "status");
  el.textContent = message;

  toastStackEl.appendChild(el);
  toastActiveCount += 1;
  requestAnimationFrame(() => {
    el.classList.add("toast--visible");
  });

  const remove = () => {
    if (!el.isConnected) return;
    el.classList.remove("toast--visible");
    el.classList.add("toast--leaving");
    window.setTimeout(() => {
      el.remove();
      toastActiveCount = Math.max(0, toastActiveCount - 1);
      drainToastQueue();
    }, 260);
  };

  const tid = window.setTimeout(remove, duration);
  el.addEventListener("click", () => {
    window.clearTimeout(tid);
    remove();
  });
}

function drainToastQueue() {
  while (toastActiveCount < TOAST_MAX_VISIBLE && toastQueue.length) {
    const next = toastQueue.shift();
    if (next) mountOneToast(next.message, next.options);
  }
}

/**
 * @param {string} message
 * @param {{ type?: "info"|"success"|"error"|"warning"; duration?: number }} [options]
 */
export function showToast(message, options = {}) {
  const opts = options && typeof options === "object" ? options : {};
  if (toastActiveCount < TOAST_MAX_VISIBLE) {
    mountOneToast(message, opts);
  } else {
    toastQueue.push({ message, options: opts });
  }
}

/** Dismiss the most recently shown visible toast (keyboard shortcut). */
export function dismissTopToast() {
  if (!toastStackEl) return;
  const nodes = toastStackEl.querySelectorAll(".toast.toast--visible");
  const last = nodes[nodes.length - 1];
  if (last) last.click();
}

function clearLoaderDeferTimer() {
  if (loaderDeferTimer != null) {
    window.clearTimeout(loaderDeferTimer);
    loaderDeferTimer = null;
  }
}

function clearLoaderHideSchedule() {
  if (loaderHideTimeoutId != null) {
    window.clearTimeout(loaderHideTimeoutId);
    loaderHideTimeoutId = null;
  }
}

function finishLoaderHide() {
  if (loaderNesting > 0) return;
  loaderEl?.classList.add("is-hidden");
  loaderEl?.classList.remove("global-loader--slow");
  loaderEl?.setAttribute("aria-busy", "false");
  loaderVisible = false;
  loaderVisibleSince = null;
  loaderHideTimeoutId = null;
}

function openLoaderVisual() {
  if (!loaderEl || loaderVisible) return;
  loaderVisible = true;
  loaderVisibleSince = Date.now();
  loaderEl.classList.remove("is-hidden");
  loaderEl.setAttribute("aria-busy", "true");
}

/**
 * @param {{ deferMs?: number; slow?: boolean }} [opts]
 * - deferMs: wait before showing overlay. If `hideLoader()` runs before this delay ends, the
 *   overlay is never shown (good for avoiding flashes on very slow networks only). For a
 *   typical local API, omit `deferMs` or use `0` so the loader is visible.
 * - slow: stronger full-screen treatment (darker scrim, larger panel).
 */
export function showLoader(opts = {}) {
  initUi();
  clearLoaderHideSchedule();

  const deferMs =
    typeof opts.deferMs === "number" && opts.deferMs > 0 ? opts.deferMs : 0;
  const slow = !!opts.slow;

  loaderNesting += 1;

  if (slow) {
    loaderEl?.classList.add("global-loader--slow");
  }

  if (loaderVisible) return;

  if (deferMs === 0) {
    clearLoaderDeferTimer();
    openLoaderVisual();
  } else {
    clearLoaderDeferTimer();
    loaderDeferTimer = window.setTimeout(() => {
      loaderDeferTimer = null;
      if (loaderNesting > 0) openLoaderVisual();
    }, deferMs);
  }
}

export function hideLoader() {
  if (loaderNesting <= 0) return;
  loaderNesting -= 1;

  if (loaderNesting === 0) {
    clearLoaderDeferTimer();
  }

  if (loaderNesting > 0) return;

  if (!loaderVisible) {
    finishLoaderHide();
    return;
  }

  clearLoaderHideSchedule();

  const since = loaderVisibleSince;
  if (since == null) {
    finishLoaderHide();
    return;
  }

  const elapsed = Date.now() - since;
  const wait = Math.max(0, LOADER_MIN_VISIBLE_MS - elapsed);

  if (wait === 0) {
    finishLoaderHide();
    return;
  }

  loaderHideTimeoutId = window.setTimeout(() => {
    if (loaderNesting > 0) return;
    finishLoaderHide();
  }, wait);
}

/**
 * Animated confirm dialog. Replaces window.confirm for destructive flows.
 * @param {string} message
 * @param {{ title?: string; confirmLabel?: string; cancelLabel?: string; danger?: boolean }} [opts]
 * @returns {Promise<boolean>}
 */
export function confirmModal(message, opts = {}) {
  initUi();

  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.className = "app-modal-backdrop";
    backdrop.setAttribute("role", "presentation");
    document.body.dataset.uiModal = "1";

    const title = opts.title ? escapeHtmlText(opts.title) : "Confirm";
    const confirmLabel = escapeHtmlText(opts.confirmLabel || "OK");
    const cancelLabel = escapeHtmlText(opts.cancelLabel || "Cancel");
    const msg = escapeHtmlText(message);
    const danger = !!opts.danger;

    const confirmClass = danger
      ? "app-modal__btn app-modal__confirm danger-btn"
      : "app-modal__btn app-modal__confirm app-modal__confirm--primary";

    backdrop.innerHTML = `
      <div class="app-modal" role="dialog" aria-modal="true" aria-labelledby="app-modal-title">
        <h2 id="app-modal-title" class="app-modal__title">${title}</h2>
        <p class="app-modal__message">${msg}</p>
        <div class="app-modal__actions">
          <button type="button" class="secondary-btn app-modal__btn app-modal__cancel">${cancelLabel}</button>
          <button type="button" class="${confirmClass}">${confirmLabel}</button>
        </div>
      </div>
    `;

    const panel = backdrop.querySelector(".app-modal");
    const btnCancel = backdrop.querySelector(".app-modal__cancel");
    const btnConfirm = backdrop.querySelector(".app-modal__confirm");

    let settled = false;
    function done(value) {
      if (settled) return;
      settled = true;
      document.removeEventListener("keydown", onKey, true);
      backdrop.classList.remove("app-modal-backdrop--visible");
      panel?.classList.remove("app-modal--visible");
      window.setTimeout(() => {
        backdrop.remove();
        delete document.body.dataset.uiModal;
        resolve(value);
      }, 220);
    }

    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        done(false);
      }
    }

    document.addEventListener("keydown", onKey, true);

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) done(false);
    });

    btnCancel?.addEventListener("click", () => done(false));
    btnConfirm?.addEventListener("click", () => done(true));

    document.body.appendChild(backdrop);
    requestAnimationFrame(() => {
      backdrop.classList.add("app-modal-backdrop--visible");
      panel?.classList.add("app-modal--visible");
      (danger ? btnConfirm : btnCancel)?.focus();
    });
  });
}
