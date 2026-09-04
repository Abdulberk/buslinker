import { describe, expect, it } from 'vitest'
import { DECK_TOKENS, layoutDeck, type DeckSpec } from './geometry'
import { DECK_2P1_36, DECK_2P1_39, DECK_2P1_41, DECK_2P2_46, DECK_2P2_54 } from './layouts'

const t = DECK_TOKENS

describe('layoutDeck — column pass', () => {
  it('places 2+1 tracks by prefix sum with the aisle off-centre', () => {
    const g = layoutDeck(DECK_2P1_39)
    const row0 = g.cells.filter((c) => c.row === 0).sort((a, b) => a.x - b.x)

    // 18 | seat 40 | gap 8 | aisle 26 | gap 8 | seat 40 | gap 4 | seat 40 | 18
    expect(row0.map((c) => c.x)).toEqual([18, 100, 144])
    expect(g.viewBox.w).toBe(202)

    // The aisle sits at 66..92, whose centre (79) is LEFT of the deck centre
    // (101) — because the left side carries one seat and the right side two.
    // That asymmetry is exactly what a 2+1 coach looks like, and is something
    // the old uniform `seatNum * 42` could never produce.
    expect(g.chrome.floor.x).toBe(66)
    expect(g.chrome.floor.w).toBe(26)
    expect(g.chrome.floor.x + g.chrome.floor.w / 2).toBeLessThan(g.viewBox.w / 2)
  })

  it('places 2+2 tracks symmetrically about the aisle', () => {
    const g = layoutDeck(DECK_2P2_46)
    const row0 = g.cells.filter((c) => c.row === 0).sort((a, b) => a.x - b.x)
    expect(row0.map((c) => c.x)).toEqual([18, 62, 144, 188])
    expect(g.viewBox.w).toBe(246)
    // Symmetric: the aisle centre is the deck centre.
    expect(g.chrome.floor.x + g.chrome.floor.w / 2).toBe(g.viewBox.w / 2)
  })
})

describe('layoutDeck — row pass', () => {
  it('is linear in the row index, not quadratic', () => {
    const g = layoutDeck(DECK_2P1_39)
    const ys = [...new Set(g.cells.map((c) => c.row))]
      .sort((a, b) => a - b)
      .map((r) => {
        // A compressed back row (four across, scaled down) is centred inside
        // its pitch, so its cell sits a hair below the row baseline. Undo that
        // offset: the claim under test is about the baseline, not the cell.
        const c = g.cells.find((c) => c.row === r)!
        return c.y - (t.seatH - c.h) / 2
      })

    const deltas = ys.slice(1).map((y, i) => y - ys[i]!)
    // Every gap identical. The old formula produced 42, 222, 402, 606.
    expect(new Set(deltas.map((d) => Math.round(d)))).toEqual(new Set([t.seatH + t.rowGap]))
    expect(ys[0]).toBe(t.noseLen + t.padTop)
  })

  it('derives the viewBox height from the last row so tokens cannot desync it', () => {
    const g = layoutDeck(DECK_2P1_39)
    const lastY = t.noseLen + t.padTop + (g.rowCount - 1) * (t.seatH + t.rowGap)
    expect(g.viewBox.h).toBe(lastY + t.seatH + t.padBottom)
  })
})

