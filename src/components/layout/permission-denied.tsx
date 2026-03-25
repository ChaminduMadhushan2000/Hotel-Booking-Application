import { useNavigate } from 'react-router-dom'

export function PermissionDenied(): JSX.Element {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You do not have permission to access this resource.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 min-h-11 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go back
        </button>
      </div>
    </div>
  )
}
