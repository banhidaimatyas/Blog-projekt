import './style.css';
import { renderNavbar } from './components/navbar';
import { startRouter } from './router';

function initApp(): void {
    renderNavbar();
    startRouter();
}

initApp();