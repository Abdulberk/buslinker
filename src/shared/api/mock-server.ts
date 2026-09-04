import { layoutDeck } from '@/entities/deck/geometry'
import { DECK_IDS, DECKS, getDeck, type SeatLayout } from '@/entities/deck/layouts'
import {
  DEFAULT_POLICY,
  seatMapSchema,
  type Availability,
  type Seat,
  type SeatMap,
  type SeatPolicy,
} from '@/entities/seat/model'
import { AMENITIES, CITIES, cityById, distanceKm, OPERATORS, type AmenityId } from './catalog'
import { createRng } from '@/shared/lib/rng'
import { fromISODate, istanbulHour, toISODate, toISODateLocal, trInstant } from '@/shared/lib/tr'

/**
 * A mock backend that behaves like a real one.
 *
 * Everything is derived from a string seed, so the same route on the same day
 * always returns the same trips with the same coach and the same occupancy.
 * That is what makes the app deep-linkable and the UI testable — the old code
 * called `Math.random()` during render and reshuffled the bus on every mount.
 *
 * Facet counts are computed here rather than in the client because a count
 * must EXCLUDE its own group's selection: after you tick "Metro Turizm", the
 * Firma facet still has to show how many trips the other carriers have. That
 * cannot be derived from the filtered page of results.
 */

export interface Trip {
  readonly id: string
  readonly operatorId: string
  readonly fromCityId: string
  readonly toCityId: string
  readonly fromTerminalId: string
  readonly toTerminalId: string
  /** ISO instants. */
  readonly departsAt: string
  readonly arrivesAt: string
  readonly durationMin: number
  readonly price: number
  readonly seatLayout: SeatLayout
  readonly deckId: string
  readonly amenities: readonly AmenityId[]
  readonly seatsLeft: number
  readonly rating: number
  readonly premium: boolean
  /** True when the coach arrives on a later calendar day than it departs. */
  readonly overnight: boolean
}

export interface TripFilters {
  readonly bands?: readonly string[]
  readonly operators?: readonly string[]
  readonly layouts?: readonly string[]
  readonly amenities?: readonly string[]
  readonly fromTerminals?: readonly string[]
  readonly toTerminals?: readonly string[]
  readonly priceMin?: number
  readonly priceMax?: number
}

export type SortKey =
  'dep_asc' | 'dep_desc' | 'price_asc' | 'price_desc' | 'duration_asc' | 'arr_asc' | 'rating_desc'

export interface FacetBucket {
  readonly value: string
  readonly label: string
  readonly count: number
}

export interface SearchResult {
  readonly trips: readonly Trip[]
  readonly total: number
  readonly totalUnfiltered: number
  readonly facets: {
    readonly bands: readonly FacetBucket[]
    readonly operators: readonly FacetBucket[]
    readonly layouts: readonly FacetBucket[]
    readonly amenities: readonly FacetBucket[]
    readonly fromTerminals: readonly FacetBucket[]
    readonly toTerminals: readonly FacetBucket[]
  }
  readonly priceBounds: { readonly min: number; readonly max: number }
}

const AMENITY_IDS = AMENITIES.map((a) => a.id)

