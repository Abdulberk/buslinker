import { createRng } from '@/shared/lib/rng'
import { toISODate, upperAscii } from '@/shared/lib/tr'
import { cityById, operatorById, OPERATORS, CITIES } from './catalog'
import { getTrip, type Trip } from './mock-server'

/**
 * Mock ticket store, keyed by PNR.
 *
 * Same discipline as the trip generator: everything derives from the PNR, so a
 * lookup is reproducible, deep-linkable and testable. There is no session and
 * nothing is written anywhere.
 */

export type TicketStatus = 'confirmed' | 'used' | 'cancelled'

export interface TicketPassenger {
  readonly fullName: string
  readonly seat: number
  readonly gender: 'M' | 'F'
}

export interface Ticket {
  readonly pnr: string
  readonly status: TicketStatus
  readonly surname: string
  readonly trip: Trip
  readonly passengers: readonly TicketPassenger[]
  readonly total: number
  readonly purchasedAt: string
  /** Whether the fare still allows a self-service cancellation. */
  readonly refundable: boolean
}

// Names carry their own gender: picking the two independently produced
// passengers like "Selin Doğan · Erkek", which reads as a bug even in demo data.
const NAMES: readonly { name: string; gender: 'M' | 'F' }[] = [
  { name: 'Ayşe', gender: 'F' },
  { name: 'Zeynep', gender: 'F' },
  { name: 'Elif', gender: 'F' },
  { name: 'Selin', gender: 'F' },
  { name: 'Merve', gender: 'F' },
  { name: 'Mehmet', gender: 'M' },
  { name: 'Emre', gender: 'M' },
  { name: 'Burak', gender: 'M' },
  { name: 'Kerem', gender: 'M' },
  { name: 'Onur', gender: 'M' },
]
const SURNAMES = ['Yılmaz', 'Demir', 'Kaya', 'Çelik', 'Şahin', 'Aydın', 'Öztürk', 'Doğan']

export function isPnrShape(value: string): boolean {
  return /^[A-Z0-9]{6}$/.test(upperAscii(value.trim()))
}

/**
 * Builds a ticket from a PNR alone.
 *
 * The PNR seeds a route, a date and a passenger list, so any well-formed code
 * resolves to a plausible ticket — which is what makes the lookup screen
 * demonstrable without a backend or a fixture list to keep in sync.
 */
export function getTicket(rawPnr: string): Ticket | undefined {
  const pnr = upperAscii(rawPnr.trim())
  if (!isPnrShape(pnr)) return undefined

  const rng = createRng(`ticket:${pnr}`)

  const from = rng.pick(CITIES)
  const to = rng.pick(CITIES.filter((c) => c.id !== from.id))

  // Spread across a window around today so the list shows both upcoming and
  // past journeys without any of them depending on the wall clock's minute.
  const dayOffset = rng.int(-40, 30)
  const date = new Date()
  date.setDate(date.getDate() + dayOffset)
  const iso = toISODate(date)

  const trip = getTrip(`${from.id}-${to.id}-${iso}-${rng.int(0, 4)}`)
  if (!trip) return undefined

  const surname = rng.pick(SURNAMES)
  const count = rng.int(1, 3)
  const seats = rng
    .sample(
      Array.from({ length: 34 }, (_, i) => i + 1),
      count,
    )
    .sort((a, b) => a - b)

  const passengers: TicketPassenger[] = seats.map((seat, index) => {
    const person = rng.pick(NAMES)
    return {
      fullName: `${person.name} ${index === 0 ? surname : rng.pick(SURNAMES)}`,
      seat,
      gender: person.gender,
    }
  })

  const departed = new Date(trip.departsAt).getTime() < Date.now()
  const status: TicketStatus = departed ? (rng.chance(0.12) ? 'cancelled' : 'used') : 'confirmed'

  return {
    pnr,
    status,
    surname,
    trip,
    passengers,
    total: trip.price * passengers.length,
    purchasedAt: new Date(
      new Date(trip.departsAt).getTime() - 86_400_000 * rng.int(1, 20),
    ).toISOString(),
    refundable: status === 'confirmed' && !rng.chance(0.25),
  }
}

/** A stable demo set for the account screens. */
export const DEMO_PNRS: readonly string[] = [
  'BK7J2M',
  'TR4NS9',
  'YLM3D8',
  'KVZ6P1',
  'DNZ8H4',
  'SLN2R7',
]

export function demoTickets(): Ticket[] {
  return DEMO_PNRS.map(getTicket).filter((t): t is Ticket => t !== undefined)
}

export function upcomingTickets(): Ticket[] {
  return demoTickets()
    .filter((t) => t.status === 'confirmed')
    .sort((a, b) => a.trip.departsAt.localeCompare(b.trip.departsAt))
}

export function pastTickets(): Ticket[] {
  return demoTickets()
    .filter((t) => t.status !== 'confirmed')
    .sort((a, b) => b.trip.departsAt.localeCompare(a.trip.departsAt))
}

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  confirmed: 'Onaylandı',
  used: 'Tamamlandı',
  cancelled: 'İptal edildi',
}

/** Convenience for the ticket screens, which always need both endpoints. */
export function ticketRoute(ticket: Ticket) {
  return {
    from: cityById(ticket.trip.fromCityId),
    to: cityById(ticket.trip.toCityId),
    operator: operatorById(ticket.trip.operatorId),
  }
}

export { OPERATORS }
