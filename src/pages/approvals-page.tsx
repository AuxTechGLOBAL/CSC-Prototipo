import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { ConfirmActionDialog } from '../components/confirm-action-dialog'
import { Dialog } from '../components/ui/dialog'
import { Textarea } from '../components/ui/textarea'
import { useApprovalMutation, useTicketsQuery, useUsersQuery } from '../hooks/use-csc-data'
import { useAppStore } from '../store/app-store'
import { describeTransitionPt } from '../lib/workflow'
import { formatDate } from '../lib/utils'

export function ApprovalsPage() {
  const ticketsQuery = useTicketsQuery({ status: 'AwaitingApproval' })
  const usersQuery = useUsersQuery()
  const currentUserId = useAppStore((state) => state.activeUserId)
  const approvalMutation = useApprovalMutation()

  const [activeTicketId, setActiveTicketId] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [pendingDecision, setPendingDecision] = useState<{ approve: boolean } | null>(null)
  const [rejectionTicketId, setRejectionTicketId] = useState<string | null>(null)

  const ticket = useMemo(() => {
    return ticketsQuery.data?.find((item) => item.id === activeTicketId)
  }, [ticketsQuery.data, activeTicketId])

  const submit = async (ticketId: string, approve: boolean) => {
    setActiveTicketId(ticketId)
    if (!approve) {
      setRejectionTicketId(ticketId)
      return
    }
    setComment('Aprovado para execucao.')
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
      setRejectionTicketId(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha na aprovacao')
    }
  }

  const waitingLabel = (createdAt: string) => {
    const minutes = Math.max(1, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000))
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} h`
    return `${Math.floor(hours / 24)} d`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aprovacoes Pendentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {(ticketsQuery.data ?? []).map((item) => {
          const requester = usersQuery.data?.find((user) => user.id === item.requesterId)
          return (
            <div
              key={item.id}
              className="w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3 text-left"
            >
              <p className="text-xs text-[var(--text-soft)]">{item.id}</p>
              <p className="font-semibold text-[var(--text-strong)]">{item.title}</p>
              <div className="mt-1 grid gap-1 text-xs text-[var(--text-soft)] md:grid-cols-2">
                <p>Solicitante: {requester?.name ?? '-'}</p>
                <p>Aguardando ha: {waitingLabel(item.createdAt)}</p>
                <p>Area: {item.area}</p>
                <p>Criado em: {formatDate(item.createdAt)}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => submit(item.id, true)} disabled={approvalMutation.isPending}>
                  Aprovar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => submit(item.id, false)} disabled={approvalMutation.isPending}>
                  Rejeitar
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setActiveTicketId(item.id)}>
                  Ver resumo
                </Button>
                <Link to={`/tickets/${item.id}`}>
                  <Button size="sm" variant="ghost">Abrir ticket</Button>
                </Link>
              </div>
            </div>
          )
        })}

        {!ticketsQuery.data?.length && <p className="text-sm text-[var(--text-soft)]">Nenhuma aprovacao pendente.</p>}
      </CardContent>

      <Dialog open={Boolean(ticket)} onClose={() => setActiveTicketId(null)} title={`Resumo do ticket - ${ticket?.id ?? ''}`}>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[var(--text-strong)]">{ticket?.title}</p>
          <p className="text-sm text-[var(--text-soft)]">{ticket?.description}</p>
          <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3 text-xs text-[var(--text-soft)]">
            <p>Solicitante: {usersQuery.data?.find((user) => user.id === ticket?.requesterId)?.name ?? '-'}</p>
            <p>Area: {ticket?.area ?? '-'}</p>
            <p>Criado em: {ticket?.createdAt ? formatDate(ticket.createdAt) : '-'}</p>
          </div>
        </div>
      </Dialog>

      <Dialog open={Boolean(rejectionTicketId)} onClose={() => setRejectionTicketId(null)} title="Motivo da rejeicao (obrigatorio)">
        <div className="space-y-3">
          <Textarea placeholder="Explique o motivo da rejeicao" value={comment} onChange={(event) => setComment(event.target.value)} />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setRejectionTicketId(null)} disabled={approvalMutation.isPending}>
              Cancelar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (!comment.trim()) {
                  toast.error('Comentario obrigatorio para rejeitar')
                  return
                }
                setPendingDecision({ approve: false })
              }}
              disabled={approvalMutation.isPending}
            >
              Confirmar rejeicao
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
