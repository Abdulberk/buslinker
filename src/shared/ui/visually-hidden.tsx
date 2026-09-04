import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'

/** Visible to screen readers only. Stays focusable, unlike `display: none`. */
export function VisuallyHidden({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'absolute size-px overflow-hidden whitespace-nowrap',
        '[clip-path:inset(50%)] [clip:rect(0,0,0,0)]',
        className,
      )}
      {...props}
    />
  )
}
