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
