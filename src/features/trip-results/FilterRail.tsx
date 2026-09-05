import { useId, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Checkbox,
  Slider,
} from '@/shared/ui/primitives'
import { Skeleton } from '@/shared/ui/skeleton'
import { useTranslation } from 'react-i18next'
import { cn } from '@/shared/lib/cn'
import { formatPrice } from '@/shared/lib/tr'
import { countActiveFilters, toggleFacet } from '@/shared/lib/search-params'
import { TIME_BANDS } from '@/shared/api/catalog'
// The morning/noon/evening/night files shipped as icon+LABEL lockups, with
// "Sabah"/"Öğle"/"Akşam"/"Gece" drawn into the artwork as outlined paths.
// Their viewBoxes are now cropped to the glyph, so they can sit beside a row
// label without repeating the word.
import { BAND_ICON, ICON } from '@/shared/config/assets'
import { AssetIcon } from '@/shared/ui/asset-icon'
import type { FacetBucket, SearchResult, SortKey, TripFilters } from '@/shared/api/mock-server'

type FacetKey = 'bands' | 'operators' | 'layouts' | 'amenities' | 'fromTerminals' | 'toTerminals'

interface FacetGroup {
  readonly key: FacetKey
  /** Null where the project ships no glyph for that facet. */
  readonly icon: string | null
}

const GROUPS: readonly FacetGroup[] = [
  { key: 'bands', icon: ICON.departureHour },
  { key: 'operators', icon: ICON.bus },
  { key: 'layouts', icon: ICON.seatLayout },
  { key: 'amenities', icon: ICON.extraServices },
  { key: 'fromTerminals', icon: ICON.from },
  { key: 'toTerminals', icon: ICON.from },
]

const DEFAULT_OPEN = ['bands', 'operators', 'price']

const BAND_HINTS = new Map(TIME_BANDS.map((b) => [b.id as string, b.hint]))

/** Fares are generated on a 5 TL grid, so a finer step would only add jitter. */
const PRICE_STEP = 5

export interface FilterRailProps {
  result: SearchResult | undefined
  filters: TripFilters
  sort: SortKey
  onChange: (filters: TripFilters) => void
  className?: string
  /** Set on the mobile sheet so its heading is not a second one on the page. */
  headingLevel?: 'h2' | 'p'
}

export function FilterRail({
  result,
  filters,
  onChange,
  className,
  headingLevel = 'h2',
}: FilterRailProps) {
  const { t } = useTranslation()
  const activeCount = countActiveFilters(filters)
  const Heading = headingLevel

  if (!result) return <FilterRailSkeleton className={className} />

  const priceGroupVisible = result.priceBounds.max > result.priceBounds.min

  return (
    <div className={cn('text-fg', className)}>
      <div className="flex items-center justify-between gap-3 pb-1">
        <Heading className="font-display text-base font-bold text-fg">
          {t('results.filters')}
        </Heading>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={() => onChange({})}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium',
              'text-brand-fg transition-colors hover:bg-brand/8',
            )}
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Tümünü temizle
          </button>
        ) : null}
      </div>

      <Accordion type="multiple" defaultValue={DEFAULT_OPEN} className="border-t border-border">
        {GROUPS.map((group) => {
          const buckets = result.facets[group.key]
          // A single terminal is not a choice — the group would be decoration.
          const isTerminalGroup = group.key === 'fromTerminals' || group.key === 'toTerminals'
          if (buckets.length === 0 || (isTerminalGroup && buckets.length < 2)) return null

          const selected = filters[group.key] ?? []

          return (
            <AccordionItem
              key={group.key}
              value={group.key}
              className="border-b border-border last:border-b-0"
            >
              <AccordionTrigger>
                <GroupTitle
                  title={t(`results.group.${group.key}`)}
                  icon={group.icon}
                  count={selected.length}
                />
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-0.5">
                  {buckets.map((bucket) => (
                    <li key={bucket.value}>
                      <FacetRow
                        bucket={bucket}
                        groupKey={group.key}
                        checked={selected.includes(bucket.value)}
                        hint={group.key === 'bands' ? BAND_HINTS.get(bucket.value) : undefined}
                        icon={group.key === 'bands' ? BAND_ICON[bucket.value]?.base : undefined}
                        onToggle={() => onChange(toggleFacet(filters, group.key, bucket.value))}
                      />
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )
        })}

        {priceGroupVisible ? (
          <AccordionItem value="price" className="border-b border-border last:border-b-0">
            <AccordionTrigger>
              <GroupTitle
                title="Bilet Fiyatı"
                icon={ICON.ticketPrice}
                count={filters.priceMin !== undefined || filters.priceMax !== undefined ? 1 : 0}
              />
            </AccordionTrigger>
            <AccordionContent>
              <PriceFilter bounds={result.priceBounds} filters={filters} onChange={onChange} />
            </AccordionContent>
          </AccordionItem>
        ) : null}
      </Accordion>
    </div>
  )
}

function GroupTitle({ title, icon, count }: { title: string; icon: string | null; count: number }) {
  return (
    <span className="flex items-center gap-2">
      {icon ? <AssetIcon src={icon} className="size-4 text-fg-muted" /> : null}
      {title}
      {count > 0 ? (
        <span
          className={cn(
            'inline-flex min-w-5 items-center justify-center rounded-full',
            'border border-brand/25 bg-brand/10 px-1.5 py-px text-2xs font-semibold text-brand-fg',
          )}
          data-numeric
        >
          {count}
          <span className="sr-only"> seçili</span>
        </span>
      ) : null}
    </span>
  )
}

function FacetRow({
  bucket,
  groupKey,
  checked,
  hint,
  icon,
  onToggle,
}: {
  bucket: FacetBucket
  /** Bands are the one group whose values are UI words rather than data. */
  groupKey: FacetKey
  checked: boolean
  hint: string | undefined
  /** Only the departure bands carry one; masked, so it takes the row colour. */
  icon?: string | undefined
  onToggle: () => void
}) {
  const { t } = useTranslation()
  // A zero-count value stays put and greys out. Removing it would make the
  // list reflow under the pointer and read as a broken filter.
  const disabled = bucket.count === 0 && !checked

  // 44px stays the target where fingers are; a pointer does not need it, and
  // at six groups the rail reads as a list rather than a stack of buttons.
  const row = cn(
    '-mx-2 flex min-h-11 w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-1 text-left',
    'transition-colors duration-(--duration-fast) sm:min-h-9',
  )

  const body = (
    <>
      {icon ? (
        <AssetIcon src={icon} className={cn('size-6 shrink-0', !checked && 'text-fg-muted')} />
      ) : null}
      <span className="min-w-0 flex-1 truncate text-sm">
        {groupKey === 'bands' ? t(`results.band.${bucket.value}`) : bucket.label}
      </span>

      {/* A band shows its hours where the others show their count. The count
          still goes to assistive tech: it is the only thing that explains why
          a row is greyed out, and dropping it would leave that silent. */}
      <span
        className={cn('shrink-0 text-xs', checked ? 'text-brand-fg/75' : 'text-fg-muted')}
        data-numeric
      >
        {hint ?? bucket.count}
        <span className="sr-only">{hint ? `, ${bucket.count} sefer` : ' sefer'}</span>
      </span>
    </>
  )

  // The bands drop the checkbox and let the whole row be the control. There is
  // no box left to carry the state, so the row itself has to show it — hence
  // the brand tint rather than only a colour change on the text.
  if (icon) {
    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={onToggle}
        className={cn(
          row,
          disabled && 'cursor-not-allowed opacity-50',
          checked
            ? 'bg-brand/10 font-medium text-brand-fg'
            : 'text-fg not-disabled:cursor-pointer hover:bg-surface-sunken',
        )}
      >
        {body}
      </button>
    )
  }

  return (
    <label
      className={cn(
        row,
        'text-fg',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-surface-sunken',
      )}
    >
      <Checkbox checked={checked} disabled={disabled} onCheckedChange={() => onToggle()} />
      {body}
    </label>
  )
}

