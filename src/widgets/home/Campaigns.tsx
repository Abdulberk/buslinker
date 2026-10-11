import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { CalendarClock, ChevronLeft, ChevronRight } from 'lucide-react'
import { CAMPAIGNS, type Campaign } from '@/shared/config/campaigns'
import { campaignPath } from '@/shared/lib/search-params'
import { toISODate } from '@/shared/lib/tr'
import { cn } from '@/shared/lib/cn'
import { CLOSING_SOON_DAYS, activeCampaigns, daysLeft, deadlineLabel } from './campaign-window'
import { mediaCard } from './card-recipes'
import { SectionHeading } from './SectionHeading'

/**
 * The campaigns rail.
 *
 * A native horizontally-scrolling list rather than a JS carousel: touch,
 * trackpad, keyboard and screen-reader navigation all work because they are
 * the browser's own. The arrows only call `scrollBy` on that same container,
 * so they are an enhancement — remove them and nothing breaks.
 *
 * There is deliberately no auto-advance. Content that moves on its own has to
 * offer a pause control under WCAG 2.2.2, and it makes a deal you were reading
 * slide away mid-sentence.
 */
export function Campaigns() {
  const today = toISODate(new Date())
  const campaigns = useMemo(() => activeCampaigns(CAMPAIGNS, today), [today])

  const scrollerRef = useRef<HTMLUListElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const sync = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    // A 2px tolerance: sub-pixel scroll positions never land exactly on 0 or
    // on the maximum, so a strict comparison leaves an arrow stuck enabled.
    setAtStart(el.scrollLeft <= 2)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    sync()
    const el = scrollerRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => observer.disconnect()
  }, [sync])

  const scrollByCard = (direction: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector('li')
    const step = card ? card.getBoundingClientRect().width + 16 : el.clientWidth * 0.8
    el.scrollBy({ left: step * direction, behavior: 'smooth' })
  }

  if (campaigns.length === 0) return null

  return (
    <>
      <SectionHeading
        id="kampanyalar"
        title="Kampanyalar"
        lead="Süresi dolmadan yararlanabileceğiniz güncel indirimler."
        aside={
          // For a fine pointer at any width from sm, not just from lg: a mouse
          // in a 900px window has no swipe, and the scrollbar is hidden, so
          // without these the rail could not be moved at all. A touch screen
          // scrolls the list itself and does not need them.
          <div className="hidden gap-2 sm:pointer-fine:flex">
            <ArrowButton direction="prev" disabled={atStart} onClick={() => scrollByCard(-1)} />
            <ArrowButton direction="next" disabled={atEnd} onClick={() => scrollByCard(1)} />
          </div>
        }
      />

      <ul
        ref={scrollerRef}
        onScroll={sync}
        // `tabIndex={0}` makes an overflowing region keyboard-scrollable, which
        // browsers otherwise only grant to focusable content inside it.
        tabIndex={0}
        aria-label="Kampanyalar listesi"
        className={cn(
          'scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto',
          // A scroller clips on both axes, so the 4px focus ring of a card at
          // its edge was cut off. One spacing step of padding all round gives
          // the ring room; the negative margin below keeps the cards where
          // they were. The top margin is one step short for the same reason.
          'mt-5 -mb-1 py-1 sm:mt-7',
          // Bleeds to the viewport edge on a phone so a card can sit flush
          // while the section keeps its gutter. Cancels the container's own
          // padding variable, which a hand-copied -mx-4 only matched at the
          // narrowest widths.
          '-mx-(--app-pad) scroll-px-(--app-pad) px-(--app-pad)',
          'sm:-mx-1 sm:scroll-px-1 sm:px-1',
        )}
      >
        {campaigns.map((campaign) => (
          <li key={campaign.id} className="w-76 shrink-0 snap-start sm:w-88">
            <CampaignCard campaign={campaign} today={today} />
          </li>
        ))}
      </ul>
    </>
  )
}

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'prev' | 'next'
  disabled: boolean
  onClick: () => void
}) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'prev' ? 'Önceki kampanyalar' : 'Sonraki kampanyalar'}
      className={cn(
        'grid size-11 place-items-center rounded-full border border-border-strong bg-surface',
        'text-fg-secondary transition-colors duration-(--duration-fast)',
        'hover:bg-hover hover:text-fg',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface',
      )}
    >
      {/* The same chevron as every "Tümünü gör" beside the other headings —
          one glyph family in the one slot all six headings share. */}
      <Icon className="size-5" aria-hidden="true" />
    </button>
  )
}

function CampaignCard({ campaign, today }: { campaign: Campaign; today: string }) {
  // The artwork carries the whole offer — audience, headline, amount, code —
  // so the image carries no caption of its own. That puts every one of those
  // words out of reach of a screen reader, which is why alt repeats them: on
  // an image link it is also what opens the link's accessible name.
  const alt = campaign.code
    ? `${campaign.badge}: ${campaign.title}. İndirim kodu ${campaign.code}.`
    : `${campaign.badge}: ${campaign.title}.`
  const closingSoon = daysLeft(campaign.validUntil, today) <= CLOSING_SOON_DAYS

  return (
    <Link to={campaignPath(campaign.id)} className={cn(mediaCard, 'group')}>
      <img
        src={campaign.image}
        alt={alt}
        width={800}
        height={667}
        loading="lazy"
        decoding="async"
        className="aspect-6/5 w-full object-cover"
      />
      {/* The one fact the art does not carry. Stated plainly on every card,
          and only raised to the warning colour in the last week, so the
          urgency is real when it appears instead of a permanent alarm. */}
      <span className="flex items-center justify-between gap-3 border-t border-border bg-surface px-3.5 py-2.5 text-xs">
        <span
          className={cn(
            'flex items-center gap-1.5',
            closingSoon ? 'font-medium text-warning-fg' : 'text-fg-muted',
          )}
        >
          <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
          <span>
            Son gün{' '}
            <time dateTime={campaign.validUntil} data-numeric>
              {deadlineLabel(campaign.validUntil, today)}
            </time>
          </span>
        </span>
        <ChevronRight
          className="size-4 shrink-0 text-fg-subtle transition-[color,translate] duration-(--duration-fast) group-hover:translate-x-0.5 group-hover:text-brand-fg"
          aria-hidden="true"
        />
      </span>
    </Link>
  )
}
