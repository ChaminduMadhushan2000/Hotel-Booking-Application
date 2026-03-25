import apiClient from '@/api/client'
import type { ApiResponse } from '@/types/api.types'
import type { LoginDto, RegisterDto, TokenResponse, User } from '@/types/auth.types'

export async function loginApi(dto: LoginDto): Promise<ApiResponse<TokenResponse>> {
  const response = await apiClient.post<ApiResponse<TokenResponse>>('/api/v1/auth/login', dto)
  return response.data
}

export async function registerApi(dto: RegisterDto): Promise<ApiResponse<User>> {
  const response = await apiClient.post<ApiResponse<User>>('/api/v1/auth/register', dto)
  return response.data
}

export async function refreshApi(): Promise<ApiResponse<TokenResponse>> {
  const response = await apiClient.post<ApiResponse<TokenResponse>>('/api/v1/auth/refresh', {})
  return response.data
}

export async function logoutApi(): Promise<ApiResponse<null>> {
  const response = await apiClient.post<ApiResponse<null>>('/api/v1/auth/logout', {})
  return response.data
}
