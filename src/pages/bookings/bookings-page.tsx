import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBookings, useCancelBooking } from '@/hooks/use-bookings'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { BookingRow } from '@/components/ui/booking-row'
import { PageSkeleton } from '@/components/layout/page-skeleton'
import { useMasterData } from '@/hooks/use-platform'
import { showError, showSuccess } from '@/components/ui/toast'
import type { Booking } from '@/types/booking.types'

type BookingFilter = 'all' | Booking['status']

function filterBookings(bookings: Booking[], statusFilter: BookingFilter): Booking[] {
  if (statusFilter === 'all') {
    return bookings
  }
  return bookings.filter((booking) => booking.status === statusFilter)
}

export function BookingsPage(): JSX.Element {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<BookingFilter>('all')
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useBookings(page, 10)
  const cancelMutation = useCancelBooking()
  const { data: masterData } = useMasterData()

  const filters = useMemo<BookingFilter[]>(() => {
    const statuses = (masterData?.data?.bookingStatuses ?? [])
      .map((status) => status.toLowerCase())
      .filter((status): status is Booking['status'] =>
        status === 'pending' ||
        status === 'confirmed' ||
        status === 'cancelled' ||
        status === 'completed'
      )

    const uniqueStatuses = Array.from(new Set(statuses))
    return ['all', ...uniqueStatuses]
  }, [masterData?.data?.bookingStatuses])

  const bookings = useMemo(
    () => filterBookings(data?.data ?? [], statusFilter),
    [data?.data, statusFilter]
  )
  const totalPages = data?.meta?.totalPages ?? 1

  const onCancel = (id: string): void => {
    cancelMutation.mutate(id, {
      onSuccess: () => showSuccess('Booking cancelled'),
      onError: () => showError('Failed to cancel booking')
    })
  }

  if (isLoading) {
    return <PageSkeleton rows={5} />
  }

  if (isError) {
    return (
      <section className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <h1 className="text-xl font-semibold text-red-800">Failed to load bookings</h1>
        <Button className="mt-4 min-h-11" onClick={() => void refetch()}>Retry</Button>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My bookings</h1>
        <Button className="min-h-11" onClick={() => navigate('/bookings/new')}>New booking</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter}
            variant={statusFilter === filter ? 'primary' : 'secondary'}
            className="min-h-11"
            onClick={() => setStatusFilter(filter)}
          >
            {filter.slice(0, 1).toUpperCase() + filter.slice(1)}
          </Button>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          {statusFilter === 'all' ? (
            <>
              <p className="text-lg font-medium text-gray-900">You have no bookings yet</p>
              <Button className="mt-4 min-h-11" onClick={() => navigate('/rooms')}>Browse rooms</Button>
            </>
          ) : (
            <p className="text-lg font-medium text-gray-900">No {statusFilter} bookings</p>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {bookings.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                onCancel={onCancel}
                isCancelling={cancelMutation.isPending}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  )
}
