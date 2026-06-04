/**
 * DeskHub — Main Entry Point
 *
 * This file boots the app. Each HTML page should include this script
 * with `<script type="module" src="../src/main.js"></script>`.
 *
 * Suggested approach: read `document.body.dataset.page` on each HTML page
 * (e.g., <body data-page="login">) and dispatch to the right init function.
 *
 * Alternatives: separate script per page; client-side router (overkill for now).
 *
 * TODO:
 *   [ ] Import init functions from each module
 *   [ ] Read which page we're on
 *   [ ] Dispatch to the right init()
 *   [ ] Add a top-level try/catch + window.onerror for unhandled errors
 *   [ ] Redirect to /login.html if no token (except on login page itself)
 */

// import { initLogin } from "./modules/auth.js";
// import { initDashboard } from "./modules/dashboard.js";
// import { initTicketsList } from "./modules/tickets.js";
// import { initTicketDetail } from "./modules/ticketDetail.js";

console.log("DeskHub booting…");

// const page = document.body.dataset.page;
// switch (page) {
//   case "login":         initLogin(); break;
//   case "dashboard":     initDashboard(); break;
//   case "tickets-list":  initTicketsList(); break;
//   case "ticket-detail": initTicketDetail(); break;
//   default: console.warn("Unknown page:", page);
// }

import { initLogin } from "./modules/auth.js";
import { initTicketsList } from "./modules/ticket.js";
// import { initDashboard } from "./modules/dashboard.js";
// import { initTicketDetail } from "./modules/ticketDetail.js";

console.log("DeskHub booting...");

window.addEventListener("error", (event) => {
  console.error("Unhandled Error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled Promise Rejection:", event.reason);
});

const page = document.body.dataset.page;

try {
  switch (page) {
    case "login":
      initLogin();
      break;

    case "tickets-list":
      initTicketsList();
      break;

    // Uncomment when Day 31 starts
    // case "dashboard":
    //   initDashboard();
    //   break;

    // case "ticket-detail":
    //   initTicketDetail();
    //   break;

    default:
      console.warn("Unknown page:", page);
  }
} catch (error) {
  console.error("Boot Error:", error);
}