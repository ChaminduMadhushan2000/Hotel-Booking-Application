import { Button } from '@/components/ui/button'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps): JSX.Element {
  const safeTotal = totalPages > 0 ? totalPages : 1

  return (
    <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Pagination">
      <Button
        variant="secondary"
        className="min-h-11"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>

      <p className="text-sm font-medium text-gray-700">
        Page {page} of {safeTotal}
      </p>

      <Button
        variant="secondary"
        className="min-h-11"
        disabled={page >= safeTotal}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </nav>
  )
}
