import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateBooking } from '@/hooks/use-bookings'
import { useRoom } from '@/hooks/use-rooms'
import { isCheckOutAfterCheckIn, isFutureDate, toISODateString } from '@/lib/date-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { BookingSummary } from '@/components/ui/booking-summary'
import { showError, showSuccess } from '@/components/ui/toast'

const createBookingSchema = z
  .object({
    checkInDate: z
      .string()
      .min(1, 'Check-in date is required')
      .refine(isFutureDate, 'Check-in must be today or later'),
    checkOutDate: z.string().min(1, 'Check-out date is required'),
    guestCount: z.coerce.number().min(1, 'At least 1 guest required').max(20, 'Maximum 20 guests'),
    specialRequests: z.string().max(1000, 'Maximum 1000 characters').optional()
  })
  .refine((data) => isCheckOutAfterCheckIn(data.checkInDate, data.checkOutDate), {
    message: 'Check-out must be after check-in',
    path: ['checkOutDate']
  })

type CreateBookingFormValues = z.output<typeof createBookingSchema>
type CreateBookingFormInput = z.input<typeof createBookingSchema>

export function CreateBookingPage(): JSX.Element {
  const [searchParams] = useSearchParams()
  const roomId = searchParams.get('roomId') ?? ''
  const navigate = useNavigate()
  const createBooking = useCreateBooking()
  const { data: roomData, isLoading: roomLoading, isError: roomError } = useRoom(roomId)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CreateBookingFormInput, unknown, CreateBookingFormValues>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      guestCount: 1,
      checkInDate: toISODateString(new Date()),
      checkOutDate: '',
      specialRequests: ''
    }
  })
  const checkInDate = watch('checkInDate', '')
  const checkOutDate = watch('checkOutDate', '')
  const guestCount = Number(watch('guestCount', 1))

  const onSubmit = async (data: CreateBookingFormValues): Promise<void> => {
    try {
      await createBooking.mutateAsync({
        roomId,
        checkInDate: new Date(data.checkInDate).toISOString(),
        checkOutDate: new Date(data.checkOutDate).toISOString(),
        guestCount: data.guestCount,
        specialRequests: data.specialRequests
      })
      showSuccess('Booking confirmed!')
      navigate('/bookings')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Booking failed'
      const normalized = message.toLowerCase()
      if (normalized.includes('conflict') || normalized.includes('unavailable')) {
        showError('Room is not available for these dates. Please choose different dates.')
        return
      }
      showError(message)
    }
  }
  if (roomId.length === 0) {
    return (
      <section className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <h1 className="text-xl font-semibold text-red-800">No room selected</h1>
        <p className="mt-2 text-sm text-red-700">Please select a room before creating a booking.</p>
        <Button className="mt-4 min-h-11" onClick={() => navigate('/rooms')}>Browse rooms</Button>
      </section>
    )
  }
  if (roomError || roomData?.data === null) {
    return (
      <section className="mx-auto max-w-3xl rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <h1 className="text-xl font-semibold text-red-800">Failed to load selected room</h1>
        <Button className="mt-4 min-h-11" onClick={() => navigate('/rooms')}>Browse rooms</Button>
      </section>
    )
  }
  const room = roomData?.data
  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <Button variant="ghost" className="min-h-11" onClick={() => navigate(-1)}>← Back</Button>
      <h1 className="text-2xl font-bold text-gray-900">Book a room</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        {roomLoading ? (
          <div className="flex items-center gap-2 text-gray-600"><Spinner size="sm" /> Loading room details...</div>
        ) : roomData?.data ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-gray-900">{roomData.data.name}</p>
              <p className="text-sm text-gray-600">${(roomData.data.pricePerNight / 100).toLocaleString()} per night</p>
            </div>
            <Badge label={roomData.data.type} variant="info" />
          </div>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-gray-200 bg-white p-4" noValidate>
          <Input type="date" label="Check-in date" error={errors.checkInDate?.message} {...register('checkInDate')} />
          <Input type="date" label="Check-out date" error={errors.checkOutDate?.message} {...register('checkOutDate')} />
          <Input type="number" min={1} max={20} label="Number of guests" error={errors.guestCount?.message} {...register('guestCount')} />
          <div className="flex flex-col gap-2">
            <label htmlFor="specialRequests" className="text-sm font-medium text-gray-900">Special requests (optional)</label>
            <textarea
              id="specialRequests"
              rows={4}
              className="w-full min-h-24 rounded-lg border-2 border-gray-300 px-4 py-2 text-base text-gray-900 placeholder-gray-500 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              placeholder="Any notes for your stay"
              {...register('specialRequests')}
            />
            {errors.specialRequests?.message && <span className="text-sm font-medium text-red-600">{errors.specialRequests.message}</span>}
          </div>
          <Button type="submit" className="w-full min-h-11" isLoading={isSubmitting} disabled={isSubmitting}>
            Confirm booking
          </Button>
        </form>
        <BookingSummary
          checkInDate={checkInDate}
          checkOutDate={checkOutDate}
          guestCount={guestCount}
          pricePerNight={roomData?.data?.pricePerNight ?? 0}
          roomName={roomData?.data?.name ?? ''}
        />
      </div>
    </section>
  )
}
