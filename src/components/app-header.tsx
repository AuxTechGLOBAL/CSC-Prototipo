import { Bell, Search } from 'lucide-react'
import { useMemo } from 'react'
import { Input } from './ui/input'
import { useAppStore } from '../store/app-store'
import { useUsersQuery } from '../hooks/use-csc-data'

export function AppHeader() {
  const role = useAppStore((state) => state.activeRole)
  const userId = useAppStore((state) => state.activeUserId)
  const usersQuery = useUsersQuery()

  const activeUser = useMemo(() => {
    return (usersQuery.data ?? []).find((user) => user.id === userId)
  }, [userId, usersQuery.data])

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface-1)_92%,transparent)] shadow-[0_10px_24px_rgba(0,0,0,0.16)] backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 lg:px-6">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-2 top-2.5 text-[var(--text-soft)]" size={16} />
          <Input className="h-10 rounded-xl border-[var(--border-subtle)] bg-[var(--surface-2)] pl-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]" placeholder="Busca global por ID, ticket, artigo..." />
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-1.5 text-xs text-[var(--text-soft)] shadow-[0_8px_18px_rgba(0,0,0,0.12)]">
          <span className="font-semibold text-[var(--text-strong)]">{activeUser?.name ?? 'Usuario'}</span>
          <span className="mx-2">•</span>
          <span>{role}</span>
          <span className="mx-2">•</span>
          <span>Tema do sistema</span>
        </div>

        <button className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-soft)] shadow-[0_8px_18px_rgba(0,0,0,0.12)] transition hover:border-[var(--brand-500)]/40 hover:text-[var(--text-strong)]">
          <Bell size={16} />
        </button>
      </div>
    </header>
  )
}
