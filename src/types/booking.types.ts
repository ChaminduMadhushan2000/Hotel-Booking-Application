export interface Booking {
  id: string
  roomId: string
  userId: string
  checkInDate: string
  checkOutDate: string
  guestCount: number
  totalAmount: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  specialRequests: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateBookingDto {
  roomId: string
  checkInDate: string
  checkOutDate: string
  guestCount: number
  specialRequests?: string
}

export interface UpdateBookingDto {
  guestCount?: number
  specialRequests?: string
}