describe('layoutDeck — numbering', () => {
  it('numbers 2+1/38 in reading order with the real mid-door signature', () => {
    const g = layoutDeck(DECK_2P1_39)
    expect(g.seatCount).toBe(39)

    const at = (n: number) => g.bySeatNo.get(n)!
    // Seat 1 is the front-most seat on the driver's (left) single column.
    expect(at(1).track).toBe(0)
    expect(at(1).isSingle).toBe(true)
    expect(at(1).row).toBe(0)

    // The door blocks the right-hand pair for two rows, so the right columns
    // jump 18 -> 22 while the left single column runs 19, 20, 21.
    const leftColumn = g.seats.filter((s) => s.track === 0).map((s) => s.seatNo)
    expect(leftColumn).toContain(19)
    expect(leftColumn).toContain(20)
    expect(leftColumn).toContain(21)

    // The right pair always skips the left single, so a gap of 2 is normal.
    // The door is the one place the gap widens — 18 is followed by 22.
    const rightPair = g.seats
      .filter((s) => s.track >= 2 && !s.isBackRow)
      .map((s) => s.seatNo!)
      .sort((a, b) => a - b)
    expect(rightPair[rightPair.indexOf(18) + 1]).toBe(22)
    expect(rightPair.filter((n, i) => i > 0 && n - rightPair[i - 1]! > 2)).toEqual([22])
  })

  it('numbers 2+1/41 with a single door row and a 4-across back row', () => {
    const g = layoutDeck(DECK_2P1_41)
    expect(g.seatCount).toBe(41)
    // Seat 22 sits alone opposite the door; the right pair jumps 21 -> 23.
    expect(g.bySeatNo.get(22)!.track).toBe(0)
    const back = g.seats.filter((s) => s.isBackRow).map((s) => s.seatNo)
    expect(back).toEqual([38, 39, 40, 41])
  })

  it('gives 2+2 window seats the classic 4k+1 / 4k pattern', () => {
    const g = layoutDeck(DECK_2P2_54)
    expect(g.seatCount).toBe(54)
    const windows = g.seats
      .filter((s) => !s.isBackRow && s.isWindow)
      .map((s) => s.seatNo!)
      .sort((a, b) => a - b)
    expect(windows.slice(0, 6)).toEqual([1, 4, 5, 8, 9, 12])
  })

  it('keeps every catalogue layout at its advertised capacity', () => {
    expect(layoutDeck(DECK_2P1_36).seatCount).toBe(36)
    expect(layoutDeck(DECK_2P1_39).seatCount).toBe(39)
    expect(layoutDeck(DECK_2P1_41).seatCount).toBe(41)
    expect(layoutDeck(DECK_2P2_46).seatCount).toBe(46)
    expect(layoutDeck(DECK_2P2_54).seatCount).toBe(54)
  })

  it('assigns a contiguous 1..n with no gaps or repeats', () => {
    for (const deck of [DECK_2P1_36, DECK_2P1_41, DECK_2P2_46]) {
      const g = layoutDeck(deck)
      const nums = g.seats.map((s) => s.seatNo!).sort((a, b) => a - b)
      expect(nums).toEqual(Array.from({ length: g.seatCount }, (_, i) => i + 1))
    }
  })
})

describe('layoutDeck — pairs and singles', () => {
  it('marks the left column of a 2+1 as single and pairs the right two', () => {
    const g = layoutDeck(DECK_2P1_39)
    const bodySeats = g.seats.filter((s) => !s.isBackRow)
    for (const seat of bodySeats) {
      if (seat.track === 0) {
        expect(seat.isSingle).toBe(true)
        expect(seat.pairKey).toBeNull()
      } else {
        expect(seat.isSingle).toBe(false)
        expect(seat.pairKey).not.toBeNull()
      }
    }
  })

  it('makes pairing symmetric', () => {
    const g = layoutDeck(DECK_2P2_46)
    for (const seat of g.seats) {
      if (!seat.pairKey) continue
      expect(g.byKey.get(seat.pairKey)!.pairKey).toBe(seat.key)
    }
  })

  it('never pairs across the aisle', () => {
    const g = layoutDeck(DECK_2P2_54)
    const aisleTrack = DECK_2P2_54.tracks.findIndex((tr) => tr.kind === 'aisle')
    for (const seat of g.seats) {
      if (!seat.pairKey) continue
      const partner = g.byKey.get(seat.pairKey)!
      const lo = Math.min(seat.track, partner.track)
      const hi = Math.max(seat.track, partner.track)
      expect(lo < aisleTrack && hi > aisleTrack).toBe(false)
    }
  })
})

