const DEFAULT_ADMIN_PASSWORD = "ProjectPath@2026";

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("loginBtn");
    if (btn) {
        btn.addEventListener("click", loginAdmin);
    }

    // Allow Enter key to submit
    const input = document.getElementById("adminPassword");
    if (input) {
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") loginAdmin();
        });
    }

    // Attach logout to all logout buttons
    const logoutButtons = document.querySelectorAll(".logout-button");
    logoutButtons.forEach(button => {
        button.addEventListener("click", logoutAdmin);
    });
});

function getAdminPassword() {
    return localStorage.getItem("adminPassword") || DEFAULT_ADMIN_PASSWORD;
}

function setAdminPassword(newPassword) {
    localStorage.setItem("adminPassword", newPassword);
}

function loginAdmin() {
    const input = document.getElementById("adminPassword").value.trim();
    const saved = getAdminPassword();

    if (input === saved) {
        sessionStorage.setItem("adminLoggedIn", "true");
        sessionStorage.setItem("adminLoginTime", Date.now().toString());
        location.href = "dashboard.html";
    } else {
        const errorDiv = document.getElementById("error");
        if (errorDiv) errorDiv.innerText = "Incorrect password";
    }
}

function protectAdminPage() {
    if (sessionStorage.getItem("adminLoggedIn") !== "true") {
        location.href = "index.html";
    }
}

function logoutAdmin() {
    sessionStorage.clear();
    location.href = "index.html";
}