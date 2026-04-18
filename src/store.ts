import { User } from './types';

const USER_KEY = 'blog_user';
const TOKEN_KEY = 'blog_token';

export function saveUser(user: User, token: string): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
}

export function getUser(): User | null {
    const data = localStorage.getItem(USER_KEY);
    if (!data) return null;
    try {
        return JSON.parse(data) as User;
    } catch {
        return null;
    }
}

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function clearUser(): void {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
    return getToken() !== null && getUser() !== null;
}

export function isAdmin(): boolean {
    return getUser()?.role === 'admin';
}