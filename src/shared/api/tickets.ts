import { z } from 'zod'
import { createRng } from '@/shared/lib/rng'
import { foldTr, toISODate, upperAscii } from '@/shared/lib/tr'
import { cityById, operatorById, OPERATORS, CITIES } from './catalog'
import { getTrip, type Trip } from './mock-server'

/**
 * Mock ticket store, keyed by PNR.
 *
 * Two sources, read in this order:
 *
 *   1. Tickets issued by the demo checkout in this browser session. The
 *      confirmation page used to derive its PNR from the trip id while this
 *      file derived the ticket from the PNR, so the two never met: an Ulusoy
 *      İstanbul → Ankara booking opened as a Metro Muğla → Hatay ticket in a
 *      stranger's name. An issued ticket is now written down at checkout and
 *      read back here, so "Bileti görüntüleyin" opens the booking just made.
 *
 *   2. Everything else derives from the PNR, the same discipline as the trip
 *      generator: any well-formed code resolves to a reproducible ticket, which
 *      keeps the lookup screen and the demo codes working with no backend.
 */

export type TicketStatus = 'confirmed' | 'used' | 'cancelled'

/** `M` erkek, `F` kadın, `S` for a carrier that does not seat by gender. */
export type TicketGender = 'M' | 'F' | 'S'

export interface TicketPassenger {
  readonly fullName: string
  /** Kept apart from the full name: lookup matches on it, and surnames can have spaces. */
  readonly lastName: string
  readonly seat: number
  readonly gender: TicketGender
  /** What this seat cost, before any fee line. */
  readonly fare: number
}

/** One line of the receipt — the same shape and wording checkout itemised. */
export interface TicketFareLine {
  readonly label: string
  readonly amount: number
  readonly kind: 'seat' | 'fee'
}

