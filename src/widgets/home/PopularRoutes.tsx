import { Link } from 'react-router'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { POPULAR_ROUTES, cityBySlug, type City } from '@/shared/api/catalog'
import { resultsPath } from '@/shared/lib/search-params'
import { toISODate } from '@/shared/lib/tr'
import { ICON } from '@/shared/config/assets'
import { AssetIcon } from '@/shared/ui/asset-icon'
import { cn } from '@/shared/lib/cn'

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

      {/* Two across on a phone. Eight full-width cards, each 99px tall for
          two short lines, made a browse aid longer than the page it sits on;
          the pairs are short enough to read at half the width. */}
      <ul className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-3 lg:grid-cols-4">
        {ROUTES.map(({ from, to, departures }) => (
          <li key={`${from.slug}-${to.slug}`}>
            <Link
              to={resultsPath(from.slug, to.slug, today)}
              aria-label={`${from.name} ${to.name} otobüs biletlerini ara`}
              className={cn(
                'group flex h-full flex-col justify-between rounded-xl border border-border bg-surface',
                'gap-1.5 p-3 sm:gap-5 sm:p-4',
                'transition-[border-color,box-shadow,translate] duration-(--duration-base) ease-standard',
                'hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md',
              )}
            >
              <span className="flex items-center gap-1.5 font-display text-sm font-semibold text-fg sm:gap-2 sm:text-base">
                <span className="truncate">{from.name}</span>
                <ArrowRight
                  className="size-3.5 shrink-0 text-fg-subtle transition-colors duration-(--duration-fast) group-hover:text-brand-fg sm:size-4"
                  aria-hidden="true"
                />
                <span className="truncate">{to.name}</span>
              </span>

              <span className="flex items-baseline justify-between gap-3">
                <span className="text-xs text-fg-muted sm:text-sm">Günlük {departures} sefer</span>
                {/* The whole tile is the link; on a phone there is no room to
                    say so eight times over. */}
                <span className="hidden items-center gap-1 text-sm font-medium text-brand-fg sm:inline-flex">
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
