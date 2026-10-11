import { POPULAR_ROUTES, cityBySlug, type City } from '@/shared/api/catalog'
import { searchTrips } from '@/shared/api/mock-server'

export interface RouteStats {
  readonly from: City
  readonly to: City
  /** Every departure listed for the day, exactly what the results page counts. */
  readonly departures: number
  /** The lowest fare of the day in lira, or null when nothing runs. */
  readonly cheapest: number | null
}

/**
 * The figures a popular-route card shows, asked of the same mock server the
 * results page reads.
 *
 * The card used to hash the city pair into a number between 22 and 68, so it
 * promised "Günlük 54 sefer" and the click then listed 15. A number on a card
 * has to be the number its link delivers, so both now come from `searchTrips`
 * for the same day — and the fare, which is what the choice actually turns on,
 * comes along with it.
 */
export function routeStats(from: City, to: City, date: string, now?: number): RouteStats {
  // `now` drops coaches that have already left, exactly as the results page
  // does; without it the card could quote a fare the click no longer lists.
  const result = searchTrips({
    from: from.id,
    to: to.id,
    date,
    sort: 'price_asc',
    ...(now === undefined ? {} : { now }),
  })
  return {
    from,
    to,
    departures: result.totalUnfiltered,
    cheapest: result.trips[0]?.price ?? null,
  }
}

/**
 * The home page's popular routes for one day, in catalogue order.
 *
 * The order is kept rather than sorted by fare: it is the order the corridors
 * are searched in, and a list that reshuffles every day is harder to find your
 * usual route in.
 */
export function popularRouteStats(date: string, now?: number): readonly RouteStats[] {
  return POPULAR_ROUTES.flatMap(({ from, to }) => {
    const origin = cityBySlug(from)
    const destination = cityBySlug(to)
    return origin && destination ? [routeStats(origin, destination, date, now)] : []
  })
}
