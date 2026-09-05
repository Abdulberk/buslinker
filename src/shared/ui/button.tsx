import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

/**
 * Button.
 *
 * Two rules from the colour system are encoded here rather than left to
 * discipline:
 *
 *   1. `primary` hover goes DARKER (brand-700), never lighter. White on
 *      brand-600 measures 4.75:1 — only 0.25 above AA — so lightening the
 *      fill on hover would break contrast.
 *
 *   2. There is one solid brand fill per decision context. A results page
 *      renders dozens of "Seç" buttons, so those use `brand-outline`, which
 *      fills on hover. The solid pill is reserved for the single page-level
 *      primary action. That separation is also what keeps brand red readable
 *      as distinct from danger red.
 */
const buttonVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-medium select-none',
    'transition-[background-color,border-color,color,box-shadow,transform]',
    'duration-(--duration-fast) ease-standard',
    'active:scale-[0.98]',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        // No coloured shadow under the fill: a red glow around a red button
        // read as a second, softer button behind the first.
        primary:
          'on-brand bg-brand text-on-brand hover:bg-brand-hover focus-visible:bg-brand-hover',
        'brand-outline':
          'border border-brand/40 bg-surface text-brand-fg hover:border-brand hover:bg-brand hover:text-on-brand',
        secondary: 'border border-border-strong bg-surface text-fg hover:bg-surface-sunken',
        ghost: 'text-fg-secondary hover:bg-surface-sunken hover:text-fg',
        subtle: 'bg-surface-sunken text-fg hover:bg-border',
        danger: 'bg-danger text-on-danger hover:brightness-95',
        link: 'text-brand-fg underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 rounded-lg px-3 text-sm',
        md: 'h-11 rounded-lg px-4 text-base',
        lg: 'h-13 rounded-full px-6 text-lg',
        icon: 'size-11 rounded-lg',
        'icon-sm': 'size-9 rounded-lg',
      },
      full: { true: 'w-full', false: '' },
    },
    compoundVariants: [
      // The pill shape belongs to the primary CTA alone; it is one of the
      // signals separating it from a destructive action.
      { variant: 'primary', size: 'lg', class: 'rounded-full' },
    ],
    defaultVariants: { variant: 'primary', size: 'md', full: false },
  },
)

export interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  /** Announced while `loading` is true. Defaults to the Turkish standard. */
  loadingLabel?: string
}

export function Button({
  className,
  variant,
  size,
  full,
  asChild = false,
  loading = false,
  loadingLabel = 'Lütfen bekleyin',
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, full }), className)}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

export { buttonVariants }
