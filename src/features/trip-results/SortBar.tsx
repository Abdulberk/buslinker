import { useId, type Ref } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { ICON } from '@/shared/config/assets'
import { AssetIcon } from '@/shared/ui/asset-icon'
import { pluralTr } from '@/shared/lib/tr'
import { SORT_OPTIONS } from '@/shared/lib/search-params'
import type { SortKey } from '@/shared/api/mock-server'

export interface SortBarProps {
  total: number
  sort: SortKey
  onSortChange: (sort: SortKey) => void
  onOpenFilters: () => void
  /** The sheet returns focus here on close; Radix cannot do it without a trigger. */
  filterButtonRef?: Ref<HTMLButtonElement>
  activeFilterCount: number
  className?: string
}

export function SortBar({
  total,
  sort,
  onSortChange,
  onOpenFilters,
  filterButtonRef,
  activeFilterCount,
  className,
}: SortBarProps) {
  const selectId = useId()

  return (
    <div
      className={cn(
        // The header is 4rem tall (4.5rem from lg); `--header-h` overrides both
        // if the shell ever publishes one.
        'sticky top-[var(--header-h,4rem)] lg:top-[var(--header-h,4.5rem)]',
        // No rule underneath: when stuck, the translucent surface over the
        // scrolling cards is separation enough, and a line here was one more
        // frame stacked under the search strip.
        'z-20 -mx-4 px-4 py-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0',
        'bg-surface/85 backdrop-blur-md supports-[not(backdrop-filter:blur(0))]:bg-surface',
        'flex flex-wrap items-center gap-x-4 gap-y-3',
        className,
      )}
    >
      <p className="text-sm text-fg-secondary">
        <b className="font-display font-semibold text-fg" data-numeric>
          {pluralTr(total, 'sefer')}
        </b>{' '}
        bulundu
      </p>

      <div className="ms-auto flex items-center gap-2">
        <label htmlFor={selectId} className="hidden text-sm text-fg-muted xs:block">
          Sırala
        </label>
        <div className="relative">
          {/* Decorative: the <select> carries its own label, so the glyph is
              orientation for sighted users only. */}
          <AssetIcon
            src={ICON.sort}
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted"
          />
          <select
            id={selectId}
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortKey)}
            className={cn(
              // A native <select> for its behaviour — keyboard, mobile pickers,
              // assistive tech — dressed as a ghost control rather than a box.
              'h-10 appearance-none rounded-lg border-0 bg-transparent',
              'ps-9 pe-8 text-sm font-medium text-fg',
              'transition-colors duration-(--duration-fast) hover:bg-surface-sunken',
            )}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted"
            aria-hidden="true"
          />
        </div>

        <button
          ref={filterButtonRef}
          type="button"
          onClick={onOpenFilters}
          className={cn(
            'inline-flex h-10 items-center gap-2 rounded-lg bg-surface-sunken px-3',
            'text-sm font-medium text-fg transition-colors duration-(--duration-fast)',
            'hover:bg-border lg:hidden',
          )}
        >
          <AssetIcon src={ICON.filters} className="size-4" />
          Filtrele
          {activeFilterCount > 0 ? (
            <span
              className={cn(
                'inline-flex min-w-5 items-center justify-center rounded-full',
                'bg-brand px-1.5 py-px text-2xs font-semibold text-on-brand',
              )}
              data-numeric
            >
              {activeFilterCount}
              <span className="sr-only"> filtre etkin</span>
            </span>
          ) : null}
        </button>
      </div>
    </div>
  )
}
