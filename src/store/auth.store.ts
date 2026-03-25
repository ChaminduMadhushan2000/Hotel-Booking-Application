import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
}

interface AuthActions {
  setToken: (token: string) => void;
  clearAuth: () => void;
}

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,

  setToken: (token: string): void => {
    set({ accessToken: token });
  },

  clearAuth: (): void => {
    set({ accessToken: null });
  },
}));
