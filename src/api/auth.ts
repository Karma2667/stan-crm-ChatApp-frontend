import axios from "axios";
import {apiPath } from "../config";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

const apiClient = axios.create({
  baseURL: "/api",  // <- сюда, не https://stan-messenger.ru
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export const login = async (data: LoginData) => {
  const res = await apiClient.post(apiPath("/auth/login"), data);
  return res.data;
};

export const register = async (data: RegisterData) => {
  const res = await apiClient.post(apiPath("/auth/register"), data);
  return res.data;
};

export const logout = async () => {
  await apiClient.post(apiPath("/auth/logout"));
};
