export interface ApiResponse<T = null> {
  statusCode: number
  timestamp: string
  path: string
  method: string
  success: boolean
  message: string
  data: T | null
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface HealthStatus {
  status: 'ok'
  database: {
    status: 'ok'
    latency: string
  }
  redis: {
    status: 'ok'
    memoryUsed: string
    evictedKeys: number
    hitRate: string
  }
  queues: {
    email: {
      status: 'active'
      waiting: number
      failed: number
    }
  }
  disk: {
    used: string
    total: string
    percentUsed: number
  }
}

export interface PlatformStatus {
  maintenanceMode: boolean
  message: string
}

export interface MasterData {
  countries: string[]
  currencies: string[]
  languages: string[]
  timezones: string[]
  bookingStatuses: string[]
  roomTypes: string[]
  paymentStatuses: string[]
}

export interface AppVersion {
  currentVersion: string
  minimumVersion: string
  forceUpdate: boolean
}