function PriceFilter({
  bounds,
  filters,
  onChange,
}: {
  bounds: { min: number; max: number }
  filters: TripFilters
  onChange: (filters: TripFilters) => void
}) {
  const { t } = useTranslation()
  const labelId = useId()
  const min = Math.floor(bounds.min / PRICE_STEP) * PRICE_STEP
  const max = Math.ceil(bounds.max / PRICE_STEP) * PRICE_STEP

  const committedLow = filters.priceMin ?? min
  const committedHigh = filters.priceMax ?? max

  // Dragging must feel live without writing a URL entry per pointer move, so
  // the thumbs are local while dragging and commit on release. When the URL
  // changes underneath (a chip removed, "Tümünü temizle"), the draft is
  // re-synced during render rather than in an effect — no second paint.
  const [draft, setDraft] = useState<[number, number]>([committedLow, committedHigh])
  const [synced, setSynced] = useState<[number, number]>([committedLow, committedHigh])
  if (synced[0] !== committedLow || synced[1] !== committedHigh) {
    setSynced([committedLow, committedHigh])
    setDraft([committedLow, committedHigh])
  }

  const commit = (values: number[]) => {
    const low = values[0] ?? min
    const high = values[1] ?? max
    const next = { ...filters }
    if (low <= min) delete next.priceMin
    else next.priceMin = low
    if (high >= max) delete next.priceMax
    else next.priceMax = high
    onChange(next)
  }

  return (
    <div role="group" aria-labelledby={labelId}>
      <p id={labelId} className="sr-only">
        Bilet fiyatı aralığı
      </p>
      <Slider
        min={min}
        max={max}
        step={PRICE_STEP}
        minStepsBetweenThumbs={1}
        value={draft}
        onValueChange={(values) => setDraft([values[0] ?? min, values[1] ?? max])}
        onValueCommit={commit}
        aria-label={t('results.priceRange')}
      />
      <div className="mt-1 flex items-center justify-between text-sm font-medium text-fg-secondary">
        <span data-numeric>{formatPrice(draft[0])}</span>
        <span className="text-fg-muted" aria-hidden="true">
          –
        </span>
        <span data-numeric>{formatPrice(draft[1])}</span>
      </div>
    </div>
  )
}

function FilterRailSkeleton({ className }: { className: string | undefined }) {
  return (
    <div className={cn('space-y-4', className)} aria-hidden="true">
      <Skeleton className="h-5 w-24" />
      {[0, 1, 2].map((group) => (
        <div key={group} className="space-y-2 border-t border-border pt-4">
          <Skeleton className="h-4 w-28" />
          {[0, 1, 2, 3].map((row) => (
            <div key={row} className="flex items-center gap-3 py-1.5">
              <Skeleton className="size-5 rounded-sm" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-3 w-6" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
