import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'
import type { ApiResponse } from '@/types/api.types'
import type { TokenResponse } from '@/types/auth.types'
import { useAuthStore } from '@/store/auth.store'

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const accessToken = useAuthStore.getState().accessToken
    if (accessToken !== null) {
      const headers = AxiosHeaders.from(config.headers)
      headers.set('Authorization', `Bearer ${accessToken}`)
      config.headers = headers
    }
    return config
  },
  (error: AxiosError): Promise<never> => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<AxiosResponse> => {
    const originalRequest = error.config as RetryRequestConfig | undefined

    if (
      error.response?.status === 401 &&
      originalRequest !== undefined &&
      !originalRequest._retry &&
      originalRequest.url !== '/api/v1/auth/refresh'
    ) {
      originalRequest._retry = true

      try {
        const refreshResponse = await axios.post<ApiResponse<TokenResponse>>(
          '/api/v1/auth/refresh',
          {},
          {
            baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )

        const refreshedToken = refreshResponse.data.data?.accessToken
        if (typeof refreshedToken === 'string' && refreshedToken.length > 0) {
          useAuthStore.getState().setToken(refreshedToken)
          const headers = AxiosHeaders.from(originalRequest.headers)
          headers.set('Authorization', `Bearer ${refreshedToken}`)
          originalRequest.headers = headers
          return apiClient.request(originalRequest)
        }

        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
        return Promise.reject(error)
      } catch (_refreshError: unknown) {
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
