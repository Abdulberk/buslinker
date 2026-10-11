import { describe, expect, it } from 'vitest'
import { getTicket } from '@/shared/api/tickets'
import { boardingPayload, qrMatrix } from './qr'
import {
  buildTicketIcs,
  directionsUrl,
  foldIcsLine,
  shareSummary,
  type TicketFacts,
} from './ticket-text'

const FACTS: TicketFacts = {
  pnr: 'TR4NS9',
  departsAt: '2026-10-26T23:30:00.000Z',
  arrivesAt: '2026-10-27T11:10:00.000Z',
  overnight: true,
  fromCity: 'İstanbul',
  toCity: 'Ankara',
  fromTerminal: 'Esenler Otogarı',
  toTerminal: 'AŞTİ',
  operatorName: 'Örnek Turizm',
  seats: [8, 27],
}

const utf8 = new TextEncoder()

describe('buildTicketIcs', () => {
  const ics = buildTicketIcs(FACTS, new Date('2026-10-12T09:00:00Z'))
  // Folding is transport, not content: a reader joins the lines back first.
  const unfolded = ics.replace(/\r\n /g, '')

  it('ends every line with CRLF', () => {
    expect(ics.endsWith('\r\n')).toBe(true)
    expect(ics.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/)
  })

  it('places the event in UTC', () => {
    expect(unfolded).toContain('\r\nDTSTART:20261026T233000Z\r\n')
    expect(unfolded).toContain('\r\nDTEND:20261027T111000Z\r\n')
    expect(unfolded).toContain('\r\nDTSTAMP:20261012T090000Z\r\n')
  })

  it('names the route, the departure terminal and the booking code', () => {
    expect(unfolded).toContain('\r\nSUMMARY:İstanbul → Ankara otobüs yolculuğu\r\n')
    expect(unfolded).toContain('\r\nLOCATION:Esenler Otogarı\\, İstanbul\r\n')
    expect(unfolded).toContain(
      '\r\nDESCRIPTION:PNR: TR4NS9\\nFirma: Örnek Turizm\\nKoltuklar: 8\\, 27',
    )
  })

  it('keeps one event per booking, whatever the import count', () => {
    expect(unfolded).toContain('\r\nUID:bilet-TR4NS9@buslinker\r\n')
  })

  it('keeps every physical line within 75 bytes', () => {
    for (const line of ics.split('\r\n')) {
      expect(utf8.encode(line).length).toBeLessThanOrEqual(75)
    }
  })
})

describe('foldIcsLine', () => {
  it('folds by bytes and never inside a character', () => {
    const line = `DESCRIPTION:${'İğneada → Şile, Çağlayan '.repeat(8)}`
    const folded = foldIcsLine(line)
    for (const part of folded.split('\r\n')) {
      expect(utf8.encode(part).length).toBeLessThanOrEqual(75)
    }
    expect(folded.replace(/\r\n /g, '')).toBe(line)
  })

  it('leaves a short line alone', () => {
    expect(foldIcsLine('VERSION:2.0')).toBe('VERSION:2.0')
  })
})

describe('shareSummary', () => {
  it('never carries the booking code or a ticket link', () => {
    const text = shareSummary(FACTS)
    expect(text).not.toContain(FACTS.pnr)
    expect(text).not.toMatch(/bilet\/|https?:/i)
  })

  it('says where and when', () => {
    const text = shareSummary(FACTS)
    expect(text).toContain('İstanbul → Ankara otobüs yolculuğu')
    expect(text).toContain('Esenler Otogarı')
    expect(text).toContain('AŞTİ')
    expect(text).toContain('(ertesi gün)')
  })
})

describe('directionsUrl', () => {
  it('searches for the departure terminal in its city', () => {
    expect(directionsUrl(FACTS)).toBe(
      'https://www.google.com/maps/search/?api=1&query=Esenler%20Otogar%C4%B1%2C%20%C4%B0stanbul',
    )
  })
})

describe('boarding code', () => {
  it('encodes the version, code, trip and sorted seats, and nothing personal', () => {
    const ticket = getTicket('TR4NS9')!
    const first = ticket.passengers[0]!
    const payload = boardingPayload({
      ...ticket,
      passengers: [
        { ...first, seat: 27 },
        { ...first, seat: 8 },
      ],
    })
    expect(payload).toBe(`BL1|TR4NS9|${ticket.trip.id}|8,27`)
    expect(payload).not.toContain(first.lastName)
  })

  it('produces a real QR grid, finder pattern first', () => {
    const { size, path } = qrMatrix('BL1|TR4NS9|61-65-2026-10-27-3|8,27')
    // Versions grow in steps of four modules from 21.
    expect(size).toBeGreaterThanOrEqual(21)
    expect((size - 17) % 4).toBe(0)
    // The top-left finder pattern opens with a run of seven dark modules.
    expect(path.startsWith('M0 0h7v1h-7z')).toBe(true)
  })
})
