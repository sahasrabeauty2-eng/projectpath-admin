document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("changePasswordBtn");
    if (btn) btn.addEventListener("click", changePassword);

    // Initializations for other settings elements
    displayLoginTime();
    checkFirebaseStatus();

    // Mobile menu toggle (if needed, though it's usually global)
    const mobileToggle = document.getElementById('mobileMenuToggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });
    }

    // Attach reset to default
    const resetBtn = document.querySelector('.btn-danger');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetToDefault);
    }
});

function changePassword() {
    const current = document.getElementById("currentPassword").value.trim();
    const next = document.getElementById("newPassword").value.trim();
    const confirm = document.getElementById("confirmPassword").value.trim();
    const error = document.getElementById("settingsError");

    const saved = localStorage.getItem("adminPassword") || "ProjectPath@2026";

    error.innerText = "";

    if (!current || !next || !confirm) {
        error.innerText = "All fields are required";
        return;
    }

    if (current !== saved) {
        error.innerText = "Current password is incorrect";
        return;
    }

    if (next.length < 6) {
        error.innerText = "New password must be at least 6 characters";
        return;
    }

    if (next !== confirm) {
        error.innerText = "Passwords do not match";
        return;
    }

    localStorage.setItem("adminPassword", next);

    // Force logout after change
    sessionStorage.clear();
    alert("Password changed successfully. Please login again.");
    window.location.href = "index.html";
}

// Display login time
function displayLoginTime() {
    const loginTime = sessionStorage.getItem('adminLoginTime');
    const timeEl = document.getElementById('loginTime');
    if (loginTime && timeEl) {
        const date = new Date(parseInt(loginTime));
        timeEl.textContent = date.toLocaleString();
    }
}

// Check Firebase status
async function checkFirebaseStatus() {
    const statusEl = document.getElementById('firebaseStatus');
    if (!statusEl) return;

    try {
        // Using database from global scope (assumed matched by firebase-config.js)
        if (typeof database !== 'undefined') {
            await database.ref('.info/connected').once('value');
            statusEl.innerHTML = '<span style="color: var(--secondary-color);">✅ Connected</span>';
        } else {
            statusEl.innerHTML = '<span style="color: var(--danger-color);">⚠️ Firebase not initialized</span>';
        }
    } catch (error) {
        statusEl.innerHTML = '<span style="color: var(--danger-color);">❌ Disconnected</span>';
    }
}

// Reset to default
function resetToDefault() {
    if (!confirm('Are you sure you want to reset all settings to default?\n\nThis will:\n- Reset password to default\n- Clear all session data\n- Log you out\n\nYou will need to login again with the default password.')) {
        return;
    }

    // Clear all data
    localStorage.removeItem('adminPassword');
    sessionStorage.clear();

    alert('Settings reset to default. You will now be logged out.');
    window.location.href = 'index.html';
}