/** Deterministic trip generation for one origin/destination/date. */
function generateTrips(fromId: string, toId: string, date: string): Trip[] {
  const from = cityById(fromId)
  const to = cityById(toId)
  if (!from || !to || from.id === to.id) return []

  const rng = createRng(`${fromId}>${toId}@${date}`)
  const km = distanceKm(from, to)
  // Coaches average ~68 km/h door to door once stops are counted.
  const baseMinutes = Math.max(45, Math.round((km / 68) * 60))
  const basePrice = Math.max(220, Math.round((120 + km * 1.55) / 10) * 10)

  // Busy corridors run far more often than thin ones.
  const count = km < 200 ? rng.int(14, 22) : km < 600 ? rng.int(9, 16) : rng.int(5, 11)

  const operators = rng.sample(OPERATORS, Math.min(OPERATORS.length, rng.int(4, 7)))

  // Built without ids, because the id encodes the trip's position and the list
  // is sorted below — assigning ids first would make `getTrip(id)` resolve to a
  // different departure than the one the caller clicked.
  const draft: Omit<Trip, 'id'>[] = []
  for (let i = 0; i < count; i++) {
    const operator = operators[i % operators.length]!
    const hour = rng.int(0, 23)
    const minute = rng.pick([0, 15, 30, 45])

    // Built as a Turkish wall-clock instant. Using setHours would bake in the
    // runtime's zone, so a 09:00 departure would render as 12:30 to a UTC
    // viewer and land in the wrong departure-time band.
    const departsAt = trInstant(date, hour, minute)

    const durationMin = baseMinutes + rng.int(-25, 55)
    const arrivesAt = new Date(departsAt.getTime() + durationMin * 60_000)

    const layout: SeatLayout = operator.premium || rng.chance(0.45) ? '2+1' : '2+2'
    const deckId = rng.pick(DECK_IDS.filter((id) => DECKS[id]?.family === layout))

    const premiumFactor = operator.premium ? 1.28 : 1
    const layoutFactor = layout === '2+1' ? 1.18 : 1
    const timeFactor = hour >= 22 || hour < 6 ? 0.92 : hour >= 7 && hour <= 10 ? 1.08 : 1
    const price =
      Math.round(
        (basePrice * premiumFactor * layoutFactor * timeFactor * rng.float(0.9, 1.14)) / 5,
      ) * 5

    const amenityCount = operator.premium ? rng.int(5, 8) : rng.int(2, 6)
    const amenities = rng
      .sample(AMENITY_IDS, amenityCount)
      .sort((a, b) => AMENITY_IDS.indexOf(a) - AMENITY_IDS.indexOf(b))

    const capacity = layoutDeck(getDeck(deckId)).seatCount

    draft.push({
      operatorId: operator.id,
      fromCityId: from.id,
      toCityId: to.id,
      fromTerminalId: rng.pick(from.terminals).id,
      toTerminalId: rng.pick(to.terminals).id,
      departsAt: departsAt.toISOString(),
      arrivesAt: arrivesAt.toISOString(),
      durationMin,
      price,
      seatLayout: layout,
      deckId,
      amenities,
      // Most departures still have room; roughly one in seven is nearly full,
      // which is what drives the scarcity cue on the results card. Skewing
      // this toward "sold out" made every coach render as a wall of taken
      // seats — neither realistic nor usable.
      seatsLeft: rng.chance(0.14)
        ? rng.int(1, 5)
        : rng.int(Math.floor(capacity * 0.3), Math.floor(capacity * 0.72)),
      rating: Math.round((operator.rating + rng.float(-0.4, 0.4)) * 10) / 10,
      premium: operator.premium,
      overnight: toISODate(arrivesAt) !== toISODate(departsAt),
    })
  }

  return draft
    .sort((a, b) => a.departsAt.localeCompare(b.departsAt))
    .map((trip, index) => ({ ...trip, id: `${fromId}-${toId}-${date}-${index}` }))
}

const hourOf = (iso: string) => istanbulHour(iso)

function bandOf(iso: string): string {
  const h = hourOf(iso)
  if (h >= 6 && h < 12) return 'morning'
  if (h >= 12 && h < 18) return 'noon'
  if (h >= 18) return 'evening'
  return 'night'
}

/** One predicate per facet group, so a group can be excluded from its own count. */
const PREDICATES = {
  bands: (t: Trip, values: readonly string[]) => values.includes(bandOf(t.departsAt)),
  operators: (t: Trip, values: readonly string[]) => values.includes(t.operatorId),
  layouts: (t: Trip, values: readonly string[]) => values.includes(t.seatLayout),
  amenities: (t: Trip, values: readonly string[]) =>
    values.every((v) => t.amenities.includes(v as AmenityId)),
  fromTerminals: (t: Trip, values: readonly string[]) => values.includes(t.fromTerminalId),
  toTerminals: (t: Trip, values: readonly string[]) => values.includes(t.toTerminalId),
} as const

type FacetKey = keyof typeof PREDICATES

const FACET_KEYS = Object.keys(PREDICATES) as FacetKey[]

function activeValues(filters: TripFilters, key: FacetKey): readonly string[] {
  return filters[key] ?? []
}

/** Applies every facet group except `skip`, plus the price range. */
function applyFilters(trips: readonly Trip[], filters: TripFilters, skip?: FacetKey): Trip[] {
  return trips.filter((t) => {
    for (const key of FACET_KEYS) {
      if (key === skip) continue
      const values = activeValues(filters, key)
      if (values.length > 0 && !PREDICATES[key](t, values)) return false
    }
    if (filters.priceMin !== undefined && t.price < filters.priceMin) return false
    if (filters.priceMax !== undefined && t.price > filters.priceMax) return false
    return true
  })
}

