export interface Room {
  id: string
  name: string
  roomNumber: string
  type: string
  pricePerNight: number
  capacity: number
  description: string | null
  amenities: Record<string, unknown> | null
  isAvailable: boolean
  status: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface CreateRoomDto {
  name: string
  roomNumber: string
  type: string
  pricePerNight: number
  capacity: number
  description?: string
  amenities?: Record<string, unknown>
  isAvailable?: boolean
  status: string
}

export interface UpdateRoomDto {
  name?: string
  roomNumber?: string
  type?: string
  pricePerNight?: number
  capacity?: number
  description?: string
  amenities?: Record<string, unknown>
  isAvailable?: boolean
  status?: string
}
