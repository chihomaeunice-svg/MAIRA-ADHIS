import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLocalSession: boolean;
  setUser: (user: User | null, local?: boolean) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isLocalSession: false,

      setUser: (user, local = false) => {
        set({ user, isAuthenticated: !!user, isLoading: false, isLocalSession: local });
      },

      setLoading: (isLoading) => set({ isLoading }),

      logout: () => {
        set({ user: null, isAuthenticated: false, isLoading: false, isLocalSession: false });
      },

      hasRole: (roles: UserRole[]) => {
        const { user } = get();
        if (!user) return false;
        return roles.includes(user.role);
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === 'ADMIN' || user?.role === 'MANAGING_PARTNER';
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLocalSession: state.isLocalSession,
      }),
    }
  )
);
