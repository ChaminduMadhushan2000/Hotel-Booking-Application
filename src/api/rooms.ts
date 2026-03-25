import apiClient from '@/api/client'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type { CreateRoomDto, Room, UpdateRoomDto } from '@/types/room.types'

export async function getRoomsApi(
  page?: number,
  limit?: number
): Promise<PaginatedResponse<Room>> {
  const response = await apiClient.get<PaginatedResponse<Room>>('/api/v1/rooms', {
    params: {
      page,
      limit
    }
  })
  return response.data
}

export async function getRoomByIdApi(id: string): Promise<ApiResponse<Room>> {
  const response = await apiClient.get<ApiResponse<Room>>(`/api/v1/rooms/${id}`)
  return response.data
}

export async function createRoomApi(dto: CreateRoomDto): Promise<ApiResponse<Room>> {
  const response = await apiClient.post<ApiResponse<Room>>('/api/v1/rooms', dto)
  return response.data
}

export async function updateRoomApi(
  id: string,
  dto: UpdateRoomDto
): Promise<ApiResponse<Room>> {
  const response = await apiClient.patch<ApiResponse<Room>>(`/api/v1/rooms/${id}`, dto)
  return response.data
}

export async function deleteRoomApi(id: string): Promise<ApiResponse<null>> {
  const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/rooms/${id}`)
  return response.data
}
