import { cn, formatSlaDistance } from '../../../lib/utils'
import { useNow } from '../../../hooks/use-now'

interface SLAIndicatorProps {
  dueAt: string
  startedAt?: string
  showBar?: boolean
}

export function SLAIndicator({ dueAt, startedAt, showBar }: SLAIndicatorProps) {
  const now = useNow()
  const delta = new Date(dueAt).getTime() - now

  if (!showBar) {
    return (
      <span
        className={cn('text-xs font-semibold uppercase tracking-wide', {
          'text-emerald-300': delta > 1000 * 60 * 120,
          'text-amber-300': delta <= 1000 * 60 * 120 && delta > 0,
          'text-rose-300': delta <= 0,
        })}
        title={new Date(dueAt).toLocaleString('pt-BR')}
      >
        {formatSlaDistance(dueAt)}
      </span>
    )
  }

  const start = new Date(startedAt ?? dueAt).getTime()
  const due = new Date(dueAt).getTime()
  const total = Math.max(due - start, 1)
  const elapsed = Math.max(now - start, 0)
  const ratio = Math.min(Math.max(elapsed / total, 0), 1)
  const barClass =
    delta <= 0
      ? 'bg-rose-500'
      : delta <= 1000 * 60 * 120
        ? 'bg-amber-500'
        : 'bg-emerald-500'

  return (
    <div className="min-w-[180px] space-y-1" title={new Date(dueAt).toLocaleString('pt-BR')}>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-3)]">
        <div className={`h-full transition-all ${barClass}`} style={{ width: `${Math.round(ratio * 100)}%` }} />
      </div>
      <span
        className={cn('text-xs font-semibold uppercase tracking-wide', {
          'text-emerald-300': delta > 1000 * 60 * 120,
          'text-amber-300': delta <= 1000 * 60 * 120 && delta > 0,
          'text-rose-300': delta <= 0,
        })}
      >
        {formatSlaDistance(dueAt)}
      </span>
    </div>
  )
}
