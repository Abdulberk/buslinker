import { z } from 'zod'
import type { SortKey, TripFilters } from '@/shared/api/mock-server'
import { tokenToLayout, type SeatLayout } from '@/entities/deck/layouts'

/**
 * The URL is the single source of truth for a search.
 *
 * Multi-value facets are serialised as REPEATED keys (`?op=metro&op=varan`),
 * not comma-joined: repeated keys are native to `URLSearchParams`, need no
 * delimiter escaping, and are what crawlers expect.
 *
 * Seat layout travels as `2p1`, never `2+1` — a literal `+` in a query string
 * decodes to a space, so `seat=2+1` silently arrives as `"2 1"`.
 *
 * Every field parses with `.catch()` rather than `.default()`, so a hand-edited
 * or stale URL degrades to a sane search instead of throwing a route error.
 */

export const SORT_KEYS = [
  'dep_asc',
  'dep_desc',
  'price_asc',
  'price_desc',
  'duration_asc',
  'arr_asc',
  'rating_desc',
] as const

/**
 * Sort orders, by translation key rather than by label: this module is imported
 * by the URL parser and the mock server as well as the UI, and none of those
 * may depend on the translation runtime.
 */
export const SORT_OPTIONS: { value: SortKey; key: string }[] = [
  { value: 'dep_asc', key: 'depAsc' },
  { value: 'dep_desc', key: 'depDesc' },
  { value: 'price_asc', key: 'priceAsc' },
  { value: 'price_desc', key: 'priceDesc' },
  { value: 'duration_asc', key: 'durationAsc' },
  { value: 'arr_asc', key: 'arrAsc' },
  { value: 'rating_desc', key: 'ratingDesc' },
]

export const DEFAULT_SORT: SortKey = 'dep_asc'

const sortSchema = z.enum(SORT_KEYS).catch(DEFAULT_SORT)

/** Canonical key order — one filter set always produces one identical URL. */
const KEY_ORDER = ['sort', 'dep', 'op', 'seat', 'amen', 'dterm', 'aterm', 'pmin', 'pmax'] as const

export interface SearchState {
  readonly sort: SortKey
  readonly filters: TripFilters
}

function readAll(params: URLSearchParams, key: string): string[] {
  return params.getAll(key).filter((v) => v.length > 0)
}

export function parseSearchState(params: URLSearchParams): SearchState {
  const layouts = readAll(params, 'seat')
    .map(tokenToLayout)
    .filter((l): l is SeatLayout => l !== null)

  const num = (key: string): number | undefined => {
    const raw = params.get(key)
    if (raw === null) return undefined
    const value = Number(raw)
    return Number.isFinite(value) && value >= 0 ? value : undefined
  }

  const bands = readAll(params, 'dep')
  const operators = readAll(params, 'op')
  const amenities = readAll(params, 'amen')
  const fromTerminals = readAll(params, 'dterm')
  const toTerminals = readAll(params, 'aterm')
  const priceMin = num('pmin')
  const priceMax = num('pmax')

  return {
    sort: sortSchema.parse(params.get('sort') ?? undefined),
    filters: {
      ...(bands.length > 0 && { bands }),
      ...(operators.length > 0 && { operators }),
      ...(layouts.length > 0 && { layouts }),
      ...(amenities.length > 0 && { amenities }),
      ...(fromTerminals.length > 0 && { fromTerminals }),
      ...(toTerminals.length > 0 && { toTerminals }),
      ...(priceMin !== undefined && { priceMin }),
      ...(priceMax !== undefined && { priceMax }),
    },
  }
}

