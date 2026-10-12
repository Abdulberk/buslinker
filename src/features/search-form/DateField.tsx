import 'react-day-picker/style.css'

import { createContext, useContext, useId, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DayButton,
  DayPicker,
  getDefaultClassNames,
  type DayButtonProps,
  type Modifiers,
} from 'react-day-picker'
import { tr } from 'date-fns/locale'
import { ChevronDown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/primitives'
import { cn } from '@/shared/lib/cn'
import { useMediaQuery } from '@/shared/lib/use-media-query'
import { ICON } from '@/shared/config/assets'
import { AssetIcon } from '@/shared/ui/asset-icon'
import {
  formatDateLong,
  formatDateMedium,
  formatPrice,
  formatWeekdayShort,
  fromISODate,
  isValidISODate,
  toISODate,
  toISODateLocal,
} from '@/shared/lib/tr'
import { fareCalendarFor, fareOn, type FareCalendar } from './fare-calendar'

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
  /**
   * Sits at the end of the label's line, for the hero's quick-date chips. It
   * shares the line rather than adding one, so the date box stays level with
   * the city boxes beside it.
   */
  labelAside?: ReactNode
  /**
   * City ids, once both ends of the trip are chosen. With a route every
   * selectable day of the next two months carries its lowest fare, and each
   * month's cheapest day is marked; without one the picker shows dates alone.
   */
  route?: { from: string; to: string } | undefined
  className?: string | undefined
}

/**
 * The picker's own stylesheet sets these on `.rdp-root` outside any cascade
 * layer, and an unlayered rule beats every Tailwind utility whatever its
 * specificity — which is how the stock blue kept painting the month arrows
 * and the today marker through the token classes. Inline custom properties
 * outrank the stylesheet, so the tokens are set here instead.
 */
const PICKER_VARS = {
  '--rdp-accent-color': 'var(--color-brand)',
  '--rdp-accent-background-color': 'color-mix(in oklab, var(--color-brand) 10%, transparent)',
  '--rdp-today-color': 'var(--color-fg)',
  '--rdp-selected-border': '0',
  '--rdp-weekday-opacity': '1',
  '--rdp-outside-opacity': '1',
  '--rdp-nav_button-disabled-opacity': '0.4',
} as CSSProperties

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
  labelDayButton: (date: Date, modifiers?: Modifiers) => {
    const parts = [formatDateLong(date)]
    if (modifiers?.today) parts.unshift('Bugün')
    if (modifiers?.selected) parts.push('seçili')
    return parts.join(', ')
  },
}

type DayLabels = typeof TR_LABELS

/**
 * The route's fares, read by each day button. Handed down through context
 * rather than closed over by a component built per route, so `components`
 * stays one module constant and DayPicker's own memo, which is keyed on it,
 * survives a change of fares.
 */
const FareContext = createContext<FareCalendar | null>(null)

/**
 * The library's day button with the day's lowest fare under its number. It
 * wraps `DayButton` rather than drawing its own, because that component is
 * what moves focus to the day the arrow keys land on.
 */
function FareDayButton({ day, modifiers, children, ...props }: DayButtonProps) {
  const calendar = useContext(FareContext)
  if (!calendar) {
    return (
      <DayButton day={day} modifiers={modifiers} {...props}>
        {children}
      </DayButton>
    )
  }
  const fare = fareOn(calendar, day.isoDate, modifiers)
  return (
    <DayButton day={day} modifiers={modifiers} {...props}>
      {children}
      {/* Every cell keeps the fare line, empty or not, so the numbers sit at
          one height along a row. 10px under the sheet's 44px buttons, 11px in
          the popover's 48px ones: the sheet is what DateField shows below sm.
          Under 360px the seven columns are 41px wide, narrower than a
          four-digit lira fare at 10px, so the fare steps down once more there
          rather than run into its neighbour's. The fare is part of the
          button's aria-label, so this is visual only. A good deal is told by
          weight as well as by the green; on the chosen day's red fill both
          give way to the on-brand white. */}
      <span
        aria-hidden="true"
        data-numeric
        className={cn(
          'min-h-[1em] text-[0.625rem] leading-none tracking-tight whitespace-nowrap',
          'max-[359px]:text-[0.5625rem] max-[359px]:tracking-tighter sm:text-[0.6875rem]',
          modifiers.selected
            ? 'font-semibold text-on-brand'
            : fare?.best
              ? 'font-semibold text-success-fg'
              : 'font-normal text-fg-muted',
        )}
      >
        {fare ? formatPrice(fare.price) : null}
      </span>
    </DayButton>
  )
}

