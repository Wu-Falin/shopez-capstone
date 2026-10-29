import axios from 'axios';
import { readJSON } from '../utils/storage';

export const AUTH_STORAGE_KEY = 'shopez_auth';

/**
 * One Axios instance for the whole app.
 * - baseURL: "/api" in development (Vite forwards it to the Express server).
 * - Adds the saved login token to every request.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const saved = readJSON(AUTH_STORAGE_KEY, null);
  if (saved?.token) config.headers.Authorization = `Bearer ${saved.token}`;
  return config;
});

// If the server says the token is no longer valid, tell the app to log out.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginCall = error.config?.url?.startsWith('/auth/login');
    if (error.response?.status === 401 && !isLoginCall) {
      window.dispatchEvent(new Event('shopez:unauthorized'));
    }
    return Promise.reject(error);
  }
);

/** Turns any Axios error into a short message to show the user. */
export function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.request && !error.response) return 'Cannot reach the server. Is the API running?';
  return error.message || 'Something went wrong';
}

export default api;
