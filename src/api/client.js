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

const BASE_URL =
  typeof import.meta !== "undefined" && import.meta.env?.DEV
    ? ""
    : "http://localhost:3001";

function getToken() {
  const t = getStored("token");
  return typeof t === "string" ? t : null;
}

export async function request(path, options = {}) {
  try {
    const headers = {
      ...(options.headers || {}),
    };

    if (options.body) {
      headers["Content-Type"] = "application/json";
    }

    const token = getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      body: options.body
        ? JSON.stringify(options.body)
        : undefined,
    });

    if (!response.ok) {
      let message = `Request failed (${response.status})`;

      try {
        const errorData = await response.json();

        if (errorData.message) {
          message = errorData.message;
        }
      } catch {
        // ignore JSON parse errors
      }

      throw new Error(message);
    }

    if (response.status === 204) {
      return null;
    }

    const raw = await response.text();
    const total = Number(response.headers.get("X-Total-Count")) || 0;

    let data;
    try {
      data = raw.length ? JSON.parse(raw) : null;
    } catch {
      throw new Error(
        "The API did not return JSON (wrong app on port 3001, or proxy error). Stop other apps on 3001, then run: npm run api — or use: npm start"
      );
    }

    return { data, total };
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Cannot reach the API. From the project folder run: npm start (or npm run api in a second terminal), then reload. The API must listen on http://localhost:3001."
      );
    }

    throw error;
  }
}

export function get(path) {
  return request(path);
}

export function post(path, body) {
  return request(path, {
    method: "POST",
    body,
  });
}

export function patch(path, body) {
  return request(path, {
    method: "PATCH",
    body,
  });
}

export function put(path, body) {
  return request(path, {
    method: "PUT",
    body,
  });
}

export function del(path) {
  return request(path, {
    method: "DELETE",
  });
}