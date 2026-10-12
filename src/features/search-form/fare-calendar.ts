import { datePrices, type DayPrice } from '@/shared/api/mock-server'

/**
 * How far ahead the date pickers carry fares. Every day costs a timetable, so
 * the window is computed once per route and kept to two months; later days
 * show their date alone, as the pickers did before fares.
 */
export const FARE_CALENDAR_DAYS = 60

export interface FareCalendar {
  /** ISO day to the lowest fare still on sale that day, in lira. Days without trips are absent. */
  readonly prices: ReadonlyMap<string, number>
  /** The ISO days whose fare is the lowest of their calendar month. */
  readonly best: ReadonlySet<string>
}

export interface DayFare {
  readonly price: number
  /** The lowest fare of its month: the day the calendar points at. */
  readonly best: boolean
}

/**
 * Indexes a run of daily fares and marks each month's cheapest day.
 *
 * Every day tied at a month's lowest fare is marked, since any of them is as
 * good a deal as the others. A month whose priced days all cost the same has
 * no deal to point at, so it marks none: an accent on every day says nothing.
 * Returns null when no day has a fare at all, so a route without service
 * leaves the picker exactly as it is without a route.
 */
export function buildFareCalendar(days: readonly DayPrice[]): FareCalendar | null {
  const prices = new Map<string, number>()
  const lowest = new Map<string, number>()
  const highest = new Map<string, number>()
  for (const day of days) {
    if (day.minPrice === null) continue
    const month = day.date.slice(0, 7)
    prices.set(day.date, day.minPrice)
    lowest.set(month, Math.min(lowest.get(month) ?? Infinity, day.minPrice))
    highest.set(month, Math.max(highest.get(month) ?? -Infinity, day.minPrice))
  }
  if (prices.size === 0) return null

  const best = new Set<string>()
  for (const [date, price] of prices) {
    const month = date.slice(0, 7)
    if (price === lowest.get(month) && price < (highest.get(month) ?? price)) best.add(date)
  }
  return { prices, best }
}

/**
 * The fare one day button shows, or null for a plain date.
 *
 * A day spilling in from a neighbouring month shows no fare: its accent is
 * measured against its own month, and drawn here it would put next month's
 * best among this month's. A disabled day cannot be chosen, so its fare is
 * nothing anyone can act on.
 */
export function fareOn(
  calendar: FareCalendar | null,
  iso: string,
  modifiers: { readonly outside?: boolean; readonly disabled?: boolean },
): DayFare | null {
  if (!calendar || modifiers.outside || modifiers.disabled) return null
  const price = calendar.prices.get(iso)
  return price === undefined ? null : { price, best: calendar.best.has(iso) }
}

/**
 * The calendar for one route, starting at the first selectable day.
 *
 * A plain function, not inline in a component, because it reads the clock:
 * today's fare counts only the coaches still on sale, as the results strip's
 * does. The caller memoises it per route, so sixty timetables are built once
 * when both cities are known, not on every render of the form.
 */
export function fareCalendarFor(from: string, to: string, start: string): FareCalendar | null {
  return buildFareCalendar(datePrices(from, to, start, FARE_CALENDAR_DAYS, Date.now()))
}
