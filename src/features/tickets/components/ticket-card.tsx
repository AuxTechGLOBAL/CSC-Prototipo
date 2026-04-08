import { Link } from 'react-router-dom'
import type { Ticket, User } from '../../../types/domain'
import { Card, CardContent } from '../../../components/ui/card'
import { StatusBadge } from './status-badge'
import { PriorityBadge } from './priority-badge'
import { SLAIndicator } from './sla-indicator'
import { UserAvatar } from './user-avatar'

export function TicketCard({ ticket, users }: { ticket: Ticket; users: User[] }) {
  const assignee = users.find((user) => user.id === ticket.assigneeId)

  return (
    <Link to={`/tickets/${ticket.id}`}>
      <Card className="hover:border-[var(--brand-500)]/40 hover:bg-[var(--surface-2)]">
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-soft)]">{ticket.id}</span>
            <StatusBadge status={ticket.status} />
          </div>
          <p className="line-clamp-2 text-sm font-medium text-[var(--text-strong)]">{ticket.title}</p>
          <div className="flex items-center justify-between">
            <PriorityBadge priority={ticket.priority} />
            <SLAIndicator dueAt={ticket.dueAt} />
          </div>
          <UserAvatar user={assignee} dense />
        </CardContent>
      </Card>
    </Link>
  )
}
