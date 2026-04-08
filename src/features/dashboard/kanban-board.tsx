import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { ConfirmActionDialog } from '../../components/confirm-action-dialog'
import { TicketCard } from '../tickets/components/ticket-card'
import { useAppStore } from '../../store/app-store'
import { useAssignTicketMutation } from '../../hooks/use-csc-data'
import { toast } from 'sonner'
import type { Ticket, User } from '../../types/domain'

export function KanbanBoard({ tickets, users }: { tickets: Ticket[]; users: User[] }) {
  const role = useAppStore((state) => state.activeRole)
  const assignTicket = useAssignTicketMutation()
  const [dragTicketId, setDragTicketId] = useState<string | null>(null)
  const [pendingMove, setPendingMove] = useState<{ ticketId: string; fromUserId?: string; toUserId?: string } | null>(null)

  const canMoveBetweenQueues = role === 'Supervisor' || role === 'Admin'

  const assigneeColumns = useMemo(() => {
    return users.filter((user) => user.role === 'Agent' || user.role === 'Supervisor' || user.role === 'Admin')
  }, [users])

  const grouped = useMemo(() => {
    const map: Record<string, Ticket[]> = {}

    map.unassigned = tickets.filter((ticket) => !ticket.assigneeId)

    assigneeColumns.forEach((user) => {
      map[user.id] = tickets.filter((ticket) => ticket.assigneeId === user.id)
    })

    return map
  }, [tickets, assigneeColumns])

  const moveTicket = async (sourceTicketId: string, targetUserId?: string) => {
    if (!canMoveBetweenQueues) {
      toast.error('Somente Supervisor ou Admin pode mover tickets entre filas de funcionarios.')
      return
    }

    const ticket = tickets.find((item) => item.id === sourceTicketId)
    if (!ticket) return
    if (ticket.assigneeId === targetUserId) return

    if (!targetUserId) {
      toast.error('Este prototipo permite mover entre filas de funcionarios atribuidos.')
      return
    }

    setPendingMove({
      ticketId: ticket.id,
      fromUserId: ticket.assigneeId,
      toUserId: targetUserId,
    })
  }

  const confirmMove = async () => {
    if (!pendingMove) return
    if (!pendingMove.toUserId) return

    const targetUser = users.find((user) => user.id === pendingMove.toUserId)

    try {
      await assignTicket.mutateAsync({ ticketId: pendingMove.ticketId, assigneeId: pendingMove.toUserId })
      toast.success(`Ticket ${pendingMove.ticketId} movido para a fila de ${targetUser?.name ?? pendingMove.toUserId}.`)
      setPendingMove(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao mover ticket')
    }
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      <Card className="min-h-[240px] w-72 shrink-0">
        <CardHeader>
          <CardTitle>Sem responsavel</CardTitle>
          <span className="text-xs text-[var(--text-soft)]">{grouped.unassigned?.length ?? 0}</span>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(grouped.unassigned ?? []).map((ticket) => (
              <div key={ticket.id} draggable={canMoveBetweenQueues} onDragStart={() => setDragTicketId(ticket.id)}>
                <TicketCard ticket={ticket} users={users} />
              </div>
            ))}
            {!grouped.unassigned?.length && <p className="text-xs text-[var(--text-soft)]">Sem tickets</p>}
          </div>
        </CardContent>
      </Card>

      {assigneeColumns.map((assignee) => (
        <Card
          key={assignee.id}
          className="min-h-[240px] w-72 shrink-0"
          onDragOver={(event) => event.preventDefault()}
          onDrop={async () => {
            if (!dragTicketId) return
            await moveTicket(dragTicketId, assignee.id)
            setDragTicketId(null)
          }}
        >
          <CardHeader>
            <CardTitle>{assignee.name}</CardTitle>
            <span className="text-xs text-[var(--text-soft)]">{grouped[assignee.id]?.length ?? 0}</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(grouped[assignee.id] ?? []).map((ticket) => (
                <div key={ticket.id} draggable={canMoveBetweenQueues} onDragStart={() => setDragTicketId(ticket.id)}>
                  <TicketCard ticket={ticket} users={users} />
                </div>
              ))}
              {!grouped[assignee.id]?.length && <p className="text-xs text-[var(--text-soft)]">Sem tickets</p>}
            </div>
          </CardContent>
        </Card>
      ))}

      <ConfirmActionDialog
        open={Boolean(pendingMove)}
        title="Confirmar mudanca de fila"
        description={
          pendingMove
            ? `Mover ticket ${pendingMove.ticketId} para a fila de ${users.find((user) => user.id === pendingMove.toUserId)?.name ?? ''}.`
            : ''
        }
        confirmLabel="Confirmar mudanca"
        isLoading={assignTicket.isPending}
        onCancel={() => setPendingMove(null)}
        onConfirm={confirmMove}
      />
    </div>
  )
}
