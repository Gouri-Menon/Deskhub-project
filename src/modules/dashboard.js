import { get } from "../utils/storage.js";
import { get as apiGet } from "../api/client.js";
import { formatDate } from "../utils/formatDate.js";
import { doLogout } from "./auth.js";

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

export async function initDashboard() {
  document.getElementById("logout-btn")?.addEventListener("click", () => {
    doLogout();
  });

  const user = get("user");
  if (user?.name) {
    setText("welcome-name", user.name);
  }

  const now = new Date();
  setText(
    "dashboard-date",
    new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(now)
  );

  try {
    const { data: tickets } = await apiGet("/tickets");
    const list = Array.isArray(tickets) ? tickets : [];

    setText("stat-total", String(list.length));
    setText(
      "stat-open",
      String(list.filter((t) => t.status === "open").length)
    );
    setText(
      "stat-in-progress",
      String(list.filter((t) => t.status === "in-progress").length)
    );
    setText(
      "stat-resolved",
      String(list.filter((t) => t.status === "resolved").length)
    );

    const recent = [...list]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);

    const tbody = document.getElementById("recent-tickets-body");
    if (tbody) {
      tbody.innerHTML = recent
        .map(
          (t) => `
        <tr data-href="/ticket-detail.html?id=${t.id}">
          <td>${t.id}</td>
          <td>${escapeHtml(t.title)}</td>
          <td><span class="badge ${badgeClass(t.status)}">${formatStatus(
            t.status
          )}</span></td>
          <td><span class="badge ${priorityClass(t.priority)}">${(
            t.priority || ""
          ).toUpperCase()}</span></td>
          <td>${formatDate(t.createdAt)}</td>
          <td class="td-actions">
            <a href="/ticket-detail.html?id=${
              t.id
            }" class="link-view-details">View</a>
          </td>
        </tr>`
        )
        .join("");

      tbody.querySelectorAll(".link-view-details").forEach((a) => {
        a.addEventListener("click", (e) => e.stopPropagation());
      });

      tbody.querySelectorAll("tr[data-href]").forEach((row) => {
        row.addEventListener("click", () => {
          const href = row.getAttribute("data-href");
          if (href) window.location.href = href;
        });
      });
    }
  } catch (e) {
    console.error(e);
    setText("stat-total", "—");
    const tbody = document.getElementById("recent-tickets-body");
    if (tbody) {
      tbody.innerHTML =
        '<tr><td colspan="6">Could not load tickets. Is the API running?</td></tr>';
    }
  }
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatStatus(status) {
  const map = {
    open: "OPEN",
    "in-progress": "IN PROGRESS",
    resolved: "RESOLVED",
    closed: "CLOSED",
  };
  return map[status] || String(status || "").toUpperCase();
}

function badgeClass(status) {
  if (status === "open") return "open";
  if (status === "in-progress") return "progress";
  if (status === "resolved") return "resolved";
  if (status === "closed") return "closed";
  return "open";
}

function priorityClass(p) {
  if (p === "urgent") return "urgent";
  if (p === "high") return "high";
  if (p === "medium") return "medium";
  if (p === "low") return "low";
  return "medium";
}
