import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface DialogProps {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
}

export function Dialog({ open, title, children, onClose }: DialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-1)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
          <h3 className="text-sm font-semibold text-[var(--text-strong)]">{title}</h3>
          <button className={cn('rounded-md px-2 py-1 text-xs text-[var(--text-soft)] hover:bg-[var(--surface-3)]')} onClick={onClose}>
            Fechar
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
