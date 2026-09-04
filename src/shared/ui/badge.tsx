import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap [&_svg]:shrink-0',
  {
    variants: {
      tone: {
        neutral: 'border-border bg-surface-sunken text-fg-secondary',
        brand: 'border-brand/25 bg-brand/8 text-brand-fg',
        info: 'border-info/25 bg-info-tint text-info-fg',
        success: 'border-success/25 bg-success-tint text-success-fg',
        warning: 'border-warning/30 bg-warning-tint text-warning-fg',
        danger: 'border-danger/25 bg-danger-tint text-danger-fg',
        outline: 'border-border-strong bg-transparent text-fg-secondary',
      },
      size: {
        sm: 'px-2 py-0.5 text-2xs [&_svg]:size-3',
        md: 'px-2.5 py-1 text-xs [&_svg]:size-3.5',
      },
    },
    defaultVariants: { tone: 'neutral', size: 'sm' },
  },
)

export interface BadgeProps extends ComponentProps<'span'>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />
}