describe('layoutDeck — back row', () => {
  it('spans the full content width and ends flush with the right edge', () => {
    const g = layoutDeck(DECK_2P1_41)
    const back = g.seats.filter((s) => s.isBackRow).sort((a, b) => a.x - b.x)
    expect(back[0]!.x).toBe(t.padX)
    const right = back.at(-1)!
    expect(right.x + right.w).toBeCloseTo(g.viewBox.w - t.padX, 5)
  })

  it('compresses rather than overflows when the row is wider than the tracks', () => {
    const g = layoutDeck(DECK_2P1_41)
    const back = g.seats.filter((s) => s.isBackRow)
    for (const seat of back) {
      expect(seat.scale).toBeLessThanOrEqual(1)
      expect(seat.w).toBeLessThanOrEqual(t.seatW)
    }
  })

  it('vertically centres a compressed back-row seat in its row band', () => {
    const g = layoutDeck(DECK_2P1_41)
    const back = g.seats.filter((s) => s.isBackRow)
    const cys = new Set(back.map((s) => Math.round(s.cy)))
    expect(cys.size).toBe(1)
  })
})

describe('layoutDeck — keyboard neighbours', () => {
  it('steps across the aisle with no special case, because no cell exists there', () => {
    const g = layoutDeck(DECK_2P1_39)
    const row0 = g.cells.filter((c) => c.row === 0).sort((a, b) => a.x - b.x)
    const left = row0[0]!
    // Track 0 -> track 2: the aisle at track 1 emits no cell, so `right` skips it.
    expect(g.byKey.get(left.nb.right!)!.track).toBe(2)
    expect(left.nb.left).toBeNull()
    expect(row0.at(-1)!.nb.right).toBeNull()
  })

  it('walks up and down by nearest column across rows of differing width', () => {
    const g = layoutDeck(DECK_2P1_41)
    const lastBody = g.rowCount - 2
    const single = g.cells.find((c) => c.row === lastBody && c.track === 0)!
    const down = g.byKey.get(single.nb.down!)!
    expect(down.isBackRow).toBe(true)
    // The left single is leftmost, so it lands on the leftmost back-row seat.
    expect(down.ariaColIndex).toBe(1)
  })

  it('makes up/down mutually consistent along a column', () => {
    const g = layoutDeck(DECK_2P2_46)
    for (const cell of g.cells) {
      if (!cell.nb.down) continue
      const below = g.byKey.get(cell.nb.down)!
      expect(below.row).toBe(cell.row + 1)
    }
  })

  it('reaches every seat from the first cell using only arrow neighbours', () => {
    const g = layoutDeck(DECK_2P1_36)
    const seen = new Set<string>()
    const queue = [g.cells[0]!.key]
    while (queue.length > 0) {
      const key = queue.pop()!
      if (seen.has(key)) continue
      seen.add(key)
      const cell = g.byKey.get(key)!
      for (const next of [cell.nb.left, cell.nb.right, cell.nb.up, cell.nb.down]) {
        if (next && !seen.has(next)) queue.push(next)
      }
    }
    expect(seen.size).toBe(g.cells.length)
  })
})

describe('layoutDeck — fixtures', () => {
  it('merges a two-row, two-track door into one drawable block', () => {
    const g = layoutDeck(DECK_2P1_39)
    const doors = g.fixtures.filter((f) => f.kind === 'door')
    expect(doors).toHaveLength(1)
    const door = doors[0]!
    // Two tracks wide (40 + 4 + 40) and two rows tall (44 + 12 + 44).
    expect(door.w).toBe(t.seatW * 2 + t.pairGap)
    expect(door.h).toBe(t.seatH * 2 + t.rowGap)
    expect(door.x).toBe(144 - t.seatW - t.pairGap)
  })

  it('keeps a WC separate from the door', () => {
    // No catalogue deck carries a WC any more — Turkish coaches stop at rest
    // areas — but the fixture merger still has to keep two kinds apart when
    // they abut, so the case lives on as an inline spec.
    const withWc: DeckSpec = {
      ...DECK_2P1_39,
      rows: [
        { cells: ['seat', 'seat', 'seat'] },
        { cells: ['seat', 'door', 'door'] },
        { cells: ['seat', 'wc', 'wc'] },
        { back: 3 },
      ],
    }
    const g = layoutDeck(withWc)
    expect(g.fixtures.filter((f) => f.kind === 'door')).toHaveLength(1)
    expect(g.fixtures.filter((f) => f.kind === 'wc')).toHaveLength(1)
  })
})

