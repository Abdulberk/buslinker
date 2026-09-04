import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router'
import { cn } from '@/shared/lib/cn'
import {
  formatDateLong,
  formatDateShort,
  formatPrice,
  formatWeekdayShort,
  toISODate,
} from '@/shared/lib/tr'
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

const ITEM = 'w-[6.25rem] shrink-0 sm:w-auto sm:flex-1'
const CELL =
  'flex h-full w-full flex-col items-center gap-0.5 rounded-xl border px-2 py-2.5 text-center'

export function DateStrip({ from, to, date, className }: DateStripProps) {
  const [searchParams] = useSearchParams()
  const { data, isPending } = useQuery(datePricesQuery(from.id, to.id, date))

  // Pinned to Istanbul: in Tokyo at 01:00 the viewer-local day is already
  // tomorrow, so a day still selling tickets in Turkey rendered as past.
  const today = toISODate(new Date())

  return (
    <nav aria-label="Tarihe göre en ucuz fiyatlar" className={className}>
      {/* The box is reserved before the prices land, so the list below never
          shifts when they do. */}
      <ul className="scrollbar-none flex min-h-[5.75rem] gap-2 overflow-x-auto pb-1 sm:gap-3">
        {isPending || !data
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
              const isPast = day.date < today
              const weekday = formatWeekdayShort(day.date)
              const short = formatDateShort(day.date)
              // Just the fare on screen — "en ucuz 580 TL" wrapped to two lines
              // in a 100px cell. The qualifier stays for screen readers.
              const priceLabel = day.minPrice !== null ? formatPrice(day.minPrice) : 'sefer yok'

              const body = (
                <>
                  <span className="text-xs font-medium text-fg-secondary">{weekday}</span>
                  <span className="font-display text-sm font-semibold text-fg" data-numeric>
                    {short}
                  </span>
                  <span
                    className={cn(
                      'text-xs whitespace-nowrap',
                      day.minPrice !== null ? 'font-medium text-brand-fg' : 'text-fg-subtle',
                    )}
                    data-numeric
                  >
                    {day.minPrice !== null ? <VisuallyHidden>en ucuz </VisuallyHidden> : null}
                    {priceLabel}
                  </span>
                </>
              )

              if (isPast) {
                return (
                  <li key={day.date} className={ITEM}>
                    <span
                      className={cn(CELL, 'cursor-not-allowed border-border bg-surface opacity-45')}
                      aria-disabled="true"
                    >
                      {body}
                      <span className="sr-only">{formatDateLong(day.date)} — geçmiş tarih</span>
                    </span>
                  </li>
                )
              }

              return (
                <li key={day.date} className={ITEM}>
                  <Link
                    to={resultsPath(from.slug, to.slug, day.date, searchParams)}
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
                        : 'border-border bg-surface hover:border-border-strong hover:bg-surface-sunken',
                    )}
                  >
                    {body}
                    <span className="sr-only">
                      {formatDateLong(day.date)}
                      {isCurrent ? ' — seçili gün' : ''}
                    </span>
                  </Link>
                </li>
              )
            })}
      </ul>
    </nav>
  )
}
