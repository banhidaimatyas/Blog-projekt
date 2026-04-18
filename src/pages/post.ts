import { getPost, getCategories } from '../api';
import { Post, Category } from '../types';

export async function renderPost(params?: Record<string, string>): Promise<void> {
    const app = document.getElementById('app');
    if (!app) return;

    const id = parseInt(params?.['id'] ?? '0', 10);

    if (!id) {
        window.location.hash = '#/';
        return;
    }

    app.innerHTML = `
    <div class="container">
      <div class="loading">
        <div class="spinner"></div>
        <p>Bejegyzés betöltése...</p>
      </div>
    </div>
  `;

    try {

        const [post, categories] = await Promise.all([
            getPost(id),
            getCategories(),
        ]);

        renderPostContent(app, post, categories);
    } catch {
        app.innerHTML = `
      <div class="container">
        <div class="error-message">
          <h2>Bejegyzés nem található</h2>
          <p>A keresett bejegyzés nem létezik vagy nem sikerült betölteni.</p>
          <a href="#/" class="btn btn-primary" style="margin-top:1rem; display:inline-block;">
            ← Vissza a főoldalra
          </a>
        </div>
      </div>
    `;
    }
}
function renderPostContent(app: HTMLElement, post: Post, categories: Category[]): void {
    const category = categories.find((c) => c.id === post.categoryId);

    const date = new Date(post.datum).toLocaleDateString('hu-HU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    app.innerHTML = `
    <div class="container">
      <!-- Vissza gomb -->
      <a href="#/" class="back-link">← Vissza a főoldalra</a>
 
      <article class="post-detail">
        <!-- Borítókép -->
        <div class="post-detail-image">
          <img
            src="${post.boritekep}"
            alt="${post.cim}"
            onerror="this.src='https://picsum.photos/seed/${post.id}/1200/500'"
          />
          ${post.kiemelt ? '<span class="badge badge--featured post-featured-badge">Kiemelt bejegyzés</span>' : ''}
        </div>
 
        <!-- Bejegyzés fejléce -->
        <header class="post-detail-header">
          <div class="post-meta">
            ${category ? `<span class="post-category-tag">${category.nev}</span>` : ''}
            <span class="post-date-tag">${date}</span>
          </div>
          <h1 class="post-detail-title">${post.cim}</h1>
          <div class="post-author-info">
            <span class="post-author-name">Szerző: <strong>${post.szerzo}</strong></span>
          </div>
          <p class="post-excerpt">${post.kivonat}</p>
        </header>
 
        <!-- A bejegyzés teljes tartalma -->
        <div class="post-detail-content">
          ${formatContent(post.tartalom)}
        </div>
 
        <!-- Vissza gomb a tartalom után is -->
        <div class="post-detail-footer">
          <a href="#/" class="btn btn-primary">← Vissza a főoldalra</a>
        </div>
      </article>
    </div>
  `;
}
function formatContent(content: string): string {
    return content
        .split('\n')
        .filter((line) => line.trim() !== '')
        .map((line) => `<p>${line.trim()}</p>`)
        .join('');
}