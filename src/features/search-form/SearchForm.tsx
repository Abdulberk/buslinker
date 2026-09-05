import { useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { ICON } from '@/shared/config/assets'
import { AssetIcon } from '@/shared/ui/asset-icon'
import type { City } from '@/shared/api/catalog'
import { resultsPath } from '@/shared/lib/search-params'
import { toISODate } from '@/shared/lib/tr'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'
import { CityCombobox } from './CityCombobox'
import { DateField } from './DateField'

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
  const fieldSize = hero ? 'lg' : 'md'

  const [from, setFrom] = useState<City | null>(initial?.from ?? null)
  const [to, setTo] = useState<City | null>(initial?.to ?? null)
  const [date, setDate] = useState<string>(initial?.date ?? toISODate(new Date()))
  const [invalid, setInvalid] = useState<'from' | 'to' | null>(null)
  const [swapped, setSwapped] = useState(false)

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
    void navigate(resultsPath(from.slug, to.slug, date))
  }

  /** One field, in its own card on a phone and bare from sm up. */
  const heroCard = (children: ReactNode) => (
    // `sm:contents` dissolves this box from sm up, so anything that has to
    // survive into the desktop grid — a width, for one — goes on the child.
    <div className="rounded-xl bg-surface p-3 shadow-sm sm:contents">{children}</div>
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
        <AssetIcon src={ICON.mobileSwap} className="size-5 lg:hidden" />
        <AssetIcon src={ICON.swap} className="hidden size-5 lg:block" />
      </span>
    </button>
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
      error={invalid === 'from' ? t('search.fromError') : undefined}
      size={fieldSize}
      flush={hero}
      bare={!hero}
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
      error={invalid === 'to' ? t('search.toError') : undefined}
      size={fieldSize}
      flush={hero}
      bare={!hero}
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
      flush={hero}
      bare={!hero}
    />
  )

  if (!hero) {
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
          'flex flex-col overflow-visible rounded-2xl bg-surface shadow-md sm:flex-row sm:items-stretch',
          'dark:ring-1 dark:ring-border',
          className,
        )}
      >
        <div
          className={cn(
            'relative min-w-0 px-4 py-1 transition-colors duration-(--duration-fast)',
            'focus-within:bg-surface-sunken/60 hover:bg-surface-sunken/60',
            'flex-1 rounded-t-2xl sm:basis-0 sm:rounded-l-2xl sm:rounded-tr-none',
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
          )}
        >
          {toField}
        </div>

        <div
          className={cn(
            'relative min-w-0 px-4 py-1 transition-colors duration-(--duration-fast)',
            'focus-within:bg-surface-sunken/60 hover:bg-surface-sunken/60',
            'border-t border-border sm:basis-52 sm:border-t-0 sm:border-l',
          )}
        >
          {dateField}
        </div>

        <div className="flex shrink-0 items-stretch p-2 sm:pl-3">
          <Button
            type="submit"
            size="md"
            variant="primary"
            className="w-full rounded-xl px-5 sm:h-auto sm:w-auto"
          >
            <AssetIcon src={ICON.magnify} className="size-4" />
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

        {/* Today and tomorrow are most of what a coach site is asked for, and
            on a phone they save opening a calendar to say so. */}
        {heroCard(
          <div className="flex items-center gap-2 lg:w-56">
            <div className="min-w-0 flex-1">{dateField}</div>
            <div className="flex shrink-0 flex-col gap-1 sm:hidden">
              {[
                { label: t('search.today'), offset: 0 },
                { label: t('search.tomorrow'), offset: 1 },
              ].map((chip) => {
                const iso = relativeISO(chip.offset)
                return (
                  <button
                    key={chip.label}
                    type="button"
                    aria-pressed={date === iso}
                    onClick={() => setDate(iso)}
                    className={cn(
                      'rounded-lg border px-2.5 py-1 text-xs font-medium',
                      'transition-colors duration-(--duration-fast)',
                      date === iso
                        ? 'border-brand/40 bg-brand/10 text-brand-fg'
                        : 'border-border bg-surface text-fg-secondary',
                    )}
                  >
                    {chip.label}
                  </button>
                )
              })}
            </div>
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
