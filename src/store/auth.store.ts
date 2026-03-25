import { create } from 'zustand'
import type { User } from '@/types/auth.types'

interface AuthState {
  accessToken: string | null
  user: User | null
  isAuthenticated: boolean
}

interface AuthActions {
  setToken: (token: string) => void
  setUser: (user: User) => void
  clearAuth: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  setToken: (token: string): void => {
    set({
      accessToken: token,
      isAuthenticated: token !== null
    })
  },
  setUser: (user: User): void => {
    set({ user })
  },
  clearAuth: (): void => {
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false
    })
  }
}))
