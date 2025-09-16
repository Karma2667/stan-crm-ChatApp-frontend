// src/store/useAuthStore.ts
import { create } from "zustand";
import axios from "axios";

export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;

  // Методы управления
  setAuth: (user: User | null, accessToken?: string, refreshToken?: string) => void;
  refresh: () => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; username: string; password: string; passwordConfirmation: string }) => Promise<void>;
  logout: () => Promise<void>;
  getAppAuth: () => boolean;
}

const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  loading: false,
  error: null,

  // 🔹 Установить аутентификацию
  setAuth: (user, accessToken, refreshToken) => {
    set({ user, accessToken: accessToken || null, refreshToken: refreshToken || null });
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    else localStorage.removeItem("accessToken");
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    else localStorage.removeItem("refreshToken");
  },

  // 🔹 Обновление токена
  refresh: async () => {
    const token = get().refreshToken;
    if (!token) {
      get().logout();
      return;
    }
    try {
      const res = await apiClient.post("/v1/auth/refresh", { refresh_token: token });
      const { access_token, refresh_token } = res.data;
      set({ accessToken: access_token, refreshToken: refresh_token });
      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("refreshToken", refresh_token);
    } catch (err) {
      console.error("Не удалось обновить токен", err);
      await get().logout();
    }
  },

  // 🔹 Логин
  login: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.post("/v1/auth/login", { auth: data });
      const { access_token, refresh_token, user } = res.data;
      get().setAuth(user, access_token, refresh_token);
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message || "Ошибка входа", loading: false });
    } finally {
      set({ loading: false });
    }
  },

  // 🔹 Регистрация
  register: async (data) => {
    set({ loading: true, error: null });
    try {
      await apiClient.post("/v1/auth/register", {
        auth: {
          email: data.email,
          username: data.username,
          password: data.password,
          password_confirmation: data.passwordConfirmation,
        },
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message || "Ошибка регистрации" });
    } finally {
      set({ loading: false });
    }
  },

  // 🔹 Логаут
  logout: async () => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete("/v1/auth/logout");
    } catch (_) {}
    get().setAuth(null);
    set({ loading: false });
  },

  // 🔹 Проверка авторизации
  getAppAuth: () => !!get().accessToken,
}));
