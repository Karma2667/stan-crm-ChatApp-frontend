import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/', // через Vite-прокси
  withCredentials: true,
});

export const setAuthToken = (token?: string) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};
