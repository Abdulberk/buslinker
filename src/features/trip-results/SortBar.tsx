import type { Ref } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { ICON } from '@/shared/config/assets'
import { AssetIcon } from '@/shared/ui/asset-icon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/shared/ui/primitives'
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

/**
 * The bar above the results: the count on the left, sort on the right and,
 * on a phone, the filters button beside it.
 */
export function SortBar({
  total,
  sort,
  onSortChange,
  onOpenFilters,
  filterButtonRef,
  activeFilterCount,
  className,
}: SortBarProps) {
  const { t } = useTranslation()
  const current = SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0]!

  return (
    <div
      className={cn(
        // The header is 4rem tall (4.5rem from lg); `--header-h` overrides both
        // if the shell ever publishes one.
        'sticky top-[var(--header-h,4rem)] lg:top-[var(--header-h,4.5rem)]',
        // No rule underneath: when stuck, the translucent surface over the
        // scrolling cards is separation enough.
        'z-20 -mx-4 px-4 py-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0',
        // The page's own ground, not a surface: at rest the bar is invisible, and
        // once stuck the translucency still masks the cards scrolling under it.
        'bg-bg/85 backdrop-blur-md supports-[not(backdrop-filter:blur(0))]:bg-bg',
        'flex items-center gap-2',
        className,
      )}
    >
      <p className="me-auto text-sm whitespace-nowrap text-fg-secondary">
        {/* The emphasis sits inside the sentence, and where in the sentence
            differs by language, so the tag travels with the copy rather than
            being wrapped around a slot here. */}
        <Trans
          i18nKey="results.foundRich"
          count={total}
          components={{
            b: <b className="font-display font-semibold text-fg" data-numeric />,
          }}
        />
      </p>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'group inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium whitespace-nowrap text-fg',
              'transition-colors duration-(--duration-fast) hover:bg-surface-sunken',
              'data-[state=open]:bg-surface-sunken',
            )}
          >
            <AssetIcon src={ICON.sort} className="size-4 text-fg-muted" />
            {/* On a phone the count, this and the filters button share one
                row, so the label lives in the menu and the trigger is its glyph. */}
            <span className="sr-only">{t('results.sort')}: </span>
            <span className="sr-only sm:not-sr-only">{t(`results.sortOption.${current.key}`)}</span>
            <ChevronDown
              className="size-4 text-fg-muted transition-transform duration-(--duration-fast) group-data-[state=open]:rotate-180"
              aria-hidden="true"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup value={sort} onValueChange={(v) => onSortChange(v as SortKey)}>
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {t(`results.sortOption.${option.key}`)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

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
        {t('results.filter')}
        {activeFilterCount > 0 ? (
          <span
            className={cn(
              'inline-flex min-w-5 items-center justify-center rounded-full',
              'bg-brand px-1.5 py-px text-2xs font-semibold text-on-brand',
            )}
            data-numeric
          >
            {activeFilterCount}
            <span className="sr-only">
              {' '}
              {t('results.activeFilters', { count: activeFilterCount })}
            </span>
          </span>
        ) : null}
      </button>
    </div>
  )
}
