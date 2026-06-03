// Login.js

const loginForm = document.getElementById("loginForm");
const errorBanner = document.getElementById("errorBanner");

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (
        email.endsWith("@deskhub.in") &&
        password === "demo123"
    ) {
        // Save login state
        localStorage.setItem("deskhub:isLoggedIn", "true");

        // Redirect to dashboard
        window.location.href = "./dashboard.html";
    } else {
        errorBanner.style.display = "block";
    }
});