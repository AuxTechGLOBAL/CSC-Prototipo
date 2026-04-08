import { AlertCircle, FileX, Inbox, Search } from 'lucide-react'

interface EmptyStateProps {
  icon?: 'empty' | 'search' | 'inbox' | 'error'
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

const iconMap = {
  empty: FileX,
  search: Search,
  inbox: Inbox,
  error: AlertCircle,
}

export function EmptyState({ icon = 'empty', title, description, action }: EmptyStateProps) {
  const Icon = iconMap[icon]

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface-2)] p-8 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--surface-3)]">
        <Icon size={24} className="text-[var(--text-soft)]" />
      </div>
      <h3 className="mb-2 text-sm font-semibold text-[var(--text-strong)]">{title}</h3>
      {description && (
        <p className="mb-4 max-w-xs text-xs text-[var(--text-soft)]">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="rounded-md bg-[var(--brand-500)] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[var(--brand-600)]"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
