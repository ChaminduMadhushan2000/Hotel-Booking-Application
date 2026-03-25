import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createRoomApi,
  deleteRoomApi,
  getRoomByIdApi,
  getRoomsApi,
  updateRoomApi
} from '@/api/rooms'
import type { CreateRoomDto, UpdateRoomDto } from '@/types/room.types'

export function useRooms(page?: number, limit?: number) {
  return useQuery({
    queryKey: ['rooms', page, limit],
    queryFn: () => getRoomsApi(page, limit),
    staleTime: 60_000
  })
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: ['rooms', id],
    queryFn: () => getRoomByIdApi(id),
    enabled: Boolean(id)
  })
}

export function useCreateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateRoomDto) => createRoomApi(dto),
    onSuccess: async (): Promise<void> => {
      await queryClient.invalidateQueries({ queryKey: ['rooms'] })
    }
  })
}

export function useUpdateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRoomDto }) => updateRoomApi(id, dto),
    onSuccess: async (): Promise<void> => {
      await queryClient.invalidateQueries({ queryKey: ['rooms'] })
    }
  })
}

export function useDeleteRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteRoomApi(id),
    onSuccess: async (): Promise<void> => {
      await queryClient.invalidateQueries({ queryKey: ['rooms'] })
    }
  })
}
