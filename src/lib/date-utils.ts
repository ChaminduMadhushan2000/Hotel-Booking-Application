export function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

export function formatDateShort(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

export function toISODateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function calculateNights(checkIn: string, checkOut: string): number {
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    return 0
  }

  const msPerNight = 24 * 60 * 60 * 1000
  const diff = checkOutDate.getTime() - checkInDate.getTime()
  return Math.floor(diff / msPerNight)
}

export function isFutureDate(dateString: string): boolean {
  const selected = new Date(dateString)
  if (Number.isNaN(selected.getTime())) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  selected.setHours(0, 0, 0, 0)
  return selected.getTime() >= today.getTime()
}

export function isCheckOutAfterCheckIn(checkIn: string, checkOut: string): boolean {
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    return false
  }

  return checkOutDate.getTime() > checkInDate.getTime()
}
