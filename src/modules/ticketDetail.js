import {
  getTicket,
  updateTicket,
  deleteTicket,
  listComments,
  addComment,
  updateComment,
  deleteComment,
  getUsers,
} from "../api/tickets.js";
import { get } from "../utils/storage.js";
import { formatDate } from "../utils/formatDate.js";
import { showToast, showLoader, hideLoader, confirmModal } from "./ui.js";

let currentId = null;
let users = [];
let ticketEditing = false;
let commentMenuOutsideBound = false;

/** Last saved status / priority / assignee for Cancel + after load. */
let ticketFieldSnapshot = null;

/** If the request finishes faster than `ms`, wait so “Sending…” is visible. */
function withMinDuration(ms, promise) {
  const started = performance.now();
  return promise.then((value) => {
    const elapsed = performance.now() - started;
    const wait = Math.max(0, ms - elapsed);
    return wait > 0
      ? new Promise((resolve) => {
          setTimeout(() => resolve(value), wait);
        })
      : value;
  });
}

export async function initTicketDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  if (!Number.isFinite(id) || id < 1) {
    showFatal("Missing or invalid ticket id.");
    return;
  }
  currentId = id;

  try {
    showLoader({ slow: true });
    const [usersRes, ticketRes, commentsRes] = await Promise.all([
      getUsers(),
      getTicket(id),
      listComments(id),
    ]);

    users = usersRes.data || [];
    const ticket = ticketRes.data;
    const comments = commentsRes.data || [];

    if (!ticket) {
      showFatal("Ticket not found.");
      return;
    }

    renderTicket(ticket);
    renderComments(comments);
    wireEditToggle();
    wireSaveTicket();
    wireComments();
    wireCommentActions();
    wireDelete();
  } catch (e) {
    console.error(e);
    showFatal(e instanceof Error ? e.message : "Failed to load ticket.");
  } finally {
    hideLoader();
  }
}

