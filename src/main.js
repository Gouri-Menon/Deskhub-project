import "./styles/main.css";

import { mountThemeToggle } from "./modules/theme.js";
import { initLogin, initLanding, requireAuth } from "./modules/auth.js";
import { initTicketsList } from "./modules/tickets.js";
import { initDashboard } from "./modules/dashboard.js";
import { initTicketDetail } from "./modules/ticketDetail.js";

window.addEventListener("error", (event) => {
  console.error("Unhandled Error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled Promise Rejection:", event.reason);
});

const page = document.body.dataset.page;

try {
  mountThemeToggle();

  switch (page) {
    case "landing":
      initLanding();
      break;
    case "login":
      initLogin();
      break;
    case "dashboard":
      if (requireAuth()) initDashboard();
      break;
    case "tickets-list":
      if (requireAuth()) initTicketsList();
      break;
    case "ticket-detail":
      if (requireAuth()) initTicketDetail();
      break;
    default:
      console.warn("Unknown page:", page);
  }
} catch (error) {
  console.error("Boot Error:", error);
}
