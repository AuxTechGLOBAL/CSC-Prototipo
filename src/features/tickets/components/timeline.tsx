import type { Ticket, User } from '../../../types/domain'
import { formatDate } from '../../../lib/utils'

export function Timeline({ ticket, users }: { ticket: Ticket; users: User[] }) {
  return (
    <ol className="space-y-3">
      {ticket.events.map((event) => {
        const actor = users.find((user) => user.id === event.authorId)

        return (
          <li key={event.id} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3">
            <p className="text-xs uppercase tracking-wide text-[var(--text-soft)]">{event.type}</p>
            <p className="mt-1 text-sm text-[var(--text-strong)]">{event.message}</p>
            <div className="mt-2 flex items-center justify-between text-xs text-[var(--text-soft)]">
              <span>{actor?.name ?? event.authorId}</span>
              <span>{formatDate(event.createdAt)}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
