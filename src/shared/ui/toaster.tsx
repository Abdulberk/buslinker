import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { CircleAlert, CircleCheck, Info, LoaderCircle, TriangleAlert } from 'lucide-react'
import { useTheme } from '@/shared/lib/use-theme'
import { useIsMobile } from '@/shared/lib/use-media-query'

/**
 * Toasts, in the product's own design language.
 *
 * sonner ships its own palette, radii and shadows, which read as a third-party
 * widget dropped onto the page. Everything visual here is re-declared from our
 * tokens instead, so a toast is recognisably the same material as a Card: same
 * surface, same border, same `shadow-lg`, same type scale.
 *
 * `richColors` is deliberately OFF. It floods the whole toast with a status
 * colour, which (a) fights the "one brand fill per decision context" rule and
 * (b) puts a large red panel next to our red CTA. Status is carried by an icon
 * and a 3px leading bar instead — the same treatment inline validation uses —
 * so the toast reads as information rather than as a second call to action.
 *
 * Accessibility: sonner already renders an `aria-live` region and moves focus
 * on hotkey. What it does not do is localise, so the region label, the close
 * button and the dismiss hotkey hint are all set in Turkish.
 */
export function Toaster(props: ToasterProps) {
  const { theme } = useTheme()
  const isMobile = useIsMobile()

  return (
    <Sonner
      theme={theme}
      // Centred on mobile, where the viewport is narrow and a toast reads as a
      // banner; moved to the right on desktop because a centred toast lands
      // squarely on the page title it is often reporting about.
      position={isMobile ? 'top-center' : 'top-right'}
      closeButton
      gap={10}
      // Clears the sticky header (64px, 72px from lg) so a toast never
      // covers the navigation it might be telling you to use.
      offset={{ top: 84 }}
      mobileOffset={{ top: 76 }}
      containerAriaLabel="Bildirimler"
      icons={{
        success: <CircleCheck className="size-5 text-success" aria-hidden="true" />,
        error: <CircleAlert className="size-5 text-danger" aria-hidden="true" />,
        warning: <TriangleAlert className="size-5 text-warning" aria-hidden="true" />,
        info: <Info className="size-5 text-info" aria-hidden="true" />,
        loading: <LoaderCircle className="size-5 animate-spin text-fg-muted" aria-hidden="true" />,
      }}
      toastOptions={{
        duration: 5000,
        closeButtonAriaLabel: 'Bildirimi kapat',
        classNames: {
          toast: [
            'group pointer-events-auto relative flex w-full items-start gap-3',
            'overflow-hidden rounded-xl border border-border bg-surface-raised',
            'px-4 py-3.5 shadow-lg',
            // The status bar is a pseudo-element so no wrapper is needed and it
            // cannot be knocked out of alignment by the icon or the text.
            'before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-border-strong',
            'data-[type=success]:before:bg-success',
            'data-[type=error]:before:bg-danger',
            'data-[type=warning]:before:bg-warning',
            'data-[type=info]:before:bg-info',
          ].join(' '),
          content: 'flex min-w-0 flex-1 flex-col gap-0.5',
          title: 'text-sm font-semibold text-fg',
          description: 'text-sm text-fg-secondary',
          icon: 'mt-px flex shrink-0 items-center justify-center',
          actionButton: [
            'shrink-0 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-on-brand',
            'transition-colors duration-(--duration-fast) hover:bg-brand-hover',
          ].join(' '),
          cancelButton: [
            'shrink-0 rounded-lg border border-border-strong bg-surface px-3 py-1.5',
            'text-xs font-medium text-fg-secondary',
            'transition-colors duration-(--duration-fast) hover:bg-surface-sunken',
          ].join(' '),
          closeButton: [
            'absolute top-2 right-2 grid size-6 place-items-center rounded-md border-0',
            'bg-transparent text-fg-muted opacity-0 transition-[opacity,color,background-color]',
            'duration-(--duration-fast) hover:bg-surface-sunken hover:text-fg',
            // Revealed on hover for pointer users, but always present for
            // keyboard users — an invisible-yet-focusable control is a trap.
            'group-hover:opacity-100 focus-visible:opacity-100',
          ].join(' '),
        },
      }}
      {...props}
    />
  )
}
