import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { ConfirmActionDialog } from '../../components/confirm-action-dialog'
import { TicketCard } from '../tickets/components/ticket-card'
import { useAppStore } from '../../store/app-store'
import { useChangeStatusMutation } from '../../hooks/use-csc-data'
import { toast } from 'sonner'
import type { Ticket, TicketStatus, User } from '../../types/domain'
import { getAllowedTransitions, getStatusLabelPt } from '../../lib/workflow'

export function KanbanBoard({ tickets, users }: { tickets: Ticket[]; users: User[] }) {
  const role = useAppStore((state) => state.activeRole)
  const statusMutation = useChangeStatusMutation()
  const [dragTicketId, setDragTicketId] = useState<string | null>(null)
  const [pendingMove, setPendingMove] = useState<{
    ticketId: string
    fromStatus: TicketStatus
    toStatus: TicketStatus
  } | null>(null)

  const canMoveBetweenColumns = role !== 'Requester'

  const statusColumns: Array<{ key: TicketStatus; label: string }> = [
    { key: 'New', label: 'New' },
    { key: 'InTriage', label: 'InTriage' },
    { key: 'Assigned', label: 'Assigned' },
    { key: 'InProgress', label: 'InProgress' },
    { key: 'WaitingRequester', label: 'Waiting' },
    { key: 'Resolved', label: 'Resolved' },
  ]

  const grouped = useMemo(() => {
    const map: Record<TicketStatus, Ticket[]> = {
      New: [],
      InTriage: [],
      AwaitingApproval: [],
      Assigned: [],
      InProgress: [],
      WaitingRequester: [],
      Resolved: [],
      Closed: [],
      Cancelled: [],
    }

    tickets.forEach((ticket) => {
      map[ticket.status].push(ticket)
    })

    return map
  }, [tickets])

  const moveTicket = async (sourceTicketId: string, targetStatus: TicketStatus) => {
    if (!canMoveBetweenColumns) {
      toast.error('Seu perfil nao pode mover tickets no Kanban.')
      return
    }

    const ticket = tickets.find((item) => item.id === sourceTicketId)
    if (!ticket) return
    if (ticket.status === targetStatus) return

    const allowed = getAllowedTransitions(ticket.status, role)
    if (!allowed.includes(targetStatus)) {
      toast.error(`Transicao invalida para ${getStatusLabelPt(targetStatus)} no perfil atual.`)
      return
    }

    setPendingMove({
      ticketId: ticket.id,
      fromStatus: ticket.status,
      toStatus: targetStatus,
    })
  }

  const confirmMove = async () => {
    if (!pendingMove) return

    try {
      await statusMutation.mutateAsync({
        ticketId: pendingMove.ticketId,
        status: pendingMove.toStatus,
      })
      toast.success(
        `Ticket ${pendingMove.ticketId} movido de ${getStatusLabelPt(pendingMove.fromStatus)} para ${getStatusLabelPt(
          pendingMove.toStatus,
        )}.`,
      )
      setPendingMove(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao mover ticket')
    }
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {statusColumns.map((column) => (
        <Card
          key={column.key}
          className="min-h-[240px] w-72 shrink-0"
          onDragOver={(event) => event.preventDefault()}
          onDrop={async () => {
            if (!dragTicketId) return
            await moveTicket(dragTicketId, column.key)
            setDragTicketId(null)
          }}
        >
          <CardHeader>
            <CardTitle>{column.label}</CardTitle>
            <span className="text-xs text-[var(--text-soft)]">{grouped[column.key]?.length ?? 0}</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(grouped[column.key] ?? []).map((ticket) => (
                <div key={ticket.id} draggable={canMoveBetweenColumns} onDragStart={() => setDragTicketId(ticket.id)}>
                  <TicketCard ticket={ticket} users={users} />
                </div>
              ))}
              {!grouped[column.key]?.length && (
                <div className="rounded-md border border-dashed border-[var(--border-subtle)] bg-[var(--surface-2)] p-2">
                  <p className="text-xs text-[var(--text-soft)]">Sem tickets nesta coluna</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <ConfirmActionDialog
        open={Boolean(pendingMove)}
        title="Confirmar mudanca de coluna"
        description={
          pendingMove
            ? `Mover ticket ${pendingMove.ticketId} de ${getStatusLabelPt(pendingMove.fromStatus)} para ${getStatusLabelPt(
                pendingMove.toStatus,
              )}.`
            : ''
        }
        confirmLabel="Confirmar mudanca"
        isLoading={statusMutation.isPending}
        onCancel={() => setPendingMove(null)}
        onConfirm={confirmMove}
      />
    </div>
  )
}
