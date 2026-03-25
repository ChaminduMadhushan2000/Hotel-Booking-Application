import apiClient from '@/api/client'
import type {
  ApiResponse,
  AppVersion,
  HealthStatus,
  MasterData,
  PlatformStatus
} from '@/types/api.types'

export async function getHealthApi(): Promise<ApiResponse<HealthStatus>> {
  const response = await apiClient.get<ApiResponse<HealthStatus>>('/api/health')
  return response.data
}

export async function getPlatformStatusApi(): Promise<ApiResponse<PlatformStatus>> {
  const response = await apiClient.get<ApiResponse<PlatformStatus>>('/api/v1/platform/status')
  return response.data
}

export async function getMasterDataApi(): Promise<ApiResponse<MasterData>> {
  const response = await apiClient.get<ApiResponse<MasterData>>('/api/v1/platform/master-data')
  return response.data
}

export async function getAppVersionApi(
  platform: 'android' | 'ios'
): Promise<ApiResponse<AppVersion>> {
  const response = await apiClient.get<ApiResponse<AppVersion>>('/api/v1/platform/app-version', {
    params: { platform }
  })
  return response.data
}
