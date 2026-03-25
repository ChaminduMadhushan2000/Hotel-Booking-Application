import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/rooms', label: 'Rooms' },
  { href: '/bookings', label: 'My Bookings' }
]

export function Sidebar({ isOpen, onClose }: SidebarProps): JSX.Element {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static left-0 top-16 h-[calc(100vh-64px)] w-64 bg-white border-r border-gray-200',
          'transition-transform duration-300 lg:translate-x-0 z-50',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <nav className="p-4 space-y-2">
          {/* Close button - mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden w-full mb-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <span className="flex items-center">
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </span>
          </button>

          {/* Navigation links */}
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'block w-full px-4 py-3 min-h-11 rounded-lg font-medium transition-colors text-left',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
