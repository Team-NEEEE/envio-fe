import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import type { EnvHistory } from '@/store/mockData';

const API_BASE_URL = 'http://env.io.kr';

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

/**
 * CORE_HISTORY_001: 프로젝트 히스토리 조회
 * GET /api/core/projects/{projectId}/history
 */
export async function getProjectHistory(projectId: number): Promise<EnvHistory[]> {
  console.log(`[CORE_HISTORY_001] 히스토리 조회 요청 (projectId: ${projectId})`);
  const { data } = await api.get(`/api/core/projects/${projectId}/history`);
  if (data && Array.isArray(data.data)) {
    console.log(`[CORE_HISTORY_001] 히스토리 ${data.data.length}건 수신`);
    console.log('[CORE_HISTORY_001] 히스토리 상세 조회 성공:', data.data)
    return data.data as EnvHistory[];
  }
  return [];
}
