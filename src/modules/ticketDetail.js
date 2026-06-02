/**
 * modules/ticketDetail.js — Ticket Detail Page
 *
 * Reads ticket id from URL (e.g., ticket.html?id=12), shows full info,
 * allows status/priority/assignee changes and comment thread.
 *
 * Expected HTML elements (you design these):
 *   - <h1 id="ticket-title">, <p id="ticket-description">, etc.
 *   - <select id="status-select">    — change status
 *   - <select id="priority-select">  — change priority
 *   - <select id="assignee-select">  — change assignee
 *   - <ul id="comments-list">        — render existing comments
 *   - <textarea id="new-comment">    — add a comment
 *   - <button id="add-comment-btn">
 *   - <button id="delete-btn">       — delete ticket (with confirmation)
 *
 * TODO:
 *   [ ] initTicketDetail()
 *       - parse id from URL (URLSearchParams)
 *       - load ticket + comments in parallel (Promise.all)
 *       - render everything
 *       - wire up status/priority/assignee changes → updateTicket
 *       - wire up add-comment → addComment + re-render comments
 *       - wire up delete with confirm() → deleteTicket → redirect
 *   [ ] Show user-friendly error if ticket id is invalid or missing
 *   [ ] Optional: optimistic update on status changes (stretch goal)
 */

// import { getTicket, updateTicket, deleteTicket, listComments, addComment } from "../api/tickets.js";
// import { getCurrentUser, requireAuth } from "../api/auth.js";
// import { showToast } from "./ui.js";

// export async function initTicketDetail() {
//   requireAuth();
//   // TODO
// }

// function renderTicket(ticket, users) { /* TODO */ }
// function renderComments(comments, users) { /* TODO */ }
