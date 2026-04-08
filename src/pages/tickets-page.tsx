import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Table, TBody, TD, TH, THead } from '../components/ui/table'
import { useAssignTicketMutation, useChangeStatusMutation, useTicketsQuery, useUsersQuery } from '../hooks/use-csc-data'
import type { Priority, Ticket, TicketStatus } from '../types/domain'
import { StatusBadge } from '../features/tickets/components/status-badge'
import { PriorityBadge } from '../features/tickets/components/priority-badge'
import { SLAIndicator } from '../features/tickets/components/sla-indicator'
import { UserAvatar } from '../features/tickets/components/user-avatar'
import { useAppStore } from '../store/app-store'
import { useNow } from '../hooks/use-now'
import { getAllowedTransitions, getTransitionActionLabel, getStatusLabelPt } from '../lib/workflow'
import { formatDate } from '../lib/utils'
import { KanbanBoard } from '../features/dashboard/kanban-board'

type QuickFilter = 'all' | 'mine' | 'unassigned' | 'overdue'
type ViewMode = 'table' | 'kanban'
type PeriodFilter = 'all' | '24h' | '7d' | '30d'

interface TicketsFilterState {
  query: string
  statuses: TicketStatus[]
  priorities: Priority[]
  areas: string[]
  assigneeId?: string
  period: PeriodFilter
}

const QUICK_FILTER_STORAGE_KEY = 'csc.tickets.quick-filter'
const FILTERS_STORAGE_KEY = 'csc.tickets.filters'
const VIEW_MODE_STORAGE_KEY = 'csc.tickets.view-mode'

