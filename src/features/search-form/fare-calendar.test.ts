import { describe, expect, it } from 'vitest'
import type { DayPrice } from '@/shared/api/mock-server'
import { buildFareCalendar, FARE_CALENDAR_DAYS, fareCalendarFor, fareOn } from './fare-calendar'

function day(date: string, minPrice: number | null): DayPrice {
  return { date, minPrice, count: minPrice === null ? 0 : 3 }
}

describe('buildFareCalendar', () => {
  it('indexes the days that have a fare and skips the ones without trips', () => {
    const calendar = buildFareCalendar([
      day('2026-10-12', 640),
      day('2026-10-13', null),
      day('2026-10-14', 605),
    ])
    expect(calendar?.prices.get('2026-10-12')).toBe(640)
    expect(calendar?.prices.has('2026-10-13')).toBe(false)
    expect(calendar?.prices.size).toBe(2)
  })

  it("marks each month's cheapest day, ties included, against that month only", () => {
    const calendar = buildFareCalendar([
      day('2026-10-30', 605),
      day('2026-10-31', 700),
      day('2026-11-01', 650),
      day('2026-11-02', 620),
      day('2026-11-03', 620),
      day('2026-11-04', 690),
    ])
    // 620 is not October's best, but it is November's, on both days.
    expect([...(calendar?.best ?? [])]).toEqual(['2026-10-30', '2026-11-02', '2026-11-03'])
  })

  it('marks nothing in a month whose days all cost the same', () => {
    const calendar = buildFareCalendar([
      day('2026-11-29', 640),
      day('2026-11-30', 640),
      day('2026-12-01', 700),
    ])
    expect(calendar?.best.size).toBe(0)
  })

  it('returns null when no day has a fare, so the picker stays plain', () => {
    expect(buildFareCalendar([day('2026-10-12', null), day('2026-10-13', null)])).toBeNull()
    expect(buildFareCalendar([])).toBeNull()
  })
})

describe('fareOn', () => {
  const calendar = buildFareCalendar([day('2026-10-12', 605), day('2026-10-13', 640)])

  it('gives the fare and whether it is the best of its month', () => {
    expect(fareOn(calendar, '2026-10-12', {})).toEqual({ price: 605, best: true })
    expect(fareOn(calendar, '2026-10-13', {})).toEqual({ price: 640, best: false })
  })

  it('shows nothing for a day without trips, outside its month or disabled', () => {
    expect(fareOn(calendar, '2026-10-14', {})).toBeNull()
    expect(fareOn(calendar, '2026-10-12', { outside: true })).toBeNull()
    expect(fareOn(calendar, '2026-10-12', { disabled: true })).toBeNull()
    expect(fareOn(null, '2026-10-12', {})).toBeNull()
  })
})

describe('fareCalendarFor', () => {
  it('prices the whole window for a served route and points at a day in each month', () => {
    // Far enough ahead that no departure has left yet, so every day is priced.
    const calendar = fareCalendarFor('34', '6', '2030-01-01')
    expect(calendar?.prices.size).toBe(FARE_CALENDAR_DAYS)
    const months = new Set([...(calendar?.best ?? [])].map((iso) => iso.slice(0, 7)))
    // The sixtieth day is 1 March, alone in its month: one day is no deal.
    expect(months).toEqual(new Set(['2030-01', '2030-02']))
  })

  it('has nothing to show for a trip that starts and ends in the same city', () => {
    expect(fareCalendarFor('34', '34', '2030-01-01')).toBeNull()
  })
})
