import { BOARDING_LEAD_MINUTES, ticketRoute, type Ticket } from '@/shared/api/tickets'
import { formatDateLong, formatTime, nightOfLabel } from '@/shared/lib/tr'

/**
 * The words a ticket leaves the page with: the calendar file, the share
 * sheet's summary and the map search.
 *
 * Kept apart from the page and free of the DOM, so each can be tested as plain
 * text. The ticket screens and the confirmation screen both build from here,
 * which keeps "what the calendar says" from drifting between them.
 */

export interface TicketFacts {
  readonly pnr: string
  readonly departsAt: string
  readonly arrivesAt: string
  readonly overnight: boolean
  readonly fromCity: string
  readonly toCity: string
  readonly fromTerminal: string
  readonly toTerminal: string
  readonly operatorName: string
  readonly seats: readonly number[]
}

export function ticketFacts(ticket: Ticket): TicketFacts {
  const { from, to, operator, fromTerminal, toTerminal } = ticketRoute(ticket)
  const fromCity = from?.name ?? ''
  const toCity = to?.name ?? ''
  return {
    pnr: ticket.pnr,
    departsAt: ticket.trip.departsAt,
    arrivesAt: ticket.trip.arrivesAt,
    overnight: ticket.trip.overnight,
    fromCity,
    toCity,
    fromTerminal: fromTerminal?.name ?? fromCity,
    toTerminal: toTerminal?.name ?? toCity,
    operatorName: operator?.name ?? 'Otobüs firması',
    seats: ticket.passengers.map((p) => p.seat),
  }
}

/** `İstanbul → Ankara otobüs yolculuğu`: the event title and the share title. */
export function tripTitle(facts: Pick<TicketFacts, 'fromCity' | 'toCity'>): string {
  return `${facts.fromCity} → ${facts.toCity} otobüs yolculuğu`
}

/** `Esenler Otogarı, İstanbul`: enough for a map search to land on the right building. */
export function terminalPlace(terminal: string, city: string): string {
  return terminal === city || city === '' ? terminal : `${terminal}, ${city}`
}

export function directionsUrl(facts: Pick<TicketFacts, 'fromTerminal' | 'fromCity'>): string {
  const query = encodeURIComponent(terminalPlace(facts.fromTerminal, facts.fromCity))
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

const seatLine = (seats: readonly number[]) =>
  `${seats.length > 1 ? 'Koltuklar' : 'Koltuk'}: ${seats.join(', ')}`

/**
 * The summary the share sheet sends.
 *
 * Never the PNR and never the ticket link: together with a surname, either one
 * opens the booking — and cancels it. What someone meeting the coach needs is
 * when and where, so that is all it says.
 */
export function shareSummary(facts: TicketFacts): string {
  const night = nightOfLabel(facts.departsAt)
  return [
    tripTitle(facts),
    night ? `${formatDateLong(facts.departsAt)} (${night})` : formatDateLong(facts.departsAt),
    `Kalkış: ${formatTime(facts.departsAt)} · ${facts.fromTerminal}`,
    `Varış: ${formatTime(facts.arrivesAt)}${facts.overnight ? ' (ertesi gün)' : ''} · ${facts.toTerminal}`,
    `Firma: ${facts.operatorName}`,
  ].join('\n')
}

// ---------------------------------------------------------------------------
// Calendar file (RFC 5545)
// ---------------------------------------------------------------------------

const CRLF = '\r\n'

/** `20261026T233000Z`: UTC, so every calendar app places it right whatever its zone. */
export function icsUtc(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value)
  return date
    .toISOString()
    .replace(/\.\d{3}/, '')
    .replace(/[-:]/g, '')
}

/** TEXT values escape backslashes, separators and line breaks. */
function icsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

const utf8Length = (char: string) => {
  const code = char.codePointAt(0) ?? 0
  return code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4
}

/**
 * Folds a content line at 75 octets, as the format requires.
 *
 * Counted in UTF-8 bytes, not characters: "İ", "ş" and "→" take two or three
 * bytes each, and a line folded by character count overruns the limit on
 * exactly the Turkish words. Folding happens between code points, never inside
 * one, and each continuation line starts with the one space that marks it.
 */
export function foldIcsLine(line: string): string {
  const parts: string[] = []
  let current = ''
  let size = 0
  for (const char of line) {
    const bytes = utf8Length(char)
    const limit = parts.length === 0 ? 75 : 74
    if (size + bytes > limit) {
      parts.push(current)
      current = char
      size = bytes
    } else {
      current += char
      size += bytes
    }
  }
  parts.push(current)
  return parts.join(`${CRLF} `)
}

export function buildTicketIcs(facts: TicketFacts, now: Date = new Date()): string {
  const description = [
    `PNR: ${facts.pnr}`,
    `Firma: ${facts.operatorName}`,
    seatLine(facts.seats),
    `Kalkıştan ${BOARDING_LEAD_MINUTES} dakika önce peronda olun.`,
  ].join('\n')

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BusLinker//Bilet//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    // Stable per booking, so importing the file twice updates one event
    // instead of adding a second coach to the calendar.
    `UID:bilet-${facts.pnr}@buslinker`,
    `DTSTAMP:${icsUtc(now)}`,
    `DTSTART:${icsUtc(facts.departsAt)}`,
    `DTEND:${icsUtc(facts.arrivesAt)}`,
    `SUMMARY:${icsText(tripTitle(facts))}`,
    `LOCATION:${icsText(terminalPlace(facts.fromTerminal, facts.fromCity))}`,
    `DESCRIPTION:${icsText(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(foldIcsLine).join(CRLF) + CRLF
}

export function icsFilename(pnr: string): string {
  return `buslinker-bilet-${pnr}.ics`
}