const statusOptions: TicketStatus[] = [
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

const priorityOptions: Priority[] = ['High', 'Medium', 'Low']

const defaultFilters: TicketsFilterState = {
  query: '',
  statuses: [],
  priorities: [],
  areas: [],
  assigneeId: undefined,
  period: 'all',
}

function getRelativeTimeLabel(iso: string, now: number) {
  const deltaMs = now - new Date(iso).getTime()
  const minutes = Math.max(1, Math.floor(deltaMs / 60_000))

  if (minutes < 60) return `ha ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `ha ${hours} h`

  const days = Math.floor(hours / 24)
  return `ha ${days} d`
}

function loadStoredFilters(): TicketsFilterState {
  if (typeof window === 'undefined') return defaultFilters

  try {
    const raw = window.localStorage.getItem(FILTERS_STORAGE_KEY)
    if (!raw) return defaultFilters
    const parsed = JSON.parse(raw) as Partial<TicketsFilterState>

    return {
      query: typeof parsed.query === 'string' ? parsed.query : '',
      statuses: Array.isArray(parsed.statuses) ? parsed.statuses.filter((item): item is TicketStatus => statusOptions.includes(item as TicketStatus)) : [],
      priorities: Array.isArray(parsed.priorities)
        ? parsed.priorities.filter((item): item is Priority => priorityOptions.includes(item as Priority))
        : [],
      areas: Array.isArray(parsed.areas) ? parsed.areas.filter((item): item is string => typeof item === 'string') : [],
      assigneeId: typeof parsed.assigneeId === 'string' && parsed.assigneeId ? parsed.assigneeId : undefined,
      period: parsed.period === '24h' || parsed.period === '7d' || parsed.period === '30d' ? parsed.period : 'all',
    }
  } catch {
    return defaultFilters
  }
}

function loadStoredQuickFilter(): QuickFilter {
  if (typeof window === 'undefined') return 'all'
  const value = window.localStorage.getItem(QUICK_FILTER_STORAGE_KEY)
  return value === 'mine' || value === 'unassigned' || value === 'overdue' ? value : 'all'
}

function loadStoredViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'table'
  return window.localStorage.getItem(VIEW_MODE_STORAGE_KEY) === 'kanban' ? 'kanban' : 'table'
}

function toggleItem<T extends string>(list: T[], value: T) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function TicketsPage() {
  const [filters, setFilters] = useState<TicketsFilterState>(() => loadStoredFilters())
  const [quickFilter, setQuickFilter] = useState<QuickFilter>(() => loadStoredQuickFilter())
  const [viewMode, setViewMode] = useState<ViewMode>(() => loadStoredViewMode())
  const [previewTicketId, setPreviewTicketId] = useState<string | null>(null)
  const role = useAppStore((state) => state.activeRole)
  const activeUserId = useAppStore((state) => state.activeUserId)
  const now = useNow()
  const isRequester = role === 'Requester'

  const ticketsQuery = useTicketsQuery({ query: filters.query || undefined })
  const usersQuery = useUsersQuery()
  const assignMutation = useAssignTicketMutation()
  const statusMutation = useChangeStatusMutation()

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters))
  }, [filters])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(QUICK_FILTER_STORAGE_KEY, quickFilter)
  }, [quickFilter])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode)
  }, [viewMode])

  const areaOptions = useMemo(() => {
    const set = new Set((ticketsQuery.data ?? []).map((ticket) => ticket.area))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [ticketsQuery.data])

  const filteredTickets = useMemo(() => {
    let list = ticketsQuery.data ?? []

    if (filters.statuses.length) {
      list = list.filter((ticket) => filters.statuses.includes(ticket.status))
    }

    if (filters.priorities.length) {
      list = list.filter((ticket) => filters.priorities.includes(ticket.priority))
    }

    if (filters.areas.length) {
      list = list.filter((ticket) => filters.areas.includes(ticket.area))
    }

    if (filters.assigneeId) {
      list = list.filter((ticket) => ticket.assigneeId === filters.assigneeId)
    }

    if (filters.period !== 'all') {
      const windowMs =
        filters.period === '24h' ? 24 * 60 * 60 * 1000 : filters.period === '7d' ? 7 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000
      list = list.filter((ticket) => now - new Date(ticket.updatedAt).getTime() <= windowMs)
    }

    if (quickFilter === 'mine') {
      if (isRequester) {
        return list.filter((ticket) => ticket.requesterId === activeUserId)
      }
      return list.filter((ticket) => ticket.assigneeId === activeUserId)
    }

    if (quickFilter === 'unassigned') {
      return list.filter((ticket) => !ticket.assigneeId)
    }

    if (quickFilter === 'overdue') {
      return list.filter((ticket) => {
        const isFinalStatus = ticket.status === 'Closed' || ticket.status === 'Cancelled'
        return !isFinalStatus && new Date(ticket.dueAt).getTime() < now
      })
    }

    return list
  }, [ticketsQuery.data, quickFilter, isRequester, activeUserId, now, filters])

  const userOptions = useMemo(() => {
    return [{ label: 'Todos', value: '' }, ...(usersQuery.data ?? []).map((user) => ({ label: user.name, value: user.id }))]
  }, [usersQuery.data])

  const previewTicket = useMemo(() => {
    if (!previewTicketId) return null
    return (ticketsQuery.data ?? []).find((ticket) => ticket.id === previewTicketId) ?? null
  }, [previewTicketId, ticketsQuery.data])

  const executeAssignToMe = async (ticket: Ticket) => {
    if (role === 'Requester') return

    try {
      await assignMutation.mutateAsync({ ticketId: ticket.id, assigneeId: activeUserId })
      toast.success(`Ticket ${ticket.id} atribuido para voce`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao atribuir ticket')
    }
  }

  const executeNextStatus = async (ticket: Ticket) => {
    const allowed = getAllowedTransitions(ticket.status, role)
    const nextStatus = allowed[0]
    if (!nextStatus) {
      toast.error('Nenhuma mudanca de status permitida para este ticket')
      return
    }

    try {
      await statusMutation.mutateAsync({ ticketId: ticket.id, status: nextStatus })
      toast.success(`Ticket ${ticket.id}: ${getTransitionActionLabel(ticket.status, nextStatus)}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao atualizar status')
    }
  }

  const resetFilters = () => {
    setFilters(defaultFilters)
    setQuickFilter('all')
  }

  return (
    <>
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Tickets</CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant={viewMode === 'table' ? 'default' : 'secondary'} onClick={() => setViewMode('table')}>
                Tabela
              </Button>
              <Button size="sm" variant={viewMode === 'kanban' ? 'default' : 'secondary'} onClick={() => setViewMode('kanban')}>
                Kanban
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={quickFilter === 'all' ? 'default' : 'secondary'} onClick={() => setQuickFilter('all')}>
              Todos
            </Button>
            <Button size="sm" variant={quickFilter === 'mine' ? 'default' : 'secondary'} onClick={() => setQuickFilter('mine')}>
              Meus
            </Button>
            <Button
              size="sm"
              variant={quickFilter === 'unassigned' ? 'default' : 'secondary'}
              onClick={() => setQuickFilter('unassigned')}
            >
              Sem dono
            </Button>
            <Button size="sm" variant={quickFilter === 'overdue' ? 'default' : 'secondary'} onClick={() => setQuickFilter('overdue')}>
              Em atraso
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className={`grid gap-2 ${isRequester ? 'md:grid-cols-2' : 'md:grid-cols-4'}`}>
            <Input
              placeholder="Buscar por ID ou titulo"
              value={filters.query}
              onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
            />
            <Select
              placeholder="Periodo"
              value={filters.period}
              options={[
                { label: 'Periodo: todos', value: 'all' },
                { label: 'Ultimas 24h', value: '24h' },
                { label: 'Ultimos 7 dias', value: '7d' },
                { label: 'Ultimos 30 dias', value: '30d' },
              ]}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  period: (event.target.value as PeriodFilter) || 'all',
                }))
              }
            />
            {!isRequester && (
              <Select
                placeholder="Atendente"
                value={filters.assigneeId ?? ''}
                options={userOptions}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    assigneeId: event.target.value || undefined,
                  }))
                }
              />
            )}
            <Button size="sm" variant="secondary" onClick={resetFilters}>
              Limpar filtros
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">Status (multi-filtro)</p>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={filters.statuses.includes(status) ? 'default' : 'secondary'}
                  onClick={() => setFilters((prev) => ({ ...prev, statuses: toggleItem(prev.statuses, status) }))}
                >
                  {getStatusLabelPt(status)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">Prioridade (multi-filtro)</p>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map((priority) => (
                <Button
                  key={priority}
                  size="sm"
                  variant={filters.priorities.includes(priority) ? 'default' : 'secondary'}
                  onClick={() => setFilters((prev) => ({ ...prev, priorities: toggleItem(prev.priorities, priority) }))}
                >
                  {priority}
                </Button>
              ))}
            </div>
          </div>

          {!isRequester && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">Area (multi-filtro)</p>
              <div className="flex flex-wrap gap-2">
                {areaOptions.map((area) => (
                  <Button
                    key={area}
                    size="sm"
                    variant={filters.areas.includes(area) ? 'default' : 'secondary'}
                    onClick={() => setFilters((prev) => ({ ...prev, areas: toggleItem(prev.areas, area) }))}
                  >
                    {area}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'table' && (
            <div className="overflow-x-auto">
              <Table>
                <THead>
                  <tr>
                    <TH>ID / Titulo</TH>
                    <TH>Status</TH>
                    <TH>Prioridade</TH>
                    <TH>Area</TH>
                    <TH>Atendente</TH>
                    <TH>SLA</TH>
                    <TH>Atualizado</TH>
                    <TH className="text-right">Acoes</TH>
                  </tr>
                </THead>
                <TBody>
                  {filteredTickets.map((ticket) => {
                    const assignee = usersQuery.data?.find((user) => user.id === ticket.assigneeId)
                    const dueDelta = new Date(ticket.dueAt).getTime() - now

                    return (
                      <tr key={ticket.id} className="group transition-colors hover:bg-[var(--surface-2)]">
                        <TD>
                          <div className="space-y-1">
                            <Link className="text-sm font-semibold text-[var(--brand-700)] hover:underline" to={`/tickets/${ticket.id}`}>
                              {ticket.id}
                            </Link>
                            <p className="line-clamp-1 text-sm text-[var(--text-strong)]">{ticket.title}</p>
                          </div>
                        </TD>
                        <TD>
                          <StatusBadge status={ticket.status} />
                        </TD>
                        <TD>
                          <PriorityBadge priority={ticket.priority} />
                        </TD>
                        <TD>{ticket.area}</TD>
                        <TD>
                          <UserAvatar user={assignee} dense />
                        </TD>
                        <TD>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 ${
                              dueDelta < 0
                                ? 'bg-rose-500/15 text-rose-200'
                                : dueDelta <= 1000 * 60 * 120
                                  ? 'bg-amber-500/15 text-amber-200'
                                  : 'bg-emerald-500/15 text-emerald-200'
                            }`}
                          >
                            <SLAIndicator dueAt={ticket.dueAt} />
                          </span>
                        </TD>
                        <TD>
                          <div className="space-y-1 text-xs text-[var(--text-soft)]">
                            <p>{getRelativeTimeLabel(ticket.updatedAt, now)}</p>
                            <p>{formatDate(ticket.updatedAt)}</p>
                          </div>
                        </TD>
                        <TD className="text-right">
                          <div className="inline-flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            {!isRequester && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => executeAssignToMe(ticket)}
                                disabled={assignMutation.isPending}
                              >
                                Atribuir para mim
                              </Button>
                            )}
                            {!isRequester && (
                              <Button size="sm" variant="secondary" onClick={() => executeNextStatus(ticket)} disabled={statusMutation.isPending}>
                                Mudar status
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => setPreviewTicketId(ticket.id)}>
                              Preview
                            </Button>
                          </div>
                        </TD>
                      </tr>
                    )
                  })}
                </TBody>
              </Table>
            </div>
          )}

          {viewMode === 'kanban' && <KanbanBoard tickets={filteredTickets} users={usersQuery.data ?? []} />}

          {!filteredTickets.length && (
            <div className="rounded-md border border-dashed border-[var(--border-subtle)] bg-[var(--surface-2)] p-4 text-sm text-[var(--text-soft)]">
              <p className="font-medium text-[var(--text-strong)]">Nenhum ticket encontrado</p>
              <p className="mt-1">
                {quickFilter === 'mine' &&
                  (isRequester ? 'Voce ainda nao abriu tickets.' : 'Voce nao tem tickets atribuidos no momento.')}
                {quickFilter === 'unassigned' && 'Nenhum ticket nao atribuido encontrado.'}
                {quickFilter === 'overdue' && 'Nenhum ticket em atraso encontrado.'}
                {quickFilter === 'all' && 'Ajuste os filtros ou crie um novo ticket para iniciar o fluxo.'}
              </p>
              <div className="mt-3">
                <Link to="/tickets/new" className="text-[var(--brand-700)] hover:underline">
                  Criar novo ticket
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {previewTicket && (
        <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setPreviewTicketId(null)}>
          <aside
            className="absolute right-0 top-0 h-full w-full max-w-md border-l border-[var(--border-subtle)] bg-[var(--surface-1)] p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-[var(--text-soft)]">{previewTicket.id}</p>
                <h3 className="text-lg font-semibold text-[var(--text-strong)]">{previewTicket.title}</h3>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setPreviewTicketId(null)}>
                Fechar
              </Button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={previewTicket.status} />
                <PriorityBadge priority={previewTicket.priority} />
              </div>
              <p className="text-[var(--text-soft)]">{previewTicket.description}</p>
              <p>
                <span className="text-[var(--text-soft)]">Area:</span> {previewTicket.area}
              </p>
              <p>
                <span className="text-[var(--text-soft)]">Atualizado:</span> {getRelativeTimeLabel(previewTicket.updatedAt, now)}
              </p>
              <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
                <SLAIndicator dueAt={previewTicket.dueAt} startedAt={previewTicket.createdAt} showBar />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {!isRequester && (
                <Button size="sm" variant="secondary" onClick={() => executeAssignToMe(previewTicket)} disabled={assignMutation.isPending}>
                  Atribuir para mim
                </Button>
              )}
              {!isRequester && (
                <Button size="sm" variant="secondary" onClick={() => executeNextStatus(previewTicket)} disabled={statusMutation.isPending}>
                  Mudar status
                </Button>
              )}
              <Link to={`/tickets/${previewTicket.id}`}>
                <Button size="sm">Abrir ticket</Button>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
