import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * Surface container. Light mode elevates with shadow, dark mode with
 * lightness — `surface-raised` sharing a value with `surface` in light mode
 * is intentional, not a missing token.
 */
export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-surface-raised shadow-sm',
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