/** Serialises state back to a URL with keys in canonical order and values sorted. */
export function serializeSearchState(state: SearchState): URLSearchParams {
  const params = new URLSearchParams()
  const push = (key: string, values: readonly string[] | undefined) => {
    if (!values || values.length === 0) return
    for (const value of [...values].sort()) params.append(key, value)
  }

  const bag: Record<(typeof KEY_ORDER)[number], () => void> = {
    sort: () => {
      if (state.sort !== DEFAULT_SORT) params.set('sort', state.sort)
    },
    dep: () => push('dep', state.filters.bands),
    op: () => push('op', state.filters.operators),
    seat: () =>
      push(
        'seat',
        state.filters.layouts?.map((l) => l.replace('+', 'p')),
      ),
    amen: () => push('amen', state.filters.amenities),
    dterm: () => push('dterm', state.filters.fromTerminals),
    aterm: () => push('aterm', state.filters.toTerminals),
    pmin: () => {
      if (state.filters.priceMin !== undefined) params.set('pmin', String(state.filters.priceMin))
    },
    pmax: () => {
      if (state.filters.priceMax !== undefined) params.set('pmax', String(state.filters.priceMax))
    },
  }

  for (const key of KEY_ORDER) bag[key]()
  return params
}

/** Toggles one value inside a multi-select facet group. */
export function toggleFacet(
  filters: TripFilters,
  key: 'bands' | 'operators' | 'layouts' | 'amenities' | 'fromTerminals' | 'toTerminals',
  value: string,
): TripFilters {
  const current = filters[key] ?? []
  const next = current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value].sort()
  const out = { ...filters }
  if (next.length === 0) delete out[key]
  else Object.assign(out, { [key]: next })
  return out
}

export function countActiveFilters(filters: TripFilters): number {
  return (
    (filters.bands?.length ?? 0) +
    (filters.operators?.length ?? 0) +
    (filters.layouts?.length ?? 0) +
    (filters.amenities?.length ?? 0) +
    (filters.fromTerminals?.length ?? 0) +
    (filters.toTerminals?.length ?? 0) +
    (filters.priceMin !== undefined || filters.priceMax !== undefined ? 1 : 0)
  )
}

export const EMPTY_FILTERS: TripFilters = {}

/** `/otobus-bileti/istanbul-ankara/2026-09-04` — an SEO-indexable search path. */
export function resultsPath(
  fromSlug: string,
  toSlug: string,
  date: string,
  search?: URLSearchParams,
) {
  const query = search?.toString()
  return `/otobus-bileti/${fromSlug}-${toSlug}/${date}${query ? `?${query}` : ''}`
}

/**
 * The date-less route landing: /otobus-bileti/istanbul-ankara
 *
 * One component, but every city pair is its own indexable URL — which is where
 * a bus-ticket site actually earns its organic traffic. The dated variant of
 * this same path is the results page.
 */
export function routePath(fromSlug: string, toSlug: string) {
  return `/otobus-bileti/${fromSlug}-${toSlug}`
}

export function cityPath(slug: string) {
  return `/sehir/${slug}`
}

export function tripPath(tripId: string) {
  return `/sefer/${tripId}`
}

export function campaignPath(id: string) {
  return `/kampanya/${id}`
}

export function blogPath(slug: string) {
  return `/blog/${slug}`
}

export function checkoutSuccessPath(tripId: string) {
  return `/odeme/${tripId}/onay`
}

/**
 * Splits a `:route` param back into two city slugs.
 *
 * A slug can itself contain a hyphen, so this cannot naively split on the
 * first one — it tries every boundary and returns the pair that both resolve.
 */
export function parseRouteParam(
  raw: string,
  resolve: (slug: string) => unknown,
): { from: string; to: string } | null {
  const parts = raw.split('-')
  for (let i = 1; i < parts.length; i++) {
    const from = parts.slice(0, i).join('-')
    const to = parts.slice(i).join('-')
    if (resolve(from) && resolve(to)) return { from, to }
  }
  return null
}

export function seatPath(tripId: string) {
  return `/koltuk/${tripId}`
}

export function checkoutPath(tripId: string) {
  return `/odeme/${tripId}`
}
