import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { CAMPAIGNS, type Campaign } from '@/shared/config/campaigns'
import { ICON } from '@/shared/config/assets'
import { AssetIcon } from '@/shared/ui/asset-icon'
import { cn } from '@/shared/lib/cn'

import { campaignPath } from '@/shared/lib/search-params'

/** Ink for each tone's motif — low contrast, because it is texture not content. */
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

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="kampanyalar" className="flex items-center gap-2.5 text-2xl sm:text-3xl">
            <AssetIcon src={ICON.linker} className="size-5 shrink-0 text-brand" />
            Kampanyalar
          </h2>
          <p className="mt-2 max-w-prose text-base text-fg-secondary">
            Süresi dolmadan yararlanabileceğiniz güncel indirimler.
          </p>
        </div>

        {/* Hidden below lg, where the list is scrolled by touch instead. */}
        <div className="hidden shrink-0 gap-2 lg:flex">
          <ArrowButton direction="prev" disabled={atStart} onClick={() => scrollByCard(-1)} />
          <ArrowButton direction="next" disabled={atEnd} onClick={() => scrollByCard(1)} />
        </div>
      </div>

      <ul
        ref={scrollerRef}
        onScroll={sync}
        // `tabIndex={0}` makes an overflowing region keyboard-scrollable, which
        // browsers otherwise only grant to focusable content inside it.
        tabIndex={0}
        aria-label="Kampanyalar listesi"
        className={cn(
          'mt-6 scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto sm:mt-8',
          // Bleed to the viewport edge on mobile so a card can sit flush while
          // the section keeps its gutter.
          '-mx-4 scroll-px-4 px-4 sm:mx-0 sm:scroll-px-0 sm:px-0',
        )}
      >
        {CAMPAIGNS.map((campaign) => (
          <li key={campaign.id} className="w-76 shrink-0 snap-start sm:w-88">
            <CampaignCard campaign={campaign} />
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
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'prev' ? 'Önceki kampanyalar' : 'Sonraki kampanyalar'}
      className={cn(
        'grid size-11 place-items-center rounded-full border border-border-strong bg-surface',
        'text-fg-secondary transition-colors duration-(--duration-fast)',
        'hover:bg-surface-sunken hover:text-fg',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface',
      )}
    >
      <AssetIcon src={direction === 'prev' ? ICON.leftArrow : ICON.rightArrow} className="size-4" />
    </button>
  )
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  // The artwork carries the whole offer — audience, headline, amount, code —
  // so the card is the image and nothing else. That puts every one of those
  // words out of reach of a screen reader, which is why alt repeats them: on
  // an image-only link it is also what gives the link its accessible name.
  const alt = campaign.code
    ? `${campaign.badge}: ${campaign.title}. İndirim kodu ${campaign.code}.`
    : `${campaign.badge}: ${campaign.title}.`

  return (
    <Link
      to={campaignPath(campaign.id)}
      className={cn(
        'block overflow-hidden rounded-xl border border-border',
        'transition-[border-color,box-shadow] duration-(--duration-base) ease-standard',
        'hover:border-brand/30 hover:shadow-md',
      )}
    >
      <img
        src={campaign.image}
        alt={alt}
        width={800}
        height={667}
        loading="lazy"
        decoding="async"
        className="aspect-6/5 w-full object-cover"
      />
    </Link>
  )
}
