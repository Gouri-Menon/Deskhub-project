import { login } from "../api/auth";
import { set } from "../utils/storage";
import { get } from "../utils/storage";

export function isAuthenticated() {
  return !!get("token");
}

const form = document.getElementById("loginForm");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const data = await login(email, password);

    set("token", data.token);
    set("user", data.user);

    window.location.href = "/dashboard.html";
  } catch (error) {
    alert(error.message);
  }
});