import axios, { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

// ── Base URL resolution ─────────────────────────────────────────────
// CRA embeds REACT_APP_* vars at build time via process.env.
// We also check for Vite-style env so the same file works in both setups.
const getBaseUrl = (): string => {
  // Vite (import.meta.env)
  const metaEnv = (import.meta as any)?.env;
  if (metaEnv?.VITE_API_URL) return metaEnv.VITE_API_URL;

  // CRA (process.env)
  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Fallback – local dev
  return 'http://localhost:8000/api';
};

// ── Axios instance ──────────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ── Request interceptor: attach JWT ─────────────────────────────────
// Pulls the access token from the Zustand auth store on every request.
// This is the single place where Authorization headers are injected.
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: handle 401 ────────────────────────────────
// On a 401 we attempt a silent token refresh using the stored refresh
// token.  If that also fails we log the user out and redirect.
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) prom.resolve(token);
    else prom.reject(error);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, and not if we already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If a refresh is already in-flight, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken =
          typeof sessionStorage !== 'undefined'
            ? sessionStorage.getItem('aegis_refresh_token')
            : null;

        if (!refreshToken) throw new Error('No refresh token');

        // Call the backend refresh endpoint directly (avoid interceptor loop)
        const { data } = await axios.post(`${getBaseUrl()}/users/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken: string = data.access_token;
        if (data.refresh_token) {
          sessionStorage.setItem('aegis_refresh_token', data.refresh_token);
        }
        useAuthStore.getState().setAccessToken(newAccessToken);

        processQueue(null, newAccessToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed → full logout
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
