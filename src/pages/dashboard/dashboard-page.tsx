import { Link, useNavigate } from 'react-router-dom'
import { useBookings } from '@/hooks/use-bookings'
import { useAuthStore } from '@/store/auth.store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageSkeleton } from '@/components/layout/page-skeleton'
import { formatDateShort } from '@/lib/date-utils'
import type { Booking } from '@/types/booking.types'

interface BookingStats {
  total: number
  pending: number
  confirmed: number
  cancelled: number
}

function getStatusCounts(bookings: Booking[]): BookingStats {
  return bookings.reduce(
    (stats, booking) => {
      const status = booking.status.toLowerCase()
      if (status === 'pending') stats.pending += 1
      if (status === 'confirmed') stats.confirmed += 1
      if (status === 'cancelled') stats.cancelled += 1
      stats.total += 1
      return stats
    },
    { total: 0, pending: 0, confirmed: 0, cancelled: 0 }
  )
}

function statusVariant(status: string): 'warning' | 'success' | 'danger' | 'neutral' {
  const normalized = status.toLowerCase()
  if (normalized === 'pending') return 'warning'
  if (normalized === 'confirmed') return 'success'
  if (normalized === 'cancelled') return 'danger'
  return 'neutral'
}

export function DashboardPage(): JSX.Element {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { data, isLoading, isError } = useBookings(1, 100)

  if (isLoading) {
    return <PageSkeleton rows={3} />
  }

  if (isError) {
    return (
      <section className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <h1 className="text-xl font-semibold text-red-800">Failed to load dashboard data</h1>
        <p className="mt-2 text-sm text-red-700">Please refresh and try again.</p>
      </section>
    )
  }

  const bookings = data?.data ?? []
  const stats = getStatusCounts(bookings)
  const recentBookings = bookings.slice(-5).reverse()

  return (
    <section className="mx-auto max-w-7xl space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.firstName ?? 'Guest'}</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <article className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-sm text-gray-600">Total bookings</p><p className="mt-2 text-2xl font-bold text-gray-900">{stats.total}</p></article>
        <article className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-sm text-gray-600">Pending</p><p className="mt-2 text-2xl font-bold text-amber-600">{stats.pending}</p></article>
        <article className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-sm text-gray-600">Confirmed</p><p className="mt-2 text-2xl font-bold text-green-600">{stats.confirmed}</p></article>
        <article className="rounded-xl border border-gray-200 bg-white p-4"><p className="text-sm text-gray-600">Cancelled</p><p className="mt-2 text-2xl font-bold text-red-600">{stats.cancelled}</p></article>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent bookings</h2>
          <Link
            to="/bookings"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            View all bookings
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <p className="text-sm text-gray-600">No bookings found yet.</p>
        ) : (
          <ul className="space-y-3">
            {recentBookings.map((booking) => (
              <li key={booking.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-100 p-3">
                <div>
                  <p className="font-medium text-gray-900">Room #{booking.roomId.slice(0, 8)}</p>
                  <p className="text-sm text-gray-600">
                    Check-in: {formatDateShort(booking.checkInDate)}
                  </p>
                </div>
                <Badge label={booking.status} variant={statusVariant(booking.status)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3 sm:flex-row">
        <Button className="min-h-11" onClick={() => navigate('/rooms')}>Browse rooms</Button>
        <Button variant="secondary" className="min-h-11" onClick={() => navigate('/bookings/new')}>
          New booking
        </Button>
      </section>
    </section>
  )
}
