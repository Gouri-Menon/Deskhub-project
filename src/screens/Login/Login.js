

const form = document.getElementById("loginForm");
const btn = document.getElementById("loginBtn");
const errorBanner = document.getElementById("errorBanner");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    errorBanner.style.display = "none";

    // Demo credentials
    const validEmail = email.endsWith("@deskhub.in");
    const validPassword = password === "demo123";

    if (!validEmail || !validPassword) {
        errorBanner.style.display = "block";
        return;
    }

    // Loading state
    btn.disabled = true;
    btn.textContent = "Signing in...";

    setTimeout(() => {
        // Hard redirect
        window.location.href = "dashboard.html";
    }, 1500);
});
