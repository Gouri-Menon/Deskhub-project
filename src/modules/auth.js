/**
 * modules/auth.js — Login Page UI
 *
 * Wires up the login form and logout button.
 *
 * Expected HTML elements (you create these in public/login.html):
 *   - <form id="login-form"> with <input name="email"> and <input name="password">
 *   - <button id="login-submit">
 *   - <div id="login-error"> (hidden by default)
 *
 * For logout — add an event listener on a logout button on every authed page.
 *
 * TODO:
 *   [ ] initLogin()
 *       - on form submit: prevent default, read email + password
 *       - call api/auth.login(email, password)
 *       - on success: store token + user, redirect to /dashboard.html
 *       - on failure: show error message in #login-error
 *       - manage button disabled / loading state
 *   [ ] initLogout(buttonSelector)
 *       - on click: call api/auth.logout(), redirect to /index.html
 *   [ ] requireAuth() — call at the top of every protected page; redirect to login if no token
 */

// import * as authApi from "../api/auth.js";

// export function initLogin() {
//   // TODO
// }

// export function initLogout(selector = "#logout-btn") {
//   // TODO
// }

// export function requireAuth() {
//   // TODO
// }
