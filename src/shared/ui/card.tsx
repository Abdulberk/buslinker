import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * Surface container. Light mode elevates with shadow, dark mode with
 * lightness — `surface-raised` sharing a value with `surface` in light mode
 * is intentional, not a missing token.
 *
 * In dark mode a shadow does not read against a near-black ground, so the
 * card also carries a faint inner hairline: the lit edge that tells a raised
 * panel from the page around it when the fills are only a step apart.
 */
export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface-raised shadow-sm',
        'dark:ring-1 dark:ring-fg/6 dark:ring-inset',
        'transition-shadow duration-(--duration-base)',
        className,
      )}
      {...props}
    />
  )
}

export function CardBody({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('p-4 sm:p-6', className)} {...props} />
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex items-start justify-between gap-4 p-4 pb-0 sm:p-6 sm:pb-0', className)}
      {...props}
    />
  )
}
