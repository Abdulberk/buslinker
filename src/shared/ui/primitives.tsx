import {
  Accordion as A,
  Checkbox as C,
  Dialog as D,
  Popover as P,
  Slider as S,
  Tooltip as T,
  ToggleGroup as TG,
} from 'radix-ui'
import { Check, ChevronDown, X } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * Thin, styled wrappers over Radix primitives.
 *
 * Radix owns the behaviour that is genuinely hard to get right — focus
 * trapping, escape layering, `aria-expanded`/`aria-controls` wiring, typeahead,
 * pointer-vs-keyboard distinction. We only supply appearance, so accessibility
 * cannot regress through a styling change.
 */

// ---------------------------------------------------------------------------
// Dialog / Sheet
// ---------------------------------------------------------------------------

export const Dialog = D.Root
export const DialogTrigger = D.Trigger
export const DialogClose = D.Close

export function DialogOverlay({ className, ...props }: ComponentProps<typeof D.Overlay>) {
  return (
    <D.Overlay
      className={cn(
        'fixed inset-0 z-50 bg-overlay backdrop-blur-[2px]',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        className,
      )}
      {...props}
    />
  )
}

export function DialogContent({
  className,
  children,
  title,
  description,
  side = 'center',
  ...props
}: ComponentProps<typeof D.Content> & {
  title: string
  description?: string
  /** `bottom` gives the mobile filter sheet; `center` a regular modal. */
  side?: 'center' | 'bottom'
}) {
  return (
    <D.Portal>
      <DialogOverlay />
      <D.Content
        className={cn(
          'fixed z-50 flex flex-col bg-surface shadow-xl outline-none',
          'data-[state=closed]:animate-out data-[state=open]:animate-in',
          side === 'center' && [
            'top-1/2 left-1/2 w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2',
            'max-h-[min(42rem,calc(100dvh-2rem))] rounded-2xl',
            'data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
            'data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          ],
          side === 'bottom' && [
            'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-3xl',
            'pb-[env(safe-area-inset-bottom)]',
            'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
          ],
          className,
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <D.Title className="font-display text-lg font-bold text-fg">{title}</D.Title>
            {description ? (
              <D.Description className="mt-0.5 text-sm text-fg-muted">{description}</D.Description>
            ) : (
              // Radix warns when a dialog has no description; an explicitly
              // empty one is the documented way to opt out.
              <D.Description className="sr-only">{title}</D.Description>
            )}
          </div>
          <D.Close
            className="tap-44 -m-1 rounded-lg p-1 text-fg-muted transition-colors hover:bg-surface-sunken hover:text-fg"
            aria-label="Kapat"
          >
            <X className="size-5" aria-hidden="true" />
          </D.Close>
        </div>
        {children}
      </D.Content>
    </D.Portal>
  )
}

// ---------------------------------------------------------------------------
// Popover
// ---------------------------------------------------------------------------

export const Popover = P.Root
export const PopoverTrigger = P.Trigger
export const PopoverAnchor = P.Anchor

export function PopoverContent({
  className,
  align = 'start',
  sideOffset = 8,
  ...props
}: ComponentProps<typeof P.Content>) {
  return (
    <P.Portal>
      <P.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 rounded-xl border border-border bg-surface p-2 shadow-lg outline-none',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          className,
        )}
        {...props}
      />
    </P.Portal>
  )
}

// ---------------------------------------------------------------------------
// Checkbox
// ---------------------------------------------------------------------------

export function Checkbox({ className, ...props }: ComponentProps<typeof C.Root>) {
  return (
    <C.Root
      className={cn(
        'peer grid size-5 shrink-0 place-items-center rounded-sm border-[1.5px] border-border-strong',
        'bg-surface transition-colors duration-(--duration-fast)',
        'data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=checked]:text-on-brand',
        'disabled:cursor-not-allowed disabled:opacity-45',
        className,
      )}
      {...props}
    >
      <C.Indicator>
        <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
      </C.Indicator>
    </C.Root>
  )
}

// ---------------------------------------------------------------------------
// Slider (price range)
// ---------------------------------------------------------------------------

export function Slider({ className, ...props }: ComponentProps<typeof S.Root>) {
  const thumbCount = props.value?.length ?? props.defaultValue?.length ?? 1
  return (
    <S.Root
      className={cn('relative flex w-full touch-none items-center py-2 select-none', className)}
      {...props}
    >
      <S.Track className="relative h-1.5 w-full grow rounded-full bg-surface-sunken">
        <S.Range className="absolute h-full rounded-full bg-brand" />
      </S.Track>
      {Array.from({ length: thumbCount }, (_, i) => (
        <S.Thumb
          key={i}
          className={cn(
            'block size-5 rounded-full border-2 border-brand bg-surface shadow-sm',
            'transition-transform duration-(--duration-fast) hover:scale-110',
            'disabled:pointer-events-none',
          )}
        />
      ))}
    </S.Root>
  )
}

// ---------------------------------------------------------------------------
// Toggle group (sort, tabs-as-filters)
// ---------------------------------------------------------------------------

export const ToggleGroup = TG.Root
export function ToggleGroupItem({ className, ...props }: ComponentProps<typeof TG.Item>) {
  return (
    <TG.Item
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3.5',
        'text-sm font-medium text-fg-secondary transition-colors duration-(--duration-fast)',
        'hover:bg-surface-sunken',
        'data-[state=on]:border-brand/40 data-[state=on]:bg-brand/8 data-[state=on]:text-brand-fg',
        className,
      )}
      {...props}
    />
  )
}

// ---------------------------------------------------------------------------
// Accordion (filter groups)
// ---------------------------------------------------------------------------

export const Accordion = A.Root
export const AccordionItem = A.Item

export function AccordionTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof A.Trigger>) {
  return (
    <A.Header className="flex">
      <A.Trigger
        className={cn(
          'group flex flex-1 items-center justify-between gap-2 py-3.5 text-left',
          'text-sm font-semibold text-fg transition-colors hover:text-brand-fg',
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDown
          className="size-4 shrink-0 text-fg-muted transition-transform duration-(--duration-slow) group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      </A.Trigger>
    </A.Header>
  )
}

export function AccordionContent({
  className,
  children,
  ...props
}: ComponentProps<typeof A.Content>) {
  return (
    <A.Content
      className={cn(
        'overflow-hidden',
        'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
        className,
      )}
      {...props}
    >
      <div className="pb-4">{children}</div>
    </A.Content>
  )
}

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------

export const TooltipProvider = T.Provider
export const Tooltip = T.Root
export const TooltipTrigger = T.Trigger

export function TooltipContent({ className, ...props }: ComponentProps<typeof T.Content>) {
  return (
    <T.Portal>
      <T.Content
        sideOffset={6}
        className={cn(
          'z-50 rounded-lg bg-fg px-2.5 py-1.5 text-xs font-medium text-bg shadow-md',
          'data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0',
          className,
        )}
        {...props}
      />
    </T.Portal>
  )
}

/** Icon plus a tooltip, with the label always available to assistive tech. */
export function IconWithLabel({
  icon,
  label,
  className,
}: {
  icon: ReactNode
  label: string
  className?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'inline-grid size-8 place-items-center rounded-lg bg-surface-sunken text-fg-secondary',
            className,
          )}
        >
          {icon}
          <span className="sr-only">{label}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
