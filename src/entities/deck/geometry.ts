/**
 * Deck geometry — the pure layout engine for a coach floor plan.
 *
 * Takes a declarative `DeckSpec` (rows of typed cells over column tracks) and
 * returns absolute boxes in SVG user units, a viewBox, seat numbers assigned in
 * reading order, ARIA grid coordinates, and precomputed arrow-key neighbours.
 *
 * No DOM, no React, no randomness — everything here is a pure function of its
 * arguments, which is what makes the whole layout unit-testable.
 *
 * Two properties are load-bearing and each has a test:
 *
 *   1. Row placement is a LINEAR recurrence, `y = NOSE + PAD + r * PITCH`.
 *      The old code used `row * (42 + (row - 1) * 90)`, which is quadratic in
 *      `row` — it yields 0, 42, 264, 666, so the deck could never line up at
 *      any spacing constant. That was the real reason the geometry never sat.
 *
 *   2. Seat numbers come from a SEPARATE pass over cells of kind `seat` in
 *      reading order, never from arithmetic on (row, column). Only a reading
 *      order pass reproduces the real Turkish numbering, where the mid-door
 *      interrupts one column and the opposite column runs consecutively.
 */

export type DeckOrientation = 'vertical' | 'horizontal'

export type CellKind = 'seat' | 'door' | 'wc' | 'stairs' | 'empty'

/** A column track. Aisle tracks hold no cells; they are pure spacing. */
export interface TrackSpec {
  readonly kind: 'seat' | 'aisle'
  readonly width?: number
}

/**
 * One entry per SEAT track, in track order. Adjacent identical non-seat cells
 * (both across tracks and down rows) are merged into one visual block, so a
 * two-row mid-door is written as `door` in the four cells it covers — there
 * are no spans to keep in sync.
 */
export type RowCell = CellKind

export interface CellsRow {
  readonly cells: readonly RowCell[]
}

/** A full-width back row of `back` seats, laid out ignoring the aisle. */
export interface BackRowSpec {
  readonly back: number
}

export type RowSpec = CellsRow | BackRowSpec

export interface DeckSpec {
  readonly id: string
  readonly name: string
  /** `2+1`, `2+2`, `1+1` — used for copy and filtering, not for geometry. */
  readonly family: string
  readonly tracks: readonly TrackSpec[]
  readonly rows: readonly RowSpec[]
  /** Which side of the coach the boarding door is on. Drives the shell art. */
  readonly doorSide?: 'left' | 'right'
}

export interface GeometryTokens {
  readonly seatW: number
  readonly seatH: number
  readonly pairGap: number
  readonly aisleGap: number
  readonly aisleW: number
  readonly rowGap: number
  readonly padX: number
  readonly padTop: number
  readonly padBottom: number
  readonly noseLen: number
  readonly noseR: number
  readonly tailR: number
  readonly shellStroke: number
  readonly wheelW: number
  readonly wheelH: number
  readonly backGap: number
}

/**
 * Frozen defaults. These live in SVG user units inside a viewBox and are never
 * rendered 1:1, so the 4px CSS spacing scale deliberately does not apply here —
 * do not "round 18 to 16", it changes every downstream percentage.
 */
export const DECK_TOKENS: GeometryTokens = Object.freeze({
  seatW: 40,
  seatH: 44,
  pairGap: 4,
  aisleGap: 8,
  aisleW: 26,
  rowGap: 12,
  padX: 18,
  padTop: 14,
  padBottom: 18,
  noseLen: 96,
  noseR: 44,
  tailR: 28,
  shellStroke: 3,
  wheelW: 12,
  wheelH: 54,
  backGap: 6,
})

export interface Box {
  readonly x: number
  readonly y: number
  readonly w: number
  readonly h: number
}

export interface Neighbours {
  readonly left: string | null
  readonly right: string | null
  readonly up: string | null
  readonly down: string | null
}

export interface PlacedCell extends Box {
  readonly key: string
  readonly kind: CellKind
  readonly row: number
  readonly track: number
  /** Assigned only to `seat` cells, in reading order, starting at 1. */
  readonly seatNo: number | null
  /** `w / seatW`. Compressed back rows scale below 1; normal rows are exactly 1. */
  readonly scale: number
  /** Centre of the cell, where the seat number is optically anchored. */
  readonly cx: number
  readonly cy: number
  readonly ariaRowIndex: number
  readonly ariaColIndex: number
  /** True for a seat with no partner across the pair gap — the "1" of a 2+1. */
  readonly isSingle: boolean
  /** True when the cell touches an outer wall. */
  readonly isWindow: boolean
  /** True for the last body row, where seats often do not recline. */
  readonly isBackRow: boolean
  /** The other seat of this seat's pair, if it has one. */
  readonly pairKey: string | null
  readonly nb: Neighbours
}

