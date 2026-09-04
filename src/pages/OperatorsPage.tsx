import { useEffect, useMemo } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight, Sparkles, Star } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { OperatorLogo } from '@/shared/ui/operator-logo'
import { AMENITIES, OPERATORS, POPULAR_ROUTES, cityBySlug } from '@/shared/api/catalog'
import { searchTrips, type Trip } from '@/shared/api/mock-server'
import { formatDateLong, formatPrice, fromISODate, toISODate } from '@/shared/lib/tr'

/** Every figure on this page is quoted for tomorrow, the first bookable day. */
function tomorrowISO(): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return toISODate(date)
}

/** Ratings are one-decimal and have no formatter of their own in `tr`. */
const ratingFmt = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

interface OperatorProfile {
  readonly layouts: readonly string[]
  readonly amenityLabels: readonly string[]
  readonly corridors: number
  readonly cheapest: number | null
}

/**
 * Every fact on this page is read back out of the same generator the results
 * page uses, so nothing here is a claim about a real carrier's fleet — it is a
 * description of what the listings actually contain for tomorrow.
 */
function buildProfiles(date: string): Map<string, OperatorProfile> {
  // Searched once per corridor and then bucketed, rather than once per
  // corridor per carrier — the generator rebuilds the whole day each call.
  const perRoute: Trip[][] = POPULAR_ROUTES.flatMap(({ from, to }) => {
    const origin = cityBySlug(from)
    const destination = cityBySlug(to)
    if (!origin || !destination) return []
    return [[...searchTrips({ from: origin.id, to: destination.id, date }).trips]]
  })

  const profiles = new Map<string, OperatorProfile>()

  for (const operator of OPERATORS) {
    const routes = perRoute.map((trips) => trips.filter((t) => t.operatorId === operator.id))
    const trips = routes.flat()

    const layouts = (['2+1', '2+2'] as const).filter((layout) =>
      trips.some((t) => t.seatLayout === layout),
    )

    const amenityLabels =
      trips.length === 0
        ? []
        : AMENITIES.map((amenity) => ({
            label: amenity.label,
            share: trips.filter((t) => t.amenities.includes(amenity.id)).length / trips.length,
          }))
            .filter((entry) => entry.share >= 0.5)
            .sort((a, b) => b.share - a.share)
            .slice(0, 3)
            .map((entry) => entry.label)

    const prices = trips.map((t) => t.price)

    profiles.set(operator.id, {
      layouts,
      amenityLabels,
      corridors: routes.filter((trips) => trips.length > 0).length,
      cheapest: prices.length > 0 ? Math.min(...prices) : null,
    })
  }

  return profiles
}

export default function OperatorsPage() {
  useEffect(() => {
    document.title = 'Otobüs Firmaları | BusLinker'
  }, [])

  const date = useMemo(() => tomorrowISO(), [])
  const profiles = useMemo(() => buildProfiles(date), [date])

  return (
    <>
      <PageHeader
        title="Otobüs Firmaları"
        lead="BusLinker üzerinden bilet alabileceğiniz otobüs firmalarını, yolcu puanlarını ve seferlerinde öne çıkan hizmetleri tek sayfada karşılaştırın."
        breadcrumbs={[{ label: 'Ana sayfa', to: '/' }]}
      />

      <div className="app-container section-y">
        <p className="max-w-prose text-sm text-fg-muted">
          Aşağıdaki koltuk düzeni, hizmet ve fiyat bilgileri {formatDateLong(fromISODate(date))}{' '}
          tarihli popüler hat aramalarından derlenmiştir; seçtiğiniz güzergâha göre değişebilir.
        </p>

        <ul className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
          {OPERATORS.map((operator) => {
            const profile = profiles.get(operator.id)
            const rating = ratingFmt.format(operator.rating)

            return (
              <li key={operator.id}>
                <Link
                  to={`/otobus-firmalari/${operator.id}`}
                  className="group flex h-full flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-xs transition-[border-color,box-shadow,translate] duration-(--duration-base) ease-standard hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <OperatorLogo operatorId={operator.id} className="size-16" />
                    <div className="min-w-0">
                      <h2 className="font-display text-lg font-semibold text-balance-tr text-fg">
                        {operator.name}
                      </h2>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-sm text-fg-muted">
                          <Star
                            className="size-3.5 text-warning"
                            fill="currentColor"
                            aria-hidden="true"
                          />
                          <span data-numeric>{rating}</span>
                          <span className="sr-only">puan, 10 üzerinden</span>
                        </span>
                        {operator.premium ? (
                          <Badge tone="brand" size="sm">
                            <Sparkles aria-hidden="true" />
                            Premium
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <dl className="flex flex-col gap-2 text-sm">
                    <Fact
                      label="Koltuk düzeni"
                      value={
                        profile && profile.layouts.length > 0
                          ? profile.layouts.join(' ve ')
                          : 'Sefere göre değişiyor'
                      }
                    />
                    <Fact
                      label="Popüler hatlar"
                      value={`${POPULAR_ROUTES.length} popüler hattın ${profile?.corridors ?? 0} tanesinde`}
                    />
                    <Fact
                      label="Sık sunulan"
                      value={
                        profile && profile.amenityLabels.length > 0
                          ? profile.amenityLabels.join(', ')
                          : 'Sefere göre değişiyor'
                      }
                    />
                  </dl>

                  <div className="mt-auto flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t border-border pt-4">
                    <span className="text-sm text-fg-muted">
                      {profile?.cheapest === null || profile === undefined ? (
                        'Yarın için sefer listelenmedi'
                      ) : (
                        <>
                          Yarın en uygun{' '}
                          <span className="font-medium text-fg" data-numeric>
                            {formatPrice(profile.cheapest)}
                          </span>
                        </>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-fg">
                      İnceleyin
                      <ArrowUpRight
                        className="size-4 transition-transform duration-(--duration-fast) ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-28 shrink-0 text-fg-muted">{label}</dt>
      <dd className="min-w-0 text-fg-secondary">{value}</dd>
    </div>
  )
}