function showFatal(msg) {
  const root = document.getElementById("ticket-detail-root");
  if (root) {
    root.innerHTML = `<p class="error-text">${escapeHtml(msg)}</p><p><a href="/tickets.html">← Back to tickets</a></p>`;
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function snapshotFromTicket(t) {
  ticketFieldSnapshot = {
    status: t.status || "open",
    priority: t.priority || "medium",
    assignedTo:
      t.assignedTo == null || t.assignedTo === "" ? null : Number(t.assignedTo),
    description: t.description != null ? String(t.description) : "",
  };
}

function applySnapshotToControls() {
  if (!ticketFieldSnapshot) return;
  const statusSel = document.getElementById("status-select");
  const prioritySel = document.getElementById("priority-select");
  const assigneeSel = document.getElementById("assignee-select");
  if (statusSel) statusSel.value = ticketFieldSnapshot.status;
  if (prioritySel) prioritySel.value = ticketFieldSnapshot.priority;
  if (assigneeSel) {
    const v =
      ticketFieldSnapshot.assignedTo == null
        ? ""
        : String(ticketFieldSnapshot.assignedTo);
    assigneeSel.value = v;
  }
  const descP = document.getElementById("ticket-description");
  const descTa = document.getElementById("ticket-description-edit");
  const d = ticketFieldSnapshot.description ?? "";
  if (descP) descP.textContent = d.trim() ? d : "—";
  if (descTa) descTa.value = d;
}

function snapshotFromControls() {
  const statusSel = document.getElementById("status-select");
  const prioritySel = document.getElementById("priority-select");
  const assigneeSel = document.getElementById("assignee-select");
  const descTa = document.getElementById("ticket-description-edit");
  const assignedRaw = assigneeSel?.value ?? "";
  ticketFieldSnapshot = {
    status: statusSel?.value || "open",
    priority: prioritySel?.value || "medium",
    assignedTo: assignedRaw === "" ? null : Number(assignedRaw),
    description: descTa?.value ?? "",
  };
}

function setTicketEditing(on) {
  ticketEditing = on;
  const controls = document.getElementById("ticket-controls");
  const statusSel = document.getElementById("status-select");
  const prioritySel = document.getElementById("priority-select");
  const assigneeSel = document.getElementById("assignee-select");
  const saveBtn = document.getElementById("save-ticket-btn");
  const toggle = document.getElementById("edit-ticket-toggle-btn");

  if (controls) {
    controls.classList.toggle("ticket-controls--locked", !on);
  }
  for (const el of [statusSel, prioritySel, assigneeSel]) {
    if (el) el.disabled = !on;
  }
  if (saveBtn) saveBtn.disabled = !on;
  const descView = document.getElementById("ticket-description");
  const descEdit = document.getElementById("ticket-description-edit");
  const descScroll = document.querySelector(".ticket-description-scroll");
  if (descScroll) descScroll.classList.toggle("ticket-description-scroll--edit", on);
  if (descView && descEdit) {
    if (on) {
      descEdit.value = ticketFieldSnapshot
        ? String(ticketFieldSnapshot.description ?? "")
        : descView.textContent === "—"
          ? ""
          : descView.textContent;
      descView.hidden = true;
      descEdit.hidden = false;
    } else {
      descView.hidden = false;
      descEdit.hidden = true;
    }
  }
  if (toggle) {
    toggle.classList.toggle("ticket-edit-pen-btn--editing", on);
    toggle.setAttribute("aria-pressed", on ? "true" : "false");
    toggle.setAttribute(
      "aria-label",
      on
        ? "Exit edit mode and revert unsaved changes"
        : "Edit description, status, priority, and assignee"
    );
    toggle.title = on
      ? "Exit edit mode (revert unsaved changes)"
      : "Edit description, status, priority, and assignee";
  }
}

function renderTicket(t) {
  setText("ticket-title", t.title);
  setText("ticket-meta", `#${t.id} · ${formatDate(t.createdAt)}`);

  const desc = document.getElementById("ticket-description");
  const descTa = document.getElementById("ticket-description-edit");
  const rawDesc = t.description != null ? String(t.description) : "";
  if (desc) desc.textContent = rawDesc.trim() ? rawDesc : "—";
  if (descTa) descTa.value = rawDesc;

  setText(
    "ticket-customer",
    `${t.customerName || "—"} · ${t.customerEmail || ""}`.trim()
  );

  const statusSel = document.getElementById("status-select");
  if (statusSel) statusSel.value = t.status || "";

  const priSel = document.getElementById("priority-select");
  if (priSel) priSel.value = t.priority || "";

  const assignSel = document.getElementById("assignee-select");
  if (assignSel) {
    assignSel.innerHTML =
      `<option value="">Unassigned</option>` +
      users
        .map(
          (u) =>
            `<option value="${u.id}" ${
              String(u.id) === String(t.assignedTo) ? "selected" : ""
            }>${escapeHtml(u.name)}</option>`
        )
        .join("");
  }

  const statusEl = document.getElementById("ticket-save-status");
  if (statusEl) statusEl.textContent = "";

  snapshotFromTicket(t);
  setTicketEditing(false);
}

function commentHeadHtml(name, whenIso, suffixHtml = "") {
  const when = escapeHtml(String(whenIso || ""));
  return `<div class="comment-head">
    <div class="comment-meta">
      <strong class="comment-author">${escapeHtml(name)}</strong>
      <span class="comment-meta-sep" aria-hidden="true">·</span>
      <time class="comment-date" datetime="${when}">${formatDate(whenIso)}</time>
    </div>${suffixHtml}</div>`;
}

function commentItemHtml(c, { pending = false } = {}) {
  const author = users.find((u) => u.id === c.authorId);
  const name = author ? author.name : `User #${c.authorId}`;
  const pendingTag = pending
    ? '<span class="comment-pending-badge" aria-live="polite">Sending…</span>'
    : "";
  const bodyHtml = escapeHtml(c.content);
  const me = get("user");
  const isOwn =
    !pending &&
    c.id != null &&
    me?.id != null &&
    Number(me.id) === Number(c.authorId);

  if (pending) {
    return `<li class="comment-item comment-item--pending" data-pending="1">
    ${commentHeadHtml(name, c.createdAt, pendingTag)}
    <div class="comment-view"><p class="comment-text">${bodyHtml}</p></div></li>`;
  }

  const idAttr = ` data-comment-id="${Number(c.id)}"`;
  const whenIso = c.updatedAt || c.createdAt;
  const ownClass = isOwn ? " comment-item--own" : "";
  const menuId = `comment-menu-${c.id}`;
  const toolbar = isOwn
    ? `<div class="comment-toolbar">
        <div class="comment-menu-wrap">
          <button type="button" class="comment-tool-btn comment-tool-btn--icon-only" data-comment-action="toggle-menu" data-comment-id="${c.id}" aria-expanded="false" aria-haspopup="true" aria-controls="${menuId}" title="Edit or delete comment" aria-label="Comment options">
            <svg class="comment-tool-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <div class="comment-menu" id="${menuId}" role="menu" hidden>
            <button type="button" class="comment-menu-item" role="menuitem" data-comment-action="edit" data-comment-id="${c.id}">
              <svg class="comment-menu-item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <span>Edit</span>
            </button>
            <button type="button" class="comment-menu-item comment-menu-item--danger" role="menuitem" data-comment-action="delete" data-comment-id="${c.id}">
              <svg class="comment-menu-item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>`
    : "";

  const editShell = isOwn
    ? `<div class="comment-edit">
        <div class="comment-edit-header">
          <span class="comment-edit-label">Edit comment</span>
        </div>
        <textarea class="comment-edit-textarea" rows="4" aria-label="Edit comment text"></textarea>
        <div class="comment-edit-footer">
          <button type="button" class="comment-edit-cancel" data-comment-action="cancel-edit" data-comment-id="${c.id}">Cancel</button>
          <button type="button" class="comment-edit-save" data-comment-action="save-edit" data-comment-id="${c.id}">Save changes</button>
        </div>
      </div>`
    : "";

  return `<li class="comment-item${ownClass}"${idAttr}>
    ${commentHeadHtml(name, whenIso, toolbar)}
    <div class="comment-view">
      <p class="comment-text">${bodyHtml}</p>
    </div>
    ${editShell}
  </li>`;
}

function renderComments(comments) {
  const ul = document.getElementById("comments-list");
  if (!ul) return;

  if (!comments.length) {
    ul.innerHTML = "<li class=\"comment-empty\">No comments yet.</li>";
    return;
  }

  ul.innerHTML = comments
    .map((c) => commentItemHtml(c, { pending: false }))
    .join("");
}

async function reloadComments() {
  const res = await listComments(currentId);
  renderComments(res.data || []);
}

function wireEditToggle() {
  const btn = document.getElementById("edit-ticket-toggle-btn");
  if (!btn || btn.dataset.wired === "1") return;
  btn.dataset.wired = "1";
  btn.addEventListener("click", () => {
    if (ticketEditing) {
      applySnapshotToControls();
      setTicketEditing(false);
    } else {
      setTicketEditing(true);
    }
  });
}

function wireSaveTicket() {
  const btn = document.getElementById("save-ticket-btn");
  const statusEl = document.getElementById("ticket-save-status");

  if (!btn || btn.dataset.wired === "1") return;
  btn.dataset.wired = "1";

  btn.addEventListener("click", async () => {
    if (!currentId || !ticketEditing) return;

    const statusSel = document.getElementById("status-select");
    const prioritySel = document.getElementById("priority-select");
    const assigneeSel = document.getElementById("assignee-select");
    const descEdit = document.getElementById("ticket-description-edit");

    const assignedRaw = assigneeSel?.value ?? "";

    btn.disabled = true;
    if (statusEl) statusEl.textContent = "";

    try {
      await updateTicket(currentId, {
        status: statusSel?.value,
        priority: prioritySel?.value,
        assignedTo: assignedRaw === "" ? null : Number(assignedRaw),
        description: descEdit?.value?.trim() ?? "",
      });
      if (statusEl) statusEl.textContent = "";
      snapshotFromControls();
      const descView = document.getElementById("ticket-description");
      const savedDesc = descEdit?.value?.trim() ?? "";
      if (descView) descView.textContent = savedDesc || "—";
      showToast("Ticket updated.", { type: "success" });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed", {
        type: "error",
      });
    } finally {
      btn.disabled = !ticketEditing;
    }
  });
}