export interface Ticket {
  readonly pnr: string
  readonly status: TicketStatus
  /** The buyer's surname, the second half of a lookup. */
  readonly surname: string
  readonly trip: Trip
  readonly passengers: readonly TicketPassenger[]
  readonly fareLines: readonly TicketFareLine[]
  readonly total: number
  readonly purchasedAt: string
  /** Whether the fare still allows a self-service cancellation. */
  readonly refundable: boolean
  /** `booking` was issued by this session's checkout; `sample` is generated from the code. */
  readonly origin: 'booking' | 'sample'
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

export const PNR_LENGTH = 6

/** No I, O, 0 or 1: a code people read aloud and retype should not have look-alikes. */
const PNR_ALPHABET = [...'ABCDEFGHJKLMNPQRSTUVWXYZ23456789']

export function isPnrShape(value: string): boolean {
  return /^[A-Z0-9]{6}$/.test(upperAscii(value.trim()))
}

/** A stable demo set for the lookup chips and the account screens. */
export const DEMO_PNRS: readonly string[] = [
  'BK7J2M',
  'TR4NS9',
  'YLM3D8',
  'KVZ6P1',
  'DNZ8H4',
  'SLN2R7',
]

/**
 * A new booking code, reproducible from its seed.
 *
 * Re-rolls on a demo code: an issued ticket shadows the generated one for the
 * same PNR, and quietly replacing "TR4NS9" for the rest of the session would
 * break the codes the lookup page hands out.
 */
export function issuePnr(seed: string): string {
  const rng = createRng(`pnr:${seed}`)
  const draw = () => Array.from({ length: PNR_LENGTH }, () => rng.pick(PNR_ALPHABET)).join('')
  let code = draw()
  while (DEMO_PNRS.includes(code)) code = draw()
  return code
}

// ---------------------------------------------------------------------------
// Issued tickets
//
// Kept in sessionStorage: the demo promises at checkout that what is typed
// stays in this browser, and a session is the narrowest scope that still
// survives a refresh and the way back from the ticket to the confirmation.
// Storage can be blocked (private mode, a sandboxed preview), so every access
// is guarded and an in-memory copy carries the booking through this page load.
// ---------------------------------------------------------------------------

const REGISTRY_KEY = 'bl-issued-tickets'
/** Enough for any honest session; stops a scripted loop from filling storage. */
const REGISTRY_CAP = 20

// Storage is user-editable, so what comes back is parsed, not trusted.
const issuedRecordSchema = z.object({
  pnr: z.string().regex(/^[A-Z0-9]{6}$/),
  tripId: z.string(),
  surname: z.string(),
  passengers: z
    .array(
      z.object({
        fullName: z.string(),
        lastName: z.string(),
        seat: z.number().int().positive(),
        gender: z.enum(['M', 'F', 'S']),
        fare: z.number().nonnegative(),
      }),
    )
    .min(1),
  fareLines: z.array(
    z.object({ label: z.string(), amount: z.number(), kind: z.enum(['seat', 'fee']) }),
  ),
  total: z.number().nonnegative(),
  purchasedAt: z.string(),
})
const registrySchema = z.array(issuedRecordSchema)

type IssuedRecord = z.infer<typeof issuedRecordSchema>

let memoryRegistry: IssuedRecord[] = []
// Once storage has failed, the in-memory copy is the only one that has every
// write — reading storage again would hand back a list missing the newest
// booking.
let storageFailed = false

function readRegistry(): IssuedRecord[] {
  if (storageFailed) return memoryRegistry
  let raw: string | null
  try {
    raw = globalThis.sessionStorage.getItem(REGISTRY_KEY)
  } catch {
    storageFailed = true
    return memoryRegistry
  }
  if (raw === null) return []
  try {
    const parsed = registrySchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : []
  } catch {
    // Not JSON, so edited by hand: read as empty, and the next write replaces it.
    return []
  }
}

function writeRegistry(records: IssuedRecord[]): void {
  memoryRegistry = records
  if (storageFailed) return
  try {
    globalThis.sessionStorage.setItem(REGISTRY_KEY, JSON.stringify(records))
  } catch {
    // Blocked or full: the in-memory copy serves the rest of this page load.
    storageFailed = true
  }
}

export interface IssueTicketInput {
  readonly tripId: string
  readonly passengers: readonly {
    readonly firstName: string
    readonly lastName: string
    readonly seat: number
    readonly gender: TicketGender
    readonly fare: number
  }[]
  /** The buyer's surname, when the contact person is not the first passenger. */
  readonly surname?: string | undefined
  readonly fareLines: readonly TicketFareLine[]
  readonly total: number
  /** Injectable for tests; the purchase instant and the PNR seed. */
  readonly now?: Date | undefined
}

const tidy = (value: string) => value.trim().replace(/\s+/g, ' ')

/**
 * Writes down a demo booking and returns it as a ticket.
 *
 * Returns undefined for an unknown trip id, so a caller can never be handed a
 * PNR that resolves to nothing.
 */
export function issueDemoTicket(input: IssueTicketInput): Ticket | undefined {
  const trip = getTrip(input.tripId)
  if (!trip || input.passengers.length === 0) return undefined

  const now = input.now ?? new Date()
  const passengers = input.passengers.map((p) => ({
    fullName: tidy(`${p.firstName} ${p.lastName}`),
    lastName: tidy(p.lastName),
    seat: p.seat,
    gender: p.gender,
    fare: p.fare,
  }))
  const seats = passengers.map((p) => p.seat).join(',')
  const pnr = issuePnr(`${input.tripId}|${seats}|${now.toISOString()}`)

  const record: IssuedRecord = {
    pnr,
    tripId: input.tripId,
    surname: tidy(input.surname ?? passengers[0]!.lastName),
    passengers,
    fareLines: [...input.fareLines],
    total: input.total,
    purchasedAt: now.toISOString(),
  }

  const others = readRegistry().filter((r) => r.pnr !== pnr)
  writeRegistry([record, ...others].slice(0, REGISTRY_CAP))
  return ticketFromRecord(record, now)
}

function ticketFromRecord(record: IssuedRecord, now: Date): Ticket | undefined {
  const trip = getTrip(record.tripId)
  if (!trip) return undefined
  return {
    pnr: record.pnr,
    status: Date.parse(trip.departsAt) > now.getTime() ? 'confirmed' : 'used',
    surname: record.surname,
    trip,
    passengers: record.passengers,
    fareLines: record.fareLines,
    total: record.total,
    purchasedAt: record.purchasedAt,
    // The demo checkout sells one fare type; its terms allow a cancellation
    // up to the cut-off below.
    refundable: true,
    origin: 'booking',
  }
}

/** This session's bookings, newest first. */
export function issuedTickets(now: Date = new Date()): Ticket[] {
  return readRegistry()
    .map((record) => ticketFromRecord(record, now))
    .filter((t): t is Ticket => t !== undefined)
}

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

/**
 * The ticket behind a PNR.
 *
 * A booking issued in this session wins over the generated ticket for the
 * same code. Otherwise the PNR seeds a route, a date and a passenger list, so
 * any well-formed code resolves to a plausible ticket.
 */
export function getTicket(rawPnr: string): Ticket | undefined {
  const pnr = upperAscii(rawPnr.trim())
  if (!isPnrShape(pnr)) return undefined

  const issued = readRegistry().find((r) => r.pnr === pnr)
  if (issued) {
    const ticket = ticketFromRecord(issued, new Date())
    if (ticket) return ticket
  }
  return sampleTicket(pnr)
}

/**
 * Whether a surname belongs to this ticket: the buyer's or any passenger's.
 *
 * Folded, so `ozturk` finds Öztürk and `YILMAZ` finds Yılmaz. Without this
 * check a one-character typo in the PNR opened a stranger's ticket.
 */
export function matchesSurname(ticket: Ticket, surname: string): boolean {
  const wanted = foldTr(tidy(surname))
  if (wanted === '') return false
  return [ticket.surname, ...ticket.passengers.map((p) => p.lastName)].some(
    (name) => foldTr(tidy(name)) === wanted,
  )
}

/** The lookup screens' query: a PNR AND a surname that belongs to it. */
export function findTicket(pnr: string, surname: string): Ticket | undefined {
  const ticket = getTicket(pnr)
  return ticket && matchesSurname(ticket, surname) ? ticket : undefined
}

function sampleTicket(pnr: string): Ticket | undefined {
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

  // The draw order below is load-bearing: every demo code's route, date and
  // status falls out of this sequence, so a reordering would silently swap
  // which code is the upcoming one and which the cancelled one.
  const passengers: TicketPassenger[] = seats.map((seat, index) => {
    const person = rng.pick(NAMES)
    const lastName = index === 0 ? surname : rng.pick(SURNAMES)
    return {
      fullName: `${person.name} ${lastName}`,
      lastName,
      seat,
      gender: person.gender,
      fare: trip.price,
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
    fareLines: passengers.map((p) => ({
      label: `${p.seat} numaralı koltuk`,
      amount: p.fare,
      kind: 'seat' as const,
    })),
    total: trip.price * passengers.length,
    purchasedAt: new Date(
      new Date(trip.departsAt).getTime() - 86_400_000 * rng.int(1, 20),
    ).toISOString(),
    refundable: status === 'confirmed' && !rng.chance(0.25),
    origin: 'sample',
  }
}

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

/** This session's bookings first, then the demo set; one entry per PNR. */
export function demoTickets(): Ticket[] {
  const issued = issuedTickets()
  const samples = DEMO_PNRS.filter((pnr) => !issued.some((t) => t.pnr === pnr))
    .map(getTicket)
    .filter((t): t is Ticket => t !== undefined)
  return [...issued, ...samples]
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

/**
 * The status as of `now`, not as of the lookup.
 *
 * A ticket page left open across its departure must stop presenting itself as
 * valid to board; the generator applies the same rule when it builds one.
 */
export function effectiveStatus(ticket: Ticket, now: Date = new Date()): TicketStatus {
  if (ticket.status === 'confirmed' && now.getTime() >= Date.parse(ticket.trip.departsAt)) {
    return 'used'
  }
  return ticket.status
}

// ---------------------------------------------------------------------------
// Boarding, cancellation and refund rules
//
// One source for every surface. The ticket used to promise a 3-hour rule that
// the cancel page never checked, and the deduction lived in the cancel page
// alone, so the two screens could disagree about the same booking.
// ---------------------------------------------------------------------------

/** How early to be at the platform. Coaches leave on the minute. */
export const BOARDING_LEAD_MINUTES = 15

export function boardingTime(ticket: Ticket): Date {
  return new Date(Date.parse(ticket.trip.departsAt) - BOARDING_LEAD_MINUTES * 60_000)
}

/** Online cancellation closes this many hours before departure. */
export const CANCEL_CUTOFF_HOURS = 3

export function cancelDeadline(ticket: Ticket): Date {
  return new Date(Date.parse(ticket.trip.departsAt) - CANCEL_CUTOFF_HOURS * 3_600_000)
}

/** Why a ticket cannot be cancelled online, most fundamental reason first. */
export type CancelBlocker = 'cancelled' | 'used' | 'nonrefundable' | 'deadline'

export interface CancellationState {
  readonly deadline: Date
  readonly blocker: CancelBlocker | null
}

export function cancellationState(ticket: Ticket, now: Date = new Date()): CancellationState {
  const deadline = cancelDeadline(ticket)
  const status = effectiveStatus(ticket, now)
  const blocker: CancelBlocker | null =
    status === 'cancelled'
      ? 'cancelled'
      : status === 'used'
        ? 'used'
        : !ticket.refundable
          ? 'nonrefundable'
          : now.getTime() >= deadline.getTime()
            ? 'deadline'
            : null
  return { deadline, blocker }
}

/**
 * Illustrative only. A real deduction depends on the carrier's own tariff and
 * on how close to departure the request is; this build has no such contract,
 * so the number is presented as an example and labelled as one everywhere it
 * appears.
 */
export const DEMO_DEDUCTION_RATE = 0.1

export function refundFor(ticket: Ticket): { paid: number; deduction: number; refund: number } {
  const deduction = Math.round(ticket.total * DEMO_DEDUCTION_RATE)
  return { paid: ticket.total, deduction, refund: ticket.total - deduction }
}

/** Convenience for the ticket screens, which always need both endpoints. */
export function ticketRoute(ticket: Ticket) {
  const from = cityById(ticket.trip.fromCityId)
  const to = cityById(ticket.trip.toCityId)
  return {
    from,
    to,
    operator: operatorById(ticket.trip.operatorId),
    fromTerminal: from?.terminals.find((t) => t.id === ticket.trip.fromTerminalId),
    toTerminal: to?.terminals.find((t) => t.id === ticket.trip.toTerminalId),
  }
}

export { OPERATORS }
