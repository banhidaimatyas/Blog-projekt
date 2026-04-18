import { isLoggedIn } from './store';
import { renderNavbar } from './components/navbar';
import { renderHome } from './pages/home';
import { renderPost } from './pages/post';
import { renderLogin } from './pages/login';
import { renderDashboard } from './pages/dashboard';
interface Permission {
    needsLogin: boolean;
}

interface RouteDefinition {
    path: string;
    page: (params?: Record<string, string>) => void;
    permission?: Permission;
}
const pages: RouteDefinition[] = [
    {
        path: '#/',
        page: renderHome,
    },
    {
        path: '#/blog/:id',
        page: renderPost,
    },
    {
        path: '#/login',
        page: renderLogin,
    },
    {
        path: '#/dashboard',
        page: renderDashboard,
        permission: { needsLogin: true },
    },
];
function matches(path: string, hash: string): Record<string, string> | null {
    const patternParts = path.split('/');
    const hashParts = hash.split('/');

    if (patternParts.length !== hashParts.length) return null;

    const params: Record<string, string> = {};

    for (let i = 0; i < patternParts.length; i++) {
        const pattern = patternParts[i];
        const value = hashParts[i];

        if (pattern.startsWith(':')) {
            params[pattern.slice(1)] = value;
        } else if (pattern !== value) {
            return null;
        }
    }
    return params;
}

function resolve(): void {
    const hash = window.location.hash || '#/';

    for (const def of pages) {
        const params = matches(def.path, hash);
        if (params !== null) {
            if (def.permission?.needsLogin && !isLoggedIn()) {
                window.location.hash = '#/login';
                return;
            }
            renderNavbar();
            def.page(params);
            return;
        }
    }
    window.location.hash = '#/';
}

export function startRouter(): void {
    window.addEventListener('hashchange', resolve);
    resolve();
}
