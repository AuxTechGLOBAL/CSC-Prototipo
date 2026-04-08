import type { User } from '../../../types/domain'
import { getInitials } from '../../../lib/utils'

export function UserAvatar({ user, dense = false }: { user?: User; dense?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className={`grid place-items-center rounded-full bg-[var(--surface-3)] text-[10px] font-semibold text-[var(--text-soft)] ${dense ? 'h-6 w-6' : 'h-8 w-8'}`}>
        {user ? getInitials(user.name) : '--'}
      </span>
      <span className="text-xs text-[var(--text-soft)]">{user?.name ?? 'Nao atribuido'}</span>
    </div>
  )
}