const DAY_COMPONENTS = { DayButton: FareDayButton }

/** The key to the green fares, shown only when some day carries one. */
function FareLegend({ className }: { className?: string }) {
  const { t } = useTranslation()
  return (
    <p className={cn('flex items-center gap-1.5 text-xs text-fg-secondary', className)}>
      <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-success" />
      {t('search.fareLegend')}
    </p>
  )
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

interface CalendarProps extends PanelProps {
  /** The route's fares, or null to show dates alone. */
  fares: FareCalendar | null
  /** TR_LABELS, with each day's fare added to its name once there are fares. */
  labels: DayLabels
}

/**
 * Lives in its own component so that closing the popover — which unmounts the
 * Radix content — also discards a half-typed date and its error.
 */
function DatePanel({ value, min, onPick, fares, labels }: CalendarProps) {
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

  // With fares every week grows by a line, and stacked under the typed date
  // the calendar no longer fits above the hero's date field on a 900px
  // screen, where the popover opens upwards and its top was cut off. So the
  // typed date and the quick dates move to a column beside the calendar: the
  // popover grows wider rather than taller. The DOM order stays as it is, so
  // the typed date is still the first stop for the keyboard.
  const wide = fares !== null

  return (
    <div
      className={
        wide
          ? 'grid grid-cols-[auto_11rem] grid-rows-[auto_1fr] items-start gap-x-4 gap-y-3'
          : 'flex flex-col gap-3'
      }
    >
      <div className={cn(wide && 'col-start-2 row-start-1')}>
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
            'placeholder:font-normal',
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

      <div
        className={
          wide
            ? 'col-start-1 row-span-2 row-start-1 border-r border-border pr-4'
            : 'border-t border-border pt-1'
        }
      >
        {fares && fares.best.size > 0 ? <FareLegend className="px-1 pb-1" /> : null}
        <FareContext value={fares}>
          <DayPicker
            mode="single"
            locale={tr}
            labels={labels}
            components={DAY_COMPONENTS}
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
            style={PICKER_VARS}
            classNames={{
              root: cn(defaults.root, 'text-sm'),
              month: `${defaults.month} w-full`,
              caption_label: `${defaults.caption_label} font-display text-base font-semibold text-fg`,
              button_previous: `${defaults.button_previous} rounded-lg text-fg-secondary hover:bg-hover`,
              button_next: `${defaults.button_next} rounded-lg text-fg-secondary hover:bg-hover`,
              // Not the library's class: its fill is the accent, which is the
              // brand red now. The arrows take the button's own text colour, a
              // neutral that clears 3:1 against the panel in both themes.
              chevron: 'inline-block fill-current',
              weekday: `${defaults.weekday} pb-1 text-2xs font-semibold text-fg-muted`,
              day: 'p-0.5 text-center align-middle',
              day_button: cn(
                'flex items-center justify-center rounded-lg text-sm text-fg',
                'transition-colors duration-(--duration-fast) hover:bg-hover',
                // A fare needs a line of its own under the number, and a
                // four-digit lira fare needs the width.
                fares ? 'size-12 flex-col gap-1 leading-none' : 'size-9',
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
        </FareContext>
      </div>

      <div className={cn('border-t border-border pt-3', wide && 'col-start-2 row-start-2')}>
        <QuickDates
          value={value}
          min={min}
          onPick={(iso) => {
            setError(null)
            onPick(iso)
          }}
        />
      </div>
    </div>
  )
}

/** Today, tomorrow and this weekend: most of what a coach search asks for. */
function QuickDates({ value, min, onPick }: PanelProps) {
  const { t } = useTranslation()
  const chips: { label: string; iso: string }[] = [
    { label: t('search.today'), iso: min },
    { label: t('search.tomorrow'), iso: addDays(min, 1) },
    { label: t('search.thisWeekend'), iso: upcomingWeekend(min) },
  ]
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => {
        const disabled = chip.iso < min
        return (
          <button
            key={chip.label}
            type="button"
            disabled={disabled}
            aria-pressed={chip.iso === value}
            onClick={() => onPick(chip.iso)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm',
              'transition-colors duration-(--duration-fast) disabled:opacity-40',
              // The pressed chip changes weight and edge as well as colour,
              // so it still reads as chosen without telling the hues apart.
              chip.iso === value
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
}

/** Monday first, in the interface language: 1 January 2024 was a Monday. */
const WEEKDAYS = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i))

/**
 * The phone's date sheet: the months one under another, scrolled with the
 * thumb, instead of a 300px calendar paged with arrows.
 *
 * The weekday row is drawn once, pinned above the scroll, so the months drop
 * their own; each month's name sticks to the top while its days pass under
 * it. The weekend columns carry the sky of the hero sheet, so the days most
 * trips are planned around can be found at a glance, and the chosen day is
 * the one solid fill, in the brand red, as on the desktop picker. The typed
 * date box stays a desktop affordance: on a phone it was a keyboard between
 * the person and the calendar.
 */
function DateSheet({ value, min, onPick, fares, labels }: CalendarProps) {
  const defaults = getDefaultClassNames()
  const selected = isValidISODate(value) ? fromISODate(value) : fromISODate(min)
  const minDate = fromISODate(min)
  const lastDate = fromISODate(min)
  lastDate.setFullYear(lastDate.getFullYear() + 1)
  const months =
    (lastDate.getFullYear() - minDate.getFullYear()) * 12 +
    lastDate.getMonth() -
    minDate.getMonth() +
    1

  return (
    <>
      <div className="shrink-0 px-4 pt-3 pb-2">
        <QuickDates value={value} min={min} onPick={onPick} />
        {/* Above the scroll, so the key stays in view while the months pass. */}
        {fares && fares.best.size > 0 ? <FareLegend className="mt-2.5" /> : null}
      </div>

      <div
        aria-hidden="true"
        className="grid shrink-0 grid-cols-7 border-b border-border px-4 text-center text-2xs font-semibold text-fg-muted"
      >
        {WEEKDAYS.map((day, index) => (
          <span key={index} className={cn('py-2', index >= 5 && 'bg-info/8 text-fg-secondary')}>
            {formatWeekdayShort(day)}
          </span>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <FareContext value={fares}>
          <DayPicker
            mode="single"
            locale={tr}
            labels={labels}
            components={DAY_COMPONENTS}
            weekStartsOn={1}
            hideNavigation
            hideWeekdays
            numberOfMonths={months}
            selected={selected}
            defaultMonth={minDate}
            startMonth={minDate}
            endMonth={lastDate}
            disabled={{ before: minDate }}
            modifiers={{ weekend: { dayOfWeek: [0, 6] } }}
            modifiersClassNames={{ weekend: 'bg-info/8' }}
            onSelect={(day) => {
              if (day) onPick(toISODateLocal(day))
            }}
            style={PICKER_VARS}
            classNames={{
              root: cn(defaults.root, 'w-full text-base'),
              months: 'flex flex-col',
              month: 'w-full',
              // Sticks while its days scroll under it, on the sheet's own
              // surface so the rows do not show through.
              month_caption:
                'sticky top-0 z-10 -mx-4 flex justify-center bg-surface-raised px-4 pt-4 pb-2',
              caption_label: 'font-display text-base font-semibold text-fg',
              month_grid: 'w-full table-fixed border-collapse',
              day: 'p-0.5 text-center align-middle',
              day_button: cn(
                'mx-auto flex size-11 items-center justify-center rounded-xl text-base text-fg',
                'transition-colors duration-(--duration-fast) hover:bg-hover',
                // The fare stacks under the number inside the same 44px target.
                fares && 'flex-col gap-1 leading-none',
              ),
              today:
                '[&_button]:font-semibold [&_button]:ring-1 [&_button]:ring-border-strong [&_button]:ring-inset',
              selected: cn(
                '[&_button]:bg-brand [&_button]:font-semibold [&_button]:text-on-brand',
                '[&_button]:hover:bg-brand-hover',
              ),
              disabled:
                '[&_button]:cursor-default [&_button]:text-fg-subtle [&_button]:hover:bg-transparent',
              outside: 'invisible',
              hidden: 'invisible',
            }}
          />
        </FareContext>
      </div>
    </>
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
  labelAside,
  route,
  className,
}: DateFieldProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  /** Below sm the calendar is a sheet that takes the screen; see DateSheet. */
  const isPhone = !useMediaQuery('(min-width: 640px)')
  const labelId = `${id}-label`
  const min = minDate && isValidISODate(minDate) ? minDate : toISODate(new Date())
  const shown = isValidISODate(value) ? value : min

  // Keyed on the ids, not the route object the form rebuilds on every render:
  // the sixty days are priced once per pair of cities, here rather than in
  // the panels, so opening the picker again does not price them again.
  const routeFrom = route?.from
  const routeTo = route?.to
  const fares = useMemo(
    () => (routeFrom && routeTo ? fareCalendarFor(routeFrom, routeTo, min) : null),
    [routeFrom, routeTo, min],
  )

  // A screen reader hears the fare the sighted reader sees under the number,
  // and the green as words. Built once per set of fares: `labels` is one of
  // the props DayPicker's own memo is keyed on.
  const labels = useMemo<DayLabels>(() => {
    if (!fares) return TR_LABELS
    return {
      ...TR_LABELS,
      labelDayButton: (date, modifiers) => {
        const name = TR_LABELS.labelDayButton(date, modifiers)
        const fare = fareOn(fares, toISODateLocal(date), modifiers ?? {})
        if (!fare) return name
        const parts = [name, t('search.dayFare', { price: formatPrice(fare.price) })]
        if (fare.best) parts.push(t('search.dayFareBest'))
        return parts.join(', ')
      },
    }
  }, [fares, t])

  const trigger = (
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
  )

  const caption = (
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
  )

  return (
    <div className={cn('flex flex-col', className)}>
      {labelAside ? (
        <div className="flex items-start justify-between gap-2">
          {caption}
          {labelAside}
        </div>
      ) : (
        caption
      )}

      {isPhone ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>{trigger}</DialogTrigger>
          <DialogContent
            ref={contentRef}
            side="bottom"
            title={label}
            className="h-[calc(100dvh-2.5rem)] max-h-none"
            onOpenAutoFocus={(event) => {
              // The chosen day takes focus, which also brings its month into
              // view: a date picked for next month opens on next month.
              event.preventDefault()
              const day = contentRef.current?.querySelector<HTMLElement>('[data-selected] button')
              if (!day) {
                contentRef.current?.focus({ preventScroll: true })
                return
              }
              day.focus({ preventScroll: true })
              day.scrollIntoView({ block: 'center' })
            }}
          >
            <DateSheet
              value={shown}
              min={min}
              fares={fares}
              labels={labels}
              onPick={(iso) => {
                onChange(iso)
                setOpen(false)
              }}
            />
          </DialogContent>
        </Dialog>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent
            ref={contentRef}
            align="start"
            // The priced panel is twice as wide, so it is often pushed back
            // from the window's edge; this keeps a gutter when it is, rather
            // than leaving it flush against the edge.
            collisionPadding={fares ? 16 : 0}
            className={cn(
              'w-auto max-w-[calc(100vw-2rem)] p-3',
              // Should a short window still leave the priced panel too little
              // room, it scrolls inside the popover rather than running off
              // the screen, where nothing could bring its top back.
              fares && 'max-h-(--radix-popover-content-available-height) overflow-y-auto',
            )}
            aria-label={t('search.pickDate', { label })}
            onOpenAutoFocus={(event) => {
              // The first focusable thing in the panel is the typed-date input.
              // On a touch screen focusing it raises the keyboard over the very
              // calendar the person tapped to see, so there focus goes to the
              // chosen day instead. A keyboard keeps the input first: typing a
              // date is the quick way there.
              if (!window.matchMedia('(pointer: coarse)').matches) return
              event.preventDefault()
              const panel = contentRef.current
              const day = panel?.querySelector<HTMLElement>('[data-selected] button')
              ;(day ?? panel)?.focus({ preventScroll: true })
            }}
          >
            <DatePanel
              value={shown}
              min={min}
              fares={fares}
              labels={labels}
              onPick={(iso) => {
                onChange(iso)
                setOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
