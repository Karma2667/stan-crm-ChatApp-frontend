// src/api/http.ts
import axios, { AxiosRequestHeaders } from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  headers: {
    "Content-Type": "application/json",
  } as AxiosRequestHeaders, // <-- приведение типа
});

// Добавляем интерцептор для авторизации
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    if (!config.headers) config.headers = {} as AxiosRequestHeaders;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