function wireComments() {
  document
    .getElementById("add-comment-btn")
    ?.addEventListener("click", async () => {
      const ta = document.getElementById("new-comment");
      const btn = document.getElementById("add-comment-btn");
      const content = ta?.value?.trim();
      if (!content) return;

      const user = get("user");
      if (!user?.id) {
        showToast("Not logged in.", { type: "error" });
        return;
      }

      const ul = document.getElementById("comments-list");
      if (!ul) return;

      const btnLabel = btn?.textContent?.trim() || "Post comment";

      const optimistic = {
        id: null,
        authorId: user.id,
        content,
        createdAt: new Date().toISOString(),
      };

      const emptyRow = ul.querySelector(".comment-empty");
      if (emptyRow) emptyRow.remove();

      const wrap = document.createElement("div");
      wrap.innerHTML = commentItemHtml(optimistic, { pending: true });
      const pendingLi = wrap.firstElementChild;
      if (!pendingLi) return;

      ul.appendChild(pendingLi);
      ta.value = "";
      ul.setAttribute("aria-busy", "true");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Posting…";
        btn.setAttribute("aria-busy", "true");
      }
      if (ta) ta.disabled = true;

      try {
        const res = await withMinDuration(
          350,
          addComment({
            ticketId: currentId,
            authorId: user.id,
            content,
          })
        );
        pendingLi.remove();
        const saved = res?.data;
        if (saved && typeof saved === "object") {
          ul.insertAdjacentHTML("beforeend", commentItemHtml(saved));
        } else {
          await reloadComments();
        }
        showToast("Comment posted.", { type: "success" });
      } catch (err) {
        pendingLi.remove();
        ta.value = content;
        if (!ul.querySelector(".comment-item")) {
          ul.innerHTML = "<li class=\"comment-empty\">No comments yet.</li>";
        }
        showToast(
          err instanceof Error ? err.message : "Failed to add comment",
          { type: "error" }
        );
      } finally {
        ul.removeAttribute("aria-busy");
        if (btn) {
          btn.disabled = false;
          btn.textContent = btnLabel;
          btn.removeAttribute("aria-busy");
        }
        if (ta) ta.disabled = false;
      }
    });
}

