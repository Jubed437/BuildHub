import { create } from 'zustand';

const TOKEN_KEY = 'token';

interface User {
  id: string;
  name: string;
  email: string;
  skills: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) : null,
  isAuthenticated: typeof window !== 'undefined' ? !!sessionStorage.getItem(TOKEN_KEY) : false,
  login: (user, token) => {
    sessionStorage.setItem(TOKEN_KEY, token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    sessionStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },
  updateUser: (user) => set({ user }),
}));
