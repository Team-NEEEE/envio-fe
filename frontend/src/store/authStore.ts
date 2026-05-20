import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';
import type { User } from './mockData';
import { mockUser } from './mockData';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  _hasHydrated: boolean; // localStorage 복원 완료 여부

  setHasHydrated: (val: boolean) => void;
  setTokens: (access: string, refresh: string) => void;
  setOAuthSession: (payload: {
    accessToken: string;
    refreshToken: string;
    userId: string;
    email: string;
    role: string;
    githubId?: string;
  }) => Promise<void>;
  fetchUser: () => Promise<void>;
  fetchOrganizations: (githubId: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      _hasHydrated: false,

      setHasHydrated: (val) => set({ _hasHydrated: val }),

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },

      fetchOrganizations: async (githubId: string) => {
        const CORE_API_URL = 'http://env.io.kr';
        console.log(`[CORE_USER_001] 조직 조회 요청 시도 (githubId: ${githubId}, URL: ${CORE_API_URL}/api/core/users/me/projects)`);
        try {
          const projRes = await api.get('/api/core/users/me/projects', {
            baseURL: CORE_API_URL,
            params: { githubId }
          });

          if (projRes.data && projRes.data.success) {
            console.log('[CORE_USER_001] 조직 및 프로젝트 조회 성공:', projRes.data.data);
            // data의 키는 조직 이름(organization_name), 값은 프로젝트 배열
            const orgMap: Record<string, Array<{
              projectId: number;
              projectName: string;
              description: string | null;
              versionId: number;
            }>> = projRes.data.data;

            const organizations = Object.keys(orgMap).map(orgName => ({
              id: orgName,
              name: orgName,
              role: 'Member' as const,
              repositories: orgMap[orgName].map((proj) => ({
                id: proj.projectId,           // camelCase: projectId
                name: proj.projectName,       // camelCase: projectName
                envKeys: [],
                history: []
              }))
            }));

            const currentUser = get().user;
            if (currentUser) {
              set({ user: { ...currentUser, organizations } });
            }
          } else {
            console.error('[CORE_USER_001] 조직 조회 실패 (API 응답 에러):', projRes.data);
          }
        } catch (projError) {
          console.error('[CORE_USER_001] 조직 조회 중 예외 발생:', projError);
        }
      },

      setOAuthSession: async ({ accessToken, refreshToken, userId, email, role, githubId }) => {
        const resolvedGithubId = githubId || email.split('@')[0] || mockUser.githubId;
        console.log('[AUTH] OAuth 세션 설정 시작, githubId:', resolvedGithubId);

        set({
          accessToken,
          refreshToken,
          user: {
            ...mockUser,
            id: String(userId),
            name: resolvedGithubId,
            githubId: resolvedGithubId,
            email,
            role,
          },
        });

        await get().fetchOrganizations(resolvedGithubId);
      },

      fetchUser: async () => {
        console.log('[AUTH] fetchUser 호출 - /api/auth/me 요청 시작');
        try {
          const { data } = await api.get('/api/auth/me');
          if (data && data.data) {
            const apiUser = data.data;
            const githubId = apiUser.github_id;
            console.log('[AUTH] fetchUser 성공, githubId:', githubId);

            set({
              user: {
                ...mockUser,
                id: String(apiUser.user_id),
                name: githubId,
                githubId: githubId,
                email: apiUser.email ?? '',
                role: apiUser.role ?? '',
              }
            });

            await get().fetchOrganizations(githubId);
          }
        } catch (error) {
          console.error('[AUTH] fetchUser 실패:', error);
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
          console.error('Logout API failed, but clearing local state anyway.', error);
        } finally {
          set({ user: null, accessToken: null, refreshToken: null });
        }
      },
    }),
    {
      name: 'envio-auth-storage',
      // accessToken, refreshToken만 localStorage에 저장 (user는 매 접속 시 API로 새로 받음)
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        // localStorage 복원이 완료되면 _hasHydrated를 true로 설정
        state?.setHasHydrated(true);
      },
    }
  )
);
