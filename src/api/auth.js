/**
 * api/auth.js — Authentication API
 *
 * For this project, auth is FAKED — there's no real password hashing.
 * `users` collection in db.json has email + password fields in plaintext.
 *
 * To "log in":
 *   1. GET /users?email=<email>
 *   2. Check if password matches the returned user
 *   3. Generate a fake token (any random string, e.g., crypto.randomUUID())
 *   4. Return { token, user }
 *
 * IN REAL APPS: never check passwords client-side. The server checks them and
 * returns a signed JWT. We're faking this for learning.
 *
 * TODO:
 *   [ ] login(email, password) — returns { token, user }; throws "Invalid credentials" on mismatch
 *   [ ] logout() — clears local storage (token + user)
 *   [ ] getCurrentUser() — reads user from storage, returns null if missing
 *   [ ] isAuthenticated() — true if token exists
 */

// import { get } from "./client.js";
// import * as storage from "../utils/storage.js";

// export async function login(email, password) {
//   // TODO
// }

// export function logout() {
//   // TODO
// }

// export function getCurrentUser() {
//   // TODO
// }

// export function isAuthenticated() {
//   // TODO
// }
