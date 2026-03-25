import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRooms } from '@/hooks/use-rooms'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RoomCard } from '@/components/ui/room-card'
import { Pagination } from '@/components/ui/pagination'
import { PageSkeleton } from '@/components/layout/page-skeleton'
import type { Room } from '@/types/room.types'

function filterRooms(rooms: Room[], term: string): Room[] {
  const query = term.trim().toLowerCase()
  if (query.length === 0) {
    return rooms
  }
  return rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(query) || room.type.toLowerCase().includes(query)
  )
}

export function RoomsPage(): JSX.Element {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useRooms(page, 25)

  const rooms = useMemo(() => filterRooms(data?.data ?? [], search), [data?.data, search])
  const totalPages = data?.meta?.totalPages ?? 1

  if (isLoading) {
    return <PageSkeleton rows={6} />
  }

  if (isError) {
    return (
      <section className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <h1 className="text-xl font-semibold text-red-800">Failed to load rooms</h1>
        <p className="mt-2 text-sm text-red-700">Please try again in a moment.</p>
        <Button className="mt-4 min-h-11" onClick={() => void refetch()}>
          Retry
        </Button>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
        <div className="w-full md:w-80">
          <Input
            id="room-search"
            label="Search rooms"
            placeholder="Search by room name or type"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <span className="text-xl" aria-hidden="true">○</span>
          </div>
          <p className="text-lg font-medium text-gray-900">No rooms found</p>
          <p className="mt-1 text-sm text-gray-600">Try adjusting your search term.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} onSelect={(id) => navigate(`/rooms/${id}`)} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  )
}
