import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { Check, Info, LoaderCircle, TriangleAlert, X } from 'lucide-react'
import { useTheme } from '@/shared/lib/use-theme'
import { useIsMobile } from '@/shared/lib/use-media-query'

/**
 * Toasts, in the product's own design language.
 *
 * sonner ships its own palette, radii, shadows and motion, which read as a
 * third-party widget dropped onto the page. Everything visual here is
 * re-declared from our tokens, so a toast is recognisably the same material
 * as a Card: the same raised surface, the same hairline, the same soft
 * `shadow-lg`, the display face on the title.
 *
 * Status is carried the way the rest of the product carries it — an icon in a
 * tinted round well, the treatment the confirmation page and the value props
 * already use — rather than by a coloured stripe down the edge or by flooding
 * the card (`richColors` is off: a large red panel next to a red CTA is a
 * second call to action, and this is information).
 *
 * The close button is always visible. It was revealed on hover before, which
 * is fine for a pointer and invisible for everyone else; a control you can
 * only find by accident is not a control.
 *
 * Accessibility: sonner renders the `aria-live` region and moves focus on the
 * hotkey. What it does not do is localise, so the region label, the close
 * button and the hotkey hint are set in Turkish here.
 */
export function Toaster(props: ToasterProps) {
  const { theme } = useTheme()
  const isMobile = useIsMobile()

  return (
    <Sonner
      theme={theme}
      // Centred on a phone, where the viewport is narrow and a toast reads as a
      // banner; on the right otherwise, because centred it lands squarely on
      // the page title it is often reporting about.
      position={isMobile ? 'top-center' : 'top-right'}
      closeButton
      visibleToasts={3}
      gap={10}
      // Clears the sticky header (64px, 72px from lg) so a toast never covers
      // the navigation it might be telling you to use.
      offset={{ top: 84 }}
      mobileOffset={{ top: 76, left: 16, right: 16 }}
      containerAriaLabel="Bildirimler"
      style={
        {
          // sonner sizes and places its own parts through these. The width is
          // ours; the close button moves from sonner's floating disc at the
          // top-left corner to inside the card, top-right, where every other
          // dismiss in the product lives.
          '--width': '380px',
          '--normal-bg': 'var(--color-surface-raised)',
          '--normal-border': 'var(--color-border)',
          '--normal-text': 'var(--color-fg)',
          '--toast-close-button-start': 'auto',
          '--toast-close-button-end': '0.5rem',
          '--toast-close-button-transform': 'translateY(0.5rem)',
        } as React.CSSProperties
      }
      icons={{
        success: <Check className="size-4.5" strokeWidth={2.5} aria-hidden="true" />,
        error: <X className="size-4.5" strokeWidth={2.5} aria-hidden="true" />,
        warning: <TriangleAlert className="size-4.5" strokeWidth={2.25} aria-hidden="true" />,
        info: <Info className="size-4.5" strokeWidth={2.25} aria-hidden="true" />,
        loading: (
          <LoaderCircle className="size-4.5 animate-spin" strokeWidth={2.25} aria-hidden="true" />
        ),
      }}
      toastOptions={{
        duration: 5000,
        closeButtonAriaLabel: 'Bildirimi kapat',
        classNames: {
          toast: [
            'group pointer-events-auto relative flex w-full items-start gap-3',
            'rounded-xl border border-border bg-surface-raised p-4 shadow-lg',
            'text-fg',
          ].join(' '),
          // The well: a neutral disc that takes the toast's tone. Tint and text
          // are the semantic pair every status colour in the system ships with,
          // so it holds up in both themes without a second set of rules.
          icon: [
            // sonner pins the icon box at 16px with a two-attribute selector,
            // which beats a plain utility — hence the important modifier here.
            'm-0! grid size-9! shrink-0 place-items-center! rounded-full!',
            'bg-surface-sunken text-fg-muted',
            'group-data-[type=success]:bg-success-tint group-data-[type=success]:text-success-fg',
            'group-data-[type=error]:bg-danger-tint group-data-[type=error]:text-danger-fg',
            'group-data-[type=warning]:bg-warning-tint group-data-[type=warning]:text-warning-fg',
            'group-data-[type=info]:bg-info-tint group-data-[type=info]:text-info-fg',
          ].join(' '),
          // Room on the right for the close button, so a long title never runs
          // underneath it.
          content: 'flex min-w-0 flex-1 flex-col gap-1! pr-6',
          title: 'font-display text-sm leading-5! font-semibold! text-fg',
          // sonner mutes descriptions to 80% opacity on top of whatever colour
          // they have; ours is already the secondary tone, so that would mute
          // it twice.
          description: 'text-sm leading-5! text-pretty text-fg-secondary opacity-100!',
          actionButton: [
            'mt-2 h-8 shrink-0 self-start rounded-lg bg-brand px-3 text-xs font-semibold text-on-brand',
            'transition-colors duration-(--duration-fast) hover:bg-brand-hover',
          ].join(' '),
          cancelButton: [
            'mt-2 h-8 shrink-0 self-start rounded-lg border border-border-strong bg-surface px-3',
            'text-xs font-medium text-fg-secondary',
            'transition-colors duration-(--duration-fast) hover:bg-surface-sunken',
          ].join(' '),
          closeButton: [
            'grid size-7! place-items-center rounded-lg! border-0! bg-transparent! text-fg-subtle',
            'transition-colors duration-(--duration-fast)',
            'hover:bg-surface-sunken hover:text-fg',
          ].join(' '),
        },
      }}
      {...props}
    />
  )
}
