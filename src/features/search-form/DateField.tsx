import 'react-day-picker/style.css'

import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DayPicker, getDefaultClassNames } from 'react-day-picker'
import { tr } from 'date-fns/locale'
import { ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/primitives'
import { cn } from '@/shared/lib/cn'
import { ICON } from '@/shared/config/assets'
import { AssetIcon } from '@/shared/ui/asset-icon'
import {
  formatDateLong,
  formatDateMedium,
  formatWeekdayShort,
  fromISODate,
  isValidISODate,
  toISODate,
  toISODateLocal,
} from '@/shared/lib/tr'

export interface DateFieldProps {
  /** ISO `YYYY-MM-DD`. */
  value: string
  onChange: (iso: string) => void
  label: string
  id: string
  /** ISO `YYYY-MM-DD`; earlier days are unselectable. Defaults to today. */
  minDate?: string | undefined
  size?: 'md' | 'lg' | undefined
  /** See CityCombobox: below sm the label is hidden and the field sits flat. */
  flush?: boolean | undefined
  /**
   * No frame of its own, at any size: the parent draws one around a row of
   * fields. Unlike `flush`, which only applies below sm, this is what the
   * results-page search strip wants everywhere — one surface, hairlines
   * between cells, and nothing boxed inside it.
   */
  bare?: boolean | undefined
  className?: string | undefined
}

const TYPED = /^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})$/

/**
 * react-day-picker's `locale` drives date FORMATTING only; the ARIA strings
 * come from `labels`, whose defaults are hard-coded English. Without this a
 * Turkish screen-reader user hears "Go to the Next Month" and "Today, …,
 * selected" on the one control every search passes through.
 *
 * Hoisted to a module constant because `labels` is a dependency of DayPicker's
 * top-level memo — an inline object would rebuild its formatters and class
 * names on every keystroke in the typed-date input.
 */
const TR_LABELS = {
  labelPrevious: () => 'Önceki ay',
  labelNext: () => 'Sonraki ay',
  labelMonthDropdown: () => 'Ay seç',
  labelYearDropdown: () => 'Yıl seç',
  labelWeekday: (date: Date) => formatWeekdayShort(date),
  labelDayButton: (date: Date, modifiers?: { today?: boolean; selected?: boolean }) => {
    const parts = [formatDateLong(date)]
    if (modifiers?.today) parts.unshift('Bugün')
    if (modifiers?.selected) parts.push('seçili')
    return parts.join(', ')
  },
}

function addDays(iso: string, days: number): string {
  const date = fromISODate(iso)
  date.setDate(date.getDate() + days)
  return toISODateLocal(date)
}

/** Saturday of the current week; Sunday counts as the weekend already here. */
function upcomingWeekend(iso: string): string {
  const day = fromISODate(iso).getDay()
  if (day === 0) return iso
  return addDays(iso, 6 - day)
}

