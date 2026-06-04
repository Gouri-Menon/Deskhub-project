# DeskHub

Small ticket-desk demo: **Vite** frontend, **json-server** API with demo auth, and a shared `db.json` dataset.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (includes `npm`)

## Quick start

```bash
npm install
npm start
```

This runs:

1. **API** — `http://localhost:3001` (json-server + `/login`, `/logout`, `/me`)
2. **Web app** — `http://localhost:5173` (Vite)

Open **http://localhost:5173/** in your browser (not the `file://` URL).

### Demo sign-in

Use any user from `db.json`, for example:

| Email            | Password |
|------------------|----------|
| `priya@deskhub.in` | `demo123` |
| `aarav@deskhub.in` | `demo123` |

All listed `@deskhub.in` accounts use password **`demo123`**.

## Troubleshooting: “Failed to load tickets”

The tickets page loads data from the **API on port 3001**. That error almost always means the browser could not get a valid JSON response from `/tickets`.

1. **Run API + web together** (recommended): from the project folder run **`npm start`**, then open **http://localhost:5173/tickets.html** (not a `file://` link).
2. **Or** run two terminals: **`npm run api`** (starts the API on 3001), then **`npm run dev`** (Vite on 5173).
3. **Port 3001 in use**: another program may be bound to 3001 so DeskHub’s API never starts or the wrong app answers. Close that program or change the API port in `server.cjs` / `vite.config.js` / `client.js` so they all match.
4. After the API is running, click **Retry** on the tickets page or refresh the browser.

If you still see “API did not return JSON” while using `npm run dev`, make sure **`vite.config.js` is saved** (the dev proxy must allow URLs like `/tickets?_page=1` — an older regex-only `$` end rule breaks that).

## Creating a ticket

1. Sign in, then open **Tickets** (from the dashboard or go to `/tickets.html`).
2. Click **New ticket**.
3. Fill in the form (title, description, customer, category, priority, etc.) and click **Create ticket**.

The ticket is saved in the API (and in `db.json` while json-server runs). After creation you are taken to that ticket’s detail page.

## Scripts

| Command        | Description                                      |
|----------------|--------------------------------------------------|
| `npm start`    | API + Vite together (recommended for local dev) |
| `npm run api`  | API only on port 3001                            |
| `npm run dev`  | Frontend only (expects API on 3001)            |
| `npm run build`| Production build to `dist/`                      |

## Project layout

- `index.html` — login  
- `dashboard.html` — summary + recent tickets  
- `tickets.html` — searchable, filterable ticket list  
- `ticket-detail.html` — ticket + comments + updates  
- `src/main.js` — boots the correct page via `data-page` on `<body>` (imports `src/styles/main.css` so styles load in dev and build)  
- `server.cjs` — API server (custom auth + json-server router)  
- `db.json` — users, tickets, comments  

## Notes

- In development, Vite proxies API paths to port **3001**, so the app uses same-origin requests.  
- If you only open static HTML files without Vite, modules and the proxy will not work—always use `npm start`.
