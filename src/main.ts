import './style.css';
import { renderNavbar } from './components/navbar';
import { routerIndit } from './router';

function initApp(): void {
    renderNavbar();
    routerIndit();
}

initApp();