import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { useTicketsQuery, useUsersQuery } from '../hooks/use-csc-data'
import { useAppStore } from '../store/app-store'
import { KanbanBoard } from '../features/dashboard/kanban-board'
import { SLAIndicator } from '../features/tickets/components/sla-indicator'
import { useNow } from '../hooks/use-now'

export function DashboardPage() {
  const userId = useAppStore((state) => state.activeUserId)
  const now = useNow()
  const ticketsQuery = useTicketsQuery({})
  const usersQuery = useUsersQuery()

  if (ticketsQuery.isLoading || usersQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    )
  }

  const tickets = ticketsQuery.data ?? []
  const users = usersQuery.data ?? []
  const myQueue = tickets.filter((ticket) => ticket.assigneeId === userId)
  const atRisk = tickets.filter((ticket) => new Date(ticket.dueAt).getTime() - now < 60 * 60 * 1000)

  return (
    <div className="space-y-4">
      <section className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tickets abertos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{tickets.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SLA em risco</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-amber-200">{atRisk.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Backlog da area</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{tickets.filter((ticket) => ['New', 'InTriage'].includes(ticket.status)).length}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Minha fila</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {myQueue.length ? (
              myQueue.map((ticket) => (
                <div key={ticket.id} className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
                  <p className="text-sm font-semibold">{ticket.id}</p>
                  <p className="text-sm text-[var(--text-soft)]">{ticket.title}</p>
                  <SLAIndicator dueAt={ticket.dueAt} />
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--text-soft)]">Nenhum ticket na sua fila.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fila da area</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tickets.slice(0, 5).map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
                <p className="text-sm">{ticket.title}</p>
                <span className="text-xs text-[var(--text-soft)]">{ticket.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Kanban por funcionario</CardTitle>
        </CardHeader>
        <CardContent>
          <KanbanBoard tickets={tickets} users={users} />
        </CardContent>
      </Card>
    </div>
  )
}
