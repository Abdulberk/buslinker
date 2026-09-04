import { useEffect, useMemo } from 'react'
import { Link } from 'react-router'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { POPULAR_ROUTES, cityBySlug, type City } from '@/shared/api/catalog'
import { searchTrips } from '@/shared/api/mock-server'
import { resultsPath } from '@/shared/lib/search-params'
import {
  formatDateLong,
  formatDuration,
  formatPrice,
  fromISODate,
  pluralTr,
  toISODate,
} from '@/shared/lib/tr'

/** Every figure on this page is quoted for tomorrow, the first bookable day. */
function tomorrowISO(): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return toISODate(date)
}

interface RouteRow {
  readonly from: City
  readonly to: City
  readonly departures: number
  readonly cheapest: number | null
  readonly shortestMin: number | null
}

function buildRows(date: string): readonly RouteRow[] {
  return POPULAR_ROUTES.flatMap(({ from, to }) => {
    const origin = cityBySlug(from)
    const destination = cityBySlug(to)
    if (!origin || !destination) return []

    const result = searchTrips({ from: origin.id, to: destination.id, date, sort: 'price_asc' })
    const cheapest = result.trips[0]

    return [
      {
        from: origin,
        to: destination,
        departures: result.totalUnfiltered,
        cheapest: cheapest?.price ?? null,
        shortestMin:
          result.trips.length > 0 ? Math.min(...result.trips.map((t) => t.durationMin)) : null,
      },
    ]
    // A corridor with no departures sorts last instead of being dropped, so the
    // list of popular routes stays the same length every day.
  }).sort(
    (a, b) => (a.cheapest ?? Number.POSITIVE_INFINITY) - (b.cheapest ?? Number.POSITIVE_INFINITY),
  )
}

export default function PopularRoutesPage() {
  useEffect(() => {
    document.title = 'Popüler Seferler | BusLinker'
  }, [])

  const date = useMemo(() => tomorrowISO(), [])
  const rows = useMemo(() => buildRows(date), [date])
  const dateLabel = formatDateLong(fromISODate(date))

  return (
    <>
      <PageHeader
        title="Popüler Seferler"
        lead="En çok aranan güzergâhların günlük sefer sayısını, en uygun ücretini ve en kısa yolculuk süresini karşılaştırın."
        breadcrumbs={[{ label: 'Ana sayfa', to: '/' }]}
      />

      <div className="app-container section-y">
        <p className="max-w-prose text-sm text-fg-muted">
          Ücretler ve süreler {dateLabel} tarihli aramalardan alınmıştır. En uygun ücreti olan
          güzergâh başta listelenir.
        </p>

        {/* Mobile: one card per route. The table below carries the same rows for
            wide screens, where a real table is the readable form. */}
        <ul className="mt-6 flex flex-col gap-3 md:hidden">
          {rows.map((row) => (
            <li key={`${row.from.slug}-${row.to.slug}`}>
              <Link
                to={resultsPath(row.from.slug, row.to.slug, date)}
                aria-label={`${row.from.name} ${row.to.name} seferlerini görüntüleyin`}
                className="group flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-[border-color,box-shadow] duration-(--duration-base) ease-standard hover:border-brand/40 hover:shadow-md"
              >
                <span className="flex items-center gap-2 font-display text-base font-semibold text-fg">
                  <span className="truncate">{row.from.name}</span>
                  <ArrowRight
                    className="size-4 shrink-0 text-fg-subtle transition-colors duration-(--duration-fast) group-hover:text-brand-fg"
                    aria-hidden="true"
                  />
                  <span className="truncate">{row.to.name}</span>
                </span>

                {row.cheapest === null || row.shortestMin === null ? (
                  <span className="text-sm text-fg-secondary">Sefer bulunamadı</span>
                ) : (
                  <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
                    <span className="text-fg-muted">
                      Günlük {pluralTr(row.departures, 'sefer')}
                    </span>
                    <span className="text-fg-muted">
                      En kısa{' '}
                      <span className="text-fg-secondary" data-numeric>
                        {formatDuration(row.shortestMin)}
                      </span>
                    </span>
                    <span
                      className="ms-auto font-display text-base font-semibold text-fg"
                      data-numeric
                    >
                      {formatPrice(row.cheapest)}
                    </span>
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 hidden overflow-x-auto md:block">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">
              Popüler güzergâhların {dateLabel} tarihli günlük sefer sayısı, en uygun ücreti ve en
              kısa yolculuk süresi
            </caption>
            <thead>
              <tr className="border-b border-border-strong">
                <th scope="col" className="py-3 pe-4 text-start font-medium text-fg-secondary">
                  Güzergâh
                </th>
                <th scope="col" className="py-3 pe-4 text-end font-medium text-fg-secondary">
                  Günlük sefer
                </th>
                <th scope="col" className="py-3 pe-4 text-end font-medium text-fg-secondary">
                  En uygun ücret
                </th>
                <th scope="col" className="py-3 pe-4 text-end font-medium text-fg-secondary">
                  En kısa süre
                </th>
                <th scope="col" className="py-3 text-end font-medium text-fg-secondary">
                  <span className="sr-only">Seferleri görüntüleyin</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={`${row.from.slug}-${row.to.slug}`}
                  className="group border-b border-border last:border-b-0 hover:bg-surface-sunken"
                >
                  <th scope="row" className="py-1 pe-4 text-start font-normal">
                    <Link
                      to={resultsPath(row.from.slug, row.to.slug, date)}
                      aria-label={`${row.from.name} ${row.to.name} seferlerini görüntüleyin`}
                      className="flex min-h-11 items-center gap-2 font-display text-base font-semibold text-fg"
                    >
                      <span>{row.from.name}</span>
                      <ArrowRight
                        className="size-4 shrink-0 text-fg-subtle transition-colors duration-(--duration-fast) group-hover:text-brand-fg"
                        aria-hidden="true"
                      />
                      <span>{row.to.name}</span>
                    </Link>
                  </th>

                  {row.cheapest === null || row.shortestMin === null ? (
                    <td colSpan={3} className="py-3 pe-4 text-end text-fg-secondary">
                      Sefer bulunamadı
                    </td>
                  ) : (
                    <>
                      <td className="py-3 pe-4 text-end text-fg-secondary" data-numeric>
                        {pluralTr(row.departures, 'sefer')}
                      </td>
                      <td className="py-3 pe-4 text-end font-medium text-fg" data-numeric>
                        {formatPrice(row.cheapest)}
                      </td>
                      <td className="py-3 pe-4 text-end text-fg-secondary" data-numeric>
                        {formatDuration(row.shortestMin)}
                      </td>
                    </>
                  )}

                  <td className="py-3 text-end">
                    <ChevronRight
                      className="ms-auto size-4 text-fg-subtle transition-transform duration-(--duration-fast) ease-out group-hover:translate-x-0.5 group-hover:text-brand-fg"
                      aria-hidden="true"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
