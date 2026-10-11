import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router'
import { cn } from '@/shared/lib/cn'
import {
  formatDateLong,
  formatDateShort,
  formatPrice,
  formatWeekdayShort,
  fromISODate,
  toISODate,
  toISODateLocal,
} from '@/shared/lib/tr'
import { QUIET_NAV } from '@/shared/lib/quiet-nav'
import { resultsPath } from '@/shared/lib/search-params'
import { datePricesQuery } from '@/shared/api/queries'
import { Skeleton } from '@/shared/ui/skeleton'
import { VisuallyHidden } from '@/shared/ui/visually-hidden'
import type { City } from '@/shared/api/catalog'

export interface DateStripProps {
  from: City
  to: City
  date: string
  className?: string
}

function addDays(iso: string, days: number): string {
  const d = fromISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODateLocal(d)
}

/**
 * The strip's first day: three before the chosen one, so the chosen day sits
 * in the middle, but never before today. A day that has gone cannot be booked,
 * so a cell for it only took room from one that can.
 *
 * Exported because the results page reads the same seven days to suggest the
 * nearest date with departures; both ask with the same start, so they share
 * one cached request.
 */
export function dateStripStart(date: string, today = toISODate(new Date())): string {
  const start = addDays(date, -3)
  return start < today ? today : start
}

// Narrow enough that four days show on a 390px phone; the price is the widest
// line and "1.250 TL" still fits.
const ITEM = 'w-21 shrink-0 sm:w-auto sm:flex-1'
// `relative` matters. Each cell carries visually hidden text, which is
// absolutely positioned; without a positioned ancestor inside the scroller it
// was laid out against the page instead and widened a 390px phone to 715px.
const CELL =
  'relative flex h-full w-full flex-col items-center gap-0.5 rounded-xl border px-2 py-2.5 text-center'

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function DateStrip({ from, to, date, className }: DateStripProps) {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()

  // Pinned to Istanbul: in Tokyo at 01:00 the viewer-local day is already
  // tomorrow, so a day still selling tickets in Turkey rendered as past.
  const today = toISODate(new Date())
  const tomorrow = addDays(today, 1)

  // Tapping another day moves the window; the query keeps the old strip on
  // screen until the new one lands, so the tapped cell never unmounts.
  const { data } = useQuery(datePricesQuery(from.id, to.id, dateStripStart(date, today)))

  const listRef = useRef<HTMLUListElement>(null)
  const hasCentred = useRef(false)

  // Bring the chosen day to the middle of the strip on a phone, where it
  // scrolls. Only the strip moves: `scrollIntoView` would also scroll the page
  // to the strip when it is out of view, which is not what a date change asks
  // for. The first placement is instant, as is every one under reduced motion.
  useEffect(() => {
    const list = listRef.current
    const cell = list?.querySelector<HTMLElement>('[aria-current="date"]')
    if (!list || !cell || list.scrollWidth <= list.clientWidth) return
    const left = cell.offsetLeft - (list.clientWidth - cell.offsetWidth) / 2
    const smooth = hasCentred.current && !prefersReducedMotion()
    list.scrollTo({ left, behavior: smooth ? 'smooth' : 'instant' })
    hasCentred.current = true
  }, [date, data])

  return (
    <nav aria-label={t('results.dates.label')} className={className}>
      {/* The box is reserved before the prices land, so the list below never
          shifts when they do. */}
      <ul
        ref={listRef}
        className="relative scrollbar-none flex min-h-23 gap-2 overflow-x-auto pb-1 sm:gap-3"
      >
        {!data
          ? Array.from({ length: 7 }, (_, index) => (
              <li key={index} className={ITEM} aria-hidden="true">
                <div className={cn(CELL, 'border-border bg-surface')}>
                  <Skeleton className="h-3.5 w-8" />
                  <Skeleton className="mt-1 h-4 w-14" />
                  <Skeleton className="mt-1.5 h-3 w-16" />
                </div>
              </li>
            ))
          : data.map((day) => {
              const isCurrent = day.date === date
              const dayName =
                day.date === today
                  ? t('results.dates.today')
                  : day.date === tomorrow
                    ? t('results.dates.tomorrow')
                    : formatWeekdayShort(day.date)

              return (
                <li key={day.date} className={ITEM}>
                  <Link
                    to={resultsPath(from.slug, to.slug, day.date, searchParams)}
                    // Same page, new day: no route veil, and focus stays on the
                    // cell that was tapped.
                    state={QUIET_NAV}
                    replace={isCurrent}
                    preventScrollReset
                    {...(isCurrent && { 'aria-current': 'date' as const })}
                    className={cn(
                      CELL,
                      'transition-colors duration-(--duration-fast)',
                      // The ring doubles the border weight, so the selected day
                      // is distinguishable without relying on the tint alone.
                      isCurrent
                        ? 'border-brand bg-brand/8 ring-1 ring-brand ring-inset'
                        : 'border-border bg-surface hover:border-border-strong hover:bg-hover',
                    )}
                  >
                    <span className="text-xs font-medium text-fg-secondary">{dayName}</span>
                    <span className="font-display text-sm font-semibold text-fg" data-numeric>
                      {formatDateShort(day.date)}
                    </span>
                    {/* Just the fare on screen — "en ucuz 580 TL" wrapped to
                        two lines in a narrow cell. The qualifier stays for
                        screen readers. */}
                    <span
                      className={cn(
                        'text-xs whitespace-nowrap',
                        day.minPrice !== null ? 'font-medium text-brand-fg' : 'text-fg-muted',
                      )}
                      data-numeric
                    >
                      {day.minPrice !== null ? (
                        <>
                          <VisuallyHidden>{t('results.dates.cheapest')} </VisuallyHidden>
                          {formatPrice(day.minPrice)}
                        </>
                      ) : (
                        t('results.dates.noTrips')
                      )}
                    </span>
                    <VisuallyHidden>
                      {formatDateLong(day.date)}
                      {isCurrent ? ` — ${t('results.dates.selected')}` : ''}
                    </VisuallyHidden>
                  </Link>
                </li>
              )
            })}
      </ul>
    </nav>
  )
}
