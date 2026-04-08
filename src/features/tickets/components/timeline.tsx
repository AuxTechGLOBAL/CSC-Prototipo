import { Badge } from '../../../components/ui/badge'
import type { Ticket, TicketEventType, User } from '../../../types/domain'
import { formatDate } from '../../../lib/utils'
import { MessageSquare, GitBranch, UserCheck, FileClock } from 'lucide-react'

type TimelineEntry = {
  id: string
  createdAt: string
  actorId: string
  body: string
  kind: 'comment' | 'status' | 'assignment' | 'system'
  isInternal?: boolean
  attachments?: Array<{ id: string; name: string; sizeKb: number }>
}

function mapEventKind(type: TicketEventType): TimelineEntry['kind'] {
  if (type === 'status_changed' || type === 'closed' || type === 'reopened') {
    return 'status'
  }
  if (type === 'assigned') {
    return 'assignment'
  }
  if (type === 'commented') {
    return 'comment'
  }
  return 'system'
}

function kindMeta(kind: TimelineEntry['kind']) {
  if (kind === 'comment') {
    return {
      icon: MessageSquare,
      badge: 'Comentario',
      variant: 'info' as const,
      border: 'border-sky-700/25',
    }
  }
  if (kind === 'status') {
    return {
      icon: GitBranch,
      badge: 'Status',
      variant: 'warning' as const,
      border: 'border-amber-700/25',
    }
  }
  if (kind === 'assignment') {
    return {
      icon: UserCheck,
      badge: 'Atribuicao',
      variant: 'success' as const,
      border: 'border-emerald-700/25',
    }
  }
  return {
    icon: FileClock,
    badge: 'Sistema',
    variant: 'neutral' as const,
    border: 'border-[var(--border-subtle)]',
  }
}

export function Timeline({ ticket, users }: { ticket: Ticket; users: User[] }) {
  const entries: TimelineEntry[] = [
    ...ticket.events
      .filter((event) => event.type !== 'commented')
      .map((event) => ({
      id: event.id,
      actorId: event.authorId,
      createdAt: event.createdAt,
      body: event.message,
      kind: mapEventKind(event.type),
      isInternal: false,
      })),
    ...ticket.comments.map((comment) => ({
      id: comment.id,
      actorId: comment.authorId,
      createdAt: comment.createdAt,
      body: comment.body,
      kind: 'comment' as const,
      isInternal: comment.isInternal,
      attachments: comment.attachments?.map((attachment) => ({
        id: attachment.id,
        name: attachment.name,
        sizeKb: attachment.sizeKb,
      })),
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <ol className="space-y-3">
      {entries.map((entry) => {
        const actor = users.find((user) => user.id === entry.actorId)
        const meta = kindMeta(entry.kind)
        const Icon = meta.icon

        return (
          <li key={entry.id} className={`rounded-lg border bg-[var(--surface-2)] p-3 ${meta.border}`}>
            <div className="mb-2 flex items-center gap-2">
              <Icon size={14} className="text-[var(--text-soft)]" />
              <Badge variant={meta.variant}>{meta.badge}</Badge>
              {entry.isInternal && <Badge variant="warning">Interno</Badge>}
            </div>
            <p className="text-sm text-[var(--text-strong)]">{entry.body}</p>
            {!!entry.attachments?.length && (
              <ul className="mt-2 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-1)] p-2 text-xs text-[var(--text-soft)]">
                {entry.attachments.map((attachment) => (
                  <li key={attachment.id}>
                    {attachment.name} ({attachment.sizeKb} KB)
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-2 flex items-center justify-between text-xs text-[var(--text-soft)]">
              <span>{actor?.name ?? entry.actorId}</span>
              <span>{formatDate(entry.createdAt)}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
