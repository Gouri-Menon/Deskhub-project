/**
 * modules/tickets.js — Tickets List Page
 *
 * The big one. Combines fetch + render + search + filter + sort + paginate.
 *
 * Expected HTML elements (you design these in public/tickets.html):
 *   - <input id="search-input">              search box
 *   - <select id="filter-status">            status dropdown
 *   - <select id="filter-priority">          priority dropdown
 *   - <select id="filter-assignee">          assignee dropdown (load options from /users)
 *   - <select id="sort-by">                  sort dropdown
 *   - <table id="tickets-table"> (or list)   render rows here
 *   - <div id="pagination">                  prev / page numbers / next
 *   - <button id="new-ticket-btn">           opens create modal
 *   - <div id="loading">, <div id="error">   states
 *
 * Suggested local state shape:
 *   const state = {
 *     search: "",
 *     status: "",        // "" = all
 *     priority: "",
 *     assignee: "",
 *     sortBy: "createdAt",
 *     order: "desc",
 *     page: 1,
 *     limit: 10,
 *     items: [],
 *     total: 0,
 *     loading: false,
 *   };
 *
 * TODO:
 *   [ ] initTicketsList()
 *       - read filters/page from URL (so refresh keeps state — stretch goal)
 *       - wire up all event listeners (search uses debounce!)
 *       - call refresh() on every change
 *   [ ] refresh() — fetch with current filters and re-render
 *   [ ] renderTable(items)
 *   [ ] renderPagination(total, page, limit)
 *   [ ] openCreateModal() — show form, on submit call api.createTicket, then refresh
 */

// import { listTickets } from "../api/tickets.js";
// import { debounce } from "../utils/debounce.js";
// import { showToast, showLoader, hideLoader } from "./ui.js";
// import { requireAuth } from "./auth.js";

// const state = {
//   search: "", status: "", priority: "", assignee: "",
//   sortBy: "createdAt", order: "desc",
//   page: 1, limit: 10,
//   items: [], total: 0, loading: false,
// };

// export async function initTicketsList() {
//   requireAuth();
//   // TODO
// }

// async function refresh() { /* TODO */ }
// function renderTable(items) { /* TODO */ }
// function renderPagination(total, page, limit) { /* TODO */ }
// function openCreateModal() { /* TODO */ }


import { listTickets, getUsers, createTicket } from "../api/tickets.js";
import { debounce } from "../utils/debounce.js";
import { formatDate } from "../utils/formatDate.js";
import { get } from "../utils/storage.js";

const state = {
  search: "",
  status: "",
  priority: "",
  assignee: "",
  sortBy: "createdAt",
  order: "desc",
  page: 1,
  limit: 10,
  items: [],
  total: 0,
  loading: false,
};

let users = [];

export async function initTicketsList() {
  if (!get("token")) {
    window.location.href = "/index.html";
    return;
  }

  try {
    const response = await getUsers();
users = response.data;
    populateAssigneeDropdown();
    attachEventListeners();
    setupNewTicketDialog();

    await refresh();
  } catch (error) {
    console.error(error);
    showError("Failed to initialize tickets page");
  }
}

async function refresh() {
  try {
    showLoading();

    const response = await listTickets({
  search: state.search,
  status: state.status,
  priority: state.priority,
  assignee: state.assignee,
  sortBy: state.sortBy,
  order: state.order,
  page: state.page,
  limit: state.limit,
});

    state.items = Array.isArray(response.data) ? response.data : [];
    state.total =
      typeof response.total === "number"
        ? response.total
        : state.items.length;

    renderTable(state.items);
    renderPagination(state.total, state.page, state.limit);

    hideError();
  } catch (error) {
    console.error(error);

    const hint =
      error instanceof Error ? escapeHtml(error.message) : "Unknown error";

    showError(`
      <p><strong>Failed to load tickets.</strong></p>
      <p class="error-detail">${hint}</p>
      <button type="button" id="retry-btn">Retry</button>
    `);

    const retryBtn = document.getElementById("retry-btn");

    if (retryBtn) {
      retryBtn.addEventListener("click", refresh);
    }
  } finally {
    hideLoading();
  }
}



function renderTable(items) {
  const table = document.getElementById("tickets-table");

  if (!table) return;

  if (!items.length) {
    table.innerHTML = `
      <tr>
        <td colspan="7">No tickets found</td>
      </tr>
    `;
    return;
  }

  table.innerHTML = items
    .map((ticket) => {
      const assignee = users.find(
        (user) => String(user.id) === String(ticket.assignedTo)
      );

      return `
        <tr data-href="/ticket-detail.html?id=${ticket.id}">
          <td>${ticket.id}</td>
          <td>${escapeHtml(ticket.title)}</td>
          <td>${escapeHtml(
            ticket.customerName || ticket.customer || "—"
          )}</td>
          <td>${escapeHtml(ticket.priority)}</td>
          <td>${escapeHtml(ticket.status)}</td>
          <td>${assignee ? escapeHtml(assignee.name) : "-"}</td>
          <td>${formatDate(ticket.createdAt)}</td>
        </tr>
      `;
    })
    .join("");

  table.querySelectorAll("tr[data-href]").forEach((row) => {
    row.addEventListener("click", () => {
      const href = row.getAttribute("data-href");
      if (href) window.location.href = href;
    });
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderPagination(total, page, limit) {
  const pagination = document.getElementById("pagination");

  if (!pagination) return;

  const totalPages = Math.ceil(total / limit);

  let html = `
    <button
      id="prev-page"
      ${page === 1 ? "disabled" : ""}
    >
      Prev
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button
        class="page-btn"
        data-page="${i}"
        ${i === page ? "disabled" : ""}
      >
        ${i}
      </button>
    `;
  }

  html += `
    <button
      id="next-page"
      ${page === totalPages ? "disabled" : ""}
    >
      Next
    </button>
  `;

  pagination.innerHTML = html;

  document
    .querySelectorAll(".page-btn")
    .forEach((button) => {
      button.addEventListener("click", () => {
        state.page = Number(button.dataset.page);
        refresh();
      });
    });

  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      state.page--;
      refresh();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      state.page++;
      refresh();
    });
  }
}

