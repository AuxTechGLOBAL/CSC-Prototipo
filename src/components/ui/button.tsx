import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-canvas)]',
  {
    variants: {
      variant: {
        default: 'bg-[linear-gradient(135deg,var(--brand-600),var(--brand-700))] text-white shadow-[0_10px_20px_rgba(37,99,235,0.22)] hover:-translate-y-0.5 hover:shadow-[0_14px_26px_rgba(37,99,235,0.28)] focus-visible:ring-[var(--brand-500)]',
        secondary: 'border border-[var(--border-subtle)] bg-[var(--surface-2)] text-[var(--text-strong)] shadow-[0_8px_18px_rgba(0,0,0,0.12)] hover:border-[var(--border-subtle)] hover:bg-[var(--surface-3)] focus-visible:ring-[var(--brand-500)]',
        ghost: 'text-[var(--text-soft)] hover:bg-[var(--surface-2)] hover:text-[var(--text-strong)] focus-visible:ring-[var(--brand-500)]',
        destructive: 'bg-[linear-gradient(135deg,var(--danger-600),var(--danger-700))] text-white shadow-[0_10px_20px_rgba(220,38,38,0.22)] hover:-translate-y-0.5 hover:shadow-[0_14px_26px_rgba(220,38,38,0.28)] focus-visible:ring-[var(--danger-500)]',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4',
        lg: 'h-10 px-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)

Button.displayName = 'Button'
