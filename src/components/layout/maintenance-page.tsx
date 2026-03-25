interface MaintenancePageProps {
  message?: string
}

export function MaintenancePage({ message }: MaintenancePageProps): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
        <div className="text-5xl mb-4">🔧</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Down for Maintenance</h1>
        {message && <p className="text-gray-600">{message}</p>}
        {!message && (
          <p className="text-gray-600">
            We are performing scheduled maintenance. Please check back shortly.
          </p>
        )}
      </div>
    </div>
  )
}
