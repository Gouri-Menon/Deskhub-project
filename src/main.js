import "./styles/main.css";

import { mountThemeToggle } from "./modules/theme.js";
import { initUi } from "./modules/ui.js";
import { initShortcuts } from "./modules/shortcuts.js";
import {
  initLogin,
  initLanding,
  requireAuth,
  wireLogoutControls,
} from "./modules/auth.js";
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
  initUi();
  initShortcuts(page);

  switch (page) {
    case "landing":
      initLanding();
      break;
    case "login":
      initLogin();
      break;
    case "dashboard":
      if (requireAuth()) {
        wireLogoutControls();
        initDashboard();
      }
      break;
    case "tickets-list":
      if (requireAuth()) {
        wireLogoutControls();
        initTicketsList();
      }
      break;
    case "ticket-detail":
      if (requireAuth()) {
        wireLogoutControls();
        initTicketDetail();
      }
      break;
    default:
      console.warn("Unknown page:", page);
  }
} catch (error) {
  console.error("Boot Error:", error);
}
