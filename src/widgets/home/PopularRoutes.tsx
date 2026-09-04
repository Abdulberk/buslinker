import { Link } from 'react-router'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { POPULAR_ROUTES, cityBySlug, type City } from '@/shared/api/catalog'
import { resultsPath } from '@/shared/lib/search-params'
import { toISODate } from '@/shared/lib/tr'
import { ICON } from '@/shared/config/assets'
import { AssetIcon } from '@/shared/ui/asset-icon'

interface Route {
  readonly from: City
  readonly to: City
  readonly departures: number
}

/** A stable per-route number, so the card shows the same figure on every render. */
function dailyDepartures(key: string): number {
  let hash = 0
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return 22 + (hash % 47)
}

const ROUTES: readonly Route[] = POPULAR_ROUTES.flatMap(({ from, to }) => {
  const origin = cityBySlug(from)
  const destination = cityBySlug(to)
  if (!origin || !destination) return []
  return [{ from: origin, to: destination, departures: dailyDepartures(`${from}>${to}`) }]
})

export function PopularRoutes() {
  const today = toISODate(new Date())

  return (
    <>
      <h2 id="populer-seferler" className="flex items-center gap-2.5 text-2xl sm:text-3xl">
        <AssetIcon src={ICON.linker} className="size-5 shrink-0 text-brand" />
        Popüler seferler
      </h2>
      <p className="mt-2 max-w-prose text-base text-fg-secondary">
        En çok aranan güzergâhlarda bugünün seferlerini ve fiyatlarını tek dokunuşla görün.
      </p>

      <ul className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 lg:grid-cols-4">
        {ROUTES.map(({ from, to, departures }) => (
          <li key={`${from.slug}-${to.slug}`}>
            <Link
              to={resultsPath(from.slug, to.slug, today)}
              aria-label={`${from.name} ${to.name} otobüs biletlerini ara`}
              className="group flex h-full flex-col justify-between gap-5 rounded-xl border border-border bg-surface p-4 transition-[border-color,box-shadow,translate] duration-(--duration-base) ease-standard hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
            >
              <span className="flex items-center gap-2 font-display text-base font-semibold text-fg">
                <span className="truncate">{from.name}</span>
                <ArrowRight
                  className="size-4 shrink-0 text-fg-subtle transition-colors duration-(--duration-fast) group-hover:text-brand-fg"
                  aria-hidden="true"
                />
                <span className="truncate">{to.name}</span>
              </span>

              <span className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-fg-muted">Günlük {departures} sefer</span>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-fg">
                  Ara
                  <ArrowUpRight
                    className="size-4 transition-transform duration-(--duration-fast) ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
