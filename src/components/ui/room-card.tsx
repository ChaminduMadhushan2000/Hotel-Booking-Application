import type { Room } from '@/types/room.types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface RoomCardProps {
  room: Room
  onSelect: (id: string) => void
}

function formatPrice(priceInCents: number): string {
  return (priceInCents / 100).toLocaleString()
}

export function RoomCard({ room, onSelect }: RoomCardProps): JSX.Element {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
        <Badge label={room.type} variant="info" />
      </div>

      <div className="space-y-3 text-sm text-gray-700">
        <p>
          <span className="font-medium text-gray-900">Price:</span> ${formatPrice(room.pricePerNight)}
          <span className="ml-1">per night</span>
        </p>
        <p>
          <span className="font-medium text-gray-900">Capacity:</span> Up to {room.capacity} guests
        </p>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">Status:</span>
          <Badge label={room.isAvailable ? 'Available' : 'Unavailable'} variant={room.isAvailable ? 'success' : 'danger'} />
        </div>
      </div>

      <div className="mt-5">
        <Button className="w-full min-h-11" onClick={() => onSelect(room.id)}>
          View details
        </Button>
      </div>
    </article>
  )
}
