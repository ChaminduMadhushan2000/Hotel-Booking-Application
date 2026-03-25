import { useAuthStore } from '@/store/auth.store'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

interface NavbarProps {
  onMenuClick: () => void
}

export function Navbar({ onMenuClick }: NavbarProps): JSX.Element {
  const user = useAuthStore((state) => state.user)
  const { logout } = useAuth()

  const handleLogout = async (): Promise<void> => {
    await logout()
  }

  return (
    <nav className="bg-white border-b border-gray-200 h-16 flex items-center px-4 md:px-6">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        {/* Left side - Menu button + logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 min-h-11 min-w-11 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <span className="text-xl font-bold text-gray-900">Hotel Booking</span>
        </div>

        {/* Right side - User info + logout */}
        <div className="flex items-center gap-4">
          {user && <span className="text-sm text-gray-600">{user.firstName}</span>}
          <Button variant="ghost" size="md" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
