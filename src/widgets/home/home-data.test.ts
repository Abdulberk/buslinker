import { describe, expect, it } from 'vitest'
import { POPULAR_ROUTES, cityBySlug } from '@/shared/api/catalog'
import { searchTrips } from '@/shared/api/mock-server'
import { CAMPAIGNS, type Campaign } from '@/shared/config/campaigns'
import { activeCampaigns, daysLeft, deadlineLabel } from './campaign-window'
import { popularRouteStats, routeStats } from './route-stats'

const DATE = '2026-10-12'

describe('routeStats', () => {
  it('matches what the results page lists for the same day', () => {
    const from = cityBySlug('istanbul')!
    const to = cityBySlug('ankara')!
    const stats = routeStats(from, to, DATE)
    const result = searchTrips({ from: from.id, to: to.id, date: DATE })

    expect(stats.departures).toBe(result.total)
    expect(stats.cheapest).toBe(Math.min(...result.trips.map((t) => t.price)))
  })

  it('is deterministic', () => {
    const from = cityBySlug('adana')!
    const to = cityBySlug('hatay')!
    expect(routeStats(from, to, DATE)).toEqual(routeStats(from, to, DATE))
  })

  it('reports no fare when nothing runs', () => {
    const city = cityBySlug('izmir')!
    expect(routeStats(city, city, DATE)).toMatchObject({ departures: 0, cheapest: null })
  })
})

describe('popularRouteStats', () => {
  it('keeps every popular corridor, in catalogue order', () => {
    const rows = popularRouteStats(DATE)
    expect(rows.map((r) => `${r.from.slug}>${r.to.slug}`)).toEqual(
      POPULAR_ROUTES.map((r) => `${r.from}>${r.to}`),
    )
    for (const row of rows) {
      expect(row.departures).toBeGreaterThan(0)
      expect(row.cheapest).not.toBeNull()
    }
  })
})

describe('daysLeft', () => {
  it('counts calendar days, inclusive of the last one', () => {
    expect(daysLeft('2026-10-31', '2026-10-12')).toBe(19)
    expect(daysLeft('2026-10-12', '2026-10-12')).toBe(0)
    expect(daysLeft('2026-10-11', '2026-10-12')).toBe(-1)
  })

  it('is not shortened by a daylight-saving change in between', () => {
    expect(daysLeft('2026-11-02', '2026-10-24')).toBe(9)
    expect(daysLeft('2027-04-01', '2027-03-20')).toBe(12)
  })

  it('crosses a year boundary', () => {
    expect(daysLeft('2027-01-01', '2026-12-31')).toBe(1)
  })
})

describe('activeCampaigns', () => {
  const campaign = (id: string, validUntil: string): Campaign => ({
    ...CAMPAIGNS[0]!,
    id,
    validUntil,
  })

  it('drops expired offers and keeps the last valid day', () => {
    const list = [
      campaign('dun', '2026-10-11'),
      campaign('bugun', '2026-10-12'),
      campaign('sonra', '2027-01-01'),
    ]
    expect(activeCampaigns(list, DATE).map((c) => c.id)).toEqual(['bugun', 'sonra'])
  })
})

describe('deadlineLabel', () => {
  it('leaves the year out while it is the current one', () => {
    expect(deadlineLabel('2026-10-31', DATE)).not.toContain('2026')
  })

  it('states the year once the deadline runs into the next one', () => {
    expect(deadlineLabel('2027-06-30', DATE)).toContain('2027')
  })
})
