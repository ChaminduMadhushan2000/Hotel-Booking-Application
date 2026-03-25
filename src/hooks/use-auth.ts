import { useAuthStore } from '@/store/auth.store'
import type { LoginDto, RegisterDto, User } from '@/types/auth.types'
import { loginApi, logoutApi, registerApi } from '@/api/auth'

export function useAuth(): {
  user: ReturnType<typeof useAuthStore.getState>['user']
  isAuthenticated: boolean
  accessToken: string | null
  login: (dto: LoginDto) => Promise<void>
  register: (dto: RegisterDto) => Promise<void>
  logout: () => Promise<void>
} {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const accessToken = useAuthStore((state) => state.accessToken)
  const setToken = useAuthStore((state) => state.setToken)
  const setUser = useAuthStore((state) => state.setUser)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  const login = async (dto: LoginDto): Promise<void> => {
    const response = await loginApi(dto)
    const token = response.data?.accessToken
    const loginData = response.data as (User & { accessToken?: string }) | null
    const user = loginData !== null && typeof loginData.id === 'string' ? loginData : null

    if (response.success && typeof token === 'string' && token.length > 0) {
      setToken(token)
      if (user !== null) {
        setUser(user)
      }
      window.location.href = '/dashboard'
      return
    }

    throw new Error(response.message || 'Login failed')
  }

  const register = async (dto: RegisterDto): Promise<void> => {
    const response = await registerApi(dto)
    if (response.success) {
      window.location.href = '/login'
      return
    }

    throw new Error(response.message || 'Registration failed')
  }

  const logout = async (): Promise<void> => {
    await logoutApi()
    clearAuth()
    window.location.href = '/login'
  }

  return {
    user,
    isAuthenticated,
    accessToken,
    login,
    register,
    logout
  }
}
