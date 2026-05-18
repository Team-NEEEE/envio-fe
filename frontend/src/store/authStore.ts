import { create } from 'zustand';
import type { User } from './mockData';
import { mockUser } from './mockData';

interface AuthState {
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (username) => set({ user: { ...mockUser, githubId: username } }),
  logout: () => set({ user: null }),
}));