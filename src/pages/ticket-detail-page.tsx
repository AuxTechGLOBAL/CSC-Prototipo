import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { ConfirmActionDialog } from '../components/confirm-action-dialog'
import { Select } from '../components/ui/select'
import { useAddCommentMutation, useAssignTicketMutation, useChangeStatusMutation, useTicketQuery, useUsersQuery } from '../hooks/use-csc-data'
import { useAppStore } from '../store/app-store'
import { describeTransitionPt, getAllowedTransitions, getStatusLabelPt } from '../lib/workflow'
import { StatusBadge } from '../features/tickets/components/status-badge'
import { PriorityBadge } from '../features/tickets/components/priority-badge'
import { SLAIndicator } from '../features/tickets/components/sla-indicator'
import { Timeline } from '../features/tickets/components/timeline'
import { CommentBox } from '../features/tickets/components/comment-box'
import type { TicketStatus } from '../types/domain'

export function TicketDetailPage() {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const role = useAppStore((state) => state.activeRole)
  const activeUserId = useAppStore((state) => state.activeUserId)

  const ticketQuery = useTicketQuery(ticketId)
  const usersQuery = useUsersQuery()
  const assignMutation = useAssignTicketMutation()
  const statusMutation = useChangeStatusMutation()
  const commentMutation = useAddCommentMutation()
  const [assigneeId, setAssigneeId] = useState('')
  const [pendingStatus, setPendingStatus] = useState<TicketStatus | null>(null)

  const ticket = ticketQuery.data
  const users = usersQuery.data ?? []

  const isRequesterForbidden =
    role === 'Requester' && ticket && ticket.requesterId !== activeUserId

  const allowedTransitions = useMemo(() => {
    if (!ticket) return []
    return getAllowedTransitions(ticket.status, role)
  }, [ticket, role])

  if (!ticket) {
    return <p className="text-sm text-[var(--text-soft)]">Carregando ticket...</p>
  }

  if (isRequesterForbidden) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acesso restrito</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-[var(--text-soft)]">Como solicitante, voce pode visualizar apenas os seus proprios tickets.</p>
          <Button size="sm" variant="secondary" onClick={() => navigate('/tickets')}>
            Voltar para meus tickets
          </Button>
        </CardContent>
      </Card>
    )
  }

  const assign = async () => {
    if (!assigneeId) return
    try {
      await assignMutation.mutateAsync({ ticketId: ticket.id, assigneeId })
      toast.success('Ticket atribuido com sucesso')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha na atribuicao')
    }
  }

  const changeStatus = async (status: TicketStatus) => {
    setPendingStatus(status)
  }

  const confirmStatusChange = async () => {
    if (!pendingStatus) return
    try {
      await statusMutation.mutateAsync({ ticketId: ticket.id, status: pendingStatus })
      toast.success(`Status atualizado: ${describeTransitionPt(ticket.status, pendingStatus)}`)
      setPendingStatus(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha na mudanca de status')
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--text-soft)]">{ticket.id}</p>
            <h1 className="text-xl font-semibold">{ticket.title}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <SLAIndicator dueAt={ticket.dueAt} />
          </div>

          <div className="flex items-center gap-2">
            {allowedTransitions.map((next) => (
              <Button key={next} size="sm" variant="secondary" onClick={() => changeStatus(next)}>
                {getStatusLabelPt(next)}
              </Button>
            ))}
            <Button size="sm" variant="ghost" onClick={() => navigate('/tickets')}>
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline ticket={ticket} users={users} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comentarios</CardTitle>
            </CardHeader>
            <CardContent>
              <CommentBox
                isSending={commentMutation.isPending}
                onSend={async (text) => {
                  await commentMutation.mutateAsync({ ticketId: ticket.id, body: text })
                  toast.success('Comentario registrado')
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informacoes do ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="text-[var(--text-soft)]">Solicitante:</span> {users.find((u) => u.id === ticket.requesterId)?.name}</p>
              <p><span className="text-[var(--text-soft)]">Impactado:</span> {ticket.impactedUser}</p>
              <p><span className="text-[var(--text-soft)]">Area:</span> {ticket.area}</p>
              <p><span className="text-[var(--text-soft)]">Servico:</span> {ticket.serviceId}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atribuicao</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Select
                value={assigneeId}
                placeholder="Selecionar atendente"
                options={users.filter((user) => ['Agent', 'Supervisor', 'Admin'].includes(user.role)).map((user) => ({
                  label: `${user.name} (${user.role})`,
                  value: user.id,
                }))}
                onChange={(event) => setAssigneeId(event.target.value)}
              />
              <Button onClick={assign} disabled={!assigneeId || assignMutation.isPending}>
                Atribuir
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Anexos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ticket.attachments.map((attachment) => (
                <div key={attachment.id} className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] p-2 text-sm">
                  {attachment.name} ({attachment.sizeKb} KB)
                </div>
              ))}
              {!ticket.attachments.length && <p className="text-sm text-[var(--text-soft)]">Sem anexos.</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmActionDialog
        open={Boolean(pendingStatus)}
        title="Confirmar alteracao de status"
        description={pendingStatus ? describeTransitionPt(ticket.status, pendingStatus) : ''}
        confirmLabel="Confirmar alteracao"
        isLoading={statusMutation.isPending}
        onCancel={() => setPendingStatus(null)}
        onConfirm={confirmStatusChange}
      />
    </div>
  )
}
