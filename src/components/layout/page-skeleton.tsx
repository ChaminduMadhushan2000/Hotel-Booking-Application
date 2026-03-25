interface PageSkeletonProps {
  rows?: number
}

export function PageSkeleton({ rows = 5 }: PageSkeletonProps): JSX.Element {

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
        </div>

        {/* Content rows */}
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
