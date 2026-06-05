import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';

type Role = 'CLIENT' | 'PROVIDER' | 'PREMIUM_PROVIDER' | 'ADMIN' | null;

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

interface AuthState {
  token: string | null;
  user: User | null;
  role: Role;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null,
      setAuth: (token, user) => {
        Cookies.set('auth-token', token, { expires: 7 });
        Cookies.set('auth-role', user.role || '', { expires: 7 });
        set({ token, user, role: user.role });
      },
      logout: () => {
        Cookies.remove('auth-token');
        Cookies.remove('auth-role');
        set({ token: null, user: null, role: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