/** A merged run of identical non-seat cells, drawn as one block. */
export interface Fixture extends Box {
  readonly kind: Exclude<CellKind, 'seat' | 'empty'>
  readonly key: string
}

export interface DeckChrome {
  readonly shellPath: string
  readonly windshieldOuter: string
  readonly windshieldInner: string
  readonly floor: Box
  readonly wheels: readonly Box[]
  readonly driver: Box
  readonly wheel: { cx: number; cy: number; r: number }
}

export interface Geometry {
  readonly spec: DeckSpec
  readonly viewBox: Box
  /** `w / h` — feed straight into CSS `aspect-ratio`. */
  readonly aspectRatio: number
  readonly cells: readonly PlacedCell[]
  readonly seats: readonly PlacedCell[]
  readonly fixtures: readonly Fixture[]
  readonly byKey: ReadonlyMap<string, PlacedCell>
  readonly bySeatNo: ReadonlyMap<number, PlacedCell>
  readonly rowCount: number
  readonly ariaRowCount: number
  readonly ariaColCount: number
  readonly seatCount: number
  /**
   * `horizontal` means the deck has been turned a quarter turn anticlockwise:
   * cells, viewBox and ARIA indices are all in that turned space. `chrome` is
   * NOT — it stays upright and BusShell turns the whole SVG with one
   * transform, which beats keeping a second copy of the coach drawing.
   */
  readonly orientation: DeckOrientation
  readonly chrome: DeckChrome
}

const isBackRow = (row: RowSpec): row is BackRowSpec => 'back' in row

/** Gap between two adjacent tracks: wide beside the aisle, tight inside a pair. */
function gapBetween(a: TrackSpec, b: TrackSpec, t: GeometryTokens): number {
  return a.kind === 'aisle' || b.kind === 'aisle' ? t.aisleGap : t.pairGap
}

function trackWidth(track: TrackSpec, t: GeometryTokens): number {
  return track.width ?? (track.kind === 'aisle' ? t.aisleW : t.seatW)
}

export function layoutDeck(
  spec: DeckSpec,
  tokens: GeometryTokens = DECK_TOKENS,
  orientation: DeckOrientation = 'vertical',
): Geometry {
  const upright = layoutUpright(spec, tokens)
  return orientation === 'horizontal' ? turn(upright) : upright
}

/**
 * Turns a laid-out deck a quarter turn anticlockwise: the nose goes from the
 * top to the left and the driver's side from the left to the bottom, which is
 * how a coach is drawn on a wide screen.
 *
 * The layout is not computed twice. A rotation is exactly what this is, so the
 * upright model stays the only place that decides numbering, pairing and where
 * the aisle falls, and this moves the result.
 */
function turn(g: Geometry): Geometry {
  const W = g.viewBox.w
  const cols = g.ariaColCount
  const box = <T extends Box>(b: T) => ({ x: b.y, y: W - b.x - b.w, w: b.h, h: b.w })

  const cells = g.cells.map((c) => ({
    ...c,
    ...box(c),
    cx: c.cy,
    cy: W - c.cx,
    // A quarter turn moves the compass with it: what was toward the nose is
    // now toward the left, and the driver's side is now the bottom.
    nb: { left: c.nb.up, right: c.nb.down, up: c.nb.right, down: c.nb.left },
    // Visual rows now run along the coach, so the old column index becomes the
    // row — reversed, because the left-hand side ended up at the bottom.
    ariaRowIndex: cols - c.ariaColIndex + 1,
    ariaColIndex: c.ariaRowIndex,
  }))
  const seats = cells.filter((c) => c.kind === 'seat')

  return {
    ...g,
    orientation: 'horizontal',
    viewBox: { x: 0, y: 0, w: g.viewBox.h, h: g.viewBox.w },
    aspectRatio: g.viewBox.h / g.viewBox.w,
    cells,
    seats,
    fixtures: g.fixtures.map((f) => ({ ...f, ...box(f) })),
    byKey: new Map(cells.map((c) => [c.key, c])),
    bySeatNo: new Map(seats.map((c) => [c.seatNo!, c])),
    ariaRowCount: g.ariaColCount,
    ariaColCount: g.ariaRowCount,
  }
}

