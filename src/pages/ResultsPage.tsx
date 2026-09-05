import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams, useSearchParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { CompassIcon } from 'lucide-react'
import { SearchForm } from '@/features/search-form/SearchForm'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogClose, DialogContent } from '@/shared/ui/primitives'
import { cn } from '@/shared/lib/cn'
import { formatDateLong, fromISODate, isValidISODate, toISODate } from '@/shared/lib/tr'
import { useIsDesktop } from '@/shared/lib/use-media-query'
import {
  countActiveFilters,
  parseSearchState,
  resultsPath,
  serializeSearchState,
} from '@/shared/lib/search-params'
import { cityBySlug, type City } from '@/shared/api/catalog'
import { datePricesQuery, tripSearchQuery } from '@/shared/api/queries'
import type { SortKey, TripFilters } from '@/shared/api/mock-server'
import { TripCard } from '@/features/trip-results/TripCard'
import { FilterRail } from '@/features/trip-results/FilterRail'
import { SortBar } from '@/features/trip-results/SortBar'
import { DateStrip } from '@/features/trip-results/DateStrip'
import { ActiveFilters } from '@/features/trip-results/ActiveFilters'
import { ResultsEmpty, ResultsError, ResultsLoading } from '@/features/trip-results/ResultStates'

/**
 * `istanbul-ankara` splits on the LAST hyphen that yields two known slugs.
 * City slugs contain hyphens of their own (`afyonkarahisar-merkez` style
 * additions are one rename away), so splitting on the first one is a latent bug.
 */
function splitRoute(route: string): { from: City; to: City } | null {
  const parts = route.split('-')
  for (let cut = parts.length - 1; cut >= 1; cut--) {
    const from = cityBySlug(parts.slice(0, cut).join('-'))
    const to = cityBySlug(parts.slice(cut).join('-'))
    if (from && to) return { from, to }
  }
  return null
}

export default function ResultsPage() {
  const params = useParams<{ route: string; date: string }>()
  const route = params.route ?? ''
  const date = params.date ?? ''

  const cities = useMemo(() => splitRoute(route), [route])
  const dateValid = isValidISODate(date)
  const valid = cities !== null && dateValid

  useEffect(() => {
    document.title = cities
      ? `${cities.from.name} - ${cities.to.name} otobüs bileti | BusLinker`
      : 'Geçersiz arama | BusLinker'
  }, [cities])

  if (!valid || !cities) return <InvalidSearch route={route} date={date} dateValid={dateValid} />

  // Remounting on route change keeps every piece of local state (the sheet, the
  // price draft, the announcement) honest without a pile of reset effects.
  return (
    <ResultsView
      key={`${cities.from.id}-${cities.to.id}-${date}`}
      from={cities.from}
      to={cities.to}
      date={date}
    />
  )
}

