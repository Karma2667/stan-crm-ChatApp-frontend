export const API_BASE = import.meta.env.VITE_API_URL || "https://stan-messenger.ru";

export const apiPath = (endpoint: string) => `/v1${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
