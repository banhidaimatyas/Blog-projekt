import { getAllPosts, getCategories, createPost, updatePost, deletePost, getPost } from '../api';
import { isLoggedIn, getUser, isAdmin } from '../store';
import { Post, Category, NewPost } from '../types';

export async function renderDashboard(): Promise<void> {
    const app = document.getElementById('app');
    if (!app) return;

    if (!isLoggedIn()) {
        window.location.hash = '#/login';
        return;
    }

    const user = getUser()!;

    app.innerHTML = `
    <div class="container">
      <div class="loading">
        <div class="spinner"></div>
        <p>Dashboard betöltése...</p>
      </div>
    </div>
  `;

    try {
        const [posts, categories] = await Promise.all([getAllPosts(), getCategories()]);
        renderDashboardLayout(app, posts, categories, user.nev, user.role);
    } catch {
        app.innerHTML = `
      <div class="container">
        <div class="error-message">
          <h2>Hiba</h2>
          <p>Nem sikerült betölteni az adatokat.</p>
        </div>
      </div>
    `;
    }
}

function renderDashboardLayout(
    app: HTMLElement,
    posts: Post[],
    categories: Category[],
    userName: string,
    userRole: string
): void {
    const admin = isAdmin();

    app.innerHTML = `
    <div class="container">
      <!-- Üdvözlő fejléc -->
      <div class="dashboard-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="dashboard-welcome">
            Üdvözöllek, <strong>${userName}</strong>!
            <span class="role-badge role-badge--${userRole}">${userRole}</span>
          </p>
        </div>
        <button id="new-post-btn" class="btn btn-primary">+ Új bejegyzés</button>
      </div>
 
      <!-- Visszajelzés üzenet terület -->
      <div id="dashboard-message" class="alert" style="display:none;"></div>
 
      <!-- Bejegyzés-kezelő form (alapban rejtett) -->
      <div id="post-form-container" style="display:none;"></div>
 
      <!-- Bejegyzések táblázata -->
      <div class="dashboard-table-wrapper">
        <h2 class="section-title">Összes bejegyzés (${posts.length})</h2>
        <div id="posts-table-container">
          ${renderPostsTable(posts, categories, admin)}
        </div>
      </div>
    </div>
  `;

    setupDashboardEvents(posts, categories);
}

function renderPostsTable(posts: Post[], categories: Category[], admin: boolean): string {
    if (posts.length === 0) {
        return `<p class="empty-state">Még nincs bejegyzés. Hozz létre egyet!</p>`;
    }

    const rows = posts
        .map((post) => {
            const category = categories.find((c) => c.id === post.categoryId);
            return `
        <tr>
          <td class="td-id">${post.id}</td>
          <td class="td-title">
            <a href="#/blog/${post.id}" class="table-post-link">${post.cim}</a>
          </td>
          <td>${category?.nev ?? `#${post.categoryId}`}</td>
          <td>${post.datum}</td>
          <td class="td-actions">
            <button class="btn btn-sm btn-outline edit-btn" data-id="${post.id}">Szerkesztés</button>
            ${admin ? `<button class="btn btn-sm btn-danger delete-btn" data-id="${post.id}">Törlés</button>` : ''}
          </td>
        </tr>
      `;
        })
        .join('');

    return `
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Cím</th>
          <th>Kategória</th>
          <th>Dátum</th>
          <th>Műveletek</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderPostForm(categories: Category[], post?: Post): string {
    const isEdit = !!post;
    return `
    <div class="post-form-card">
      <h2 class="section-title">${isEdit ? 'Bejegyzés szerkesztése' : 'Új bejegyzés'}</h2>
      <div class="form-grid">
        <div class="form-group form-group--full">
          <label class="form-label" for="f-cim">Cím <span class="required">*</span></label>
          <input type="text" id="f-cim" class="form-input" placeholder="Bejegyzés címe" value="${post?.cim ?? ''}" required />
        </div>
 
        <div class="form-group form-group--full">
          <label class="form-label" for="f-kivonat">Kivonat <span class="required">*</span></label>
          <textarea id="f-kivonat" class="form-input form-textarea" placeholder="Rövid összefoglaló..." rows="3">${post?.kivonat ?? ''}</textarea>
        </div>
 
        <div class="form-group form-group--full">
          <label class="form-label" for="f-tartalom">Tartalom <span class="required">*</span></label>
          <textarea id="f-tartalom" class="form-input form-textarea" placeholder="A bejegyzés teljes szövege..." rows="8">${post?.tartalom ?? ''}</textarea>
        </div>
 
        <div class="form-group">
          <label class="form-label" for="f-category">Kategória <span class="required">*</span></label>
          <select id="f-category" class="form-input select-input">
            ${categories
            .map(
                (cat) =>
                    `<option value="${cat.id}" ${post?.categoryId === cat.id ? 'selected' : ''}>${cat.nev}</option>`
            )
            .join('')}
          </select>
        </div>
 
        <div class="form-group">
          <label class="form-label" for="f-boritekep">Borítókép URL</label>
          <input type="url" id="f-boritekep" class="form-input" placeholder="https://picsum.photos/800/400" value="${post?.boritekep ?? ''}" />
        </div>
 
        <div class="form-group">
          <label class="form-label">
            <input type="checkbox" id="f-kiemelt" ${post?.kiemelt ? 'checked' : ''} />
            Kiemelt bejegyzés
          </label>
        </div>
      </div>
 
      <div id="form-error" class="alert alert-error" style="display:none;"></div>
 
      <div class="form-actions">
        <button id="form-save-btn" class="btn btn-primary" data-editing-id="${post?.id ?? ''}">
          ${isEdit ? 'Mentés' : 'Létrehozás'}
        </button>
        <button id="form-cancel-btn" class="btn btn-outline">Mégse</button>
      </div>
    </div>
  `;
}

function setupDashboardEvents(posts: Post[], categories: Category[]): void {
    document.getElementById('new-post-btn')?.addEventListener('click', () => {
        showForm(categories);
    });

    document.getElementById('posts-table-container')?.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;

        if (target.classList.contains('edit-btn')) {
            const id = parseInt(target.dataset['id'] ?? '0', 10);
            await showEditForm(id, categories);
        }

        if (target.classList.contains('delete-btn')) {
            const id = parseInt(target.dataset['id'] ?? '0', 10);
            await handleDelete(id, posts, categories);
        }
    });
}

function showForm(categories: Category[], post?: Post): void {
    const container = document.getElementById('post-form-container');
    if (!container) return;

    container.innerHTML = renderPostForm(categories, post);
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });

    setupFormEvents(categories);
}

