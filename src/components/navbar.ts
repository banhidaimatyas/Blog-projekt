import { isLoggedIn, getUser, clearUser } from '../store';
import { logout } from '../api';

export function renderNavbar(): void {
    const container = document.getElementById('navbar-container');
    if (!container) return;

    const loggedIn = isLoggedIn();
    const user = getUser();

    container.innerHTML = `
    <nav class="navbar">
        <div class="nav-inner">
            <a href="#/" class="nav-logo">Blog Platform</a>
            <div class="nav-links">
            <a href="#/" class="nav-link">Főoldal</a>
            ${loggedIn? `
                <a href="#/dashboard" class="nav-link">Dashboard</a>
                <span class="nav-user">${user?.nev ?? user?.username}</span>
                <button id="nav-logout-btn" class="btn btn-outline btn-sm">Kijelentkezés</button>
            ` : `
                <a href="#/login" class="nav-link btn btn-primary btn-sm">Bejelentkezés</a>
            `}
            </div>
        </div>
    </nav>`;

    const logoutBtn = document.getElementById('nav-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await logout();
            } finally {
                clearUser();
                renderNavbar();
                window.location.hash = '#/';
            }
        });
    }
}