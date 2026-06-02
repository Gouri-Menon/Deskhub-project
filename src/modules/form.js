/**
 * modules/form.js — Form Validation Helpers
 *
 * Generic, reusable validators for the create-ticket form (and login form).
 *
 * Design suggestion:
 *   - validators are small functions: (value) => true | string
 *     return true if valid, or an error message string if invalid
 *   - validateField(input, validators) runs them, shows error in adjacent .error span
 *   - validateForm(formEl) runs all fields; returns { isValid, errors }
 *
 * TODO:
 *   [ ] Common validators:
 *       - required(msg = "Required")
 *       - minLength(n, msg)
 *       - maxLength(n, msg)
 *       - email(msg = "Invalid email")
 *       - oneOf(allowedValues, msg)
 *   [ ] validateField(inputEl, validators) — show error inline, return bool
 *   [ ] validateForm(formEl, fieldRules) — fieldRules: { fieldName: [validators] }
 *   [ ] Wire up: on `blur` validate that field; on `submit` validate all
 *   [ ] Disable submit button when form is invalid (or after submit attempts)
 *
 * Form fields needed for create-ticket:
 *   - title:         required, 5-100 chars
 *   - description:   required, min 10 chars
 *   - customerName:  required
 *   - customerEmail: required, email
 *   - priority:      required, oneOf(["low","medium","high","urgent"])
 *   - category:      required, oneOf(["auth","billing","bug","feature","other"])
 */

// export const required = (msg = "Required") => (v) => (v && v.trim()) ? true : msg;
// export const minLength = (n, msg) => (v) => v.length >= n ? true : (msg ?? `Min ${n} characters`);
// export const maxLength = (n, msg) => (v) => v.length <= n ? true : (msg ?? `Max ${n} characters`);
// export const email = (msg = "Invalid email") => (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? true : msg;
// export const oneOf = (vals, msg) => (v) => vals.includes(v) ? true : (msg ?? `Must be one of: ${vals.join(", ")}`);

// export function validateField(inputEl, validators) { /* TODO */ }
// export function validateForm(formEl, fieldRules) { /* TODO */ }
