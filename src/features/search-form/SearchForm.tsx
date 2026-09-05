import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
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
      className={hero ? 'border-t border-border sm:border-t-0' : undefined}
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
      className={hero ? 'border-t border-border sm:border-t-0' : undefined}
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
      className={cn('rounded-2xl border border-border bg-surface p-4 shadow-lg sm:p-6', className)}
    >
      {/* Below sm the three fields collapse into one divided list — the card
          around them is the only frame, which is how a phone form should read.
          From sm up nothing changes: the gaps and borders come straight back. */}
      <div className="grid gap-0 sm:gap-4 lg:grid-cols-[1fr_auto_1fr_auto_auto] lg:items-start">
        {/* On mobile the swap straddles the seam between the two fields, which
            is what says it acts on the pair. Right-aligning it on a row of its
            own read as an orphan and cost a row of height. `lg:contents`
            dissolves this wrapper on desktop so the five columns still line up. */}
        <div className="relative grid gap-0 sm:gap-4 lg:contents">
          {fromField}

          <div className="absolute top-1/2 right-3 z-10 -translate-y-1/2 lg:static lg:z-auto lg:flex lg:translate-y-0 lg:flex-col lg:justify-start">
            <LabelSpacer className="hidden lg:block" />
            <span className="flex items-center lg:h-14">{swapButton(false)}</span>
          </div>

          {toField}
        </div>

        <div className="lg:w-56">{dateField}</div>

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
