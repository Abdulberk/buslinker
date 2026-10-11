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
 *   2. There is one solid brand fill per decision context. Each trip card is
 *      its own context — the choice made there is "this coach" — so its
 *      "Seç" may be solid; a second action inside the same card may not, and
 *      takes `brand-outline`, which fills on hover. That separation is also
 *      what keeps brand red readable as distinct from danger red.
 */
/**
 * Unavailable is grey, not a paler red. Half-opacity brand read as pink — a
 * colour the system gives no meaning to — and a faded outline button looked
 * merely quiet rather than off. Every bordered or filled variant drops to the
 * same neutral recipe instead. A LOADING button is disabled too, but it is
 * busy, not unavailable: it keeps its fill, so the press visibly took.
 */
const DISABLED_FILL = [
  'disabled:not-aria-busy:border-transparent disabled:not-aria-busy:bg-surface-sunken',
  'disabled:not-aria-busy:text-fg-subtle',
].join(' ')

const buttonVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-medium select-none',
    'transition-[background-color,border-color,color,box-shadow,transform]',
    'duration-(--duration-fast) ease-standard',
    'active:scale-[0.98]',
    'disabled:pointer-events-none',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        // No coloured shadow under the fill: a red glow around a red button
        // read as a second, softer button behind the first.
        primary: [
          'on-brand bg-brand text-on-brand hover:bg-brand-hover focus-visible:bg-brand-hover',
          DISABLED_FILL,
        ],
        'brand-outline': [
          'border border-brand/40 bg-surface text-brand-fg',
          'hover:border-brand hover:bg-brand hover:text-on-brand',
          DISABLED_FILL,
        ],
        // Hover is the `hover` layer, not `surface-sunken`: in dark mode sunken
        // sits BELOW the surface, so a hovered button went darker and all but
        // vanished.
        secondary: ['border border-border-strong bg-surface text-fg hover:bg-hover', DISABLED_FILL],
        ghost: 'text-fg-secondary hover:bg-hover hover:text-fg disabled:text-fg-subtle',
        // Already sunken at rest, and in light mode `hover` is the same step as
        // sunken. `border` is one step on from it in both themes.
        subtle: ['bg-surface-sunken text-fg hover:bg-border', DISABLED_FILL],
        danger: ['bg-danger text-on-danger hover:brightness-95', DISABLED_FILL],
        link: 'text-brand-fg underline-offset-4 hover:underline disabled:text-fg-subtle',
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
