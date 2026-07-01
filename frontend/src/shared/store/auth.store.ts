import { create } from "zustand";
import { api } from "../lib/api";

export interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isHydrated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isHydrated: false,
  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    set({ user, token });
  },
  clearAuth: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
  hydrate: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ isHydrated: true });
      return;
    }

    set({ token });

    try {
      const user = await api.get<AuthUser>("/auth/me");
      set({ user, isHydrated: true });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null, isHydrated: true });
    }
  },
}));
