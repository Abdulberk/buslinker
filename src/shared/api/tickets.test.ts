import { describe, expect, it } from 'vitest'
import {
  DEMO_PNRS,
  demoTickets,
  getTicket,
  isPnrShape,
  pastTickets,
  upcomingTickets,
} from './tickets'

describe('isPnrShape', () => {
  it('accepts a six-character alphanumeric code', () => {
    expect(isPnrShape('BK7J2M')).toBe(true)
    expect(isPnrShape('  bk7j2m  ')).toBe(true)
  })

  it('rejects anything else', () => {
    expect(isPnrShape('BK7J2')).toBe(false)
    expect(isPnrShape('BK7J2MM')).toBe(false)
    expect(isPnrShape('BK7J-M')).toBe(false)
    expect(isPnrShape('')).toBe(false)
  })

  // A PNR is a machine identifier, not Turkish text. Upper-casing it with the
  // Turkish locale turns 'i' into 'İ', which is outside [A-Z0-9] — so a valid
  // code typed in lower case would be rejected by its own format check.
  it('accepts a lower-case i, which Turkish upper-casing would have broken', () => {
    expect(isPnrShape('bi7j2m')).toBe(true)
    expect(getTicket('bi7j2m')?.pnr).toBe('BI7J2M')
  })
})

describe('getTicket', () => {
  it('is deterministic for a given PNR', () => {
    expect(getTicket('BK7J2M')).toEqual(getTicket('BK7J2M'))
  })

  it('normalises case, so a lower-case code resolves to the same ticket', () => {
    expect(getTicket('bk7j2m')).toEqual(getTicket('BK7J2M'))
  })

  it('gives different codes different tickets', () => {
    expect(getTicket('BK7J2M')?.trip.id).not.toBe(getTicket('TR4NS9')?.trip.id)
  })

  it('returns undefined for a malformed code rather than throwing', () => {
    expect(getTicket('nope')).toBeUndefined()
    expect(getTicket('')).toBeUndefined()
  })

  it('echoes the requested PNR back in upper case', () => {
    expect(getTicket('bk7j2m')?.pnr).toBe('BK7J2M')
  })
})

describe('ticket contents', () => {
  it('never routes a journey to its own origin', () => {
    for (const pnr of DEMO_PNRS) {
      const ticket = getTicket(pnr)
      if (!ticket) continue
      expect(ticket.trip.fromCityId).not.toBe(ticket.trip.toCityId)
    }
  })

  it('carries at least one passenger, each with a distinct seat', () => {
    for (const ticket of demoTickets()) {
      expect(ticket.passengers.length).toBeGreaterThan(0)
      const seats = ticket.passengers.map((p) => p.seat)
      expect(new Set(seats).size).toBe(seats.length)
    }
  })

  it('totals the fare across passengers', () => {
    for (const ticket of demoTickets()) {
      expect(ticket.total).toBe(ticket.trip.price * ticket.passengers.length)
    }
  })

  it('was purchased before it departs', () => {
    for (const ticket of demoTickets()) {
      expect(new Date(ticket.purchasedAt).getTime()).toBeLessThan(
        new Date(ticket.trip.departsAt).getTime(),
      )
    }
  })

  it('only marks a future journey as confirmed', () => {
    const now = Date.now()
    for (const ticket of demoTickets()) {
      const departed = new Date(ticket.trip.departsAt).getTime() < now
      if (departed) expect(ticket.status).not.toBe('confirmed')
      else expect(ticket.status).toBe('confirmed')
    }
  })

  // The cancel screen keys off this, so a departed ticket offering a refund
  // would put a dead action in front of the traveller.
  it('never offers a refund on a journey that is not confirmed', () => {
    for (const ticket of demoTickets()) {
      if (ticket.status !== 'confirmed') expect(ticket.refundable).toBe(false)
    }
  })
})

describe('account lists', () => {
  it('splits the demo set into upcoming and past with no overlap', () => {
    const upcoming = upcomingTickets()
    const past = pastTickets()
    const all = demoTickets()
    expect(upcoming.length + past.length).toBe(all.length)
    const overlap = upcoming.filter((u) => past.some((p) => p.pnr === u.pnr))
    expect(overlap).toEqual([])
  })

  it('orders upcoming soonest-first and past most-recent-first', () => {
    const upcoming = upcomingTickets().map((t) => t.trip.departsAt)
    expect([...upcoming].sort()).toEqual(upcoming)

    const past = pastTickets().map((t) => t.trip.departsAt)
    expect([...past].sort().reverse()).toEqual(past)
  })
})
