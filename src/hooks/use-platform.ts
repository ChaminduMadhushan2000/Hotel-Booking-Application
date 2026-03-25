import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMasterDataApi, getPlatformStatusApi } from '@/api/platform'
import { useUiStore } from '@/store/ui.store'
import type { ApiResponse, MasterData } from '@/types/api.types'

interface PlatformStatusState {
  isLoading: boolean
  isMaintenanceMode: boolean
  maintenanceMessage: string | null
}

interface MasterDataState {
  data: ApiResponse<MasterData> | undefined
  isLoading: boolean
  isError: boolean
}

export function usePlatformStatus(): PlatformStatusState {
  const setMaintenanceMode = useUiStore((state) => state.setMaintenanceMode)
  const isMaintenanceMode = useUiStore((state) => state.isMaintenanceMode)
  const maintenanceMessage = useUiStore((state) => state.maintenanceMessage)

  const { data, isLoading } = useQuery({
    queryKey: ['platform', 'status'],
    queryFn: getPlatformStatusApi,
    staleTime: 60_000
  })

  useEffect(() => {
    if (data?.data?.maintenanceMode) {
      setMaintenanceMode(true, data.data.message)
      return
    }

    if (data?.data) {
      setMaintenanceMode(false)
    }
  }, [data, setMaintenanceMode])

  return {
    isLoading,
    isMaintenanceMode,
    maintenanceMessage
  }
}

export function useMasterData(): MasterDataState {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['platform', 'master-data'],
    queryFn: getMasterDataApi,
    staleTime: 3_600_000
  })

  return {
    data,
    isLoading,
    isError
  }
}
