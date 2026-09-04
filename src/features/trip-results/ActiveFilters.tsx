import { X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { formatPrice } from '@/shared/lib/tr'
import { countActiveFilters, toggleFacet } from '@/shared/lib/search-params'
import type { SearchResult, TripFilters } from '@/shared/api/mock-server'

type FacetKey = 'bands' | 'operators' | 'layouts' | 'amenities' | 'fromTerminals' | 'toTerminals'

const FACET_KEYS: readonly FacetKey[] = [
  'bands',
  'operators',
  'layouts',
  'amenities',
  'fromTerminals',
  'toTerminals',
]

interface Chip {
  readonly id: string
  readonly label: string
  readonly next: TripFilters
}

function buildChips(result: SearchResult | undefined, filters: TripFilters): Chip[] {
  const chips: Chip[] = []

  for (const key of FACET_KEYS) {
    for (const value of filters[key] ?? []) {
      const bucket = result?.facets[key].find((b) => b.value === value)
      chips.push({
        id: `${key}:${value}`,
        label: bucket?.label ?? value,
        next: toggleFacet(filters, key, value),
      })
    }
  }

  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    const low = filters.priceMin ?? result?.priceBounds.min ?? 0
    const high = filters.priceMax ?? result?.priceBounds.max ?? 0
    const next = { ...filters }
    delete next.priceMin
    delete next.priceMax
    chips.push({
      id: 'price',
      label: `${formatPrice(low)} – ${formatPrice(high)}`,
      next,
    })
  }

  return chips
}

export interface ActiveFiltersProps {
  result: SearchResult | undefined
  filters: TripFilters
  onChange: (filters: TripFilters) => void
  className?: string
}

export function ActiveFilters({ result, filters, onChange, className }: ActiveFiltersProps) {
  if (countActiveFilters(filters) === 0) return null

  const chips = buildChips(result, filters)

  return (
    <div className={cn('flex flex-wrap items-center gap-x-2 gap-y-2', className)}>
      <h2 className="sr-only">Uygulanan filtreler</h2>
      <ul className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => (
          <li key={chip.id}>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border border-brand/25 bg-brand/8',
                'py-1 ps-3 pe-1 text-xs font-medium text-brand-fg',
              )}
            >
              <span className="max-w-52 truncate">{chip.label}</span>
              <button
                type="button"
                onClick={() => onChange(chip.next)}
                aria-label={`${chip.label} filtresini kaldır`}
                className={cn(
                  'tap-44 grid size-6 shrink-0 place-items-center rounded-full',
                  'transition-colors duration-(--duration-fast) hover:bg-brand/15',
                )}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onChange({})}
        className={cn(
          'tap-44 rounded-lg px-1.5 py-1 text-xs font-semibold text-fg-secondary underline underline-offset-4',
          'transition-colors hover:text-brand-fg',
        )}
      >
        Tümünü temizle
      </button>
    </div>
  )
}
