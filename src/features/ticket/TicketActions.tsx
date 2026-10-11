import type { ReactNode } from 'react'
import { CalendarPlus, Navigation, Printer, Share2 } from 'lucide-react'
import { ICON } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'
import { AssetIcon } from '@/shared/ui/asset-icon'
import { Button } from '@/shared/ui/button'
import { VisuallyHidden } from '@/shared/ui/visually-hidden'
import { downloadTicketIcs, shareTrip } from './actions'
import { directionsUrl, type TicketFacts } from './ticket-text'

// On a phone the four actions are tiles, icon over label, so all of them fit
// one row at 320px; from `sm` up they are ordinary buttons in a line.
// A label may take two lines in a tile ("Takvime / ekle" at 320px) rather
// than run past its edges.
const TILE =
  'h-auto min-h-16 flex-col gap-1.5 rounded-xl px-1 py-2.5 text-center text-xs leading-tight whitespace-normal sm:h-11 sm:min-h-0 sm:flex-row sm:gap-2 sm:rounded-lg sm:px-4 sm:text-sm sm:whitespace-nowrap'

/**
 * The ticket's one action row.
 *
 * Calendar, share and directions are what a traveller does with a ticket
 * before the day; printing is kept quieter, because a phone is the ticket. A
 * journey that is over or cancelled has nothing left to plan, so only the
 * print button stays: a printed copy is still a receipt.
 */
export function TicketActions({
  facts,
  active,
  className,
}: {
  facts: TicketFacts
  active: boolean
  className?: string
}) {
  const print = (
    <Button
      variant="ghost"
      className={cn(TILE, active ? 'sm:ms-auto' : 'col-span-4 sm:ms-0')}
      onClick={() => {
        window.print()
      }}
    >
      <Printer className="size-5 sm:size-4" aria-hidden="true" />
      Yazdır
    </Button>
  )

  return (
    <div
      role="group"
      aria-label="Bilet işlemleri"
      data-print-hide
      className={cn(
        'grid gap-2 sm:flex sm:flex-wrap sm:items-center print:hidden',
        active ? 'grid-cols-4' : 'grid-cols-1',
        className,
      )}
    >
      {active ? (
        <>
          <Button
            variant="secondary"
            className={TILE}
            onClick={() => {
              downloadTicketIcs(facts)
            }}
          >
            <CalendarPlus className="size-5 sm:size-4" aria-hidden="true" />
            Takvime ekle
          </Button>
          <Button
            variant="secondary"
            className={TILE}
            onClick={() => {
              void shareTrip(facts)
            }}
          >
            <Share2 className="size-5 sm:size-4" aria-hidden="true" />
            Paylaş
          </Button>
          <Button variant="secondary" className={TILE} asChild>
            <a href={directionsUrl(facts)} target="_blank" rel="noopener noreferrer">
              <Navigation className="size-5 sm:size-4" aria-hidden="true" />
              Yol tarifi
              <VisuallyHidden> — {facts.fromTerminal}, yeni sekmede açılır</VisuallyHidden>
            </a>
          </Button>
        </>
      ) : null}
      {print}
    </div>
  )
}

/**
 * A section title on the ticket screens, with the logo's ring-dot before it —
 * the same mark, set the same way, as the home page's section headings.
 */
export function TicketHeading({
  id,
  children,
  className,
}: {
  id: string
  children: ReactNode
  className?: string
}) {
  return (
    <h2
      id={id}
      className={cn(
        'flex items-start gap-[0.45em] font-display text-base font-semibold text-fg',
        className,
      )}
    >
      <span aria-hidden="true" className="flex h-lh shrink-0 items-center">
        <AssetIcon src={ICON.linker} className="size-2.5 text-logo" />
      </span>
      <span className="min-w-0">{children}</span>
    </h2>
  )
}
