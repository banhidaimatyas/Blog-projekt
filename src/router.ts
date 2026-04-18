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
