import type { Booking } from '@/types/booking.types'
import { Badge } from '@/components/ui/badge'

interface BookingStatusBadgeProps {
  status: Booking['status']
}

function toLabel(status: Booking['status']): string {
  return `${status.slice(0, 1).toUpperCase()}${status.slice(1)}`
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps): JSX.Element {
  if (status === 'pending') {
    return <Badge label={toLabel(status)} variant="warning" />
  }
  if (status === 'confirmed') {
    return <Badge label={toLabel(status)} variant="success" />
  }
  if (status === 'cancelled') {
    return <Badge label={toLabel(status)} variant="danger" />
  }
  return <Badge label={toLabel(status)} variant="info" />
}
