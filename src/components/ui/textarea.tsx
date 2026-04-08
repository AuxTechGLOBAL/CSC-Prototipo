import * as React from 'react'
import { cn } from '../../lib/utils'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'min-h-24 w-full rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] p-3 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)]',
          className,
        )}
        {...props}
      />
    )
  },
)

Textarea.displayName = 'Textarea'
