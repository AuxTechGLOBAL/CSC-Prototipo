import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../layouts/app-layout'
import { DashboardPage } from '../pages/dashboard-page'
import { TicketsPage } from '../pages/tickets-page'
import { TicketDetailPage } from '../pages/ticket-detail-page'
import { CreateTicketPage } from '../pages/create-ticket-page'
import { ApprovalsPage } from '../pages/approvals-page'
import { KbPage } from '../pages/kb-page'
import { AdminPage } from '../pages/admin-page'
import { NotFoundPage } from '../pages/not-found-page'
import { ProfilePage } from '../pages/profile-page'
import { useAppStore } from '../store/app-store'
import type { Role } from '../types/domain'

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
      <Route element={<AppLayout />}>
        <Route
          path="/"
          element={
            <RoleGuard allowed={['Agent', 'Approver', 'Supervisor', 'Admin']}>
              <DashboardPage />
            </RoleGuard>
          }
        />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/tickets/new" element={<CreateTicketPage />} />
        <Route path="/tickets/:ticketId" element={<TicketDetailPage />} />
        <Route
          path="/approvals"
          element={
            <RoleGuard allowed={['Approver', 'Supervisor', 'Admin']}>
              <ApprovalsPage />
            </RoleGuard>
          }
        />
        <Route path="/kb" element={<KbPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminPage />
            </AdminGuard>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
