import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Select } from '../components/ui/select'
import { useUsersQuery } from '../hooks/use-csc-data'
import { useAppStore } from '../store/app-store'
import type { Role } from '../types/domain'

const roleOptions: Array<{ label: string; value: Role }> = [
  { label: 'Requester', value: 'Requester' },
  { label: 'Agent', value: 'Agent' },
  { label: 'Approver', value: 'Approver' },
  { label: 'Supervisor', value: 'Supervisor' },
  { label: 'Admin', value: 'Admin' },
]

export function ProfilePage() {
  const role = useAppStore((state) => state.activeRole)
  const userId = useAppStore((state) => state.activeUserId)
  const setRole = useAppStore((state) => state.setRole)
  const setUserId = useAppStore((state) => state.setUserId)
  const usersQuery = useUsersQuery()

  const roleUsers = useMemo(() => {
    return (usersQuery.data ?? []).filter((user) => user.role === role)
  }, [role, usersQuery.data])

  const userOptions = roleUsers.map((user) => ({
    label: `${user.name} (${user.area})`,
    value: user.id,
  }))

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Perfil em uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Papel do sistema</p>
            <Select
              value={role}
              options={roleOptions}
              onChange={(event) => setRole(event.target.value as Role)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Usuario do papel selecionado</p>
            <Select
              value={userId}
              options={userOptions}
              onChange={(event) => setUserId(event.target.value)}
            />
          </div>

          <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text-soft)]">
            O frontend adapta automaticamente permissões, transições de status e visibilidade de ações conforme o perfil selecionado.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[var(--text-soft)]">
          <p>O protótipo segue o tema do sistema operacional usando prefers-color-scheme.</p>
          <p>Ao alternar entre claro/escuro no sistema, a interface muda automaticamente.</p>
        </CardContent>
      </Card>
    </div>
  )
}