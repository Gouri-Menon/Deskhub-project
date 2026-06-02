/**
 * api/client.js — Generic Fetch Wrapper
 *
 * One place where ALL HTTP requests go through. Centralises:
 *   - Base URL ("http://localhost:3001")
 *   - JSON parsing
 *   - Authorization header (read token from storage)
 *   - Error handling (throw on non-2xx with a useful message)
 *
 * Why a wrapper? So the rest of the code never imports `fetch` directly.
 * Easier to add features later (retry, logging, cancellation, mocking for tests).
 *
 * Usage you should aim for in other files:
 *   import { get, post, patch, del } from "../api/client.js";
 *   const tickets = await get("/tickets?status=open");
 *   const newOne  = await post("/tickets", { title: "..." });
 *
 * TODO:
 *   [ ] Implement request(path, options)
 *       - prepend BASE_URL
 *       - if body, JSON.stringify it and set Content-Type
 *       - read token from storage and add Authorization header if present
 *       - await fetch
 *       - if !response.ok, throw an Error with status + message
 *       - return response.json() (or null for 204)
 *   [ ] Export shorthands: get, post, patch, put, del
 *   [ ] Handle network errors (TypeError from fetch) with a friendly message
 */

import { get as getStored } from "../utils/storage.js";

const BASE_URL = "http://localhost:3001";

export async function request(path, options = {}) {
  // TODO: implement
  throw new Error("api/client.js: request() not implemented yet");
}

// TODO: shorthand exports
// export const get   = (path)         => request(path);
// export const post  = (path, body)   => request(path, { method: "POST",   body });
// export const patch = (path, body)   => request(path, { method: "PATCH",  body });
// export const put   = (path, body)   => request(path, { method: "PUT",    body });
// export const del   = (path)         => request(path, { method: "DELETE" });
