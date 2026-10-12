import { useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { ArrowLeftRight, ArrowUpDown } from 'lucide-react'
import { ICON } from '@/shared/config/assets'
import { AssetIcon } from '@/shared/ui/asset-icon'
import type { City } from '@/shared/api/catalog'
import { resultsPath } from '@/shared/lib/search-params'
import { toISODate } from '@/shared/lib/tr'
import { cn } from '@/shared/lib/cn'
import { useIsDesktop } from '@/shared/lib/use-media-query'
import { Button } from '@/shared/ui/button'
import { CityCombobox } from './CityCombobox'
import { DateField } from './DateField'
import { lastSearch, recentCities, rememberSearch } from './recent-searches'

export interface SearchFormProps {
  variant?: 'hero' | 'compact'
  initial?:
    | {
        from?: City | null | undefined
        to?: City | null | undefined
        date?: string | undefined
      }
    | undefined
  className?: string | undefined
}

/**
 * Occupies exactly the height of a field label, so a control that has no label
 * of its own still lines up with the field boxes beside it. Reserving the row
 * this way keeps the alignment intact when a field grows an error message,
 * which bottom-alignment would not.
 */
function LabelSpacer({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('mb-1.5 block text-xs font-semibold uppercase', className)}
    >
      {' '}
    </span>
  )
}

