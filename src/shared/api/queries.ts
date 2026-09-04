import { queryOptions } from '@tanstack/react-query'
import {
  datePrices,
  getSeatMap,
  getTrip,
  searchTrips,
  type SearchResult,
  type SortKey,
  type Trip,
  type TripFilters,
} from './mock-server'
import type { SeatMap } from '@/entities/seat/model'

/**
 * The data-access boundary. Components never touch the mock server directly;
 * swapping it for a real `fetch` means editing only this file.
 *
 * Query keys are built from CANONICAL params — array values are sorted before
 * they enter a key, or `['metro','varan']` and `['varan','metro']` become two
 * cache entries for one identical request.
 */

/** Latency so loading and skeleton states are exercised in development. */
const LATENCY_MS = import.meta.env.MODE === 'test' ? 0 : 260

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  if (ms <= 0) return Promise.resolve(value)
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

const FACET_KEYS = [
  'bands',
  'operators',
  'layouts',
  'amenities',
  'fromTerminals',
  'toTerminals',
] as const

function canonicalFilters(filters: TripFilters): TripFilters {
  const out: Record<string, unknown> = {}
  for (const key of FACET_KEYS) {
    const values = filters[key]
    if (values && values.length > 0) out[key] = [...values].sort()
  }
  if (filters.priceMin !== undefined) out.priceMin = filters.priceMin
  if (filters.priceMax !== undefined) out.priceMax = filters.priceMax
  return out
}

export const queryKeys = {
  all: ['buslinker'] as const,
  trips: () => [...queryKeys.all, 'trips'] as const,
  tripSearch: (from: string, to: string, date: string, filters: TripFilters, sort: SortKey) =>
    [
      ...queryKeys.trips(),
      'search',
      { from, to, date, filters: canonicalFilters(filters), sort },
    ] as const,
  datePrices: (from: string, to: string, date: string) =>
    [...queryKeys.trips(), 'date-prices', { from, to, date }] as const,
  trip: (id: string) => [...queryKeys.trips(), 'detail', id] as const,
  seatMap: (id: string) => [...queryKeys.all, 'seat-map', id] as const,
}

export function tripSearchQuery(params: {
  from: string
  to: string
  date: string
  filters: TripFilters
  sort: SortKey
}) {
  return queryOptions<SearchResult>({
    queryKey: queryKeys.tripSearch(
      params.from,
      params.to,
      params.date,
      params.filters,
      params.sort,
    ),
    queryFn: () => delay(searchTrips(params)),
    // Results are stable for a given query, so keep the previous page visible
    // while a filter change refetches — that is what keeps CLS at zero.
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  })
}

export function datePricesQuery(from: string, to: string, date: string) {
  return queryOptions({
    queryKey: queryKeys.datePrices(from, to, date),
    queryFn: () => delay(datePrices(from, to, date)),
    staleTime: 5 * 60_000,
  })
}

export function tripQuery(id: string) {
  return queryOptions<Trip>({
    queryKey: queryKeys.trip(id),
    queryFn: async () => {
      const trip = getTrip(id)
      if (!trip) throw new NotFoundError('Sefer bulunamadı.')
      return delay(trip)
    },
    staleTime: 60_000,
    retry: (count, error) => !(error instanceof NotFoundError) && count < 2,
  })
}

export function seatMapQuery(id: string) {
  return queryOptions<SeatMap>({
    queryKey: queryKeys.seatMap(id),
    queryFn: async () => {
      const map = getSeatMap(id)
      if (!map) throw new NotFoundError('Koltuk planı bulunamadı.')
      return delay(map, LATENCY_MS + 120)
    },
    // Occupancy is the one thing that genuinely goes stale.
    staleTime: 30_000,
    retry: (count, error) => !(error instanceof NotFoundError) && count < 2,
  })
}

export class NotFoundError extends Error {
  override readonly name = 'NotFoundError'
}
