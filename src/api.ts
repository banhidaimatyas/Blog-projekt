import { Post, Category, User, PostsParams, PostsResult, NewPost } from './types';
import { getToken } from './store';

function authHeaders(): HeadersInit {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

export async function login(
    username: string,
    password: string
): Promise<{ token: string; user: User }> {
    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Bejelentkezési hiba történt.');
    }
    return response.json();
}

export async function logout(): Promise<void> {
    await fetch('/api/logout', {
        method: 'POST',
        headers: authHeaders(),
    });
}

export async function getPosts(params: PostsParams): Promise<PostsResult> {
    const url = new URL('/posts', window.location.origin);
    if (params.page !== undefined) url.searchParams.set('_page', String(params.page));
    if (params.limit !== undefined) url.searchParams.set('_limit', String(params.limit));
    if (params.search) url.searchParams.set('cim_like', params.search);
    if (params.categoryId) url.searchParams.set('categoryId', String(params.categoryId));
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Nem sikerült betölteni a bejegyzéseket.');
    const total = parseInt(response.headers.get('X-Total-Count') || '0', 10);
    const posts: Post[] = await response.json();
    return { posts, total };
}

export async function getPost(id: number): Promise<Post> {
    const response = await fetch(`/posts/${id}`);
    if (!response.ok) throw new Error('A bejegyzés nem található.');
    return response.json();
}

export async function getAllPosts(): Promise<Post[]> {
    const response = await fetch('/posts');
    if (!response.ok) throw new Error('Nem sikerült betölteni a bejegyzéseket.');
    return response.json();
}

export async function createPost(post: NewPost): Promise<Post> {
    const response = await fetch('/posts', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(post),
    });
    if (!response.ok) throw new Error('Nem sikerült létrehozni a bejegyzést.');
    return response.json();
}

export async function updatePost(id: number, post: Post): Promise<Post> {
    const response = await fetch(`/posts/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(post),
    });
    if (!response.ok) throw new Error('Nem sikerült módosítani a bejegyzést.');
    return response.json();
}

export async function deletePost(id: number): Promise<void> {
    const response = await fetch(`/posts/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Nem sikerült törölni a bejegyzést.');
}

export async function getCategories(): Promise<Category[]> {
    const response = await fetch('/categories');
    if (!response.ok) throw new Error('Nem sikerült betölteni a kategóriákat.');
    return response.json();
}