import { post, get } from "./client.js";

export async function login(email, password) {
  const { data } = await post("/login", { email, password });
  return data;
}

export async function logout() {
  await post("/logout");
}

export async function getCurrentUser() {
  const { data } = await get("/me");
  return data;
}