function layoutUpright(spec: DeckSpec, tokens: GeometryTokens): Geometry {
  const t = tokens

  // ---- Pass 1: columns, by prefix sum over the declared tracks -------------
  const colX: number[] = []
  const colW: number[] = []
  let x = t.padX
  for (let i = 0; i < spec.tracks.length; i++) {
    const track = spec.tracks[i]!
    if (i > 0) x += gapBetween(spec.tracks[i - 1]!, track, t)
    colX.push(x)
    colW.push(trackWidth(track, t))
    x += trackWidth(track, t)
  }
  const width = x + t.padX

  /** Indices of the seat-bearing tracks, in order — what a row's cells map onto. */
  const seatTracks = spec.tracks
    .map((track, i) => (track.kind === 'seat' ? i : -1))
    .filter((i) => i >= 0)

  // ---- Pass 2: rows, by linear recurrence ---------------------------------
  const rowPitch = t.seatH + t.rowGap
  const rowY = spec.rows.map((_, r) => t.noseLen + t.padTop + r * rowPitch)
  const lastRowY = rowY.at(-1) ?? t.noseLen + t.padTop
  const height = lastRowY + t.seatH + t.padBottom

  // ---- Pass 3: place cells ------------------------------------------------
  // Cells are built mutable and frozen into readonly `PlacedCell`s at the end;
  // the numbering, pairing and neighbour passes each fill in one more field.
  type Draft = { -readonly [K in keyof PlacedCell]: PlacedCell[K] }
  const drafts: Draft[] = []
  const contentW = width - 2 * t.padX

  spec.rows.forEach((row, r) => {
    const y = rowY[r]!

    if (isBackRow(row)) {
      // A full-width row ignores the aisle. Seats keep their natural width
      // where there is room and compress evenly where there is not; the run
      // always ends flush with the content edge.
      const n = row.back
      const naturalW = (contentW - (n - 1) * t.backGap) / n
      const cellW = Math.min(t.seatW, naturalW)
      const gap = n > 1 ? (contentW - n * cellW) / (n - 1) : 0
      for (let i = 0; i < n; i++) {
        const cx0 = t.padX + i * (cellW + gap)
        const scale = cellW / t.seatW
        const h = t.seatH * scale
        drafts.push({
          key: `r${r}c${i}`,
          kind: 'seat',
          row: r,
          track: i,
          seatNo: null,
          x: round2(cx0),
          y: round2(y + (t.seatH - h) / 2),
          w: round2(cellW),
          h: round2(h),
          scale: round4(scale),
          cx: round2(cx0 + cellW / 2),
          cy: round2(y + t.seatH / 2),
          ariaRowIndex: r + 1,
          ariaColIndex: 0,
          isSingle: false,
          isWindow: i === 0 || i === n - 1,
          isBackRow: true,
          pairKey: null,
          nb: EMPTY_NB,
        })
      }
      return
    }

    row.cells.forEach((cell, i) => {
      if (cell === 'empty') return
      const track = seatTracks[i]
      if (track === undefined) return
      drafts.push({
        key: `r${r}c${i}`,
        kind: cell,
        row: r,
        track,
        seatNo: null,
        x: colX[track]!,
        y,
        w: colW[track]!,
        h: t.seatH,
        scale: 1,
        cx: colX[track]! + colW[track]! / 2,
        cy: y + t.seatH / 2,
        ariaRowIndex: r + 1,
        ariaColIndex: 0,
        isSingle: false,
        isWindow: track === 0 || track === spec.tracks.length - 1,
        isBackRow: false,
        pairKey: null,
        nb: EMPTY_NB,
      })
    })
  })

  // ---- Pass 4: seat numbers, in reading order -----------------------------
  // Front to back, left to right, over seats only. Non-seat cells consume a
  // position without consuming a number, which is what produces the real
  // numbering quirks around a mid-coach door.
  let seatNo = 0
  for (const d of drafts) {
    if (d.kind === 'seat') {
      seatNo += 1
      d.seatNo = seatNo
    }
  }

  // ---- Pass 5: pairs and singles ------------------------------------------
  // Two seats form a pair when they sit in adjacent tracks with no aisle
  // between them. A seat with no such partner is a "single" — the 1 of a 2+1,
  // which is exempt from the gender rule and usually carries a surcharge.
  for (const d of drafts) {
    if (d.kind !== 'seat' || d.isBackRow) continue
    const partner = drafts.find(
      (o) =>
        o !== d &&
        o.kind === 'seat' &&
        o.row === d.row &&
        !o.isBackRow &&
        Math.abs(o.track - d.track) === 1 &&
        spec.tracks[Math.min(o.track, d.track)]!.kind === 'seat' &&
        spec.tracks[Math.max(o.track, d.track)]!.kind === 'seat',
    )
    d.pairKey = partner?.key ?? null
    d.isSingle = partner === undefined
  }

  // ---- Pass 6: ARIA column snapping ---------------------------------------
  // Rows do not share a column count (a body row has 3 cells, a back row 5),
  // so cluster every centre into canonical columns and index by cluster. This
  // is what lets ArrowDown from a body row land on the right back-row seat.
  const columns = clusterCentres(
    drafts.map((d) => d.cx),
    t.seatW / 2,
  )
  for (const d of drafts) {
    d.ariaColIndex = nearestIndex(columns, d.cx) + 1
  }

  // ---- Pass 7: neighbours --------------------------------------------------
  // Left/right is the adjacent cell in the same row by x. Because aisle tracks
  // emit no cell at all, ArrowRight steps across the aisle for free — there is
  // no special case anywhere in the key handler.
  const rowsOfCells = new Map<number, Draft[]>()
  for (const d of drafts) {
    const list = rowsOfCells.get(d.row) ?? []
    list.push(d)
    rowsOfCells.set(d.row, list)
  }
  for (const list of rowsOfCells.values()) list.sort((a, b) => a.x - b.x)

  for (const d of drafts) {
    const list = rowsOfCells.get(d.row)!
    const idx = list.indexOf(d)
    const up = nearestInRow(rowsOfCells.get(d.row - 1), d.ariaColIndex)
    const down = nearestInRow(rowsOfCells.get(d.row + 1), d.ariaColIndex)
    d.nb = {
      left: list[idx - 1]?.key ?? null,
      right: list[idx + 1]?.key ?? null,
      up: up?.key ?? null,
      down: down?.key ?? null,
    }
  }

  // ---- Pass 8: merge non-seat runs into drawable fixtures ------------------
  const fixtures = mergeFixtures(drafts)

  const cells: PlacedCell[] = drafts.map((d) => ({ ...d }))
  const seats = cells.filter((c) => c.kind === 'seat')

  return {
    spec,
    viewBox: { x: 0, y: 0, w: width, h: height },
    aspectRatio: width / height,
    cells,
    seats,
    fixtures,
    byKey: new Map(cells.map((c) => [c.key, c])),
    bySeatNo: new Map(seats.map((c) => [c.seatNo!, c])),
    rowCount: spec.rows.length,
    ariaRowCount: spec.rows.length,
    ariaColCount: columns.length,
    seatCount: seats.length,
    orientation: 'vertical',
    chrome: buildChrome(width, height, t, spec),
  }
}

