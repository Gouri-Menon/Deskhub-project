import { post, get } from "./client";

export async function login(email, password) {
  return post("/login", {
    email,
    password,
  });
}

export async function logout() {
  return post("/logout");
}

export async function getCurrentUser() {
  return get("/me");
}