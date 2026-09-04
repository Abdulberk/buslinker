import type { DeckSpec, RowCell, RowSpec } from './geometry'

/**
 * The coach layout catalogue.
 *
 * Real Turkish intercity capacities, not invented ones. On a 2+1 "lüks" coach
 * the SINGLE seats are on the LEFT (driver's side) and the PAIR is on the
 * RIGHT (kerb side), with the boarding door interrupting the right column —
 * getting this mirrored assigns a wrong number to every seat in the coach
 * while still rendering perfectly, so it is asserted in the tests.
 */

const full3: RowSpec = { cells: ['seat', 'seat', 'seat'] }
const door3: RowSpec = { cells: ['seat', 'door', 'door'] }
const full4: RowSpec = { cells: ['seat', 'seat', 'seat', 'seat'] }
const door4: RowSpec = { cells: ['seat', 'seat', 'door', 'door'] }

const repeat = (row: RowSpec, n: number): RowSpec[] => Array.from({ length: n }, () => row)

/** Left single column, aisle, then the right-hand pair. */
const TRACKS_2P1 = [
  { kind: 'seat' },
  { kind: 'aisle' },
  { kind: 'seat' },
  { kind: 'seat' },
] as const satisfies DeckSpec['tracks']

/** Left pair, aisle, right pair. */
const TRACKS_2P2 = [
  { kind: 'seat' },
  { kind: 'seat' },
  { kind: 'aisle' },
  { kind: 'seat' },
  { kind: 'seat' },
] as const satisfies DeckSpec['tracks']

/**
 * 2+1, 39 seats — the common "lüks" configuration, four across the back.
 *
 * The two door rows are what produce the numbering signature seen on real
 * seat maps: the right column jumps 18 -> 22 while the left single column
 * runs 19, 20, 21 consecutively.
 */
export const DECK_2P1_39: DeckSpec = {
  id: 'lux-2p1-39',
  name: '2+1 Lüks (39 koltuk)',
  family: '2+1',
  doorSide: 'right',
  tracks: TRACKS_2P1,
  rows: [...repeat(full3, 6), ...repeat(door3, 2), ...repeat(full3, 5), { back: 4 }],
}

/** 2+1, 41 seats — a single door row and a four-across back row (38 | 39 | 40, 41). */
export const DECK_2P1_41: DeckSpec = {
  id: 'lux-2p1-41',
  name: '2+1 Lüks (41 koltuk)',
  family: '2+1',
  doorSide: 'right',
  tracks: TRACKS_2P1,
  rows: [...repeat(full3, 7), door3, ...repeat(full3, 5), { back: 4 }],
}

/**
 * 2+1, 36 seats — the shorter cabin. No WC: Turkish intercity coaches stop at
 * rest areas rather than carry one, and the on-board WC drawn here before was
 * a fixture nobody recognised.
 */
export const DECK_2P1_36: DeckSpec = {
  id: 'lux-2p1-36',
  name: '2+1 Lüks (36 koltuk)',
  family: '2+1',
  doorSide: 'right',
  tracks: TRACKS_2P1,
  rows: [...repeat(full3, 6), ...repeat(door3, 2), ...repeat(full3, 4), { back: 4 }],
}

/** 2+2, 46 seats — the standard 12–13 m single-axle coach. */
export const DECK_2P2_46: DeckSpec = {
  id: 'std-2p2-46',
  name: '2+2 Standart (46 koltuk)',
  family: '2+2',
  doorSide: 'right',
  tracks: TRACKS_2P2,
  rows: [...repeat(full4, 6), door4, ...repeat(full4, 4), { back: 4 }],
}

/** 2+2, 54 seats — the 14–15 m twin-axle coach. */
export const DECK_2P2_54: DeckSpec = {
  id: 'std-2p2-54',
  name: '2+2 Standart (54 koltuk)',
  family: '2+2',
  doorSide: 'right',
  tracks: TRACKS_2P2,
  rows: [...repeat(full4, 7), door4, ...repeat(full4, 5), { back: 4 }],
}

// Keys are spelled out rather than computed from `.id`. A computed key widens
// to `string`, which makes `keyof typeof DECKS` become `string | number` and
// quietly erases the type safety this map exists to provide.
export const DECKS = {
  'lux-2p1-36': DECK_2P1_36,
  'lux-2p1-39': DECK_2P1_39,
  'lux-2p1-41': DECK_2P1_41,
  'std-2p2-46': DECK_2P2_46,
  'std-2p2-54': DECK_2P2_54,
} as const satisfies Record<string, DeckSpec>

export type DeckId = keyof typeof DECKS

export const DECK_IDS = Object.keys(DECKS) as DeckId[]

export function getDeck(id: string): DeckSpec {
  return DECKS[id as DeckId] ?? DECK_2P1_39
}

/** Seat-layout family as it appears in filters and on trip cards. */
export const SEAT_LAYOUTS = ['2+1', '2+2'] as const
export type SeatLayout = (typeof SEAT_LAYOUTS)[number]

/** URL token for a layout: `2+1` would decode to `2 1`, so it is never used raw. */
export function layoutToToken(layout: SeatLayout): string {
  return layout.replace('+', 'p')
}

export function tokenToLayout(token: string): SeatLayout | null {
  const value = token.replace('p', '+')
  return (SEAT_LAYOUTS as readonly string[]).includes(value) ? (value as SeatLayout) : null
}

export type { RowCell }
