import { getPosts, getCategories } from '../api';
import { Category, Post } from '../types';
import { renderPagination } from '../components/pagination';

const POSTS_PER_PAGE = 6;

let currentPage = 1;
let currentSearch = '';
let currentCategoryId = 0;
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

export async function renderHome(): Promise<void> {
    const app = document.getElementById('app');
    if (!app) return;

    currentPage = 1;
    currentSearch = '';
    currentCategoryId = 0;

    app.innerHTML = `
    <div class="container">
        <div class="loading">
            <div class="spinner"></div>
            <p>Bejegyzések betöltése...</p>
        </div>
    </div>
    `;

    try {
        const [categories] = await Promise.all([
            getCategories(),
        ]);

        renderHomeLayout(app, categories);
        await loadAndRenderPosts();
    } catch (err) {
        app.innerHTML = `
        <div class="container">
            <div class="error-message">
            <h2>Hiba</h2>
            <p>Nem sikerült betölteni az adatokat. Ellenőrizd, hogy fut-e a backend szerver!</p>
            </div>
        </div>
    `;
    }
}

function renderHomeLayout(app: HTMLElement, categories: Category[]): void {
    app.innerHTML = `
        <div class="container">
        <header class="page-header">
            <h1 class="page-title">Blog</h1>
            <p class="page-subtitle">Olvasd el legújabb bejegyzéseinket</p>
        </header>
    
        <!-- Szűrő és kereső sáv -->
        <div class="filter-bar">
            <div class="search-wrapper">
            <input
                type="text"
                id="search-input"
                class="search-input"
                placeholder="Keresés cím alapján..."
                value="${currentSearch}"
            />
            </div>
            <div class="category-filter">
            <select id="category-select" class="select-input">
                <option value="0">Minden kategória</option>
                ${categories
                .map(
                    (cat) =>
                        `<option value="${cat.id}" ${currentCategoryId === cat.id ? 'selected' : ''}>
                        ${cat.nev}
                    </option>`
                )
                .join('')}
            </select>
            </div>
        </div>
    
        <!-- Bejegyzések rácsa -->
        <div id="posts-grid" class="posts-grid"></div>
    
        <!-- Lapozó -->
        <div id="pagination-container"></div>
        </div>
    `;

    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    searchInput?.addEventListener('input', () => {
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            currentSearch = searchInput.value.trim();
            currentPage = 1;
            await loadAndRenderPosts();
        }, 300);
    });

    const categorySelect = document.getElementById('category-select') as HTMLSelectElement;
    categorySelect?.addEventListener('change', async () => {
        currentCategoryId = parseInt(categorySelect.value, 10);
        currentPage = 1;
        await loadAndRenderPosts();
    });
}

async function loadAndRenderPosts(): Promise<void> {
    const grid = document.getElementById('posts-grid');
    const paginationContainer = document.getElementById('pagination-container');
    if (!grid) return;

    grid.innerHTML = `<div class="loading-inline"><div class="spinner"></div></div>`;

    try {
        const { posts, total } = await getPosts({
            page: currentPage,
            limit: POSTS_PER_PAGE,
            search: currentSearch || undefined,
            categoryId: currentCategoryId || undefined,
        });

        if (posts.length === 0) 
        {
            grid.innerHTML = `
            <div class="empty-state">
                <p>Nem található bejegyzés a megadott szűrőkkel.</p>
            </div>
        `;
            if (paginationContainer) paginationContainer.innerHTML = '';
            return;
        }

        grid.innerHTML = posts.map((post) => renderPostCard(post)).join('');

        grid.querySelectorAll<HTMLElement>('.post-card').forEach((card) => {
            card.addEventListener('click', () => {
                const id = card.dataset['id'];
                if (id) window.location.hash = `#/blog/${id}`;
            });
        });
        if (paginationContainer) {
            renderPagination(paginationContainer, {
                currentPage,
                totalItems: total,
                itemsPerPage: POSTS_PER_PAGE,
                onPageChange: async (page) => {
                    currentPage = page;
                    await loadAndRenderPosts();
                    document.getElementById('posts-grid')?.scrollIntoView({ behavior: 'smooth' });
                },
            });
        }
    } catch {
        grid.innerHTML = `
        <div class="error-message">
            <p>Nem sikerült betölteni a bejegyzéseket.</p>
        </div>
    `;
    }
}

function renderPostCard(post: Post): string {
    const date = new Date(post.datum).toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return `
    <article class="post-card ${post.kiemelt ? 'post-card--featured' : ''}" data-id="${post.id}" role="button" tabindex="0">
        <div class="post-card-image">
            <img
            src="${post.boritekep}"
            alt="${post.cim}"
            loading="lazy"
            onerror="this.src='https://picsum.photos/seed/${post.id}/800/400'"
        />
        ${post.kiemelt ? '<span class="badge badge--featured">Kiemelt</span>' : ''}
        </div>
        <div class="post-card-body">
            <div class="post-card-meta">
                <span class="post-category">Kategória #${post.categoryId}</span>
                <span class="post-date">${date}</span>
            </div>
            <h2 class="post-card-title">${post.cim}</h2>
            <p class="post-card-excerpt">${post.kivonat}</p>
            <div class="post-card-footer">
                <span class="post-author">${post.szerzo}</span>
                <span class="post-read-more">Olvasd tovább →</span>
            </div>
        </div>
    </article>
    `;
}