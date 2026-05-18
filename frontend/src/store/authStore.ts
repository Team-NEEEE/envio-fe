import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';
import type { User } from './mockData';
import { mockUser } from './mockData';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;

  setTokens: (access: string, refresh: string) => void;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      fetchUser: async () => {
        try {
          const { data } = await api.get('/api/auth/me');
          if (data && data.data) {
            const apiUser = data.data;
            set({
              user: {
                ...mockUser,
                id: String(apiUser.user_id),
                name: apiUser.github_id,
                githubId: apiUser.github_id,
              }
            });
          }
        } catch (error) {
          console.error("Failed to fetch user:", error);
          throw error;
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        try {
          if (refreshToken) {
            await api.post('/api/auth/logout', { refreshToken });
          }
        } catch (error) {
          console.error("Logout API failed, but clearing local state anyway.", error);
        } finally {
          set({ user: null, accessToken: null, refreshToken: null });
        }
      },
    }),
    {
      name: 'envio-auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user
      }),
    }
  )
);
