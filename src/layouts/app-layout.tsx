import { Outlet } from 'react-router-dom'
import { AppHeader } from '../components/app-header'
import { AppSidebar } from '../components/app-sidebar'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-strong)]">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, var(--bg-glow-1), transparent 35%), radial-gradient(circle at 80% 0%, var(--bg-glow-2), transparent 35%), linear-gradient(180deg, var(--bg-grad-start), var(--bg-grad-mid) 35%, var(--bg-grad-end))',
        }}
      />
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
          <AppHeader />
          <main className="flex-1 px-4 py-4 lg:px-6 lg:py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
