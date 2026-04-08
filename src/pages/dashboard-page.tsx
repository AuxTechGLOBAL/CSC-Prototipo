import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'
import { EmptyState } from '../components/empty-state'
import { useTicketsQuery, useUsersQuery } from '../hooks/use-csc-data'
import { useAppStore } from '../store/app-store'
import { KanbanBoard } from '../features/dashboard/kanban-board'
import { SLAIndicator } from '../features/tickets/components/sla-indicator'
import { useNow } from '../hooks/use-now'
import { getStatusLabelPt } from '../lib/workflow'
import type { Priority, TicketStatus } from '../types/domain'

export function DashboardPage() {
  const role = useAppStore((state) => state.activeRole)
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
  const focusTickets = role === 'Agent' ? tickets.filter((ticket) => ticket.assigneeId === userId) : tickets
  const users = usersQuery.data ?? []
  const myQueue = focusTickets.filter((ticket) => ticket.assigneeId === userId)
  const atRisk = focusTickets.filter((ticket) => new Date(ticket.dueAt).getTime() - now < 60 * 60 * 1000)
  const overdue = focusTickets.filter((ticket) => new Date(ticket.dueAt).getTime() < now && !['Closed', 'Cancelled'].includes(ticket.status))
  const inProgress = focusTickets.filter((ticket) => ['Assigned', 'InProgress', 'InTriage'].includes(ticket.status))
  const closedToday = focusTickets.filter((ticket) => {
    if (!['Closed', 'Resolved'].includes(ticket.status)) return false
    const updated = new Date(ticket.updatedAt)
    const dayStart = new Date()
    dayStart.setHours(0, 0, 0, 0)
    return updated.getTime() >= dayStart.getTime()
  })
  const closedTickets = focusTickets.filter((ticket) => ticket.status === 'Closed')
  const closedInSla = closedTickets.filter((ticket) => new Date(ticket.updatedAt).getTime() <= new Date(ticket.dueAt).getTime())
  const slaCompliance = closedTickets.length
    ? Math.round((closedInSla.length / closedTickets.length) * 100)
    : 100

  const dailyVolume = Array.from({ length: 7 }).map((_, index) => {
    const day = new Date()
    day.setHours(0, 0, 0, 0)
    day.setDate(day.getDate() - (6 - index))
    const nextDay = new Date(day)
    nextDay.setDate(nextDay.getDate() + 1)

    const count = focusTickets.filter((ticket) => {
      const created = new Date(ticket.createdAt).getTime()
      return created >= day.getTime() && created < nextDay.getTime()
    }).length

    return {
      label: `${day.getDate()}/${day.getMonth() + 1}`,
      count,
    }
  })

  const maxDaily = Math.max(...dailyVolume.map((item) => item.count), 1)

  const statusKeys: TicketStatus[] = [
    'New',
    'InTriage',
    'AwaitingApproval',
    'Assigned',
    'InProgress',
    'WaitingRequester',
    'Resolved',
    'Closed',
    'Cancelled',
  ]

  const statusDistribution: Array<{ key: TicketStatus; value: number }> = statusKeys.map((status) => ({
    key: status,
    value: focusTickets.filter((ticket) => ticket.status === status).length,
  }))

  const priorityKeys: Priority[] = ['High', 'Medium', 'Low']

  const priorityDistribution: Array<{ key: Priority; value: number }> = priorityKeys.map((priority) => ({
    key: priority,
    value: focusTickets.filter((ticket) => ticket.priority === priority).length,
  }))

  const maxStatus = Math.max(...statusDistribution.map((item) => item.value), 1)
  const maxPriority = Math.max(...priorityDistribution.map((item) => item.value), 1)

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text-soft)]">
        <p className="font-semibold text-[var(--text-strong)]">Visao atual: {role === 'Agent' ? 'Meus tickets' : 'Visao da area'}</p>
        <p>{role === 'Agent' ? 'Dados focados na sua fila pessoal.' : 'Indicadores consolidados para acompanhamento operacional.'}</p>
      </div>

      <section className="grid gap-3 md:grid-cols-4">
        <Link to="/tickets?view=all">
          <button className="w-full text-left transition-colors hover:bg-[var(--surface-2)]">
            <Card className="cursor-pointer h-full">
              <CardHeader>
                <CardTitle>Tickets abertos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{focusTickets.length}</p>
              </CardContent>
            </Card>
          </button>
        </Link>
        <Link to="/tickets?status=Assigned,InProgress,InTriage">
          <button className="w-full text-left transition-colors hover:bg-[var(--surface-2)]">
            <Card className="cursor-pointer h-full">
              <CardHeader>
                <CardTitle>Em andamento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-[var(--brand-700)]">{inProgress.length}</p>
              </CardContent>
            </Card>
          </button>
        </Link>
        <Link to="/tickets?quick=overdue">
          <button className="w-full text-left transition-colors hover:bg-[var(--surface-2)]">
            <Card className="cursor-pointer h-full">
              <CardHeader>
                <CardTitle>Em atraso</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold text-rose-500">{overdue.length}</p>
              </CardContent>
            </Card>
          </button>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Resolvidos hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-emerald-600">{closedToday.length}</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Volume por dia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dailyVolume.map((item) => (
              <div key={item.label} className="grid grid-cols-[56px_1fr_40px] items-center gap-2">
                <span className="text-xs text-[var(--text-soft)]">{item.label}</span>
                <div className="h-2 rounded-full bg-[var(--surface-3)]">
                  <div
                    className="h-full rounded-full bg-[var(--brand-500)]"
                    style={{ width: `${Math.round((item.count / maxDaily) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-[var(--text-soft)]">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SLA compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-emerald-600">{slaCompliance}%</p>
            <p className="mt-1 text-sm text-[var(--text-soft)]">Considera tickets fechados dentro do prazo de SLA.</p>
            <p className="mt-2 text-xs text-[var(--text-soft)]">SLA em risco agora: {atRisk.length}</p>
          </CardContent>
        </Card>

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
              <EmptyState
                icon="inbox"
                title="Fila limpa"
                description="Você não tem nenhum ticket atribuído no momento."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fila da area</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {focusTickets.slice(0, 5).map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
                <p className="text-sm">{ticket.title}</p>
                <span className="text-xs text-[var(--text-soft)]">{ticket.status}</span>
              </div>
            ))}
            {!focusTickets.length && (
              <EmptyState
                icon="empty"
                title="Sem backlog na área"
                description="Nenhum ticket em andamento para exibir."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuicao por status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {statusDistribution.map((item) => (
              <div key={item.key} className="grid grid-cols-[140px_1fr_40px] items-center gap-2">
                <span className="text-xs text-[var(--text-soft)]">{getStatusLabelPt(item.key)}</span>
                <div className="h-2 rounded-full bg-[var(--surface-3)]">
                  <div
                    className="h-full rounded-full bg-[var(--brand-500)]"
                    style={{ width: `${Math.round((item.value / maxStatus) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-[var(--text-soft)]">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuicao por prioridade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {priorityDistribution.map((item) => (
              <div key={item.key} className="grid grid-cols-[90px_1fr_40px] items-center gap-2">
                <span className="text-xs text-[var(--text-soft)]">{item.key}</span>
                <div className="h-2 rounded-full bg-[var(--surface-3)]">
                  <div
                    className={item.key === 'High' ? 'h-full rounded-full bg-rose-500' : item.key === 'Medium' ? 'h-full rounded-full bg-amber-500' : 'h-full rounded-full bg-emerald-500'}
                    style={{ width: `${Math.round((item.value / maxPriority) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-[var(--text-soft)]">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Kanban por status</CardTitle>
        </CardHeader>
        <CardContent>
          <KanbanBoard tickets={focusTickets} users={users} />
        </CardContent>
      </Card>
    </div>
  )
}
