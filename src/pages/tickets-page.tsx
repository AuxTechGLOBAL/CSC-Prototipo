import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Table, TBody, TD, TH, THead } from '../components/ui/table'
import { useTicketsQuery, useUsersQuery } from '../hooks/use-csc-data'
import type { TicketFilters } from '../types/domain'
import { StatusBadge } from '../features/tickets/components/status-badge'
import { PriorityBadge } from '../features/tickets/components/priority-badge'
import { SLAIndicator } from '../features/tickets/components/sla-indicator'
import { useAppStore } from '../store/app-store'
import { useNow } from '../hooks/use-now'

export function TicketsPage() {
  const [filters, setFilters] = useState<TicketFilters>({})
  const [quickFilter, setQuickFilter] = useState<'all' | 'mine' | 'unassigned' | 'overdue'>('all')
  const role = useAppStore((state) => state.activeRole)
  const activeUserId = useAppStore((state) => state.activeUserId)
  const now = useNow()
  const isRequester = role === 'Requester'

  const ticketsQuery = useTicketsQuery(filters)
  const usersQuery = useUsersQuery()

  const filteredTickets = useMemo(() => {
    const list = ticketsQuery.data ?? []

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
  }, [ticketsQuery.data, quickFilter, isRequester, activeUserId, now])

  const userOptions = useMemo(() => {
    return [{ label: 'Todos', value: '' }, ...(usersQuery.data ?? []).map((user) => ({ label: user.name, value: user.id }))]
  }, [usersQuery.data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tickets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={quickFilter === 'all' ? 'default' : 'secondary'} onClick={() => setQuickFilter('all')}>
            Todos
          </Button>
          <Button size="sm" variant={quickFilter === 'mine' ? 'default' : 'secondary'} onClick={() => setQuickFilter('mine')}>
            Meus tickets
          </Button>
          <Button
            size="sm"
            variant={quickFilter === 'unassigned' ? 'default' : 'secondary'}
            onClick={() => setQuickFilter('unassigned')}
          >
            Nao atribuidos
          </Button>
          <Button size="sm" variant={quickFilter === 'overdue' ? 'default' : 'secondary'} onClick={() => setQuickFilter('overdue')}>
            Em atraso
          </Button>
        </div>

        <div className={`grid gap-2 ${isRequester ? 'md:grid-cols-3' : 'md:grid-cols-5'}`}>
          <Input
            placeholder="Buscar por ID ou titulo"
            value={filters.query ?? ''}
            onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
          />
          <Select
            placeholder="Status"
            value={filters.status ?? ''}
            options={[
              { label: 'Todos', value: '' },
              { label: 'New', value: 'New' },
              { label: 'InTriage', value: 'InTriage' },
              { label: 'AwaitingApproval', value: 'AwaitingApproval' },
              { label: 'Assigned', value: 'Assigned' },
              { label: 'InProgress', value: 'InProgress' },
              { label: 'WaitingRequester', value: 'WaitingRequester' },
              { label: 'Resolved', value: 'Resolved' },
              { label: 'Closed', value: 'Closed' },
              { label: 'Cancelled', value: 'Cancelled' },
            ]}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: (event.target.value || undefined) as TicketFilters['status'] }))}
          />
          <Select
            placeholder="Prioridade"
            value={filters.priority ?? ''}
            options={[
              { label: 'Todas', value: '' },
              { label: 'Low', value: 'Low' },
              { label: 'Medium', value: 'Medium' },
              { label: 'High', value: 'High' },
            ]}
            onChange={(event) => setFilters((prev) => ({ ...prev, priority: (event.target.value || undefined) as TicketFilters['priority'] }))}
          />
          {!isRequester && (
            <>
              <Select
                placeholder="Area"
                value={filters.area ?? ''}
                options={[
                  { label: 'Todas', value: '' },
                  { label: 'Financeiro', value: 'Financeiro' },
                  { label: 'TI Operacoes', value: 'TI Operacoes' },
                  { label: 'RH', value: 'RH' },
                ]}
                onChange={(event) => setFilters((prev) => ({ ...prev, area: event.target.value || undefined }))}
              />
              <Select
                placeholder="Atendente"
                value={filters.assigneeId ?? ''}
                options={userOptions}
                onChange={(event) => setFilters((prev) => ({ ...prev, assigneeId: event.target.value || undefined }))}
              />
            </>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <TH>ID</TH>
                <TH>Titulo</TH>
                <TH>Status</TH>
                <TH>Prioridade</TH>
                <TH>Area</TH>
                <TH>Atendente</TH>
                <TH>SLA</TH>
              </tr>
            </THead>
            <TBody>
              {filteredTickets.map((ticket) => {
                const assignee = usersQuery.data?.find((user) => user.id === ticket.assigneeId)

                return (
                  <tr key={ticket.id}>
                    <TD>
                      <Link className="font-semibold text-cyan-200 hover:underline" to={`/tickets/${ticket.id}`}>
                        {ticket.id}
                      </Link>
                    </TD>
                    <TD>{ticket.title}</TD>
                    <TD>
                      <StatusBadge status={ticket.status} />
                    </TD>
                    <TD>
                      <PriorityBadge priority={ticket.priority} />
                    </TD>
                    <TD>{ticket.area}</TD>
                    <TD>{assignee?.name ?? 'Nao atribuido'}</TD>
                    <TD>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 ${
                          new Date(ticket.dueAt).getTime() < now
                            ? 'bg-rose-500/15 text-rose-200'
                            : new Date(ticket.dueAt).getTime() - now <= 1000 * 60 * 120
                              ? 'bg-amber-500/15 text-amber-200'
                              : 'bg-emerald-500/15 text-emerald-200'
                        }`}
                      >
                        <SLAIndicator dueAt={ticket.dueAt} />
                      </span>
                    </TD>
                  </tr>
                )
              })}
            </TBody>
          </Table>
        </div>

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
              <Link to="/tickets/new" className="text-cyan-200 hover:underline">
                Criar novo ticket
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