function ResultsView({ from, to, date }: { from: City; to: City; date: string }) {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { sort, filters } = useMemo(() => parseSearchState(searchParams), [searchParams])
  const activeFilterCount = countActiveFilters(filters)

  // The rail lives in the left column from lg up, so the sheet is derived
  // closed there rather than closed by an effect after the breakpoint flips.
  const [sheetRequested, setSheetRequested] = useState(false)
  const filterButtonRef = useRef<HTMLButtonElement>(null)
  const isDesktop = useIsDesktop()
  const sheetOpen = sheetRequested && !isDesktop

  const query = useQuery(tripSearchQuery({ from: from.id, to: to.id, date, filters, sort }))
  const { data, isPending, isError, isFetching, refetch } = query
  const total = data?.total ?? 0

  const datePrices = useQuery(datePricesQuery(from.id, to.id, date))

  const write = useCallback(
    (next: { sort: SortKey; filters: TripFilters }) => {
      setSearchParams(serializeSearchState(next), { replace: true, preventScrollReset: true })
    },
    [setSearchParams],
  )

  const onFiltersChange = useCallback(
    (next: TripFilters) => write({ sort, filters: next }),
    [sort, write],
  )
  const onSortChange = useCallback(
    (next: SortKey) => write({ sort: next, filters }),
    [filters, write],
  )
  const clearFilters = useCallback(() => onFiltersChange({}), [onFiltersChange])

  // Announced once the count settles, so a burst of filter clicks does not
  // queue up four sentences in the screen reader.
  const [announcement, setAnnouncement] = useState('')
  const settled = data !== undefined && !isFetching
  useEffect(() => {
    if (!settled) return
    const timer = setTimeout(() => setAnnouncement(t('results.found', { count: total })), 400)
    return () => clearTimeout(timer)
    // `t` changes identity when the language does, which is exactly when the
    // announcement should be re-made in the new language.
  }, [settled, total, t])

  const nearestDate = useMemo(() => {
    const days = datePrices.data
    if (!days) return undefined
    // Istanbul, not the viewer: otherwise a day still on sale in Turkey is
    // skipped as past, or a departed day is offered.
    const today = toISODate(new Date())
    const candidates = days
      .filter((d) => d.count > 0 && d.date !== date && d.date >= today)
      .sort(
        (a, b) =>
          Math.abs(fromISODate(a.date).getTime() - fromISODate(date).getTime()) -
          Math.abs(fromISODate(b.date).getTime() - fromISODate(date).getTime()),
      )
    const nearest = candidates[0]
    if (!nearest) return undefined
    return { date: nearest.date, href: resultsPath(from.slug, to.slug, nearest.date) }
  }, [datePrices.data, date, from.slug, to.slug])

  const rail = <FilterRail result={data} filters={filters} sort={sort} onChange={onFiltersChange} />

  return (
    <>
      {/* The strip floats on the page ground on its own shadow; a white
          band with a rule under it was a second frame around it. */}
      <div className="bg-bg">
        <div className="app-container py-4 sm:py-6">
          <h1 className="sr-only">
            {from.name} — {to.name} otobüs bileti, {formatDateLong(date)}
          </h1>
          <SearchForm variant="compact" initial={{ from, to, date }} />
        </div>
      </div>

      <div className="app-container pb-16">
        <div className="pt-4 sm:pt-6">
          <DateStrip from={from} to={to} date={date} />
        </div>

        <div className="mt-6 grid items-start gap-8 lg:mt-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside
            aria-label="Sefer filtreleri"
            className={cn(
              'hidden lg:block',
              'lg:sticky lg:top-[calc(var(--header-h,4.5rem)+1.5rem)]',
              'lg:max-h-[calc(100dvh-var(--header-h,4.5rem)-3rem)] lg:overflow-y-auto lg:pe-2',
            )}
          >
            {rail}
          </aside>

          <section className="min-w-0" aria-label="Sefer sonuçları">
            <SortBar
              total={total}
              sort={sort}
              onSortChange={onSortChange}
              onOpenFilters={() => setSheetRequested(true)}
              filterButtonRef={filterButtonRef}
              activeFilterCount={activeFilterCount}
            />

            <p className="sr-only" role="status" aria-live="polite">
              {announcement}
            </p>

            <ActiveFilters
              result={data}
              filters={filters}
              onChange={onFiltersChange}
              className="pt-4"
            />

            <div className="pt-4">
              {isError ? (
                <ResultsError onRetry={() => void refetch()} />
              ) : isPending || !data ? (
                <ResultsLoading />
              ) : data.total === 0 ? (
                <ResultsEmpty
                  hasFilters={activeFilterCount > 0}
                  onClear={clearFilters}
                  {...(nearestDate && { nearestDate })}
                />
              ) : (
                <ul
                  className={cn(
                    'space-y-3 transition-opacity duration-(--duration-base)',
                    isFetching && 'opacity-60',
                  )}
                  aria-busy={isFetching || undefined}
                >
                  {data.trips.map((trip) => (
                    <li key={trip.id}>
                      <TripCard trip={trip} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>

      <Dialog open={sheetOpen} onOpenChange={setSheetRequested}>
        <DialogContent
          // The sheet has no DialogTrigger (it is opened from SortBar), so
          // Radix has no element to restore focus to and would drop it on
          // <body>. Send it back to the button that opened the sheet.
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            const button = filterButtonRef.current
            // offsetParent is null once the button is hidden at lg, where the
            // sheet cannot be open anyway; guarding it avoids focusing nothing.
            if (button?.isConnected && button.offsetParent !== null) button.focus()
          }}
          side="bottom"
          title={t('results.filters')}
          description={`${from.name} — ${to.name}`}
          className="lg:hidden"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <FilterRail
              result={data}
              filters={filters}
              sort={sort}
              onChange={onFiltersChange}
              headingLevel="p"
            />
          </div>
          <div className="border-t border-border bg-surface px-5 py-4">
            <DialogClose asChild>
              <Button variant="primary" size="lg" full>
                {t('results.showAll', { count: total })}
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function InvalidSearch({
  route,
  date,
  dateValid,
}: {
  route: string
  date: string
  dateValid: boolean
}) {
  return (
    <div className="app-container section-y">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-5 text-center" role="alert">
        <span className="grid size-14 place-items-center rounded-full bg-surface-sunken text-fg-muted">
          <CompassIcon className="size-7" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-balance-tr text-fg">
            Geçersiz arama
          </h1>
          <p className="text-sm text-balance-tr text-fg-secondary">
            {dateValid
              ? `“${route}” güzergâhını tanıyamadık. Adres satırındaki şehir adları hatalı olabilir.`
              : `“${date}” geçerli bir tarih değil. Tarih YYYY-AA-GG biçiminde olmalı.`}
          </p>
        </div>
        <Button asChild variant="primary" size="lg">
          <Link to="/">Ana sayfaya dön</Link>
        </Button>
      </div>
    </div>
  )
}
