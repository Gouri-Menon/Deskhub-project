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


import { listTickets, getUsers } from "../api/tickets.js";
import { debounce } from "../utils/debounce.js";
import { formatDate } from "../utils/formatDate.js";

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
  const token = localStorage.getItem("deskhub:token");

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  try {
    const response = await getUsers();
users = response.data;
    populateAssigneeDropdown();
    attachEventListeners();

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

    state.items = response.data || response;

    if (response.total) {
      state.total = response.total;
    }

    renderTable(state.items);
    renderPagination(state.total, state.page, state.limit);

    hideError();
  } catch (error) {
    console.error(error);

    showError(`
      Failed to load tickets.
      <button id="retry-btn">Retry</button>
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
        <tr>
          <td>${ticket.id}</td>
          <td>${ticket.title}</td>
          <td>${ticket.customer}</td>
          <td>${ticket.priority}</td>
          <td>${ticket.status}</td>
          <td>${assignee ? assignee.name : "-"}</td>
          <td>${formatDate(ticket.createdAt)}</td>
        </tr>
      `;
    })
    .join("");
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
      refresh();
    });

  document
    .getElementById("new-ticket-btn")
    ?.addEventListener("click", openCreateModal);
}

function openCreateModal() {
  alert("Create Ticket Modal - Day 31");
}

function showLoading() {
  const loading = document.getElementById("loading");

  if (loading) {
    loading.style.display = "block";
  }
}

function hideLoading() {
  const loading = document.getElementById("loading");

  if (loading) {
    loading.style.display = "none";
  }
}

function showError(message) {
  const error = document.getElementById("error");

  if (error) {
    error.innerHTML = message;
    error.style.display = "block";
  }
}

function hideError() {
  const error = document.getElementById("error");

  if (error) {
    error.style.display = "none";
  }
}