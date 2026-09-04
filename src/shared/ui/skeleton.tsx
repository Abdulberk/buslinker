import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * Loading placeholder. Always give it the same box as the content it stands
 * in for — a skeleton that is the wrong height causes the layout shift it was
 * supposed to prevent.
 */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-surface-sunken', className)}
      aria-hidden="true"
      {...props}
    />
  )
}
