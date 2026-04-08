import { LayoutDashboard, Ticket, CheckCheck, BookOpenText, PlusCircle, UserCircle2, ArrowLeft, ChevronRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../lib/utils'
import { useAppStore } from '../store/app-store'
import { useUsersQuery } from '../hooks/use-csc-data'
import type { Role } from '../types/domain'

function getNavItemsByRole(role: Role) {
  if (role === 'Requester') {
    return [
      { label: 'Tickets', to: '/tickets', icon: Ticket },
      { label: 'Criar Ticket', to: '/tickets/new', icon: PlusCircle },
      { label: 'Base de Conhecimento', to: '/kb', icon: BookOpenText },
    ]
  }

  const items = [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'Tickets', to: '/tickets', icon: Ticket },
    { label: 'Criar Ticket', to: '/tickets/new', icon: PlusCircle },
    { label: 'Base de Conhecimento', to: '/kb', icon: BookOpenText },
  ]

  if (role === 'Approver' || role === 'Supervisor' || role === 'Admin') {
    items.splice(3, 0, { label: 'Aprovacoes', to: '/approvals', icon: CheckCheck })
  }

  return items
}

export function AppSidebar() {
  const role = useAppStore((state) => state.activeRole)
  const userId = useAppStore((state) => state.activeUserId)
  const usersQuery = useUsersQuery()
  const navItems = getNavItemsByRole(role)

  const activeUser = (usersQuery.data ?? []).find((user) => user.id === userId)

  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col border-r border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface-1)_96%,transparent)] px-4 py-5 shadow-[var(--shadow-soft)] backdrop-blur-md">
      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[linear-gradient(135deg,rgba(59,130,246,0.16),rgba(99,102,241,0.08))] p-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--brand-600),var(--brand-700))] text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(37,99,235,0.28)]">
          RH
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-[var(--text-strong)]">CSC Prototipo</div>
          <div className="truncate text-xs uppercase tracking-[0.08em] text-[var(--text-soft)]">Portal de RH</div>
        </div>
      </div>

      <button
        type="button"
        className="mb-5 flex w-full items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[linear-gradient(135deg,#1c2333,#111827)] px-3 py-2.5 text-sm font-medium text-[var(--text-strong)] shadow-[0_6px_18px_rgba(0,0,0,0.22)] transition hover:border-[var(--brand-500)]/40 hover:bg-[linear-gradient(135deg,#212b3d,#161d2d)]"
        aria-label="Voltar ao menu"
      >
        <ArrowLeft size={16} />
        Voltar ao menu
      </button>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'border-[var(--brand-500)]/25 bg-[linear-gradient(135deg,rgba(59,130,246,0.18),rgba(99,102,241,0.08))] text-[var(--text-strong)] shadow-[0_8px_18px_rgba(59,130,246,0.14)]'
                    : 'border-transparent text-[var(--text-soft)] hover:border-[var(--border-subtle)] hover:bg-[var(--surface-2)] hover:text-[var(--text-strong)]',
                )
              }
            >
              <Icon size={16} />
              {item.label}
              <ChevronRight size={14} className="ml-auto opacity-60" />
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-4 border-t border-[var(--border-subtle)] pt-4">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition-all',
              isActive
                ? 'border-[var(--brand-500)]/25 bg-[linear-gradient(135deg,rgba(59,130,246,0.16),rgba(99,102,241,0.08))] text-[var(--text-strong)]'
                : 'border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-soft)] hover:border-[var(--border-subtle)] hover:text-[var(--text-strong)]',
            )
          }
        >
          <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
            {activeUser?.name
              ?.split(' ')
              .map((part) => part[0])
              .slice(0, 2)
              .join('') ?? 'PR'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-[var(--text-strong)]">{activeUser?.name ?? 'Perfil'}</div>
            <div className="truncate text-xs text-[var(--text-soft)]">{role}</div>
          </div>
          <UserCircle2 size={18} className="text-[var(--text-soft)]" />
        </NavLink>
      </div>
    </aside>
  )
}
