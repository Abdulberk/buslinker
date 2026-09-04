import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
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

  const swapButton = (
    <button
      type="button"
      onClick={swap}
      aria-label="Kalkış ve varış yerini değiştir"
      className={cn(
        'tap-44 grid size-11 shrink-0 place-items-center rounded-full',
        'border border-border bg-surface text-fg-secondary',
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
      label="Nereden"
      placeholder="Kalkış şehri"
      value={from}
      onChange={(city) => {
        setFrom(city)
        if (invalid === 'from') setInvalid(null)
      }}
      excludeCityId={to?.id}
      error={invalid === 'from' ? 'Kalkış şehrini seçin.' : undefined}
      size={fieldSize}
      flush={hero}
      ref={fromRef}
    />
  )

  const toField = (
    <CityCombobox
      id={`${variant}-to`}
      label="Nereye"
      placeholder="Varış şehri"
      value={to}
      onChange={(city) => {
        setTo(city)
        if (invalid === 'to') setInvalid(null)
      }}
      excludeCityId={from?.id}
      error={invalid === 'to' ? 'Varış şehrini seçin.' : undefined}
      size={fieldSize}
      flush={hero}
      className={hero ? 'border-t border-border sm:border-t-0' : undefined}
      ref={toRef}
    />
  )

  const dateField = (
    <DateField
      id={`${variant}-date`}
      label="Tarih"
      value={date}
      onChange={setDate}
      size={fieldSize}
      flush={hero}
      className={hero ? 'border-t border-border sm:border-t-0' : undefined}
    />
  )

  if (!hero) {
    return (
      <form
        onSubmit={onSubmit}
        aria-label="Sefer arama"
        className={cn(
          'flex flex-wrap items-start gap-x-2 gap-y-3',
          'rounded-xl border border-border bg-surface p-3',
          className,
        )}
      >
        <div className="min-w-32 flex-1 basis-32">{fromField}</div>

        <div className="flex shrink-0 flex-col">
          <LabelSpacer />
          {swapButton}
        </div>

        <div className="min-w-32 flex-1 basis-32">{toField}</div>
        <div className="min-w-32 flex-1 basis-32 sm:max-w-52">{dateField}</div>

        <div className="flex shrink-0 flex-col">
          <LabelSpacer />
          <Button type="submit" size="md" variant="primary">
            <AssetIcon src={ICON.magnify} className="size-4" />
            <span>Bilet Bul</span>
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      aria-label="Sefer arama"
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
            <span className="flex items-center lg:h-14">{swapButton}</span>
          </div>

          {toField}
        </div>

        <div className="lg:w-56">{dateField}</div>

        <div className="flex flex-col pt-4 sm:pt-1 lg:pt-0">
          <LabelSpacer className="hidden lg:block" />
          <Button type="submit" size="lg" variant="primary" full className="lg:h-14 lg:w-auto">
            <AssetIcon src={ICON.magnify} className="size-5" />
            <span>Bilet Bul</span>
          </Button>
        </div>
      </div>
    </form>
  )
}
