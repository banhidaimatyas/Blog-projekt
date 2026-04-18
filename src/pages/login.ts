import { login } from '../api';
import { saveUser, isLoggedIn } from '../store';
import { renderNavbar } from '../components/navbar';

export function renderLogin(): void {
    const app = document.getElementById('app');
    if (!app) return;

    if (isLoggedIn()) {
        window.location.hash = '#/dashboard';
        return;
    }

    app.innerHTML = `
    <div class="container">
      <div class="auth-wrapper">
        <div class="auth-card">
          <div class="auth-header">
            <h1 class="auth-title">Bejelentkezés</h1>
            <p class="auth-subtitle">Lépj be a Blog Platform vezérlőpultjába</p>
          </div>
 
          <div id="login-error" class="alert alert-error" style="display:none;"></div>
 
          <div class="auth-form">
            <div class="form-group">
              <label class="form-label" for="username">Felhasználónév</label>
              <input
                type="text"
                id="username"
                class="form-input"
                placeholder="pl. admin"
                autocomplete="username"
              />
            </div>
 
            <div class="form-group">
              <label class="form-label" for="password">Jelszó</label>
              <input
                type="password"
                id="password"
                class="form-input"
                placeholder="••••••••"
                autocomplete="current-password"
              />
            </div>
 
            <button id="login-btn" class="btn btn-primary btn-full">
              Bejelentkezés
            </button>
          </div>
 
          <div class="auth-hint">
            <p><strong>Teszt fiókok:</strong></p>
            <p>Admin: <code>admin</code> / <code>admin123</code></p>
            <p>Adminisztrátor: <code>adminisztrator</code> / <code>jelszo123</code></p>
          </div>
        </div>
      </div>
    </div>
  `;

    setupLoginForm();
}
function setupLoginForm(): void {
    const loginBtn = document.getElementById('login-btn') as HTMLButtonElement;
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const errorDiv = document.getElementById('login-error') as HTMLDivElement;

    loginBtn?.addEventListener('click', () => attemptLogin());

    passwordInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') attemptLogin();
    });
    usernameInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') attemptLogin();
    });

    async function attemptLogin(): Promise<void> {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            showError('Kérjük, add meg a felhasználónevet és a jelszót!');
            return;
        }
        loginBtn.disabled = true;
        loginBtn.textContent = 'Bejelentkezés...';
        hideError();

        try {
            const { token, user } = await login(username, password);

            saveUser(user, token);

            renderNavbar();

            window.location.hash = '#/dashboard';
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Ismeretlen hiba történt.';
            showError(message);
            loginBtn.disabled = false;
            loginBtn.textContent = 'Bejelentkezés';
        }
    }

    function showError(message: string): void {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    function hideError(): void {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }
}