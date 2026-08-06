import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      isAuthenticated: false,
      setAuth: (token: string) => set({ accessToken: token, isAuthenticated: true }),
      logout: () => set({ accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