function populateAssigneeDropdown() {
  const select = document.getElementById("filter-assignee");

  if (!select) return;

  select.innerHTML = `
    <option value="">All Assignees</option>
  `;

  users.forEach((user) => {
    select.innerHTML += `
      <option value="${user.id}">
        ${user.name}
      </option>
    `;
  });
}

function resetFilters() {
  state.search = "";
  state.status = "";
  state.priority = "";
  state.assignee = "";
  state.sortBy = "createdAt";
  state.order = "desc";
  state.page = 1;

  const searchEl = document.getElementById("search-input");
  if (searchEl) searchEl.value = "";
  const statusEl = document.getElementById("filter-status");
  if (statusEl) statusEl.value = "";
  const priorityEl = document.getElementById("filter-priority");
  if (priorityEl) priorityEl.value = "";
  const assigneeEl = document.getElementById("filter-assignee");
  if (assigneeEl) assigneeEl.value = "";
  const sortEl = document.getElementById("sort-by");
  if (sortEl) sortEl.value = "createdAt";
  const orderEl = document.getElementById("sort-order");
  if (orderEl) orderEl.value = "desc";

  refresh();
}

function attachEventListeners() {
  const searchInput = document.getElementById("search-input");

  if (searchInput) {
    searchInput.addEventListener(
      "input",
      debounce((event) => {
        state.search = event.target.value;
        state.page = 1;
        refresh();
      }, 300)
    );
  }

  document
    .getElementById("filter-status")
    ?.addEventListener("change", (event) => {
      state.status = event.target.value;
      state.page = 1;
      refresh();
    });

  document
    .getElementById("filter-priority")
    ?.addEventListener("change", (event) => {
      state.priority = event.target.value;
      state.page = 1;
      refresh();
    });

  document
    .getElementById("filter-assignee")
    ?.addEventListener("change", (event) => {
      state.assignee = event.target.value;
      state.page = 1;
      refresh();
    });

  document
    .getElementById("sort-by")
    ?.addEventListener("change", (event) => {
      state.sortBy = event.target.value;
      state.page = 1;
      refresh();
    });

  document
    .getElementById("sort-order")
    ?.addEventListener("change", (event) => {
      state.order = event.target.value;
      state.page = 1;
      refresh();
    });

  document
    .getElementById("reset-filters-btn")
    ?.addEventListener("click", resetFilters);

  document
    .getElementById("new-ticket-btn")
    ?.addEventListener("click", openCreateModal);
}

function setupNewTicketDialog() {
  const dialog = document.getElementById("new-ticket-dialog");
  const form = document.getElementById("new-ticket-form");
  const cancelBtn = document.getElementById("new-ticket-cancel");

  if (!dialog || !form || form.dataset.wired === "1") return;
  form.dataset.wired = "1";

  cancelBtn?.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const assignedRaw = fd.get("assignedTo");
    const payload = {
      title: String(fd.get("title") || "").trim(),
      description: String(fd.get("description") || "").trim(),
      customerName: String(fd.get("customerName") || "").trim(),
      customerEmail: String(fd.get("customerEmail") || "").trim(),
      category: String(fd.get("category") || "bug"),
      priority: String(fd.get("priority") || "medium"),
      status: String(fd.get("status") || "open"),
      assignedTo: assignedRaw ? Number(assignedRaw) : null,
    };

    if (!payload.title || !payload.description) {
      alert("Please enter a title and description.");
      return;
    }

    try {
      const res = await createTicket(payload);
      const created = res?.data;
      dialog.close();
      form.reset();
      state.page = 1;
      await refresh();
      if (created?.id) {
        window.location.href = `/ticket-detail.html?id=${created.id}`;
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not create ticket");
    }
  });
}

function openCreateModal() {
  const dialog = document.getElementById("new-ticket-dialog");
  const assignSelect = document.getElementById("new-ticket-assignee");
  if (!dialog || !assignSelect) return;

  assignSelect.innerHTML =
    `<option value="">Unassigned</option>` +
    users
      .map(
        (u) =>
          `<option value="${u.id}">${escapeHtml(u.name)}</option>`
      )
      .join("");

  dialog.showModal();
}

function showLoading() {
  const loading = document.getElementById("loading");
  loading?.classList.remove("is-hidden");
}

function hideLoading() {
  const loading = document.getElementById("loading");
  loading?.classList.add("is-hidden");
}

function showError(message) {
  const error = document.getElementById("error");

  if (error) {
    error.innerHTML = message;
    error.classList.remove("is-hidden");
  }
}

function hideError() {
  const error = document.getElementById("error");
  error?.classList.add("is-hidden");
}