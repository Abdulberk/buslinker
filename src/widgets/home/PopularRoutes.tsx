import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { resultsPath } from '@/shared/lib/search-params'
import { formatPrice, pluralTr, toISODate } from '@/shared/lib/tr'
import { cn } from '@/shared/lib/cn'
import { linkCard } from './card-recipes'
import { popularRouteStats, type RouteStats } from './route-stats'
import { SectionHeading, SectionMore } from './SectionHeading'

export function PopularRoutes() {
  // Today, because that is the hero's default date and the day each card
  // links to: the count and the fare describe exactly the list the click
  // opens. Memoised on the date string, so a re-render does not re-run eight
  // searches, while a page left open past midnight still moves on.
  const today = toISODate(new Date())
  // Read once per mount: the cards only need to know which of today's coaches
  // have already gone, not to tick.
  const [now] = useState(Date.now)
  const routes = useMemo(() => popularRouteStats(today, now), [today, now])

  return (
    <>
      <SectionHeading
        id="populer-seferler"
        title="Popüler seferler"
        lead="En çok aranan güzergâhlarda bugünkü sefer sayısını ve en uygun ücreti görün."
        more={{ to: '/populer-seferler', context: 'Popüler seferler' }}
      />

      {/* Two across on a phone, four from md. At 820px two columns made eight
          wide, mostly empty cards. Four do not always fit a pair of names on
          one line, so the route wraps (see RouteCard) instead of truncating. */}
      <ul className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-3 md:grid-cols-4">
        {routes.map((route) => (
          <li key={`${route.from.slug}-${route.to.slug}`}>
            <RouteCard route={route} date={today} />
          </li>
        ))}
      </ul>

      <SectionMore to="/populer-seferler" label="Tüm popüler seferler" />
    </>
  )
}

function RouteCard({ route, date }: { route: RouteStats; date: string }) {
  const { from, to, departures, cheapest } = route
  const price = cheapest === null ? null : formatPrice(cheapest)
  const count = pluralTr(departures, 'sefer')

  return (
    <Link
      to={resultsPath(from.slug, to.slug, date)}
      // Opens with the visible city names, so a voice user who says what they
      // see still hits it (SC 2.5.3); the rest says what the bare figures mean.
      aria-label={
        price === null
          ? `${from.name} ${to.name}, bugün sefer yok`
          : `${from.name} ${to.name}, bugün ${count}, en düşük ücret ${price}`
      }
      className={cn(
        linkCard,
        'group @container flex h-full flex-col justify-between gap-2 p-3 sm:gap-4 sm:p-4',
      )}
    >
      {/* Wraps rather than truncating: "İstanb… → Anka…" told nobody where the
          coach goes. The arrow stays with the departure city, so a long pair
          breaks as "İstanbul →" over "Ankara" and still reads as a route. */}
      <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-display text-sm font-semibold text-fg sm:gap-x-2 sm:text-base">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap sm:gap-2">
          {from.name}
          <ArrowRight
            className="size-3.5 shrink-0 text-fg-subtle transition-colors duration-(--duration-fast) group-hover:text-brand-fg sm:size-4"
            aria-hidden="true"
          />
        </span>
        <span className="whitespace-nowrap">{to.name}</span>
      </span>

      {/* One row when the card can hold the count and the fare side by side,
          two rows when it cannot. Decided by the card's own width, not the
          viewport's, so all eight cards switch together instead of each
          wrapping wherever its own fare happens to run long.

          The fare is introduced by words of its own instead of a suffix glued
          onto a figure that changes every day: "En düşük" stays correct
          whatever the number is, and it says plainly that this is the floor of
          the day, not the price of every seat. */}
      <span className="flex flex-col gap-0.5 @min-[17rem]:flex-row @min-[17rem]:items-baseline @min-[17rem]:justify-between @min-[17rem]:gap-3">
        <span className="text-xs text-fg-muted sm:text-sm">
          {price === null ? 'Bugün sefer yok' : <>Bugün {count}</>}
        </span>
        {price === null ? null : (
          <span className="flex flex-wrap items-baseline gap-x-1">
            <span className="text-xs text-fg-muted">En düşük</span>
            <span
              className="font-display text-base font-semibold whitespace-nowrap text-fg"
              data-numeric
            >
              {price}
            </span>
          </span>
        )}
      </span>
    </Link>
  )
}
