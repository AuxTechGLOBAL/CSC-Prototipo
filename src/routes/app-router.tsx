import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAppStore } from '../store/app-store'
import type { Role } from '../types/domain'

const AppLayout = lazy(() => import('../layouts/app-layout').then((module) => ({ default: module.AppLayout })))
const DashboardPage = lazy(() => import('../pages/dashboard-page').then((module) => ({ default: module.DashboardPage })))
const TicketsPage = lazy(() => import('../pages/tickets-page').then((module) => ({ default: module.TicketsPage })))
const TicketDetailPage = lazy(() => import('../pages/ticket-detail-page').then((module) => ({ default: module.TicketDetailPage })))
const CreateTicketPage = lazy(() => import('../pages/create-ticket-page').then((module) => ({ default: module.CreateTicketPage })))
const ApprovalsPage = lazy(() => import('../pages/approvals-page').then((module) => ({ default: module.ApprovalsPage })))
const KbPage = lazy(() => import('../pages/kb-page').then((module) => ({ default: module.KbPage })))
const AdminPage = lazy(() => import('../pages/admin-page').then((module) => ({ default: module.AdminPage })))
const NotFoundPage = lazy(() => import('../pages/not-found-page').then((module) => ({ default: module.NotFoundPage })))
const ProfilePage = lazy(() => import('../pages/profile-page').then((module) => ({ default: module.ProfilePage })))

function RouteFallback() {
  return <p className="p-4 text-sm text-[var(--text-soft)]">Carregando...</p>
}

function withSuspense(children: React.ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>
}

function RoleGuard({
  children,
  allowed,
  redirectTo = '/tickets',
}: {
  children: React.ReactNode
  allowed: Role[]
  redirectTo?: string
}) {
  const role = useAppStore((state) => state.activeRole)
  if (!allowed.includes(role)) {
    return <Navigate to={redirectTo} replace />
  }
  return <>{children}</>
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowed={['Admin', 'Supervisor']}>{children}</RoleGuard>
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={withSuspense(<AppLayout />)}>
        <Route
          path="/"
          element={
            withSuspense(
              <RoleGuard allowed={['Agent', 'Approver', 'Supervisor', 'Admin']}>
                <DashboardPage />
              </RoleGuard>,
            )
          }
        />
        <Route path="/tickets" element={withSuspense(<TicketsPage />)} />
        <Route path="/tickets/new" element={withSuspense(<CreateTicketPage />)} />
        <Route path="/tickets/:ticketId" element={withSuspense(<TicketDetailPage />)} />
        <Route
          path="/approvals"
          element={
            withSuspense(
              <RoleGuard allowed={['Approver', 'Supervisor', 'Admin']}>
                <ApprovalsPage />
              </RoleGuard>,
            )
          }
        />
        <Route path="/kb" element={withSuspense(<KbPage />)} />
        <Route path="/profile" element={withSuspense(<ProfilePage />)} />
        <Route
          path="/admin"
          element={
            withSuspense(
              <AdminGuard>
                <AdminPage />
              </AdminGuard>,
            )
          }
        />
        <Route path="*" element={withSuspense(<NotFoundPage />)} />
      </Route>
    </Routes>
  )
}
