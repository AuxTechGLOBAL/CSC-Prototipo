import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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

export function TicketsPage() {
  const [filters, setFilters] = useState<TicketFilters>({})
  const role = useAppStore((state) => state.activeRole)
  const activeUserId = useAppStore((state) => state.activeUserId)
  const isRequester = role === 'Requester'

  const effectiveFilters = isRequester
    ? {
        ...filters,
        requesterId: activeUserId,
      }
    : filters

  const ticketsQuery = useTicketsQuery(effectiveFilters)
  const usersQuery = useUsersQuery()

  const userOptions = useMemo(() => {
    return [{ label: 'Todos', value: '' }, ...(usersQuery.data ?? []).map((user) => ({ label: user.name, value: user.id }))]
  }, [usersQuery.data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tickets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
              {(ticketsQuery.data ?? []).map((ticket) => {
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
                      <SLAIndicator dueAt={ticket.dueAt} />
                    </TD>
                  </tr>
                )
              })}
            </TBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