const EMPTY_NB: Neighbours = { left: null, right: null, up: null, down: null }

function nearestInRow(
  list: readonly { ariaColIndex: number; key: string }[] | undefined,
  col: number,
) {
  if (!list || list.length === 0) return undefined
  let best = list[0]!
  let bestD = Math.abs(best.ariaColIndex - col)
  for (const c of list) {
    const d = Math.abs(c.ariaColIndex - col)
    if (d < bestD) {
      best = c
      bestD = d
    }
  }
  return best
}

/** Groups values that sit within `tolerance` of each other into one column. */
function clusterCentres(values: readonly number[], tolerance: number): number[] {
  const sorted = [...new Set(values)].sort((a, b) => a - b)
  const clusters: number[][] = []
  for (const v of sorted) {
    const last = clusters.at(-1)
    if (last && v - last[last.length - 1]! <= tolerance) last.push(v)
    else clusters.push([v])
  }
  return clusters.map((c) => c.reduce((s, v) => s + v, 0) / c.length)
}

function nearestIndex(values: readonly number[], target: number): number {
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < values.length; i++) {
    const d = Math.abs(values[i]! - target)
    if (d < bestD) {
      best = i
      bestD = d
    }
  }
  return best
}

/**
 * Merges adjacent cells of the same non-seat kind into one box, so a door
 * spanning two tracks and two rows is drawn once rather than four times.
 */
