const isLoggedIn =
    localStorage.getItem("deskhub:isLoggedIn");

if (!isLoggedIn) {
    window.location.href = "./index.html";
}

document
    .getElementById("logout-btn")
    .addEventListener("click", () => {
        localStorage.removeItem("deskhub:isLoggedIn");

        window.location.href = "./index.html";
    });