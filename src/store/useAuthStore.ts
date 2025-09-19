// src/store/useAuthStore.ts
import { create } from "zustand";
import { apiClient } from "@/api/http";

export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url?: string | null;
  online?: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;

  setAuth: (user: User | null, accessToken?: string, refreshToken?: string) => void;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    passwordConfirmation: string;
  }) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<boolean>;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  loading: false,
  error: null,

  setAuth: (user, accessToken, refreshToken) => {
    set({ user, accessToken: accessToken || null, refreshToken: refreshToken || null });

    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");

    if (accessToken) localStorage.setItem("accessToken", accessToken);
    else localStorage.removeItem("accessToken");

    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    else localStorage.removeItem("refreshToken");
  },

  login: async ({ email, password }) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.post("/auth/login", { auth: { email, password } });
      const { access_token, refresh_token, user } = res.data;
      get().setAuth(user, access_token, refresh_token);
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message || "Ошибка входа" });
    } finally {
      set({ loading: false });
    }
  },

  register: async ({ username, email, password, passwordConfirmation }) => {
    set({ loading: true, error: null });
    try {
      await apiClient.post("/auth/register", {
        auth: { username, email, password, password_confirmation: passwordConfirmation },
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message || "Ошибка регистрации" });
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    get().setAuth(null);
  },

  refresh: async () => {
    const token = get().refreshToken;
    if (!token) return false;

    try {
      const res = await apiClient.post("/auth/refresh", { refresh_token: token });
      const { access_token, refresh_token } = res.data;

      set({ accessToken: access_token, refreshToken: refresh_token });
      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("refreshToken", refresh_token);

      return true;
    } catch (err: any) {
      console.warn("Refresh токен недействителен, выполняем logout", err);
      get().logout();
      return false;
    }
  },

  isAuthenticated: () => !!get().accessToken && !!get().user,
}));