export function SearchForm({ variant = 'hero', initial, className }: SearchFormProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const hero = variant === 'hero'
  /**
   * From lg the hero form is the results page's strip, scaled up: one panel,
   * the fields in a row divided by hairlines, nothing boxed inside it. Four
   * outlined boxes with uppercase captions over them read as a form to fill
   * in; one row reads as a question to ask. Below lg the hero keeps its own
   * layouts — the phone's cards, the tablet's stacked card.
   */
  const strip = useIsDesktop()
  const heroStrip = hero && strip
  const fieldSize = hero ? 'lg' : 'md'

  // Read once, on mount. A hero form with no trip of its own opens holding the
  // last one searched in this browser; the results page always passes its own.
  const [start] = useState(() => initial ?? (hero ? lastSearch() : null))
  const [from, setFrom] = useState<City | null>(start?.from ?? null)
  const [to, setTo] = useState<City | null>(start?.to ?? null)
  const [date, setDate] = useState<string>(start?.date ?? toISODate(new Date()))
  const [invalid, setInvalid] = useState<'from' | 'to' | null>(null)
  const [swapped, setSwapped] = useState(false)
  const [recent] = useState(() => ({ from: recentCities('from'), to: recentCities('to') }))

  const fromRef = useRef<HTMLInputElement>(null)
  const toRef = useRef<HTMLInputElement>(null)

  const swap = () => {
    setFrom(to)
    setTo(from)
    setSwapped((previous) => !previous)
    setInvalid(null)
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!from) {
      setInvalid('from')
      fromRef.current?.focus()
      return
    }
    if (!to || to.id === from.id) {
      setInvalid('to')
      toRef.current?.focus()
      return
    }
    setInvalid(null)
    rememberSearch({ from: from.id, to: to.id, date })
    void navigate(resultsPath(from.slug, to.slug, date))
  }

  /** One field, in its own card on a phone and bare from sm up. */
  const heroCard = (children: ReactNode) => (
    // `sm:contents` dissolves this box from sm up, so anything that has to
    // survive into the desktop grid — a width, for one — goes on the child.
    //
    // Dark mode separates by lightness, and the card stands only one step
    // above the ground there; the ring is what keeps it a card.
    <div className="rounded-xl bg-surface p-3 shadow-sm sm:contents dark:ring-1 dark:ring-border">
      {children}
    </div>
  )

  /** The ISO day this many days from today, in Istanbul time. */
  const relativeISO = (offsetDays: number) => {
    const day = new Date()
    day.setDate(day.getDate() + offsetDays)
    return toISODate(day)
  }

  const swapButton = (bare: boolean) => (
    <button
      type="button"
      onClick={swap}
      aria-label={t('search.swap')}
      className={cn(
        'grid shrink-0 place-items-center rounded-full text-fg-secondary',
        // On the strip the disc is lifted by its shadow, not outlined: the
        // whole point of that layout is one frame, not five.
        bare
          ? 'size-9 bg-surface shadow-sm dark:ring-1 dark:ring-border'
          : 'tap-44 size-11 border border-border bg-surface',
        'transition-colors duration-(--duration-fast) ease-standard',
        'hover:border-brand/40 hover:bg-brand/8 hover:text-brand-fg',
      )}
    >
      <span
        className={cn(
          'grid place-items-center',
          'transition-transform duration-(--duration-slow) ease-spring',
          swapped && 'rotate-180',
        )}
      >
        {/* The arrows follow the fields: up and down while they stack, left
            and right once they share a row — from sm on the strip, from lg
            in the hero card. Stroked icons rather than the old raster-ish
            glyphs, which blurred at this size. */}
        <ArrowUpDown
          aria-hidden="true"
          className={cn('size-5', bare ? 'sm:hidden' : 'lg:hidden')}
        />
        <ArrowLeftRight
          aria-hidden="true"
          className={cn('hidden size-5', bare ? 'sm:block' : 'lg:block')}
        />
      </span>
    </button>
  )

  /**
   * Today and tomorrow are most of what a coach site is asked for; a chip
   * saves opening a calendar to say so. On a phone they stack beside the date
   * value; from sm they share the date label's line, so the row of fields
   * does not grow a line for them.
   */
  const dateChips = (layout: 'stack' | 'inline' | 'cell') => (
    <div
      role="group"
      aria-label={t('search.quickDates')}
      className={cn(
        'shrink-0 gap-1',
        layout === 'stack' && 'flex flex-col sm:hidden',
        layout === 'inline' && '-mt-1 hidden sm:flex',
        layout === 'cell' && 'flex flex-col justify-center',
      )}
    >
      {[
        { label: t('search.today'), iso: relativeISO(0) },
        { label: t('search.tomorrow'), iso: relativeISO(1) },
      ].map((chip) => {
        const pressed = date === chip.iso
        return (
          <button
            key={chip.label}
            type="button"
            aria-pressed={pressed}
            onClick={() => setDate(chip.iso)}
            className={cn(
              'border text-xs transition-colors duration-(--duration-fast)',
              layout === 'inline' ? 'h-6 rounded-full px-2.5' : 'rounded-lg px-2.5 py-1',
              // Weight and edge change with the colour, so the pressed chip
              // reads as chosen without telling two hues apart.
              pressed
                ? 'border-brand bg-brand/10 font-semibold text-brand-fg'
                : 'border-border bg-surface font-medium text-fg-secondary hover:bg-hover hover:text-fg',
            )}
          >
            {chip.label}
          </button>
        )
      })}
    </div>
  )

  const fromField = (
    <CityCombobox
      id={`${variant}-from`}
      label={t('search.from')}
      placeholder={t('search.fromPlaceholder')}
      value={from}
      onChange={(city) => {
        setFrom(city)
        if (invalid === 'from') setInvalid(null)
      }}
      excludeCityId={to?.id}
      recent={recent.from}
      error={invalid === 'from' ? t('search.fromError') : undefined}
      size={fieldSize}
      flush={hero && !heroStrip}
      bare={!hero || heroStrip}
      ref={fromRef}
    />
  )

  const toField = (
    <CityCombobox
      id={`${variant}-to`}
      label={t('search.to')}
      placeholder={t('search.toPlaceholder')}
      value={to}
      onChange={(city) => {
        setTo(city)
        if (invalid === 'to') setInvalid(null)
      }}
      excludeCityId={from?.id}
      recent={recent.to}
      error={invalid === 'to' ? t('search.toError') : undefined}
      size={fieldSize}
      flush={hero && !heroStrip}
      bare={!hero || heroStrip}
      ref={toRef}
    />
  )

  const dateField = (
    <DateField
      id={`${variant}-date`}
      label={t('search.date')}
      value={date}
      onChange={setDate}
      size={fieldSize}
      flush={hero && !heroStrip}
      bare={!hero || heroStrip}
      labelAside={hero && !heroStrip ? dateChips('inline') : undefined}
    />
  )

  if (!hero || heroStrip) {
    // One surface and nothing boxed inside it. Cells are separated by
    // hairlines rather than outlined; hover and focus tint the cell, not a
    // box. Below sm the cells stack and the hairlines turn horizontal. The
    // strip is lifted by shadow; in dark mode a shadow does not read, so a
    // single faint ring stands in for it there.
    return (
      <form
        onSubmit={onSubmit}
        aria-label={t('search.formLabel')}
        className={cn(
          'flex flex-col overflow-visible bg-surface sm:flex-row sm:items-stretch',
          'dark:ring-1 dark:ring-border',
          // In the hero the strip is the panel that rises out of the band: a
          // larger radius, a deeper shadow and an inner gutter, so its cells
          // tint as rounded tiles inside it rather than running to its edge.
          heroStrip ? 'rounded-3xl p-2 shadow-xl' : 'rounded-2xl shadow-md',
          className,
        )}
      >
        <div
          className={cn(
            'relative min-w-0 px-4 py-1 transition-colors duration-(--duration-fast)',
            'focus-within:bg-surface-sunken/60 hover:bg-surface-sunken/60',
            'flex-1 rounded-t-2xl sm:basis-0 sm:rounded-l-2xl sm:rounded-tr-none',
            heroStrip && 'px-5',
          )}
        >
          {fromField}
          {/* On the seam: bottom edge while stacked, right edge in the row. */}
          <span
            className={cn(
              'absolute right-4 bottom-0 z-10 translate-y-1/2',
              'sm:top-1/2 sm:right-0 sm:bottom-auto sm:translate-x-1/2 sm:-translate-y-1/2',
            )}
          >
            {swapButton(true)}
          </span>
        </div>

        <div
          className={cn(
            'relative min-w-0 px-4 py-1 transition-colors duration-(--duration-fast)',
            'focus-within:bg-surface-sunken/60 hover:bg-surface-sunken/60',
            'flex-1 border-t border-border sm:basis-0 sm:border-t-0 sm:border-l sm:pl-8',
            heroStrip && 'pr-5 sm:pl-9',
          )}
        >
          {toField}
        </div>

        <div
          className={cn(
            'relative min-w-0 px-4 py-1 transition-colors duration-(--duration-fast)',
            'focus-within:bg-surface-sunken/60 hover:bg-surface-sunken/60',
            'border-t border-border sm:basis-52 sm:border-t-0 sm:border-l',
            heroStrip && 'px-5 sm:basis-60',
          )}
        >
          {dateField}
        </div>

        {/* Today and tomorrow, stacked in a cell of their own beside the
            date they set, so the strip does not grow a line for them. */}
        {heroStrip ? (
          <div className="flex shrink-0 items-center border-l border-border px-3">
            {dateChips('cell')}
          </div>
        ) : null}

        <div className={cn('flex shrink-0 items-stretch', heroStrip ? 'pl-2' : 'p-2 sm:pl-3')}>
          <Button
            type="submit"
            size={heroStrip ? 'lg' : 'md'}
            variant="primary"
            className={cn(
              'w-full sm:w-auto',
              heroStrip ? 'h-auto px-8' : 'rounded-xl px-5 sm:h-auto',
            )}
          >
            <AssetIcon src={ICON.magnify} className={heroStrip ? 'size-5' : 'size-4'} />
            <span>{t('search.submit')}</span>
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      aria-label={t('search.formLabel')}
      className={cn(
        'rounded-2xl',
        // On a phone the form has no frame of its own: each field is its own
        // card on the page's ground, which is how every Turkish ticket app
        // lays this out. From sm the single card comes back exactly as it was.
        'sm:border sm:border-border sm:bg-surface sm:p-6 sm:shadow-lg',
        className,
      )}
    >
      <div className="grid gap-2 sm:gap-4 lg:grid-cols-[1fr_auto_1fr_auto_auto] lg:items-start">
        {/* On mobile the swap straddles the seam between the two fields, which
            is what says it acts on the pair. Right-aligning it on a row of its
            own read as an orphan and cost a row of height. `lg:contents`
            dissolves this wrapper on desktop so the five columns still line up. */}
        <div className="relative grid gap-2 sm:gap-4 lg:contents">
          {heroCard(fromField)}

          <div className="absolute top-1/2 right-3 z-10 -translate-y-1/2 lg:static lg:z-auto lg:flex lg:translate-y-0 lg:flex-col lg:justify-start">
            <LabelSpacer className="hidden lg:block" />
            <span className="flex items-center lg:h-14">{swapButton(false)}</span>
          </div>

          {heroCard(toField)}
        </div>

        {heroCard(
          <div className="flex items-center gap-2 lg:w-56">
            <div className="min-w-0 flex-1">{dateField}</div>
            {dateChips('stack')}
          </div>,
        )}

        <div className="flex flex-col pt-4 sm:pt-1 lg:pt-0">
          <LabelSpacer className="hidden lg:block" />
          <Button type="submit" size="lg" variant="primary" full className="lg:h-14 lg:w-auto">
            <AssetIcon src={ICON.magnify} className="size-5" />
            <span>{t('search.submit')}</span>
          </Button>
        </div>
      </div>
    </form>
  )
}
