import { describe, expect, it } from 'vitest'
import { datePrices, getSeatMap, getTrip, searchTrips } from './mock-server'
import { formatTime, toISODate } from '@/shared/lib/tr'

const QUERY = { from: '34', to: '6', date: '2026-09-04' } as const

describe('searchTrips — determinism', () => {
  // The old app generated occupancy with Math.random() inside a useEffect, so
  // the coach reshuffled on every mount. Nothing downstream could be tested,
  // deep-linked, or trusted between two renders.
  it('returns identical results for identical input', () => {
    const a = searchTrips(QUERY)
    const b = searchTrips(QUERY)
    expect(a.trips).toEqual(b.trips)
  })

  it('gives different routes different results', () => {
    const a = searchTrips(QUERY)
    const b = searchTrips({ ...QUERY, to: '35' })
    expect(a.trips[0]?.id).not.toBe(b.trips[0]?.id)
  })

  it('gives different dates different results', () => {
    const a = searchTrips(QUERY)
    const b = searchTrips({ ...QUERY, date: '2026-09-05' })
    expect(a.trips.map((t) => t.price)).not.toEqual(b.trips.map((t) => t.price))
  })

  it('returns nothing for a route to itself', () => {
    expect(searchTrips({ ...QUERY, to: '34' }).trips).toHaveLength(0)
  })
})

describe('searchTrips — sorting', () => {
  it('defaults to departure ascending', () => {
    const { trips } = searchTrips(QUERY)
    const times = trips.map((t) => t.departsAt)
    expect([...times].sort()).toEqual(times)
  })

  it('sorts by price ascending', () => {
    const { trips } = searchTrips({ ...QUERY, sort: 'price_asc' })
    const prices = trips.map((t) => t.price)
    expect([...prices].sort((a, b) => a - b)).toEqual(prices)
  })

  it('sorts by duration ascending', () => {
    const { trips } = searchTrips({ ...QUERY, sort: 'duration_asc' })
    const mins = trips.map((t) => t.durationMin)
    expect([...mins].sort((a, b) => a - b)).toEqual(mins)
  })
})

describe('searchTrips — filtering', () => {
  it('narrows to the selected operator', () => {
    const all = searchTrips(QUERY)
    const operator = all.trips[0]!.operatorId
    const filtered = searchTrips({ ...QUERY, filters: { operators: [operator] } })
    expect(filtered.trips.length).toBeGreaterThan(0)
    expect(filtered.trips.every((t) => t.operatorId === operator)).toBe(true)
  })

  it('treats multiple values in one group as OR', () => {
    const all = searchTrips(QUERY)
    const ops = [...new Set(all.trips.map((t) => t.operatorId))].slice(0, 2)
    const filtered = searchTrips({ ...QUERY, filters: { operators: ops } })
    expect(filtered.trips.every((t) => ops.includes(t.operatorId))).toBe(true)
  })

  it('treats amenities as AND — every requested feature must be present', () => {
    const filtered = searchTrips({ ...QUERY, filters: { amenities: ['wifi', 'usb'] } })
    expect(
      filtered.trips.every((t) => t.amenities.includes('wifi') && t.amenities.includes('usb')),
    ).toBe(true)
  })

  it('applies the price range inclusively', () => {
    const { priceBounds } = searchTrips(QUERY)
    const mid = Math.round((priceBounds.min + priceBounds.max) / 2)
    const filtered = searchTrips({ ...QUERY, filters: { priceMin: mid } })
    expect(filtered.trips.every((t) => t.price >= mid)).toBe(true)
  })

  it('keeps totalUnfiltered stable while total narrows', () => {
    const all = searchTrips(QUERY)
    const filtered = searchTrips({ ...QUERY, filters: { layouts: ['2+1'] } })
    expect(filtered.totalUnfiltered).toBe(all.total)
    expect(filtered.total).toBeLessThanOrEqual(all.total)
  })
})

describe('searchTrips — facet counts', () => {
  // A facet count must EXCLUDE its own group's selection, or ticking one
  // carrier zeroes out every other carrier and the filter becomes a dead end.
  it('does not collapse a group once one of its values is selected', () => {
    const all = searchTrips(QUERY)
    const first = all.facets.operators[0]!
    const filtered = searchTrips({ ...QUERY, filters: { operators: [first.value] } })

    expect(filtered.facets.operators).toEqual(all.facets.operators)
    expect(filtered.facets.operators.filter((f) => f.count > 0).length).toBeGreaterThan(1)
  })

  it('does narrow OTHER groups when a filter is applied', () => {
    const all = searchTrips(QUERY)
    const operator = all.facets.operators[0]!.value
    const filtered = searchTrips({ ...QUERY, filters: { operators: [operator] } })

    const allBandTotal = all.facets.bands.reduce((s, b) => s + b.count, 0)
    const filteredBandTotal = filtered.facets.bands.reduce((s, b) => s + b.count, 0)
    expect(filteredBandTotal).toBeLessThan(allBandTotal)
  })

  // Amenities are AND, not OR: ticking a second feature narrows further. So
  // unlike the OR groups, the amenity count must INCLUDE its own selection —
  // excluding it produced counts larger than the whole result set, and rows
  // that led to zero results when clicked.
  it('never reports an amenity count larger than the result total', () => {
    const filtered = searchTrips({ ...QUERY, filters: { amenities: ['wifi'] } })
    for (const bucket of filtered.facets.amenities) {
      expect(bucket.count).toBeLessThanOrEqual(filtered.total)
    }
  })

  it('makes each amenity count equal what clicking it would actually return', () => {
    const base = searchTrips({ ...QUERY, filters: { amenities: ['wifi'] } })
    for (const bucket of base.facets.amenities) {
      if (bucket.value === 'wifi') continue
      const clicked = searchTrips({
        ...QUERY,
        filters: { amenities: ['wifi', bucket.value] },
      })
      expect(clicked.total).toBe(bucket.count)
    }
  })

  it('reports a zero count rather than dropping the value', () => {
    const result = searchTrips({ ...QUERY, filters: { priceMax: 1 } })
    expect(result.total).toBe(0)
    expect(result.facets.operators.length).toBeGreaterThan(0)
    expect(result.facets.operators.every((f) => f.count === 0)).toBe(true)
  })
})

