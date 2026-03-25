import { useNavigate, useParams } from 'react-router-dom'
import { useRoom } from '@/hooks/use-rooms'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageSkeleton } from '@/components/layout/page-skeleton'

function formatPrice(priceInCents: number): string {
  return (priceInCents / 100).toLocaleString()
}

function mapAmenities(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string')
  }
  if (value !== null && typeof value === 'object') {
    return Object.keys(value)
  }
  return []
}

export function RoomDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useRoom(id ?? '')

  if (isLoading) {
    return <PageSkeleton rows={4} />
  }

  if (id === undefined || isError || data?.data === null) {
    return (
      <section className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <h1 className="text-xl font-semibold text-red-800">Room not found</h1>
        <p className="mt-2 text-sm text-red-700">The room may have been removed or is unavailable.</p>
        <Button variant="secondary" className="mt-4 min-h-11" onClick={() => navigate(-1)}>
          Back to rooms
        </Button>
      </section>
    )
  }

  const room = data?.data
  if (room === undefined || room === null) {
    return (
      <section className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <h1 className="text-xl font-semibold text-red-800">Room not found</h1>
        <p className="mt-2 text-sm text-red-700">The room may have been removed or is unavailable.</p>
        <Button variant="secondary" className="mt-4 min-h-11" onClick={() => navigate(-1)}>
          Back to rooms
        </Button>
      </section>
    )
  }
  const amenities = mapAmenities(room.amenities)

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <Button variant="ghost" className="min-h-11" onClick={() => navigate(-1)}>
        ← Back to rooms
      </Button>

      <header className="rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="text-3xl font-bold text-gray-900">{room.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge label={room.type} variant="info" />
          <Badge label={room.isAvailable ? 'Available' : 'Unavailable'} variant={room.isAvailable ? 'success' : 'danger'} />
        </div>
        {room.description && <p className="mt-4 text-sm text-gray-700">{room.description}</p>}
      </header>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-6 sm:grid-cols-2">
        <p><span className="font-medium text-gray-900">Price per night:</span> ${formatPrice(room.pricePerNight)}</p>
        <p><span className="font-medium text-gray-900">Capacity:</span> {room.capacity} guests</p>
        <p><span className="font-medium text-gray-900">Status:</span> {room.isAvailable ? 'Available' : 'Unavailable'}</p>
        <p><span className="font-medium text-gray-900">Room number:</span> {room.roomNumber}</p>
      </div>

      {amenities.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Amenities</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
            {amenities.map((amenity) => (
              <li key={amenity}>{amenity}</li>
            ))}
          </ul>
        </section>
      )}

      <Button className="min-h-11" onClick={() => navigate(`/bookings/new?roomId=${room.id}`)}>
        Book this room
      </Button>
    </section>
  )
}
