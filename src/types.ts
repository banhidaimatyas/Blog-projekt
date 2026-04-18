export interface Post {
  id: number;
  cim: string;
  tartalom: string;
  kivonat: string;
  categoryId: number;
  szerzo: string;
  datum: string;
  boritekep: string;
  kiemelt: boolean;
}

export interface Category {
  id: number;
  nev: string;
}

export interface User {
  id: number;
  username: string;
  role: string;
  nev: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}