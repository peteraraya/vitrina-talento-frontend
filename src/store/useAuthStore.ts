import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'CANDIDATE' | 'RECRUITER';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setAuth: (token: string) => void;
  logout: () => void;
}

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      isAuthenticated: false,
      role: null,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setAuth: (token: string) => {
        const payload = parseJwt(token);
        set({ 
          accessToken: token, 
          isAuthenticated: true,
          role: payload?.role || null
        });
      },
      logout: () => set({ accessToken: null, isAuthenticated: false, role: null }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
