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

Open **http://localhost:5173/** for the landing page, then **Log in** (or go directly to **http://localhost:5173/login.html**). Do not use a `file://` URL.

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

- `index.html` — public landing (Log in → `login.html`)  
- `login.html` — sign-in form  
- `dashboard.html` — summary + recent tickets  
- `tickets.html` — searchable, filterable ticket list  
- `ticket-detail.html` — ticket + comments + updates  
- `src/main.js` — boots the correct page via `data-page` on `<body>` (imports `src/styles/main.css` so styles load in dev and build)  
- `server.cjs` — API server (custom auth + json-server router)  
- `db.json` — users, tickets, comments  

## Notes

- In development, Vite proxies API paths to port **3001**, so the app uses same-origin requests.  
- If you only open static HTML files without Vite, modules and the proxy will not work—always use `npm start`.
- On a ticket, **Edit** / **Delete** appear only on comments you authored (same signed-in user as `authorId`); the API does not enforce authorship on PATCH/DELETE (demo only).

## Deployment

DeskHub is two parts: a **static frontend** (`npm run build` → `dist/`) and a **Node API** (`server.cjs` + `db.json`).

### 1. Point the built app at your API

When you build for production, the browser must know where the API lives (there is no Vite proxy in production).

1. Deploy the API first and copy its public URL (e.g. `https://deskhub-api.onrender.com`).
2. Set **`VITE_API_URL`** to that URL (no trailing slash) in the environment where you run **`npm run build`**.
3. Run **`npm run build`**. The client embeds this URL into the JS bundle.

Example (one-off on your machine):

```bash
set VITE_API_URL=https://your-api.example.com
npm run build
```

On Linux/macOS:

```bash
VITE_API_URL=https://your-api.example.com npm run build
```

If you skip `VITE_API_URL`, the build still defaults to **`http://localhost:3001`** (only useful if you open the built files next to a local API).

### 2. Host the frontend (`dist/`)

Upload or connect the contents of **`dist/`** to any static host, for example:

- [Netlify](https://www.netlify.com/) — publish directory `dist`, build command `npm run build`, add env **`VITE_API_URL`**
- [Vercel](https://vercel.com/) — same idea; set **`VITE_API_URL`** in Project → Environment Variables for **Production**
- [Cloudflare Pages](https://pages.cloudflare.com/)
- Nginx / Apache on a VPS — `root` pointing at `dist`

**GitHub Pages (project site):** your app lives under a subpath (e.g. `/Deskhub-project/`). Set `base` in `vite.config.js` (e.g. `base: '/Deskhub-project/'`) and rebuild, then set **`VITE_API_URL`** to your real API URL as above.

### 3. Host the API (`server.cjs`)

Run Node with the repo root as working directory so **`db.json`** is found next to `server.cjs`.

- **Start command:** `node server.cjs`
- **Install:** `npm ci` or `npm install` (json-server is a **dependency** so production installs work.)
- **Port:** platforms usually set **`PORT`**; the server already uses `process.env.PORT || 3001`.

Examples:

- [Render](https://render.com/) — Web Service, runtime Node, start `node server.cjs`, add **`db.json`** in the repo.
- [Railway](https://railway.app/) — deploy from GitHub, same start command.
- **Your own VPS** — `git pull`, `npm ci`, `pm2 start server.cjs --name deskhub-api` (or systemd).

`json-server`’s default middleware includes **CORS**, so a frontend on another origin can call the API. For a strict allow-list you’d add extra middleware later.

### 4. Data persistence (important)

`db.json` is a **file on disk**. On many free PaaS tiers the filesystem is **ephemeral** (restarts wipe changes). For a real deployment you either accept that for a demo, attach a **persistent disk**, or replace the API with a real database later.

### 5. Quick “single machine” demo

On one server: build the app, serve **`dist/`** with any static file server, and run **`node server.cjs`** (or use a reverse proxy so both share one HTTPS host and set **`VITE_API_URL`** to that HTTPS API origin).

