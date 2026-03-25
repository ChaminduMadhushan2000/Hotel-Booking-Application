import type { Booking } from '@/types/booking.types'
import { Button } from '@/components/ui/button'
import { BookingStatusBadge } from '@/components/ui/booking-status-badge'
import { calculateNights, formatDateShort } from '@/lib/date-utils'

interface BookingRowProps {
  booking: Booking
  onCancel: (id: string) => void
  isCancelling?: boolean
}

function formatAmount(amountInCents: number): string {
  return (amountInCents / 100).toLocaleString()
}

export function BookingRow({ booking, onCancel, isCancelling = false }: BookingRowProps): JSX.Element {
  const nights = calculateNights(booking.checkInDate, booking.checkOutDate)

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-base font-semibold text-gray-900">Room {booking.roomId.slice(0, 8)}...</p>
          <p className="text-sm text-gray-600">
            {formatDateShort(booking.checkInDate)} - {formatDateShort(booking.checkOutDate)}
          </p>
          <p className="text-sm text-gray-600">{nights > 0 ? `${nights} nights` : '—'}</p>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-gray-900">${formatAmount(booking.totalAmount)}</p>
          <BookingStatusBadge status={booking.status} />
          {booking.status === 'pending' && (
            <Button
              variant="danger"
              className="min-h-11"
              disabled={isCancelling}
              onClick={() => onCancel(booking.id)}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