describe('layoutDeck — purity', () => {
  it('returns identical geometry for identical input', () => {
    const a = layoutDeck(DECK_2P1_39)
    const b = layoutDeck(DECK_2P1_39)
    expect(JSON.stringify(a.cells)).toBe(JSON.stringify(b.cells))
    expect(a.viewBox).toEqual(b.viewBox)
  })

  it('scales with a token change instead of needing code edits', () => {
    const wide = layoutDeck(DECK_2P1_39, { ...t, seatW: 48 })
    expect(wide.viewBox.w).toBe(202 + 3 * 8)
    expect(wide.seatCount).toBe(39)
  })
})

describe('layoutDeck — turned a quarter turn', () => {
  const upright = layoutDeck(DECK_2P1_39)
  const turned = layoutDeck(DECK_2P1_39, DECK_TOKENS, 'horizontal')

  it('swaps the box it draws into', () => {
    expect(turned.viewBox.w).toBe(upright.viewBox.h)
    expect(turned.viewBox.h).toBe(upright.viewBox.w)
    expect(turned.aspectRatio).toBeCloseTo(upright.viewBox.h / upright.viewBox.w, 6)
    expect(turned.aspectRatio).toBeGreaterThan(1)
  })

  // The turn is presentation. Which seat is which, who it pairs with and where
  // the aisle falls are decided once, upright, and must survive untouched.
  it('changes nothing about the seats themselves', () => {
    expect(turned.seatCount).toBe(upright.seatCount)
    for (const seat of upright.seats) {
      const same = turned.byKey.get(seat.key)!
      expect(same.seatNo).toBe(seat.seatNo)
      expect(same.pairKey).toBe(seat.pairKey)
      expect(same.isSingle).toBe(seat.isSingle)
      expect(same.isWindow).toBe(seat.isWindow)
    }
  })

  it('carries the nose to the left and the driver side to the bottom', () => {
    const first = turned.bySeatNo.get(1)!
    const last = turned.bySeatNo.get(turned.seatCount)!
    // Seat 1 is at the front, which is now the left-hand end.
    expect(first.x).toBeLessThan(last.x)

    // In a 2+1 the singles ride on the driver's side, which the turn puts at
    // the bottom — a larger y than the paired seats.
    const singles = turned.seats.filter((s) => s.isSingle)
    const paired = turned.seats.filter((s) => !s.isSingle)
    const lowestSingle = Math.min(...singles.map((s) => s.y))
    const lowestPaired = Math.min(...paired.map((s) => s.y))
    expect(lowestSingle).toBeGreaterThan(lowestPaired)
  })

  it('turns the compass with the deck', () => {
    for (const cell of upright.cells) {
      const same = turned.byKey.get(cell.key)!
      expect(same.nb.left).toBe(cell.nb.up)
      expect(same.nb.right).toBe(cell.nb.down)
      expect(same.nb.up).toBe(cell.nb.right)
      expect(same.nb.down).toBe(cell.nb.left)
    }
  })

  it('rebuilds the grid so rows run along the coach', () => {
    expect(turned.ariaRowCount).toBe(upright.ariaColCount)
    expect(turned.ariaColCount).toBe(upright.ariaRowCount)
    for (const cell of turned.cells) {
      expect(cell.ariaRowIndex).toBeGreaterThanOrEqual(1)
      expect(cell.ariaRowIndex).toBeLessThanOrEqual(turned.ariaRowCount)
    }
  })

  // The chrome stays upright on purpose: BusShell turns the drawing with one
  // transform instead of the geometry keeping a second copy of the coach.
  it('leaves the coach drawing upright for the shell to turn', () => {
    expect(turned.chrome.shellPath).toBe(upright.chrome.shellPath)
    expect(turned.orientation).toBe('horizontal')
    expect(upright.orientation).toBe('vertical')
  })
})
