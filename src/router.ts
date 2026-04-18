import { isLoggedIn } from './store';
import { renderNavbar } from './components/navbar';
import { renderHome } from './pages/home';
import { renderPost } from './pages/post';
import { renderLogin } from './pages/login';
import { renderDashboard } from './pages/dashboard';
interface Jogosultsag {
    bejelentkezesKell: boolean;
}

interface UtvonalDefinicio {
    utvonal: string;
    oldal: (params?: Record<string, string>) => void;
    jog?: Jogosultsag;
}
const oldalak: UtvonalDefinicio[] = [
    {
        utvonal: '#/',
        oldal: renderHome,
    },
    {
        utvonal: '#/blog/:id',
        oldal: renderPost,
    },
    {
        utvonal: '#/login',
        oldal: renderLogin,
    },
    {
        utvonal: '#/dashboard',
        oldal: renderDashboard,
        jog: { bejelentkezesKell: true },
    },
];
function illeszkedik(utvonal: string, hash: string): Record<string, string> | null {
    const mintaReszek = utvonal.split('/');
    const hashReszek = hash.split('/');

    if (mintaReszek.length !== hashReszek.length) return null;

    const params: Record<string, string> = {};

    for (let i = 0; i < mintaReszek.length; i++) {
        const minta = mintaReszek[i];
        const ertek = hashReszek[i];

        if (minta.startsWith(':')) {
            params[minta.slice(1)] = ertek;
        } else if (minta !== ertek) {
            return null;
        }
    }
    return params;
}

function felold(): void {
    const hash = window.location.hash || '#/';

    for (const def of oldalak) {
        const params = illeszkedik(def.utvonal, hash);
        if (params !== null) {
            if (def.jog?.bejelentkezesKell && !isLoggedIn()) {
                window.location.hash = '#/login';
                return;
            }
            renderNavbar();
            def.oldal(params);
            return;
        }
    }
    window.location.hash = '#/';
}

export function routerIndit(): void {
    window.addEventListener('hashchange', felold);
    felold();
}
