import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelBookingApi,
  createBookingApi,
  getBookingByIdApi,
  getBookingsApi,
  updateBookingApi
} from '@/api/bookings'
import type { CreateBookingDto, UpdateBookingDto } from '@/types/booking.types'

export function useBookings(page?: number, limit?: number) {
  return useQuery({
    queryKey: ['bookings', page, limit],
    queryFn: () => getBookingsApi(page, limit),
    staleTime: 60_000
  })
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => getBookingByIdApi(id),
    enabled: Boolean(id)
  })
}

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateBookingDto) => createBookingApi(dto),
    onSuccess: async (): Promise<void> => {
      await queryClient.invalidateQueries({ queryKey: ['bookings'] })
    }
  })
}

export function useUpdateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateBookingDto }) =>
      updateBookingApi(id, dto),
    onSuccess: async (): Promise<void> => {
      await queryClient.invalidateQueries({ queryKey: ['bookings'] })
    }
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => cancelBookingApi(id),
    onSuccess: async (): Promise<void> => {
      await queryClient.invalidateQueries({ queryKey: ['bookings'] })
    }
  })
}
