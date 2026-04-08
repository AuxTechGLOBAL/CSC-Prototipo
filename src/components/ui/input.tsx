import * as React from 'react'
import { cn } from '../../lib/utils'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'h-9 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-soft)] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)]',
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
