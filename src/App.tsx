import React, { Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { usePlatformStatus } from '@/hooks/use-platform'
import { ToastProvider } from '@/components/ui/toast'
import { ErrorBoundary } from '@/components/layout/error-boundary'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/layout/protected-route'
import { ProtectedLayout } from '@/components/layout/protected-layout'
import { PageSkeleton } from '@/components/layout/page-skeleton'
import { MaintenancePage } from '@/components/layout/maintenance-page'
import { NotFound } from '@/components/layout/not-found'
import { Spinner } from '@/components/ui/spinner'

const LoginPage = React.lazy(() =>
  import('@/pages/auth/login-page').then((module) => ({ default: module.LoginPage }))
)
const RegisterPage = React.lazy(() =>
  import('@/pages/auth/register-page').then((module) => ({ default: module.RegisterPage }))
)
const DashboardPage = React.lazy(() =>
  import('@/pages/dashboard/dashboard-page').then((module) => ({ default: module.DashboardPage }))
)
const RoomsPage = React.lazy(() =>
  import('@/pages/rooms/rooms-page').then((module) => ({ default: module.RoomsPage }))
)
const RoomDetailPage = React.lazy(() =>
  import('@/pages/rooms/room-detail-page').then((module) => ({ default: module.RoomDetailPage }))
)
const BookingsPage = React.lazy(() =>
  import('@/pages/bookings/bookings-page').then((module) => ({ default: module.BookingsPage }))
)
const CreateBookingPage = React.lazy(() =>
  import('@/pages/bookings/create-booking-page').then((module) => ({
    default: module.CreateBookingPage
  }))
)

interface PageElementProps {
  page: JSX.Element
}

function PageElement({ page }: PageElementProps): JSX.Element {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageSkeleton />}>
        {page}
      </Suspense>
    </ErrorBoundary>
  )
}

function AppRoutes(): JSX.Element {
  const { isLoading, isMaintenanceMode, maintenanceMessage } = usePlatformStatus()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isMaintenanceMode) {
    return <MaintenancePage message={maintenanceMessage ?? undefined} />
  }

  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<PageElement page={<LoginPage />} />} />
        <Route path="/register" element={<PageElement page={<RegisterPage />} />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<PageElement page={<DashboardPage />} />} />
          <Route path="/rooms" element={<PageElement page={<RoomsPage />} />} />
          <Route path="/rooms/:id" element={<PageElement page={<RoomDetailPage />} />} />
          <Route path="/bookings" element={<PageElement page={<BookingsPage />} />} />
          <Route path="/bookings/new" element={<PageElement page={<CreateBookingPage />} />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider />
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
