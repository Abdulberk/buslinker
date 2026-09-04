import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { CAMPAIGN_GRADIENT, CAMPAIGNS, type Campaign } from '@/shared/config/campaigns'
import { ICON } from '@/shared/config/assets'
import { AssetIcon } from '@/shared/ui/asset-icon'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/cn'

import { formatDateMedium } from '@/shared/lib/tr'
import { campaignPath } from '@/shared/lib/search-params'

/** Ink for each tone's motif — low contrast, because it is texture not content. */
const TONE_INK: Record<Campaign['tone'], string> = {
  brand: 'text-brand-900/25 dark:text-brand-100/20',
  info: 'text-info-900/25 dark:text-info-100/20',
  success: 'text-success-900/25 dark:text-success-100/20',
  warning: 'text-warning-900/25 dark:text-warning-100/20',
}

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
  const to = campaignPath(campaign.id)

  const content = (
    <>
      <div
        className="relative flex h-32 items-start justify-between overflow-hidden p-4"
        style={{ background: CAMPAIGN_GRADIENT[campaign.tone] }}
      >
        {/* The motif is masked rather than drawn, so it inherits the campaign's
            own colour and stays legible in both themes without a second file. */}
        <span
          aria-hidden="true"
          className={cn('pointer-events-none absolute inset-0', TONE_INK[campaign.tone])}
          style={{
            backgroundColor: 'currentColor',
            maskImage: `url("${campaign.art}")`,
            WebkitMaskImage: `url("${campaign.art}")`,
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'right center',
            WebkitMaskPosition: 'right center',
            maskSize: 'auto 100%',
            WebkitMaskSize: 'auto 100%',
          }}
        />

        <Badge tone="neutral" size="sm" className="relative bg-surface/85 backdrop-blur-sm">
          {campaign.badge}
        </Badge>

        {campaign.code ? (
          <span
            className={cn(
              'relative rounded-md border border-dashed border-fg-muted/50 bg-surface/85 px-2 py-1',
              'text-2xs font-semibold tracking-wider text-fg backdrop-blur-sm',
            )}
          >
            {campaign.code}
            <span className="sr-only"> indirim kodu</span>
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-bold text-balance-tr text-fg">
          {campaign.title}
        </h3>
        <p className="mt-1.5 text-sm text-fg-secondary">{campaign.body}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-fg">
            {campaign.cta}
            <ArrowRight
              className="size-4 transition-transform duration-(--duration-fast) group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
          <span className="text-2xs text-fg-subtle">
            {formatDateMedium(campaign.validUntil)}&apos;e kadar
          </span>
        </div>
      </div>
    </>
  )

  const className = cn(
    'group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface-raised',
    'transition-[border-color,box-shadow] duration-(--duration-base) ease-standard',
    'hover:border-brand/30 hover:shadow-md',
  )

  // One accessible name for the whole card, so a screen reader announces the
  // offer rather than a bare "Hemen üye olun".
  const label = `${campaign.title}. ${campaign.cta}`

  return (
    <Link to={to} aria-label={label} className={className}>
      {content}
    </Link>
  )
}
