import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const apiProxy = {
  target: "http://localhost:3001",
  changeOrigin: true,
};

export default defineConfig({
  root: ".",
  publicDir: "public",
  appType: "mpa",
  server: {
    port: 5173,
    // Match path + query (e.g. /tickets?_page=1). Vite tests the full `req.url`, so a
    // trailing `$` after `(tickets|...)` would skip every list request and return HTML.
    proxy: {
      "^/(tickets|users|comments|login|logout|me)(/|\\?|$)": apiProxy,
    },
  },
  preview: {
    proxy: {
      "^/(tickets|users|comments|login|logout|me)(/|\\?|$)": apiProxy,
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        dashboard: resolve(__dirname, "dashboard.html"),
        tickets: resolve(__dirname, "tickets.html"),
        ticketDetail: resolve(__dirname, "ticket-detail.html"),
      },
    },
  },
});
