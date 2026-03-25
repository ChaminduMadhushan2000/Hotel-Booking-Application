import apiClient from '@/api/client'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type {
  Booking,
  CreateBookingDto,
  UpdateBookingDto
} from '@/types/booking.types'

export async function getBookingsApi(
  page?: number,
  limit?: number
): Promise<PaginatedResponse<Booking>> {
  const response = await apiClient.get<PaginatedResponse<Booking>>('/api/v1/bookings', {
    params: {
      page,
      limit
    }
  })
  return response.data
}

export async function getBookingByIdApi(id: string): Promise<ApiResponse<Booking>> {
  const response = await apiClient.get<ApiResponse<Booking>>(`/api/v1/bookings/${id}`)
  return response.data
}

export async function createBookingApi(
  dto: CreateBookingDto
): Promise<ApiResponse<Booking>> {
  const response = await apiClient.post<ApiResponse<Booking>>('/api/v1/bookings', dto)
  return response.data
}

export async function updateBookingApi(
  id: string,
  dto: UpdateBookingDto
): Promise<ApiResponse<Booking>> {
  const response = await apiClient.patch<ApiResponse<Booking>>(
    `/api/v1/bookings/${id}`,
    dto
  )
  return response.data
}

export async function cancelBookingApi(id: string): Promise<ApiResponse<null>> {
  const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/bookings/${id}`)
  return response.data
}
