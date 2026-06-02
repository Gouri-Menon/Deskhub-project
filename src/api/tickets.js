/**
 * api/tickets.js — Ticket API Calls
 *
 * Wraps the generic client with ticket-specific operations.
 * The rest of the app calls these functions instead of fetch directly.
 *
 * json-server endpoints (already supported, no backend code needed):
 *   GET    /tickets                              — list all
 *   GET    /tickets?status=open&priority=urgent  — filter (any field)
 *   GET    /tickets?_sort=createdAt&_order=desc  — sort
 *   GET    /tickets?_page=1&_limit=10            — paginate
 *                  (response also has X-Total-Count header — useful!)
 *   GET    /tickets?q=login                      — full-text search
 *   GET    /tickets/:id                          — single
 *   POST   /tickets                              — create (json-server auto-assigns id)
 *   PATCH  /tickets/:id                          — partial update (only changed fields)
 *   DELETE /tickets/:id                          — delete
 *
 *   GET    /comments?ticketId=:id                — comments for a ticket
 *   POST   /comments                             — add a comment
 *
 * TODO:
 *   [ ] listTickets(opts) — opts = { status, priority, search, sort, order, page, limit }
 *       Build a query string, call get(), return { items, total }
 *   [ ] getTicket(id)
 *   [ ] createTicket(data) — set createdAt/updatedAt to new Date().toISOString()
 *   [ ] updateTicket(id, patch) — also bump updatedAt
 *   [ ] deleteTicket(id)
 *   [ ] listComments(ticketId)
 *   [ ] addComment({ ticketId, authorId, content })
 */

// import { get, post, patch, del } from "./client.js";

// export async function listTickets(opts = {}) {
//   // TODO
// }

// export async function getTicket(id) { /* TODO */ }
// export async function createTicket(data) { /* TODO */ }
// export async function updateTicket(id, patch) { /* TODO */ }
// export async function deleteTicket(id) { /* TODO */ }
// export async function listComments(ticketId) { /* TODO */ }
// export async function addComment(comment) { /* TODO */ }