describe('searchTrips — time zone', () => {
  // Departures are Turkish wall-clock times. Building them with setHours would
  // bake in the runtime's zone, so a trip generated as 09:00 would display as
  // 12:30 to a UTC viewer and be filed under the wrong departure band — the
  // "Sabah" filter would return trips shown at midday.
  it('files a trip under the band its displayed time belongs to', () => {
    const { trips, facets } = searchTrips(QUERY)
    const bandOfHour = (h: number) =>
      h >= 6 && h < 12 ? 'morning' : h >= 12 && h < 18 ? 'noon' : h >= 18 ? 'evening' : 'night'

    for (const band of facets.bands) {
      const filtered = searchTrips({ ...QUERY, filters: { bands: [band.value] } })
      for (const trip of filtered.trips) {
        const shownHour = Number(formatTime(trip.departsAt).slice(0, 2))
        expect(bandOfHour(shownHour)).toBe(band.value)
      }
    }
    expect(trips.length).toBeGreaterThan(0)
  })

  it('assigns a departure to the calendar day it was searched for', () => {
    const { trips } = searchTrips(QUERY)
    for (const trip of trips) {
      expect(toISODate(new Date(trip.departsAt))).toBe(QUERY.date)
    }
  })

  it('flags an overnight trip only when the Istanbul calendar day actually changes', () => {
    const { trips } = searchTrips(QUERY)
    for (const trip of trips) {
      const changed = toISODate(new Date(trip.arrivesAt)) !== toISODate(new Date(trip.departsAt))
      expect(trip.overnight).toBe(changed)
    }
  })
})

describe('getTrip', () => {
  it('reconstructs a trip from its id alone, so a deep link survives a refresh', () => {
    const { trips } = searchTrips(QUERY)
    const original = trips[0]!
    expect(getTrip(original.id)).toEqual(original)
  })

  it('returns undefined for a malformed id instead of throwing', () => {
    expect(getTrip('nonsense')).toBeUndefined()
    expect(getTrip('34-6-not-a-date-0')).toBeUndefined()
  })
})

describe('getSeatMap', () => {
  it('is stable for a given trip', () => {
    const { trips } = searchTrips(QUERY)
    const id = trips[0]!.id
    expect(getSeatMap(id)).toEqual(getSeatMap(id))
  })

  it('matches the coach capacity for the trip layout', () => {
    const { trips } = searchTrips(QUERY)
    for (const trip of trips.slice(0, 4)) {
      const map = getSeatMap(trip.id)!
      expect(map.seats.length).toBeGreaterThan(20)
      expect(map.deckId).toBe(trip.deckId)
    }
  })

  it('never gender-locks a single seat — it has no pair partner', () => {
    const { trips } = searchTrips(QUERY)
    for (const trip of trips.slice(0, 6)) {
      const map = getSeatMap(trip.id)!
      const lockedSingles = map.seats.filter(
        (s) => s.isSingle && (s.availableFor === 'M' || s.availableFor === 'F'),
      )
      expect(lockedSingles).toEqual([])
    }
  })

  it('only gender-locks a seat whose pair partner is actually sold', () => {
    const { trips } = searchTrips(QUERY)
    const map = getSeatMap(trips[0]!.id)!
    const locked = map.seats.filter((s) => s.availableFor === 'M' || s.availableFor === 'F')
    for (const seat of locked) {
      expect(seat.occupiedBy).toBeNull()
      expect(seat.unavailableReason).toBe('GENDER_BLOCKED')
    }
  })

  it('marks every sold seat with an occupant gender', () => {
    const { trips } = searchTrips(QUERY)
    const map = getSeatMap(trips[0]!.id)!
    const sold = map.seats.filter((s) => s.unavailableReason === 'SOLD')
    expect(sold.every((s) => s.occupiedBy === 'M' || s.occupiedBy === 'F')).toBe(true)
  })

  it('caps the policy at four seats', () => {
    const { trips } = searchTrips(QUERY)
    const map = getSeatMap(trips[0]!.id)!
    expect(map.policy.maxSeats).toBeLessThanOrEqual(4)
  })

  it('returns undefined for an unknown trip', () => {
    expect(getSeatMap('nope')).toBeUndefined()
  })
})

describe('datePrices', () => {
  it('returns a symmetric window around the requested day', () => {
    const strip = datePrices('34', '6', '2026-09-04')
    expect(strip).toHaveLength(7)
    expect(strip[3]?.date).toBe('2026-09-04')
  })

  it('reports the cheapest fare that day', () => {
    const strip = datePrices('34', '6', '2026-09-04')
    const middle = strip[3]!
    const search = searchTrips(QUERY)
    expect(middle.minPrice).toBe(Math.min(...search.trips.map((t) => t.price)))
  })
})
