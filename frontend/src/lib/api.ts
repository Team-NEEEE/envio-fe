import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken, setTokens, logout } = useAuthStore.getState();

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken
          });

          if (data && data.data && data.data.accessToken) {
            const newAccessToken = data.data.accessToken;
            const newRefreshToken = data.data.refreshToken || refreshToken;

            setTokens(newAccessToken, newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return api(originalRequest);
          }
        } catch (refreshError) {
          logout();
          return Promise.reject(refreshError);
        }
      }

      logout();
    }

    return Promise.reject(error);
  }
);