function countBy(
  trips: readonly Trip[],
  pick: (t: Trip) => string | readonly string[],
): Map<string, number> {
  const counts = new Map<string, number>()
  for (const t of trips) {
    const value = pick(t)
    const values: readonly string[] = typeof value === 'string' ? [value] : value
    for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  return counts
}

const SORTERS: Record<SortKey, (a: Trip, b: Trip) => number> = {
  dep_asc: (a, b) => a.departsAt.localeCompare(b.departsAt),
  dep_desc: (a, b) => b.departsAt.localeCompare(a.departsAt),
  price_asc: (a, b) => a.price - b.price || a.departsAt.localeCompare(b.departsAt),
  price_desc: (a, b) => b.price - a.price || a.departsAt.localeCompare(b.departsAt),
  duration_asc: (a, b) => a.durationMin - b.durationMin || a.price - b.price,
  arr_asc: (a, b) => a.arrivesAt.localeCompare(b.arrivesAt),
  rating_desc: (a, b) => b.rating - a.rating || a.price - b.price,
}

export function searchTrips(params: {
  from: string
  to: string
  date: string
  filters?: TripFilters
  sort?: SortKey
}): SearchResult {
  const all = generateTrips(params.from, params.to, params.date)
  const filters = params.filters ?? {}
  const sort = params.sort ?? 'dep_asc'

  const trips = applyFilters(all, filters).sort(SORTERS[sort])

  const from = cityById(params.from)
  const to = cityById(params.to)

  // Each facet group is counted against the results filtered by every OTHER
  // group, so ticking one carrier does not zero out the rest of the list.
  const bandsBase = applyFilters(all, filters, 'bands')
  const operatorsBase = applyFilters(all, filters, 'operators')
  const layoutsBase = applyFilters(all, filters, 'layouts')
  const fromTermBase = applyFilters(all, filters, 'fromTerminals')
  const toTermBase = applyFilters(all, filters, 'toTerminals')

  const bandCounts = countBy(bandsBase, (t) => bandOf(t.departsAt))
  const operatorCounts = countBy(operatorsBase, (t) => t.operatorId)
  const layoutCounts = countBy(layoutsBase, (t) => t.seatLayout)
  // `amenities` is AND, not OR: ticking a second feature narrows further, so
  // its count must INCLUDE its own selection. Counting it the way the OR
  // groups are counted produced numbers larger than `total` and rows that
  // led to zero results when clicked.
  const amenityCounts = countBy(trips, (t) => t.amenities)
  const fromTermCounts = countBy(fromTermBase, (t) => t.fromTerminalId)
  const toTermCounts = countBy(toTermBase, (t) => t.toTerminalId)

  const prices = all.map((t) => t.price)

  return {
    trips,
    total: trips.length,
    totalUnfiltered: all.length,
    facets: {
      bands: [
        { value: 'morning', label: 'Sabah', count: bandCounts.get('morning') ?? 0 },
        { value: 'noon', label: 'Öğle', count: bandCounts.get('noon') ?? 0 },
        { value: 'evening', label: 'Akşam', count: bandCounts.get('evening') ?? 0 },
        { value: 'night', label: 'Gece', count: bandCounts.get('night') ?? 0 },
      ],
      operators: OPERATORS.filter((o) => all.some((t) => t.operatorId === o.id)).map((o) => ({
        value: o.id,
        label: o.name,
        count: operatorCounts.get(o.id) ?? 0,
      })),
      layouts: (['2+1', '2+2'] as const)
        .filter((l) => all.some((t) => t.seatLayout === l))
        .map((l) => ({ value: l, label: l, count: layoutCounts.get(l) ?? 0 })),
      amenities: AMENITIES.filter((a) => all.some((t) => t.amenities.includes(a.id))).map((a) => ({
        value: a.id,
        label: a.label,
        count: amenityCounts.get(a.id) ?? 0,
      })),
      fromTerminals: (from?.terminals ?? [])
        .filter((t) => all.some((tr) => tr.fromTerminalId === t.id))
        .map((t) => ({ value: t.id, label: t.name, count: fromTermCounts.get(t.id) ?? 0 })),
      toTerminals: (to?.terminals ?? [])
        .filter((t) => all.some((tr) => tr.toTerminalId === t.id))
        .map((t) => ({ value: t.id, label: t.name, count: toTermCounts.get(t.id) ?? 0 })),
    },
    priceBounds: {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
    },
  }
}

/** Cheapest fare per day for the +/-3 day strip above the results. */
export function datePrices(from: string, to: string, date: string, span = 3) {
  const base = fromISODate(date)
  const out: { date: string; minPrice: number | null; count: number }[] = []
  for (let offset = -span; offset <= span; offset++) {
    const d = new Date(base)
    d.setDate(base.getDate() + offset)
    const iso = toISODateLocal(d)
    const trips = generateTrips(from, to, iso)
    out.push({
      date: iso,
      minPrice: trips.length > 0 ? Math.min(...trips.map((t) => t.price)) : null,
      count: trips.length,
    })
  }
  return out
}

export function getTrip(tripId: string): Trip | undefined {
  // The id encodes its own query, so a trip is reproducible from the URL alone
  // with no server session — refresh and deep-link both just work.
  const match = /^(\d+)-(\d+)-(\d{4}-\d{2}-\d{2})-(\d+)$/.exec(tripId)
  if (!match) return undefined
  const [, from, to, date, index] = match
  return generateTrips(from!, to!, date!)[Number(index)]
}

/**
 * Builds the coach for a trip.
 *
 * Occupancy is seeded from the trip id, so the same coach comes back on every
 * render, refresh and deep link. Gender locks are computed HERE, server-side,
 * from pair adjacency — the client never re-derives them.
 */
export function getSeatMap(tripId: string): SeatMap | undefined {
  const trip = getTrip(tripId)
  if (!trip) return undefined

  const geometry = layoutDeck(getDeck(trip.deckId))
  const rng = createRng(`seats:${tripId}`)

  const capacity = geometry.seatCount
  const soldCount = Math.max(0, capacity - trip.seatsLeft)

  // Sell a seeded subset, then let gender locks fall out of pair adjacency.
  const sellable = geometry.seats.map((s) => s.key)
  const sold = new Set(rng.sample(sellable, soldCount))
  const soldGender = new Map<string, 'M' | 'F'>()
  for (const key of sellable) {
    if (sold.has(key)) soldGender.set(key, rng.chance(0.52) ? 'M' : 'F')
  }

  // A handful of seats are withheld for crew or accessibility.
  const withheld = new Set(
    rng.sample(
      sellable.filter((k) => !sold.has(k)),
      rng.int(0, 2),
    ),
  )

  const operator = OPERATORS.find((o) => o.id === trip.operatorId)
  const policy: SeatPolicy = {
    ...DEFAULT_POLICY,
    maxSeats: 4,
    mixedGenders: !rng.chance(0.2),
    hasGenderSelection: true,
    hasSeatSelection: true,
    singleSeatFee:
      trip.seatLayout === '2+1' && operator?.premium !== true ? rng.pick([0, 25, 40]) : 0,
  }

  const seats: Seat[] = geometry.seats.map((cell) => {
    const key = cell.key
    const occupiedBy = soldGender.get(key) ?? null

    let availableFor: Availability = 'ALL'
    let unavailableReason: Seat['unavailableReason'] = null

    if (occupiedBy) {
      availableFor = 'NO'
      unavailableReason = 'SOLD'
    } else if (withheld.has(key)) {
      availableFor = 'NO'
      unavailableReason = rng.chance(0.5) ? 'CREW' : 'ACCESSIBILITY'
    } else if (policy.hasGenderSelection && cell.pairKey) {
      // The gender rule binds only the two seats of one double on the same
      // side of the aisle. Single seats have no partner and are exempt —
      // which is exactly why solo travellers pay extra for them.
      const partnerGender = soldGender.get(cell.pairKey)
      if (partnerGender) {
        availableFor = partnerGender
        unavailableReason = 'GENDER_BLOCKED'
      }
    }

    const price =
      trip.price + (cell.isBackRow ? -20 : 0) + (cell.isSingle ? 0 : 0) + (cell.row <= 1 ? 15 : 0)

    return {
      key,
      number: cell.seatNo!,
      label: String(cell.seatNo),
      availableFor,
      unavailableReason,
      occupiedBy,
      price: Math.max(0, price),
      isSingle: cell.isSingle,
      isWindow: cell.isWindow,
      note: cell.isBackRow ? 'backRow' : cell.row <= 1 ? 'frontRow' : null,
    }
  })

  return seatMapSchema.parse({
    tripId,
    deckId: trip.deckId,
    policy,
    seats,
    sunSide: rng.pick(['left', 'right', 'none']),
  })
}

export { CITIES }
