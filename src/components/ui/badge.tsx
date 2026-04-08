import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide', {
  variants: {
    variant: {
      neutral: 'border-[var(--border-subtle)] bg-[var(--surface-3)] text-[var(--text-soft)]',
      success: 'border-emerald-700/30 bg-emerald-500/15 text-emerald-200',
      warning: 'border-amber-700/30 bg-amber-500/15 text-amber-200',
      danger: 'border-rose-700/30 bg-rose-500/15 text-rose-200',
      info: 'border-sky-700/30 bg-sky-500/15 text-sky-200',
    },
  },
  defaultVariants: {
    variant: 'neutral',
  },
})

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
