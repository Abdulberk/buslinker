import type { SeatVisualState } from '@/entities/seat/model'

/**
 * One seat, drawn once.
 *
 * The old code shipped the same 33x33 rectangle stack six times over, with the
 * fill and stroke hardcoded per state — so state was baked into geometry and
 * changing the drawing meant editing six copies. Here there is a single glyph
 * and state arrives as CSS custom properties.
 *
 * Geometry is a coach seat seen from above: backrest at the top, cushion
 * below, two armrest bolsters. The armrests' outer stroke edges land at
 * exactly x=0 and x=40 (0.75 - 1.5/2 = 0), so a seat fills its cell precisely
 * and the 4-unit pair gutter and 8-unit aisle gutter are real clearance rather
 * than optical guesswork.
 *
 * Every stroke carries `vector-effect="non-scaling-stroke"` so a compressed
 * back row keeps the same line weight as the rest of the coach — without it,
 * a 0.925 scale visibly reads as a different drawing.
 */

const FILL: Record<SeatVisualState, string> = {
  available: 'var(--seat-available-fill)',
  selected: 'var(--seat-selected-fill)',
  'occupied-male': 'var(--seat-male-fill)',
  'occupied-female': 'var(--seat-female-fill)',
  disabled: 'var(--seat-disabled-fill)',
}

const STROKE: Record<SeatVisualState, string> = {
  available: 'var(--seat-available-border)',
  selected: 'var(--seat-selected-border)',
  'occupied-male': 'var(--seat-male-border)',
  'occupied-female': 'var(--seat-female-border)',
  disabled: 'var(--seat-disabled-border)',
}

/**
 * One weight for every line of the seat — body, crease, armrests, selected
 * or not. Selection is carried by the fill and the badge; a heavier outline
 * on top of that was a third voice. `non-scaling-stroke` makes this screen
 * pixels, so 1.2 is 1.2 at any deck size.
 */
const LINE = 1.2

const BODY_PATH =
  'M10.5 2.25 H29.5 A5 5 0 0 1 34.5 7.25 V10 Q36.5 10 36.5 12 V34.75 A7 7 0 0 1 29.5 41.75 H10.5 A7 7 0 0 1 3.5 34.75 V12 Q3.5 10 5.5 10 V7.25 A5 5 0 0 1 10.5 2.25 Z'

export function SeatGlyph({
  state,
  turned = false,
}: {
  state: SeatVisualState
  /**
   * The deck is lying down. The drawing has its backrest at the top, so a
   * seat facing the driver on a lying-down coach — driver at the left — needs
   * the backrest on the RIGHT: a quarter turn clockwise. Note that this is
   * the opposite turn to the one the coach took; turning the seat the same
   * way would have put its back to the driver.
   */
  turned?: boolean
}) {
  const stroke = STROKE[state]
  const isOccupied = state === 'occupied-male' || state === 'occupied-female'

  return (
    <svg
      viewBox={turned ? '0 0 44 40' : '0 0 40 44'}
      className="size-full"
      aria-hidden="true"
      focusable="false"
      shapeRendering="geometricPrecision"
    >
      {/* Occupied seats carry a 45-degree hatch as well as a hue, so the state
          survives for the ~8% of men with colour-vision deficiency for whom
          the blue/pink pair collapses (WCAG 1.4.1). */}
      {isOccupied ? (
        <defs>
          <pattern
            id={`hatch-${state}`}
            width="5"
            height="5"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="5" stroke={stroke} strokeWidth="0.8" opacity="0.35" />
          </pattern>
        </defs>
      ) : null}

      {/* translate(44 0) rotate(90): the 40x44 upright drawing lands in the
          44x40 turned cell with its top edge on the right. */}
      <g transform={turned ? 'translate(44 0) rotate(90)' : undefined}>
        <path
          d={BODY_PATH}
          fill={FILL[state]}
          stroke={stroke}
          strokeWidth={LINE}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {isOccupied ? <path d={BODY_PATH} fill={`url(#hatch-${state})`} stroke="none" /> : null}

        {/* The crease where backrest meets cushion — the one detail that makes
          the shape read as a seat rather than a rounded rectangle. */}
        <path
          d="M6.5 13.5 Q20 16.5 33.5 13.5"
          fill="none"
          stroke={stroke}
          strokeWidth={LINE}
          strokeLinecap="round"
          opacity="0.5"
          vectorEffect="non-scaling-stroke"
        />

        {/* Armrest bolsters, drawn after the body so their stroke crosses it. */}
        <rect
          x="0.75"
          y="15"
          width="5"
          height="21"
          rx="2.5"
          fill={FILL[state]}
          stroke={stroke}
          strokeWidth={LINE}
          vectorEffect="non-scaling-stroke"
        />
        <rect
          x="34.25"
          y="15"
          width="5"
          height="21"
          rx="2.5"
          fill={FILL[state]}
          stroke={stroke}
          strokeWidth={LINE}
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  )
}

/**
 * The gender mark on an occupied seat. Colour is the fourth channel here, not
 * the first: the fills differ by a barely-perceptible amount, so the glyph is
 * what actually carries the information.
 */
export function GenderMark({ gender }: { gender: 'M' | 'F' }) {
  return (
    <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true" focusable="false">
      {gender === 'M' ? (
        <>
          <circle cx="4.6" cy="7.4" r="3" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M7.4 4.6 L10.6 1.4 M10.6 1.4 H7.8 M10.6 1.4 V4.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <circle cx="6" cy="4.4" r="3" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M6 7.6 V11 M4.3 9.4 H7.7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  )
}