function toTypedText(iso: string): string {
  if (!isValidISODate(iso)) return ''
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

function parseTypedText(raw: string): string | null {
  const parts = TYPED.exec(raw.trim())
  if (!parts) return null
  const [, day, month, year] = parts
  if (!day || !month || !year) return null
  const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  return isValidISODate(iso) ? iso : null
}

interface PanelProps {
  value: string
  min: string
  onPick: (iso: string) => void
}

/**
 * Lives in its own component so that closing the popover — which unmounts the
 * Radix content — also discards a half-typed date and its error.
 */
function DatePanel({ value, min, onPick }: PanelProps) {
  const { t } = useTranslation()
  const inputId = useId()
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`
  const defaults = getDefaultClassNames()

  const [draft, setDraft] = useState(() => toTypedText(value))
  const [error, setError] = useState<string | null>(null)

  const selected = isValidISODate(value) ? fromISODate(value) : fromISODate(min)
  const minDate = fromISODate(min)
  const lastDate = fromISODate(min)
  lastDate.setFullYear(lastDate.getFullYear() + 1)

  const submitTyped = () => {
    if (draft.trim().length === 0) {
      setError(null)
      setDraft(toTypedText(value))
      return
    }
    const iso = parseTypedText(draft)
    if (!iso) {
      setError(t('search.dateInvalid'))
      return
    }
    if (iso < min) {
      setError(t('search.datePast'))
      return
    }
    setError(null)
    onPick(iso)
  }

  const chips: { label: string; iso: string }[] = [
    { label: t('search.today'), iso: min },
    { label: t('search.tomorrow'), iso: addDays(min, 1) },
    { label: t('search.thisWeekend'), iso: upcomingWeekend(min) },
  ]

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label htmlFor={inputId} className="mb-1 block text-xs font-medium text-fg-secondary">
          {t('search.dateTyped')}
        </label>
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="GG.AA.YYYY"
          value={draft}
          data-numeric
          aria-describedby={error ? errorId : hintId}
          aria-invalid={error ? true : undefined}
          onChange={(event) => {
            setDraft(event.target.value)
            if (error) setError(null)
          }}
          onBlur={submitTyped}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return
            event.preventDefault()
            submitTyped()
          }}
          className={cn(
            'h-10 w-full rounded-lg border bg-surface px-3 text-base font-medium text-fg',
            'placeholder:font-normal placeholder:text-fg-subtle',
            'transition-colors duration-(--duration-fast) focus-within:border-brand',
            error ? 'border-danger' : 'border-border',
          )}
        />
        {error ? (
          <p id={errorId} role="alert" className="mt-1 text-xs font-medium text-danger-fg">
            {error}
          </p>
        ) : (
          <p id={hintId} className="mt-1 text-xs text-fg-muted">
            {t('search.dateHint')}
          </p>
        )}
      </div>

      <div className="border-t border-border pt-1">
        <DayPicker
          mode="single"
          locale={tr}
          labels={TR_LABELS}
          weekStartsOn={1}
          navLayout="around"
          showOutsideDays
          selected={selected}
          defaultMonth={selected}
          startMonth={minDate}
          endMonth={lastDate}
          disabled={{ before: minDate }}
          onSelect={(day) => {
            if (!day) return
            setError(null)
            onPick(toISODateLocal(day))
          }}
          classNames={{
            root: cn(
              defaults.root,
              '[--rdp-accent-color:var(--color-fg-secondary)] [--rdp-weekday-opacity:1]',
              'text-sm',
            ),
            month: `${defaults.month} w-full`,
            caption_label: `${defaults.caption_label} font-display text-base font-semibold text-fg`,
            button_previous: `${defaults.button_previous} rounded-lg text-fg-secondary hover:bg-surface-sunken`,
            button_next: `${defaults.button_next} rounded-lg text-fg-secondary hover:bg-surface-sunken`,
            weekday: `${defaults.weekday} pb-1 text-2xs font-semibold text-fg-muted`,
            day: 'p-0.5 text-center align-middle',
            day_button: cn(
              'flex size-9 items-center justify-center rounded-lg text-sm text-fg',
              'transition-colors duration-(--duration-fast) hover:bg-surface-sunken',
            ),
            // Today is outlined rather than tinted: colour alone would clash
            // with the selected fill on the day that is both.
            today:
              '[&_button]:font-semibold [&_button]:ring-1 [&_button]:ring-border-strong [&_button]:ring-inset',
            outside: '[&_button]:text-fg-subtle',
            selected: cn(
              '[&_button]:bg-brand [&_button]:font-semibold [&_button]:text-on-brand',
              '[&_button]:hover:bg-brand-hover',
            ),
            disabled: 'opacity-40 [&_button]:cursor-default [&_button]:hover:bg-transparent',
            hidden: 'invisible',
          }}
        />
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border pt-3">
        {chips.map((chip) => {
          const disabled = chip.iso < min
          return (
            <button
              key={chip.label}
              type="button"
              disabled={disabled}
              aria-pressed={chip.iso === value}
              onClick={() => {
                setError(null)
                onPick(chip.iso)
              }}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-medium',
                'transition-colors duration-(--duration-fast) disabled:opacity-40',
                chip.iso === value
                  ? 'border-brand/40 bg-brand/10 text-brand-fg'
                  : 'border-border bg-surface text-fg-secondary hover:bg-surface-sunken hover:text-fg',
              )}
            >
              {chip.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function DateField({
  value,
  onChange,
  label,
  id,
  minDate,
  size = 'lg',
  flush,
  bare,
  className,
}: DateFieldProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const labelId = `${id}-label`
  const min = minDate && isValidISODate(minDate) ? minDate : toISODate(new Date())
  const shown = isValidISODate(value) ? value : min

  return (
    <div className={cn('flex flex-col', className)}>
      <label
        htmlFor={id}
        id={labelId}
        className={cn(
          'mb-1.5 block text-xs font-semibold text-fg-secondary uppercase',
          // On a phone the caption sits tight above its value rather than
          // hiding: naming the field is what lets the three rows read as a
          // form instead of three anonymous boxes. It returns to its full
          // size from sm, where the layout has room for it.
          flush && 'mb-0 text-2xs sm:mb-1.5 sm:text-xs',
          // On the strip the value is the label: a city name, a date. The
          // caption stays in the document as the field's accessible name and
          // leaves the screen.
          bare && 'sr-only',
        )}
      >
        {label}
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={id}
            aria-labelledby={`${labelId} ${id}`}
            className={cn(
              'relative flex w-full items-center gap-2 rounded-xl border border-border bg-surface',
              'text-left font-medium text-fg',
              'transition-colors duration-(--duration-fast) ease-standard',
              'hover:border-border-strong data-[state=open]:border-brand',
              size === 'lg' ? 'h-11 px-3.5 text-base sm:h-14 sm:text-lg' : 'h-11 px-3 text-base',
              flush && 'border-0 px-0 sm:border sm:px-3.5',
              // Tall enough for the caption to sit above the date, matching the
              // city fields beside it.
              bare &&
                'h-14 rounded-none border-0 bg-transparent px-0 hover:border-transparent data-[state=open]:border-transparent',
            )}
          >
            <AssetIcon
              src={ICON.date}
              className={cn('shrink-0 text-fg-muted', size === 'lg' ? 'size-5' : 'size-4')}
            />
            {bare ? (
              <span className="min-w-0 flex-1">
                {/* A date is always set, so the caption is always lifted. It is
                    the sr-only label's twin for sighted users; aria-labelledby
                    already names the button, so this one is hidden from AT. */}
                <span aria-hidden="true" className="block text-xs font-medium text-fg-muted">
                  {label}
                </span>
                <span className="block truncate">{formatDateMedium(shown)}</span>
              </span>
            ) : (
              <span className="min-w-0 flex-1 truncate">{formatDateMedium(shown)}</span>
            )}
            <ChevronDown className="size-4 shrink-0 text-fg-muted" aria-hidden="true" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-auto max-w-[calc(100vw-2rem)] p-3"
          aria-label={t('search.pickDate', { label })}
        >
          <DatePanel
            value={shown}
            min={min}
            onPick={(iso) => {
              onChange(iso)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
