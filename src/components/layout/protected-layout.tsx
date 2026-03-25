import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'
import { useUiStore } from '@/store/ui.store'

export function ProtectedLayout(): JSX.Element {
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen)

  const handleMenuClick = (): void => {
    toggleSidebar()
  }

  const handleCloseSidebar = (): void => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed inset-x-0 top-0 z-50 h-16">
        <Navbar onMenuClick={handleMenuClick} />
      </header>

      <div className="pt-16 lg:grid lg:grid-cols-[240px_1fr]">
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
        <main className="min-w-0 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
