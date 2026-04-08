import { cn, formatSlaDistance } from '../../../lib/utils'
import { useNow } from '../../../hooks/use-now'

export function SLAIndicator({ dueAt }: { dueAt: string }) {
  const now = useNow()
  const delta = new Date(dueAt).getTime() - now

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
