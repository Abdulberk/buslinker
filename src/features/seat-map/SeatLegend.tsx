import type { SeatVisualState } from '@/entities/seat/model'
import { cn } from '@/shared/lib/cn'
import { SeatGlyph } from './SeatGlyph'

/**
 * The key to the seat map.
 *
 * It renders the real glyph rather than a colour chip. A texture-and-shape
 * code is only learnable if the legend shows the same drawing the deck shows —
 * a plain swatch teaches the hue and nothing else, which is exactly what fails
 * for a passenger who cannot separate the blue and pink fills.
 */

interface LegendItem {
  readonly state: SeatVisualState
  readonly label: string
}

const WITH_GENDER: readonly LegendItem[] = [
  { state: 'available', label: 'Boş Koltuk' },
  { state: 'occupied-male', label: 'Dolu - Erkek' },
  { state: 'occupied-female', label: 'Dolu - Kadın' },
  { state: 'selected', label: 'Seçilen Koltuk' },
  { state: 'blocked', label: 'Cinsiyet Kısıtlı' },
]

const WITHOUT_GENDER: readonly LegendItem[] = [
  { state: 'available', label: 'Boş' },
  { state: 'disabled', label: 'Dolu' },
  { state: 'selected', label: 'Seçilen' },
]

export interface SeatLegendProps {
  hasGenderSelection: boolean
  className?: string
}

export function SeatLegend({ hasGenderSelection, className }: SeatLegendProps) {
  const items = hasGenderSelection ? WITH_GENDER : WITHOUT_GENDER

  return (
    <ul
      aria-label="Koltuk durumu açıklamaları"
      className={cn(
        'flex flex-wrap gap-x-5 gap-y-3',
        'sm:grid sm:grid-cols-2 sm:gap-x-4',
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.state} className="flex items-center gap-2">
          <span className="grid h-7 w-6.5 shrink-0 place-items-center" aria-hidden="true">
            <SeatGlyph state={item.state} />
          </span>
          <span className="text-xs text-fg-secondary">{item.label}</span>
        </li>
      ))}
    </ul>
  )
}
