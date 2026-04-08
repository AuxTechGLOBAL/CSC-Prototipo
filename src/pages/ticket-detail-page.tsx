import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { ConfirmActionDialog } from '../components/confirm-action-dialog'
import { Dialog } from '../components/ui/dialog'
import { Select } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import { useAddCommentMutation, useAssignTicketMutation, useChangeStatusMutation, useKbQuery, useServicesQuery, useTicketQuery, useUsersQuery } from '../hooks/use-csc-data'
import { useAppStore } from '../store/app-store'
import { describeTransitionPt, getAllowedTransitions, getTransitionActionLabel } from '../lib/workflow'
import { StatusBadge } from '../features/tickets/components/status-badge'
import { PriorityBadge } from '../features/tickets/components/priority-badge'
import { SLAIndicator } from '../features/tickets/components/sla-indicator'
import { Timeline } from '../features/tickets/components/timeline'
import { CommentBox } from '../features/tickets/components/comment-box'
import { UserAvatar } from '../features/tickets/components/user-avatar'
import type { TicketStatus } from '../types/domain'
import { Badge } from '../components/ui/badge'
import { formatDate } from '../lib/utils'
import { useNow } from '../hooks/use-now'

function getPrimaryContextAction(status: TicketStatus) {
  if (status === 'New') return 'InTriage' as const
  if (status === 'Assigned') return 'InProgress' as const
  if (status === 'InProgress') return 'Resolved' as const
  return null
}

