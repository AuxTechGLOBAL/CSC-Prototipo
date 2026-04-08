import { Badge } from '../../../components/ui/badge'
import type { Ticket, TicketEventType, User } from '../../../types/domain'
import { formatDate } from '../../../lib/utils'
import {
  MessageSquare,
  GitBranch,
  UserCheck,
  FileClock,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'
import { UserAvatar } from './user-avatar'

type TimelineEntry = {
  id: string
  createdAt: string
  actorId: string
  body: string
  kind: 'comment' | 'comment-internal' | 'status' | 'assignment' | 'approved' | 'rejected' | 'system'
  isInternal?: boolean
  attachments?: Array<{ id: string; name: string; sizeKb: number }>
}

function mapEventKind(type: TicketEventType, isInternal?: boolean): TimelineEntry['kind'] {
  if (type === 'commented') {
    return isInternal ? 'comment-internal' : 'comment'
  }
  if (type === 'status_changed' || type === 'closed' || type === 'reopened') {
    return 'status'
  }
  if (type === 'assigned') {
    return 'assignment'
  }
  if (type === 'approved') {
    return 'approved'
  }
  if (type === 'rejected') {
    return 'rejected'
  }
  return 'system'
}

function kindMeta(kind: TimelineEntry['kind']) {
  if (kind === 'comment') {
    return {
      icon: MessageSquare,
      badge: 'Comentário',
      variant: 'info' as const,
      border: 'border-sky-500/20 bg-sky-500/5',
      bgColor: 'bg-sky-500/10',
    }
  }
  if (kind === 'comment-internal') {
    return {
      icon: MessageSquare,
      badge: 'Comentário interno',
      variant: 'warning' as const,
      border: 'border-amber-500/20 bg-amber-500/5',
      bgColor: 'bg-amber-500/10',
    }
  }
  if (kind === 'status') {
    return {
      icon: GitBranch,
      badge: 'Mudança de status',
      variant: 'warning' as const,
      border: 'border-amber-500/20 bg-amber-500/5',
      bgColor: 'bg-amber-500/10',
    }
  }
  if (kind === 'assignment') {
    return {
      icon: UserCheck,
      badge: 'Atribuição',
      variant: 'success' as const,
      border: 'border-emerald-500/20 bg-emerald-500/5',
      bgColor: 'bg-emerald-500/10',
    }
  }
  if (kind === 'approved') {
    return {
      icon: ThumbsUp,
      badge: 'Aprovado',
      variant: 'success' as const,
      border: 'border-emerald-500/30 bg-emerald-500/5',
      bgColor: 'bg-emerald-500/15',
    }
  }
  if (kind === 'rejected') {
    return {
      icon: ThumbsDown,
      badge: 'Rejeitado',
      variant: 'danger' as const,
      border: 'border-rose-500/30 bg-rose-500/5',
      bgColor: 'bg-rose-500/15',
    }
  }
  return {
    icon: FileClock,
    badge: 'Sistema',
    variant: 'neutral' as const,
    border: 'border-[var(--border-subtle)] bg-[var(--surface-1)]',
    bgColor: 'bg-[var(--surface-2)]',
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
        kind: mapEventKind(event.type, false),
        isInternal: false,
      })),
    ...ticket.comments.map((comment) => ({
      id: comment.id,
      actorId: comment.authorId,
      createdAt: comment.createdAt,
      body: comment.body,
      kind: mapEventKind('commented', comment.isInternal),
      isInternal: comment.isInternal,
      attachments: comment.attachments?.map((attachment) => ({
        id: attachment.id,
        name: attachment.name,
        sizeKb: attachment.sizeKb,
      })),
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const now = Date.now()

  const relativeTime = (iso: string) => {
    const minutes = Math.max(1, Math.floor((now - new Date(iso).getTime()) / 60_000))
    if (minutes < 60) return `ha ${minutes} min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `ha ${hours} h`
    const days = Math.floor(hours / 24)
    return `ha ${days} d`
  }

  return (
    <ol className="space-y-3">
      {entries.map((entry) => {
        const actor = users.find((user) => user.id === entry.actorId)
        const meta = kindMeta(entry.kind)
        const Icon = meta.icon

        return (
          <li key={entry.id} className={`rounded-lg border-2 p-4 transition-colors ${meta.border}`}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className={`rounded-lg p-2 ${meta.bgColor}`}>
                  <Icon size={16} className="text-[var(--text-soft)]" />
                </div>
                <Badge variant={meta.variant} className="font-semibold">
                  {meta.badge}
                </Badge>
                {entry.isInternal && <Badge variant="warning">Interno</Badge>}
              </div>
              <div className="flex items-center gap-2">
                <UserAvatar user={actor} dense />
                {actor && (
                  <div className="text-xs">
                    <p className="font-semibold text-[var(--text-strong)]">{actor.name}</p>
                    <p className="text-[var(--text-soft)]">{actor.role}</p>
                  </div>
                )}
              </div>
            </div>
            <p className="mb-2 text-sm text-[var(--text-strong)]">{entry.body}</p>
            {!!entry.attachments?.length && (
              <ul className="mb-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-1)] p-3 text-xs text-[var(--text-soft)]">
                {entry.attachments.map((attachment) => (
                  <li key={attachment.id} className="flex items-center gap-2">
                    <span className="truncate">{attachment.name}</span>
                    <span className="shrink-0">{attachment.sizeKb} KB</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center justify-between text-xs text-[var(--text-soft)]">
              <span>{actor?.name ?? entry.actorId}</span>
              <span>
                {relativeTime(entry.createdAt)} • {formatDate(entry.createdAt)}
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