async function showEditForm(id: number, categories: Category[]): Promise<void> {
    try {
        const post = await getPost(id);
        showForm(categories, post);
    } catch {
        showDashboardMessage('Nem sikerült betölteni a bejegyzést.', 'error');
    }
}

function setupFormEvents(categories: Category[]): void {
    document.getElementById('form-cancel-btn')?.addEventListener('click', () => {
        const container = document.getElementById('post-form-container');
        if (container) {
            container.style.display = 'none';
            container.innerHTML = '';
        }
    });

    document.getElementById('form-save-btn')?.addEventListener('click', async () => {
        await handleFormSave(categories);
    });
}

async function handleFormSave(categories: Category[]): Promise<void> {
    const saveBtn = document.getElementById('form-save-btn') as HTMLButtonElement;
    const errorDiv = document.getElementById('form-error') as HTMLDivElement;
    const editingId = saveBtn.dataset['editingId'];

    const cim = (document.getElementById('f-cim') as HTMLInputElement).value.trim();
    const kivonat = (document.getElementById('f-kivonat') as HTMLTextAreaElement).value.trim();
    const tartalom = (document.getElementById('f-tartalom') as HTMLTextAreaElement).value.trim();
    const categoryId = parseInt(
        (document.getElementById('f-category') as HTMLSelectElement).value,
        10
    );
    const boritekep = (document.getElementById('f-boritekep') as HTMLInputElement).value.trim();
    const kiemelt = (document.getElementById('f-kiemelt') as HTMLInputElement).checked;

    if (!cim || !kivonat || !tartalom) {
        errorDiv.textContent = 'A cím, kivonat és tartalom megadása kötelező!';
        errorDiv.style.display = 'block';
        return;
    }

    const user = getUser()!;
    const szerzo = user.nev;
    const datum = new Date().toISOString().split('T')[0];

    const postData: NewPost = {
        cim,
        kivonat,
        tartalom,
        categoryId,
        boritekep: boritekep || `https://picsum.photos/seed/${Date.now()}/800/400`,
        kiemelt,
        szerzo,
        datum,
    };

    saveBtn.disabled = true;
    saveBtn.textContent = 'Mentés folyamatban...';
    errorDiv.style.display = 'none';

    try {
        if (editingId) {
            await updatePost(parseInt(editingId, 10), { ...postData, id: parseInt(editingId, 10) });
            showDashboardMessage('A bejegyzés sikeresen módosítva!', 'success');
        } else {
            await createPost(postData);
            showDashboardMessage('Az új bejegyzés sikeresen létrehozva!', 'success');
        }

        const container = document.getElementById('post-form-container');
        if (container) {
            container.style.display = 'none';
            container.innerHTML = '';
        }

        await refreshPostsTable(categories);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Ismeretlen hiba.';
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        saveBtn.disabled = false;
        saveBtn.textContent = editingId ? 'Mentés' : 'Létrehozás';
    }
}

async function handleDelete(id: number, posts: Post[], categories: Category[]): Promise<void> {
    const post = posts.find((p) => p.id === id);
    const confirmed = window.confirm(
        `Biztosan törölni szeretnéd a következő bejegyzést?\n\n"${post?.cim ?? `#${id}`}"\n\nEz a művelet nem vonható vissza!`
    );

    if (!confirmed) return;

    try {
        await deletePost(id);
        showDashboardMessage('A bejegyzés sikeresen törölve!', 'success');
        await refreshPostsTable(categories);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Törlés sikertelen.';
        showDashboardMessage(message, 'error');
    }
}

async function refreshPostsTable(categories: Category[]): Promise<void> {
    const tableContainer = document.getElementById('posts-table-container');
    const sectionTitle = document.querySelector('.section-title');
    if (!tableContainer) return;

    try {
        const freshPosts = await getAllPosts();
        if (sectionTitle) sectionTitle.textContent = `Összes bejegyzés (${freshPosts.length})`;
        tableContainer.innerHTML = renderPostsTable(freshPosts, categories, isAdmin());

        setupDashboardEvents(freshPosts, categories);
    } catch {
        tableContainer.innerHTML = `<p class="error-message">Nem sikerült frissíteni a táblázatot.</p>`;
    }
}

function showDashboardMessage(message: string, type: 'success' | 'error'): void {
    const el = document.getElementById('dashboard-message');
    if (!el) return;
    el.textContent = message;
    el.className = `alert alert-${type}`;
    el.style.display = 'block';

    setTimeout(() => {
        el.style.display = 'none';
    }, 4000);
}
