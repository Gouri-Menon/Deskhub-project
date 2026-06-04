import {
  getTicket,
  updateTicket,
  deleteTicket,
  listComments,
  addComment,
  getUsers,
} from "../api/tickets.js";
import { get } from "../utils/storage.js";
import { formatDate } from "../utils/formatDate.js";

let currentId = null;
let users = [];

export async function initTicketDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  if (!Number.isFinite(id) || id < 1) {
    showFatal("Missing or invalid ticket id.");
    return;
  }
  currentId = id;

  try {
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
    wireSaveTicket();
    wireComments();
    wireDelete();
  } catch (e) {
    console.error(e);
    showFatal(e instanceof Error ? e.message : "Failed to load ticket.");
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

function renderTicket(t) {
  setText("ticket-title", t.title);
  setText("ticket-meta", `#${t.id} · ${formatDate(t.createdAt)}`);

  const desc = document.getElementById("ticket-description");
  if (desc) desc.textContent = t.description || "—";

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
}

function renderComments(comments) {
  const ul = document.getElementById("comments-list");
  if (!ul) return;

  if (!comments.length) {
    ul.innerHTML = "<li class=\"comment-empty\">No comments yet.</li>";
    return;
  }

  ul.innerHTML = comments
    .map((c) => {
      const author = users.find((u) => u.id === c.authorId);
      const name = author ? author.name : `User #${c.authorId}`;
      return `<li class="comment-item"><div class="comment-head"><strong>${escapeHtml(
        name
      )}</strong><span class="comment-date">${formatDate(
        c.createdAt
      )}</span></div><p>${escapeHtml(c.content)}</p></li>`;
    })
    .join("");
}

async function reloadComments() {
  const res = await listComments(currentId);
  renderComments(res.data || []);
}

function wireSaveTicket() {
  const btn = document.getElementById("save-ticket-btn");
  const statusEl = document.getElementById("ticket-save-status");

  btn?.addEventListener("click", async () => {
    if (!currentId) return;

    const statusSel = document.getElementById("status-select");
    const prioritySel = document.getElementById("priority-select");
    const assigneeSel = document.getElementById("assignee-select");

    const assignedRaw = assigneeSel?.value ?? "";

    btn.disabled = true;
    if (statusEl) statusEl.textContent = "";

    try {
      await updateTicket(currentId, {
        status: statusSel?.value,
        priority: prioritySel?.value,
        assignedTo: assignedRaw === "" ? null : Number(assignedRaw),
      });
      if (statusEl) statusEl.textContent = "Saved.";
      window.setTimeout(() => {
        if (statusEl?.textContent === "Saved.") statusEl.textContent = "";
      }, 2800);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      btn.disabled = false;
    }
  });
}

function wireComments() {
  document
    .getElementById("add-comment-btn")
    ?.addEventListener("click", async () => {
      const ta = document.getElementById("new-comment");
      const content = ta?.value?.trim();
      if (!content) return;

      const user = get("user");
      if (!user?.id) {
        alert("Not logged in");
        return;
      }

      try {
        await addComment({
          ticketId: currentId,
          authorId: user.id,
          content,
        });
        ta.value = "";
        await reloadComments();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to add comment");
      }
    });
}

function wireDelete() {
  document.getElementById("delete-btn")?.addEventListener("click", async () => {
    if (!confirm("Delete this ticket? This cannot be undone.")) return;
    try {
      await deleteTicket(currentId);
      window.location.href = "/tickets.html";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  });
}