function mergeFixtures(cells: readonly PlacedCell[]): Fixture[] {
  const blocks = cells.filter(
    (c): c is PlacedCell & { kind: Exclude<CellKind, 'seat' | 'empty'> } =>
      c.kind !== 'seat' && c.kind !== 'empty',
  )
  const used = new Set<string>()
  const out: Fixture[] = []

  for (const start of blocks) {
    if (used.has(start.key)) continue
    const group: PlacedCell[] = []
    const queue = [start]
    used.add(start.key)
    while (queue.length > 0) {
      const cur = queue.pop()!
      group.push(cur)
      for (const other of blocks) {
        if (used.has(other.key) || other.kind !== cur.kind) continue
        const touchesX = other.x < cur.x + cur.w + 12 && cur.x < other.x + other.w + 12
        const touchesY = other.y < cur.y + cur.h + 16 && cur.y < other.y + other.h + 16
        if (touchesX && touchesY) {
          used.add(other.key)
          queue.push(other)
        }
      }
    }
    const x0 = Math.min(...group.map((g) => g.x))
    const y0 = Math.min(...group.map((g) => g.y))
    const x1 = Math.max(...group.map((g) => g.x + g.w))
    const y1 = Math.max(...group.map((g) => g.y + g.h))
    out.push({ key: `fx-${start.key}`, kind: start.kind, x: x0, y: y0, w: x1 - x0, h: y1 - y0 })
  }
  return out
}

function buildChrome(w: number, h: number, t: GeometryTokens, spec: DeckSpec): DeckChrome {
  const s = t.shellStroke / 2
  const l = s
  const r = w - s
  const top = s
  const bottom = h - s
  const nr = t.noseR
  const tr = t.tailR

  // Rounded-nose body: a big radius at the front, a tighter one at the rear.
  const shellPath = [
    `M ${l} ${top + nr}`,
    `A ${nr} ${nr} 0 0 1 ${l + nr} ${top}`,
    `H ${r - nr}`,
    `A ${nr} ${nr} 0 0 1 ${r} ${top + nr}`,
    `V ${bottom - tr}`,
    `A ${tr} ${tr} 0 0 1 ${r - tr} ${bottom}`,
    `H ${l + tr}`,
    `A ${tr} ${tr} 0 0 1 ${l} ${bottom - tr}`,
    'Z',
  ].join(' ')

  const inset = (d: number, radius: number) =>
    [
      `M ${l + d} ${top + d + radius}`,
      `A ${radius} ${radius} 0 0 1 ${l + d + radius} ${top + d}`,
      `H ${r - d - radius}`,
      `A ${radius} ${radius} 0 0 1 ${r - d} ${top + d + radius}`,
    ].join(' ')

  const wheelY1 = t.noseLen + 28
  const wheelY2 = h - t.padBottom - t.wheelH - 60
  const wheelY3 = wheelY2 - t.wheelH - 8
  const wheels: Box[] = [
    { x: -t.wheelW / 2, y: wheelY1, w: t.wheelW, h: t.wheelH },
    { x: w - t.wheelW / 2, y: wheelY1, w: t.wheelW, h: t.wheelH },
    { x: -t.wheelW / 2, y: wheelY3, w: t.wheelW, h: t.wheelH },
    { x: w - t.wheelW / 2, y: wheelY3, w: t.wheelW, h: t.wheelH },
    { x: -t.wheelW / 2, y: wheelY2, w: t.wheelW, h: t.wheelH },
    { x: w - t.wheelW / 2, y: wheelY2, w: t.wheelW, h: t.wheelH },
  ]

  // The aisle floor runs the length of the cabin behind the nose.
  const aisleTrack = spec.tracks.findIndex((tr2) => tr2.kind === 'aisle')
  let floor: Box = {
    x: w / 2 - t.aisleW / 2,
    y: t.noseLen,
    w: t.aisleW,
    h: h - t.noseLen - t.padBottom,
  }
  if (aisleTrack >= 0) {
    let ax = t.padX
    for (let i = 0; i < aisleTrack; i++) {
      if (i > 0) ax += gapBetween(spec.tracks[i - 1]!, spec.tracks[i]!, t)
      ax += trackWidth(spec.tracks[i]!, t)
    }
    ax += gapBetween(spec.tracks[aisleTrack - 1]!, spec.tracks[aisleTrack]!, t)
    floor = { x: ax, y: t.noseLen, w: t.aisleW, h: h - t.noseLen - t.padBottom }
  }

  return {
    shellPath,
    windshieldOuter: inset(10, nr - 10),
    windshieldInner: inset(20, nr - 20),
    floor,
    wheels,
    // The driver sits front-left on a right-hand-traffic coach.
    driver: { x: t.padX, y: 34, w: t.seatW, h: t.seatH },
    wheel: { cx: t.padX + t.seatW / 2, cy: 22, r: 10 },
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100
const round4 = (n: number) => Math.round(n * 10000) / 10000
