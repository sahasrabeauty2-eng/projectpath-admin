// ========================================
// PROJECT PATH - ADMIN AUTHENTICATION
// ========================================

// Default password (can be changed via Settings)
const DEFAULT_PASSWORD = 'ProjectPath@2026';

// Get stored password from localStorage
function getStoredPassword() {
    return localStorage.getItem('adminPassword') || DEFAULT_PASSWORD;
}

// Set new password
function setPassword(newPassword) {
    localStorage.setItem('adminPassword', newPassword);
}

// Check if user is authenticated
function isAuthenticated() {
    return sessionStorage.getItem('adminSession') === 'authenticated';
}

// Login function
function login(password) {
    const storedPassword = getStoredPassword();

    if (password === storedPassword) {
        sessionStorage.setItem('adminSession', 'authenticated');
        sessionStorage.setItem('adminLoginTime', Date.now());
        return true;
    }
    return false;
}

// Logout function
function logout() {
    sessionStorage.removeItem('adminSession');
    sessionStorage.removeItem('adminLoginTime');
    window.location.href = 'index.html';
}

// Check authentication and redirect if not authenticated
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
    }
}

// Login page handler
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const errorMessage = document.getElementById('errorMessage');

    // Check if already logged in
    if (isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Handle login
    function handleLogin(e) {
        e.preventDefault();

        const password = passwordInput.value.trim();

        if (!password) {
            showError('Please enter a password');
            return;
        }

        if (login(password)) {
            // Success - redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Failed - show error
            showError('Invalid password. Please try again.');
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');

        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 3000);
    }

    // Event listeners
    loginButton.addEventListener('click', handleLogin);

    // Allow Enter key to submit
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin(e);
        }
    });

    // Focus password input on load
    passwordInput.focus();
}

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
    const isLoginPage = window.location.pathname.includes('index.html') ||
        window.location.pathname.endsWith('/');

    if (isLoginPage) {
        initLoginPage();
    } else {
        requireAuth();
    }
});
