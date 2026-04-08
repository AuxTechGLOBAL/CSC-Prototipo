import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { ConfirmActionDialog } from '../components/confirm-action-dialog'
import { Dialog } from '../components/ui/dialog'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { useApprovalMutation, useTicketsQuery, useUsersQuery } from '../hooks/use-csc-data'
import { useAppStore } from '../store/app-store'
import { describeTransitionPt } from '../lib/workflow'

export function ApprovalsPage() {
  const ticketsQuery = useTicketsQuery({ status: 'AwaitingApproval' })
  const usersQuery = useUsersQuery()
  const currentUserId = useAppStore((state) => state.activeUserId)
  const approvalMutation = useApprovalMutation()

  const [activeTicketId, setActiveTicketId] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [pendingDecision, setPendingDecision] = useState<{ approve: boolean } | null>(null)

  const ticket = useMemo(() => {
    return ticketsQuery.data?.find((item) => item.id === activeTicketId)
  }, [ticketsQuery.data, activeTicketId])

  const submit = async (approve: boolean) => {
    setPendingDecision({ approve })
  }

  const confirmDecision = async () => {
    if (!ticket) return
    if (!pendingDecision) return

    try {
      await approvalMutation.mutateAsync({
        ticketId: ticket.id,
        approve: pendingDecision.approve,
        comment,
        actorId: currentUserId,
      })
      toast.success(pendingDecision.approve ? 'Ticket aprovado' : 'Ticket rejeitado')
      setComment('')
      setActiveTicketId(null)
      setPendingDecision(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha na aprovacao')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aprovacoes Pendentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {(ticketsQuery.data ?? []).map((item) => {
          const requester = usersQuery.data?.find((user) => user.id === item.requesterId)
          return (
            <button
              key={item.id}
              className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3 text-left hover:border-cyan-500/40"
              onClick={() => setActiveTicketId(item.id)}
            >
              <p className="text-xs text-[var(--text-soft)]">{item.id}</p>
              <p className="font-semibold text-[var(--text-strong)]">{item.title}</p>
              <p className="text-xs text-[var(--text-soft)]">Solicitante: {requester?.name ?? '-'}</p>
            </button>
          )
        })}

        {!ticketsQuery.data?.length && <p className="text-sm text-[var(--text-soft)]">Nenhuma aprovacao pendente.</p>}
      </CardContent>

      <Dialog open={Boolean(ticket)} onClose={() => setActiveTicketId(null)} title={`Decisao de aprovacao - ${ticket?.id ?? ''}`}>
        <div className="space-y-3">
          <Input value={ticket?.title ?? ''} readOnly />
          <Textarea placeholder="Comentario obrigatorio" value={comment} onChange={(event) => setComment(event.target.value)} />
          <div className="flex gap-2">
            <Button onClick={() => submit(true)} disabled={approvalMutation.isPending || !comment.trim()}>
              Aprovar
            </Button>
            <Button variant="destructive" onClick={() => submit(false)} disabled={approvalMutation.isPending || !comment.trim()}>
              Rejeitar
            </Button>
          </div>
        </div>
      </Dialog>

      <ConfirmActionDialog
        open={Boolean(pendingDecision)}
        title="Confirmar alteracao de status"
        description={
          pendingDecision
            ? describeTransitionPt('AwaitingApproval', pendingDecision.approve ? 'Assigned' : 'Cancelled')
            : ''
        }
        confirmLabel="Confirmar decisao"
        isLoading={approvalMutation.isPending}
        onCancel={() => setPendingDecision(null)}
        onConfirm={confirmDecision}
      />
    </Card>
  )
}
