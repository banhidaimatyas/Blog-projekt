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

