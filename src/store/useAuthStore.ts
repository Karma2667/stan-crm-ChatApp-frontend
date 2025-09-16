// src/store/useAuthStore.ts
import { create } from "zustand";
import axios from "axios";

export interface AuthState {
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; username: string; password: string; passwordConfirmation: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokenRequest: () => Promise<void>;
  getAppAuth: () => boolean;
}

const apiClient = axios.create({
  baseURL: "/api", // <- через прокси Vite
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // если бек использует куки
});

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  loading: false,
  error: null,

  login: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await apiClient.post("/v1/auth/login", { auth: data });
      const { access_token, refresh_token, user } = res.data;
      set({ user, accessToken: access_token, refreshToken: refresh_token, loading: false });
      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("refreshToken", refresh_token);
      localStorage.setItem("user", JSON.stringify(user));
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message || "Ошибка входа", loading: false });
    }
  },

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
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message || "Ошибка регистрации", loading: false });
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete("/v1/auth/logout");
    } catch (_) {}
    set({ user: null, accessToken: null, refreshToken: null, loading: false });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },

  refreshTokenRequest: async () => {
    const token = localStorage.getItem("refreshToken");
    if (!token) return;
    try {
      const res = await apiClient.post("/v1/auth/refresh", { refresh_token: token });
      const { access_token, refresh_token } = res.data;
      set({ accessToken: access_token, refreshToken: refresh_token });
      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("refreshToken", refresh_token);
    } catch (err) {
      console.error("Не удалось обновить токен", err);
      get().logout();
    }
  },

  getAppAuth: () => !!get().accessToken,
}));