function closeOtherCommentEdits(exceptLi) {
  document
    .querySelectorAll("#comments-list li.comment-item--editing")
    .forEach((li) => {
      if (li !== exceptLi) li.classList.remove("comment-item--editing");
    });
}

function closeAllCommentMenus() {
  document.querySelectorAll(".comment-menu-wrap--open").forEach((wrap) => {
    wrap.classList.remove("comment-menu-wrap--open");
    const menu = wrap.querySelector(".comment-menu");
    const trigger = wrap.querySelector('[data-comment-action="toggle-menu"]');
    if (menu) menu.hidden = true;
    if (trigger) trigger.setAttribute("aria-expanded", "false");
  });
}

function wireCommentActions() {
  const ul = document.getElementById("comments-list");
  if (!ul || ul.dataset.commentActionsWired === "1") return;
  ul.dataset.commentActionsWired = "1";

  if (!commentMenuOutsideBound) {
    commentMenuOutsideBound = true;
    document.addEventListener("click", (e) => {
      const t = e.target;
      if (!(t instanceof Node)) return;
      const el = t instanceof Element ? t : t.parentElement;
      if (el?.closest?.(".comment-menu-wrap")) return;
      closeAllCommentMenus();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAllCommentMenus();
    });
  }

  ul.addEventListener("click", async (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const actionEl = t.closest("[data-comment-action]");
    if (!actionEl || !ul.contains(actionEl)) return;

    const action = actionEl.getAttribute("data-comment-action");
    const idStr = actionEl.getAttribute("data-comment-id");
    const id = idStr != null ? Number(idStr) : NaN;
    if (!Number.isFinite(id) || !action) return;

    const li = ul.querySelector(`li.comment-item[data-comment-id="${idStr}"]`);
    if (!li || li.hasAttribute("data-pending")) return;

    if (action === "toggle-menu") {
      e.stopPropagation();
      const wrap = actionEl.closest(".comment-menu-wrap");
      const menu = wrap?.querySelector(".comment-menu");
      if (!wrap || !menu) return;
      const wasOpen = wrap.classList.contains("comment-menu-wrap--open");
      closeAllCommentMenus();
      if (!wasOpen) {
        wrap.classList.add("comment-menu-wrap--open");
        menu.hidden = false;
        actionEl.setAttribute("aria-expanded", "true");
      }
      return;
    }

    if (action === "edit") {
      closeAllCommentMenus();
      closeOtherCommentEdits(li);
      li.classList.add("comment-item--editing");
      const ta = li.querySelector(".comment-edit-textarea");
      const p = li.querySelector(".comment-text");
      if (ta && p) ta.value = p.textContent;
      ta?.focus();
      return;
    }

    if (action === "cancel-edit") {
      li.classList.remove("comment-item--editing");
      closeAllCommentMenus();
      return;
    }

    if (action === "save-edit") {
      const ta = li.querySelector(".comment-edit-textarea");
      const text = ta?.value?.trim() ?? "";
      if (!text) {
        showToast("Comment cannot be empty.", { type: "warning" });
        return;
      }
      const saveBtn = li.querySelector('[data-comment-action="save-edit"]');
      const cancelBtn = li.querySelector('[data-comment-action="cancel-edit"]');
      for (const b of [saveBtn, cancelBtn]) if (b) b.disabled = true;
      try {
        const res = await updateComment(id, { content: text });
        const saved = res?.data;
        li.classList.remove("comment-item--editing");
        closeAllCommentMenus();
        const p = li.querySelector(".comment-text");
        if (p) p.textContent = saved?.content ?? text;
        const dateEl = li.querySelector(".comment-date");
        if (dateEl) {
          const iso = saved?.updatedAt || saved?.createdAt || new Date().toISOString();
          dateEl.textContent = formatDate(iso);
          dateEl.setAttribute("datetime", iso);
        }
        showToast("Comment updated.", { type: "success" });
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Update failed", {
          type: "error",
        });
      } finally {
        for (const b of [saveBtn, cancelBtn]) if (b) b.disabled = false;
      }
      return;
    }

    if (action === "delete") {
      closeAllCommentMenus();
      const ok = await confirmModal(
        "Delete this comment? This cannot be undone.",
        {
          title: "Delete comment",
          confirmLabel: "Delete",
          cancelLabel: "Keep",
          danger: true,
        }
      );
      if (!ok) return;

      try {
        await deleteComment(id);
        li.remove();
        if (!ul.querySelector("li.comment-item")) {
          ul.innerHTML = "<li class=\"comment-empty\">No comments yet.</li>";
        }
        showToast("Comment deleted.", { type: "success" });
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Delete failed", {
          type: "error",
        });
      }
    }
  });
}

function wireDelete() {
  document.getElementById("delete-btn")?.addEventListener("click", async () => {
    const ok = await confirmModal(
      "This ticket will be permanently deleted. Continue?",
      {
        title: "Delete ticket",
        confirmLabel: "Delete",
        cancelLabel: "Keep",
        danger: true,
      }
    );
    if (!ok) return;

    try {
      showLoader({ slow: true });
      await deleteTicket(currentId);
      hideLoader();
      window.location.href = "/tickets.html";
    } catch (err) {
      hideLoader();
      showToast(err instanceof Error ? err.message : "Delete failed", {
        type: "error",
      });
    }
  });
}
