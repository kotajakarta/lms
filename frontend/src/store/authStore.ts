import { create } from 'zustand';

export interface UserProfile {
  id: number;
  nama: string;
  email: string;
  role: 'siswa' | 'instruktur' | 'admin' | 'superadmin';
  foto?: string | null;
  department_id?: number | null;
  wilayah_id?: number | null;
  cabang_id?: number | null;
  two_factor_enabled: boolean;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserProfile, token: string) => void;
  logout: () => void;
  updateUser: (partial: Partial<UserProfile>) => void;
}

const getStoredUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  setAuth: (user, token) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
  updateUser: (partial) => {
    set((state) => {
      const updated = state.user ? { ...state.user, ...partial } : null;
      if (updated) {
        localStorage.setItem('auth_user', JSON.stringify(updated));
      }
      return { user: updated };
    });
  },
}));
