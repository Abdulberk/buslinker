import { cityById, type City } from '@/shared/api/catalog'
import { isValidISODate, toISODate } from '@/shared/lib/tr'

/**
 * The last few searches, kept in this browser only. It is a convenience — a
 * returning visitor finds the form already holding the trip they looked up
 * last — so every read and write is wrapped: a private window, blocked site
 * data or a full quota leave the form empty, never broken.
 */
const STORAGE_KEY = 'bl-recent-searches'
const MAX_SEARCHES = 5

export interface RecentSearch {
  /** City ids, which are plate numbers: a spelling can change, a plate does not. */
  from: string
  to: string
  /** ISO `YYYY-MM-DD`. */
  date: string
}

function isRecentSearch(value: unknown): value is RecentSearch {
  if (typeof value !== 'object' || value === null) return false
  const { from, to, date } = value as Record<string, unknown>
  return typeof from === 'string' && typeof to === 'string' && typeof date === 'string'
}

/**
 * Newest first. Anything this build cannot use — a city that no longer exists,
 * a hand-edited entry, another app's data under the same key — is dropped
 * rather than trusted.
 */
export function readRecentSearches(): RecentSearch[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(isRecentSearch)
      .filter((s) => s.from !== s.to && cityById(s.from) && cityById(s.to))
      .slice(0, MAX_SEARCHES)
  } catch {
    return []
  }
}

/** Puts a search at the front; the same pair searched again moves up, not in twice. */
export function rememberSearch(search: RecentSearch): void {
  try {
    const rest = readRecentSearches().filter((s) => s.from !== search.from || s.to !== search.to)
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([search, ...rest].slice(0, MAX_SEARCHES)),
    )
  } catch {
    // Storage is unavailable or full. Nothing is remembered and nothing breaks.
  }
}

/**
 * The last search, ready to put back in the form. A date that has passed
 * becomes today: a search for yesterday cannot be run, and a form that opens
 * holding one would greet a returning visitor with an error.
 */
export function lastSearch(
  today: string = toISODate(new Date()),
): { from: City; to: City; date: string } | null {
  const last = readRecentSearches()[0]
  if (!last) return null
  const from = cityById(last.from)
  const to = cityById(last.to)
  if (!from || !to) return null
  return { from, to, date: isValidISODate(last.date) && last.date >= today ? last.date : today }
}

/** The distinct cities that recently filled one end of a search, newest first. */
export function recentCities(end: 'from' | 'to', limit = 3): City[] {
  const cities: City[] = []
  for (const search of readRecentSearches()) {
    const city = cityById(search[end])
    if (city && !cities.some((c) => c.id === city.id)) cities.push(city)
    if (cities.length === limit) break
  }
  return cities
}
