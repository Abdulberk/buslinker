import { Info, Sun } from 'lucide-react'
import type { SeatMap, SeatVisualState } from '@/entities/seat/model'
import { GenderMark, SeatGlyph } from './SeatGlyph'

/**
 * The key to the seat map, set above the coach so it is read before the first
 * tap rather than found after a refused one.
 *
 * It renders the real glyph rather than a colour chip. A texture-and-shape
 * code is only learnable if the legend shows the same drawing the deck shows —
 * a plain swatch teaches the hue and nothing else, which is exactly what fails
 * for a passenger who cannot separate the blue and pink fills. For the same
 * reason the occupied samples carry the gender mark the deck carries.
 */

interface LegendItem {
  readonly state: SeatVisualState
  readonly label: string
  readonly mark?: 'M' | 'F'
}

const WITH_GENDER: readonly LegendItem[] = [
  { state: 'available', label: 'Boş' },
  { state: 'selected', label: 'Seçtiğiniz' },
  { state: 'occupied-male', label: 'Dolu – erkek', mark: 'M' },
  { state: 'occupied-female', label: 'Dolu – kadın', mark: 'F' },
  { state: 'disabled', label: 'Satışa kapalı' },
]

// Without the gender rule a sold seat carries no passenger gender, so it is
// drawn exactly like a withheld one and the two share an entry.
const WITHOUT_GENDER: readonly LegendItem[] = [
  { state: 'available', label: 'Boş' },
  { state: 'selected', label: 'Seçtiğiniz' },
  { state: 'disabled', label: 'Dolu ya da satışa kapalı' },
]

const MARK_COLOR: Partial<Record<SeatVisualState, string>> = {
  'occupied-male': 'var(--seat-male-text)',
  'occupied-female': 'var(--seat-female-text)',
}

export interface SeatLegendProps {
  hasGenderSelection: boolean
  sunSide: SeatMap['sunSide']
  className?: string
}

export function SeatLegend({ hasGenderSelection, sunSide, className }: SeatLegendProps) {
  const items = hasGenderSelection ? WITH_GENDER : WITHOUT_GENDER

  return (
    <div className={className}>
      <ul aria-label="Koltuk durumları" className="flex flex-wrap gap-x-4 gap-y-2">
        {items.map((item) => (
          <li key={item.state} className="flex items-center gap-1.5">
            <span
              className="relative grid h-7 w-6.5 shrink-0 place-items-center"
              aria-hidden="true"
            >
              <SeatGlyph state={item.state} />
              {item.mark ? (
                // Coloured inline, like the deck's numbers: the seat tokens are
                // not utility colours, and this keeps the two in lockstep.
                <span
                  className="absolute inset-x-0 top-2.5 grid place-items-center"
                  style={{ color: MARK_COLOR[item.state] }}
                >
                  <GenderMark gender={item.mark} className="size-2.5" />
                </span>
              ) : null}
            </span>
            <span className="text-xs text-fg-secondary">{item.label}</span>
          </li>
        ))}
      </ul>

      {hasGenderSelection || sunSide !== 'none' ? (
        <div className="mt-3 space-y-1 text-xs text-fg-muted">
          {hasGenderSelection ? (
            <p className="flex gap-1.5">
              <Info className="mt-px size-3.5 shrink-0" aria-hidden="true" />
              Dolu bir koltuğun yanındaki koltuk yalnızca aynı cinsiyetten yolculara satılır.
            </p>
          ) : null}
          {sunSide !== 'none' ? (
            // The coach turns on a wide screen, so "left" alone would point at
            // the bottom of the drawing. The driver and the door are on the
            // plan in both orientations; naming them fixes the side.
            <p className="flex gap-1.5">
              <Sun className="mt-px size-3.5 shrink-0" aria-hidden="true" />
              {sunSide === 'left'
                ? 'Güneş çoğunlukla sol taraftan (sürücü tarafı) vuracak.'
                : 'Güneş çoğunlukla sağ taraftan (kapı tarafı) vuracak.'}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
