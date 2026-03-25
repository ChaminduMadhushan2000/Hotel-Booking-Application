import {
  calculateNights,
  formatDate,
  isCheckOutAfterCheckIn,
  isFutureDate
} from '@/lib/date-utils'

interface BookingSummaryProps {
  checkInDate: string
  checkOutDate: string
  guestCount: number
  pricePerNight: number
  roomName: string
}

function formatAmount(amountInCents: number): string {
  return (amountInCents / 100).toLocaleString()
}

export function BookingSummary({
  checkInDate,
  checkOutDate,
  guestCount,
  pricePerNight,
  roomName
}: BookingSummaryProps): JSX.Element {
  const datesValid =
    isFutureDate(checkInDate) && isCheckOutAfterCheckIn(checkInDate, checkOutDate)
  const nights = datesValid ? calculateNights(checkInDate, checkOutDate) : 0
  const totalCents = nights > 0 ? nights * pricePerNight : 0

  return (
    <aside className="rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="text-lg font-semibold text-gray-900">Booking summary</h2>
      <p className="mt-1 text-sm text-gray-600">{roomName || 'Selected room'}</p>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-gray-600">Check-in</dt>
          <dd className="font-medium text-gray-900">{datesValid ? formatDate(checkInDate) : '—'}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-600">Check-out</dt>
          <dd className="font-medium text-gray-900">{datesValid ? formatDate(checkOutDate) : '—'}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-600">Nights</dt>
          <dd className="font-medium text-gray-900">{nights > 0 ? nights : '—'}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-600">Guests</dt>
          <dd className="font-medium text-gray-900">{guestCount || '—'}</dd>
        </div>
        <div className="mt-2 border-t border-gray-200 pt-2 flex items-center justify-between">
          <dt className="font-semibold text-gray-900">Total</dt>
          <dd className="font-semibold text-gray-900">
            {nights > 0 ? `$${formatAmount(totalCents)}` : '—'}
          </dd>
        </div>
      </dl>
    </aside>
  )
}