export function TicketDetailPage() {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const role = useAppStore((state) => state.activeRole)
  const activeUserId = useAppStore((state) => state.activeUserId)
  const now = useNow()

  const ticketQuery = useTicketQuery(ticketId)
  const ticket = ticketQuery.data
  const usersQuery = useUsersQuery()
  const servicesQuery = useServicesQuery()
  const kbQuery = useKbQuery(ticket?.serviceId ?? '')
  const assignMutation = useAssignTicketMutation()
  const statusMutation = useChangeStatusMutation()
  const commentMutation = useAddCommentMutation()
  const [assigneeId, setAssigneeId] = useState('')
  const [pendingStatus, setPendingStatus] = useState<TicketStatus | null>(null)
  const [closeReason, setCloseReason] = useState('')
  const [solutionSummary, setSolutionSummary] = useState('')

  const users = usersQuery.data ?? []
  const activeUser = users.find((user) => user.id === activeUserId)
  const ticketService = servicesQuery.data?.find((service) => service.id === ticket?.serviceId)

  const ticketType = useMemo(() => {
    const subject = `${ticket?.title ?? ''} ${ticketService?.name ?? ''}`.toLowerCase()
    if (subject.includes('acesso') || subject.includes('novo') || subject.includes('solic')) {
      return 'Requisicao'
    }
    return 'Incidente'
  }, [ticket?.title, ticketService?.name])

  const relatedArticles = useMemo(() => {
    if (!ticket) return []
    return (kbQuery.data ?? []).filter((article) => !article.serviceId || article.serviceId === ticket.serviceId).slice(0, 4)
  }, [kbQuery.data, ticket])

  const isRequesterForbidden =
    role === 'Requester' && ticket && ticket.requesterId !== activeUserId

  const allowedTransitions = useMemo(() => {
    if (!ticket) return []
    return getAllowedTransitions(ticket.status, role)
  }, [ticket, role])

  const primaryAction = ticket ? getPrimaryContextAction(ticket.status) : null
  const canRunPrimaryAction = primaryAction ? allowedTransitions.includes(primaryAction) : false

  if (ticketQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acesso restrito</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-[var(--text-soft)]">
            Voce nao possui permissao para visualizar este ticket com o perfil atual.
          </p>
          <Button size="sm" variant="secondary" onClick={() => navigate('/tickets')}>
            Voltar para tickets
          </Button>
        </CardContent>
      </Card>
    )
  }

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

  const assignToMe = async () => {
    try {
      await assignMutation.mutateAsync({ ticketId: ticket.id, assigneeId: activeUserId })
      toast.success('Ticket atribuido para voce')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao atribuir para voce')
    }
  }

  const moveToMyArea = async () => {
    const myAreaAgent = users.find(
      (user) =>
        user.area === activeUser?.area &&
        user.id !== activeUserId &&
        ['Agent', 'Supervisor', 'Admin'].includes(user.role),
    )

    if (!myAreaAgent) {
      toast.error('Nao foi encontrado atendente na sua area para mover o ticket')
      return
    }

    try {
      await assignMutation.mutateAsync({ ticketId: ticket.id, assigneeId: myAreaAgent.id })
      toast.success(`Ticket movido para a area ${myAreaAgent.area}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao mover para sua area')
    }
  }

  const resolveQuickly = async () => {
    if (!allowedTransitions.includes('Resolved')) {
      toast.error('A acao Resolver nao esta disponivel para o status atual')
      return
    }

    try {
      await statusMutation.mutateAsync({ ticketId: ticket.id, status: 'Resolved' })
      toast.success('Ticket resolvido')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao resolver ticket')
    }
  }

  const changeStatus = async (status: TicketStatus) => {
    if (status === 'Closed') {
      setCloseReason('')
      setSolutionSummary('')
    }
    setPendingStatus(status)
  }

  const confirmStatusChange = async () => {
    if (!pendingStatus) return

    if (pendingStatus === 'Closed' && (!closeReason.trim() || !solutionSummary.trim())) {
      toast.error('CloseReason e SolutionSummary sao obrigatorios para fechar o ticket')
      return
    }

    try {
      await statusMutation.mutateAsync({
        ticketId: ticket.id,
        status: pendingStatus,
        closeReason: pendingStatus === 'Closed' ? closeReason : undefined,
        solutionSummary: pendingStatus === 'Closed' ? solutionSummary : undefined,
      })
      toast.success(`Status atualizado: ${describeTransitionPt(ticket.status, pendingStatus)}`)
      setPendingStatus(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha na mudanca de status')
    }
  }

  return (
    <div className="space-y-4">
      <Card className="sticky top-3 z-20">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-[var(--text-soft)]">{ticket.id}</p>
            <p className="mb-1 text-xs text-[var(--text-soft)]">
              <Link className="hover:underline" to="/tickets">
                Tickets
              </Link>{' '}
              / {ticket.id}
            </p>
            <h1 className="text-xl font-semibold">{ticket.title}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <Badge variant="neutral">Tipo: {ticketType}</Badge>
            <Badge variant="neutral">Area: {ticket.area}</Badge>
            {ticket.firstResponseAt ? (
              <Badge variant="info">Primeira resposta: {formatDate(ticket.firstResponseAt)}</Badge>
            ) : (
              <Badge variant="warning">Primeira resposta pendente</Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canRunPrimaryAction && primaryAction && (
              <Button size="sm" onClick={() => changeStatus(primaryAction)}>
                {getTransitionActionLabel(ticket.status, primaryAction)}
              </Button>
            )}
            {allowedTransitions.map((next) => (
              next === primaryAction ? null :
              <Button key={next} size="sm" variant="secondary" onClick={() => changeStatus(next)}>
                {getTransitionActionLabel(ticket.status, next)}
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
              <CardTitle>Timeline (comentarios + historico)</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline ticket={ticket} users={users} />
            </CardContent>
          </Card>

          <Card className="sticky bottom-4">
            <CardHeader>
              <CardTitle>Novo comentario</CardTitle>
            </CardHeader>
            <CardContent>
              <CommentBox
                isSending={commentMutation.isPending}
                canMarkInternal={role !== 'Requester'}
                onSend={async (text, isInternal, attachments) => {
                  await commentMutation.mutateAsync({ ticketId: ticket.id, body: text, isInternal, attachments })
                  toast.success('Comentario registrado')
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" variant="secondary" onClick={assignToMe} disabled={assignMutation.isPending || role === 'Requester'}>
                Atribuir para mim
              </Button>
              <Button size="sm" variant="secondary" onClick={moveToMyArea} disabled={assignMutation.isPending || role === 'Requester'}>
                Mover para minha area
              </Button>
              <Button size="sm" onClick={resolveQuickly} disabled={statusMutation.isPending || role === 'Requester'}>
                Resolver
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Infos principais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {now - new Date(ticket.updatedAt).getTime() < 1000 * 60 * 2 && (
                <Badge variant="info">Atualizado agora</Badge>
              )}
              {ticket.status === 'AwaitingApproval' && <Badge variant="warning">Aguardando aprovacao</Badge>}
              <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
                <SLAIndicator dueAt={ticket.dueAt} startedAt={ticket.createdAt} showBar />
              </div>
              <p><span className="text-[var(--text-soft)]">Solicitante:</span> {users.find((u) => u.id === ticket.requesterId)?.name}</p>
              <p><span className="text-[var(--text-soft)]">Impactado:</span> {ticket.impactedUser}</p>
              <p><span className="text-[var(--text-soft)]">Area:</span> {ticket.area}</p>
              <p><span className="text-[var(--text-soft)]">Servico:</span> {ticketService?.name ?? ticket.serviceId}</p>
              <p><span className="text-[var(--text-soft)]">Criado em:</span> {formatDate(ticket.createdAt)}</p>
              <p><span className="text-[var(--text-soft)]">Atualizado em:</span> {formatDate(ticket.updatedAt)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atribuicao</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">Atendente atual</p>
                <UserAvatar user={users.find((user) => user.id === ticket.assigneeId)} />
              </div>
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

          <Card>
            <CardHeader>
              <CardTitle>Artigos relacionados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {relatedArticles.map((article) => (
                <div key={article.id} className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] p-2">
                  <p className="text-sm font-semibold text-[var(--text-strong)]">{article.title}</p>
                  <p className="text-xs text-[var(--text-soft)]">{article.tags.join(', ')}</p>
                </div>
              ))}
              {!relatedArticles.length && <p className="text-sm text-[var(--text-soft)]">Nenhum artigo relacionado para este servico.</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmActionDialog
        open={Boolean(pendingStatus) && pendingStatus !== 'Closed'}
        title="Confirmar alteracao de status"
        description={pendingStatus ? describeTransitionPt(ticket.status, pendingStatus) : ''}
        confirmLabel="Confirmar alteracao"
        isLoading={statusMutation.isPending}
        onCancel={() => setPendingStatus(null)}
        onConfirm={confirmStatusChange}
      />

      <Dialog
        open={pendingStatus === 'Closed'}
        onClose={() => setPendingStatus(null)}
        title="Fechamento obrigatorio"
      >
        <div className="space-y-3">
          <p className="text-sm text-[var(--text-soft)]">
            Para fechar o ticket, informe CloseReason e SolutionSummary.
          </p>
          <Textarea
            placeholder="CloseReason"
            value={closeReason}
            onChange={(event) => setCloseReason(event.target.value)}
          />
          <Textarea
            placeholder="SolutionSummary"
            value={solutionSummary}
            onChange={(event) => setSolutionSummary(event.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setPendingStatus(null)} disabled={statusMutation.isPending}>
              Cancelar
            </Button>
            <Button onClick={confirmStatusChange} disabled={statusMutation.isPending}>
              {statusMutation.isPending ? 'Processando...' : 'Confirmar fechamento'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
