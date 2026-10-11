import { encode } from 'uqr'
import type { Ticket } from '@/shared/api/tickets'

/**
 * What the boarding code says.
 *
 * Versioned and terse on purpose. A reader at the coach door needs the
 * booking, the departure and the seats, and every extra character makes the
 * code denser and slower to read off a dim phone screen. No name and no price:
 * a photo of someone's ticket should not leak more than the ticket shows.
 */
export function boardingPayload(ticket: Pick<Ticket, 'pnr' | 'trip' | 'passengers'>): string {
  const seats = ticket.passengers
    .map((p) => p.seat)
    .sort((a, b) => a - b)
    .join(',')
  return `BL1|${ticket.pnr}|${ticket.trip.id}|${seats}`
}

/** The margin a scanner needs around the code, in modules. The standard asks for four. */
export const QR_QUIET_ZONE = 4

export interface QrMatrix {
  /** Modules per side, without the quiet zone. */
  readonly size: number
  /** Every dark module as one SVG path, one unit per module. */
  readonly path: string
}

/**
 * Encodes `value` and returns its dark modules as a single SVG path.
 *
 * Each run of dark modules in a row becomes one rectangle. That keeps the path
 * to a few hundred segments instead of a node per module, and it leaves no
 * hairline seams between neighbours when the code is scaled to the screen.
 * Error correction is M: it survives a scratched screen protector or a smudged
 * print without making a short payload noticeably denser.
 */
export function qrMatrix(value: string): QrMatrix {
  const { data } = encode(value, { ecc: 'M', border: 0 })
  let path = ''
  data.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      if (!row[x]) {
        x += 1
        continue
      }
      const start = x
      while (x < row.length && row[x]) x += 1
      path += `M${start} ${y}h${x - start}v1h${start - x}z`
    }
  })
  return { size: data.length, path }
}
