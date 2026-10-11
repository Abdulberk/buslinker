import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, Ref } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, History } from 'lucide-react'
import { CITIES, cityById, type City } from '@/shared/api/catalog'
import { compareTr, foldTr } from '@/shared/lib/tr'
import { cn } from '@/shared/lib/cn'
import { ICON } from '@/shared/config/assets'
import { useMediaQuery } from '@/shared/lib/use-media-query'
import { AssetIcon } from '@/shared/ui/asset-icon'
import { Dialog, DialogContent } from '@/shared/ui/primitives'
import { VisuallyHidden } from '@/shared/ui/visually-hidden'

export interface CityComboboxProps {
  value: City | null
  onChange: (city: City | null) => void
  label: string
  id: string
  placeholder?: string | undefined
  /** Hides one city so the same place cannot sit on both ends of a journey. */
  excludeCityId?: string | undefined
  error?: string | undefined
  size?: 'md' | 'lg' | undefined
  /**
   * Below sm, drop the label from view and let the field sit flat.
   * For the hero form on a phone, where the labels are chrome the
   * placeholders already carry and every row of it pushes the search
   * button further down the screen. Never affects sm and up.
   */
  flush?: boolean | undefined
  /**
   * No frame of its own, at any size: the parent draws one around a row of
   * fields. Unlike `flush`, which only applies below sm, this is what the
   * results-page search strip wants everywhere — one surface, hairlines
   * between cells, and nothing boxed inside it.
   *
   * The label floats: it sits in the field as its prompt while the field is
   * empty and lifts to a small caption above the value once the field has
   * focus or a city, so the strip carries no captions of its own.
   */
  bare?: boolean | undefined
  /**
   * Cities this browser recently searched from (or to), newest first. Listed
   * above the popular ones while nothing has been typed, because the trip a
   * person searched last week is the likeliest one they want again.
   */
  recent?: readonly City[] | undefined
  className?: string | undefined
  ref?: Ref<HTMLInputElement>
}

/**
 * `hits` is the filtered list once something is typed; the other three are
 * the lists an untouched field opens with.
 */
type SectionKey = 'recent' | 'popular' | 'all' | 'hits'

interface Option {
  city: City
  /** Slice of `city.name` that matched, for the <mark>. Empty for plate hits. */
  start: number
  end: number
  /** 0 = name prefix, 1 = name substring, 2 = plate. Lower sorts first. */
  rank: number
  /** A city can sit in two lists at once, so element ids carry the list too. */
  section: SectionKey
}

interface Section {
  key: SectionKey
  options: readonly Option[]
}

const SORTED_CITIES: readonly City[] = [...CITIES].sort((a, b) => compareTr(a.name, b.name))

/**
 * Where most coach trips start and end, in that order rather than A to Z:
 * opening the list on Adana, Afyon and Aksaray made everyone scroll past
 * cities they were not looking for to reach the ones nearly everyone is.
 */
const POPULAR: readonly City[] = ['34', '6', '35', '7', '16', '1']
  .map((id) => cityById(id))
  .filter((city): city is City => city !== undefined)

function plainOptions(cities: readonly City[], section: SectionKey): Option[] {
  return cities.map((city) => ({ city, start: 0, end: 0, rank: 0, section }))
}

/**
 * `foldTr` strips diacritics through NFD, which is length-preserving for every
 * precomposed Turkish letter, so an index in fold space maps 1:1 back onto the
 * original name. The length guard keeps the highlight from drifting if that
 * ever stops holding for a newly added city.
 */
function match(city: City, folded: string): Option | null {
  const name = foldTr(city.name)
  if (name.length === city.name.length) {
    const at = name.indexOf(folded)
    if (at === 0) return { city, start: 0, end: folded.length, rank: 0, section: 'hits' }
    if (at > 0) return { city, start: at, end: at + folded.length, rank: 1, section: 'hits' }
  } else if (name.includes(folded)) {
    return { city, start: 0, end: 0, rank: 1, section: 'hits' }
  }
  if (String(city.plate).startsWith(folded)) {
    return { city, start: 0, end: 0, rank: 2, section: 'hits' }
  }
  return null
}

export function CityCombobox({
  value,
  onChange,
  label,
  id,
  placeholder,
  excludeCityId,
  error,
  size = 'lg',
  flush,
  bare,
  recent,
  className,
  ref,
}: CityComboboxProps) {
  const { t } = useTranslation()
  const reactId = useId()
  const listboxId = `${id}-listbox`
  const errorId = `${id}-error`
  const statusId = `${id}-status`

  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  /**
   * Below sm the list is not a dropdown under the field but a sheet that
   * takes the screen, the way the travel apps people already know do it. A
   * 288px dropdown under a field in the middle of a phone left the keyboard,
   * the list and the form fighting over the same half screen; the sheet gives
   * the list the whole of it, with the search box at its top. The field itself
   * becomes the sheet's trigger and no longer takes text.
   */
  const isPhone = !useMediaQuery('(min-width: 640px)')
  const [sheetOpen, setSheetOpen] = useState(false)

  const [open, setOpen] = useState(false)
  /** Drives the floating label. `open` is not a proxy for it: Escape closes
   *  the list while the field keeps focus. */
  const [focused, setFocused] = useState(false)
  const [query, setQuery] = useState('')
  /** True once the user edits the text; until then the field mirrors `value`. */
  const [dirty, setDirty] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const text = dirty ? query : (value?.name ?? '')

  const sections = useMemo<readonly Section[]>(() => {
    const allowed = (cities: readonly City[]) =>
      excludeCityId ? cities.filter((city) => city.id !== excludeCityId) : cities
    const folded = dirty ? foldTr(query) : ''
    if (folded.length === 0) {
      const untouched: Section[] = [
        { key: 'recent', options: plainOptions(allowed(recent ?? []), 'recent') },
        { key: 'popular', options: plainOptions(allowed(POPULAR), 'popular') },
        { key: 'all', options: plainOptions(allowed(SORTED_CITIES), 'all') },
      ]
      return untouched.filter((section) => section.options.length > 0)
    }
    const hits: Option[] = []
    for (const city of allowed(SORTED_CITIES)) {
      const hit = match(city, folded)
      if (hit) hits.push(hit)
    }
    hits.sort((a, b) => a.rank - b.rank || compareTr(a.city.name, b.city.name))
    return [{ key: 'hits', options: hits }]
  }, [dirty, query, excludeCityId, recent])

  /** Every option in display order, which is the order the arrow keys walk. */
  const options = useMemo(() => sections.flatMap((section) => section.options), [sections])
  /** The cities on offer, counted once each even when a city is in two lists. */
  const listedCount = sections.at(-1)?.options.length ?? 0

  const sectionLabel: Record<SectionKey, string | null> = {
    recent: t('search.recentCities'),
    popular: t('search.popularCities'),
    all: t('search.allCities'),
    hits: null,
  }

  const reset = useCallback(() => {
    setOpen(false)
    setDirty(false)
    setQuery('')
    setActiveIndex(-1)
  }, [])

  // Pointerdown rather than click: a drag that starts on an option and ends
  // outside must still count as a selection, not a dismissal.
  useEffect(() => {
    // The sheet is a dialog with its own dismissal; this is the dropdown's.
    if (!open || isPhone) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Node && rootRef.current?.contains(target)) return
      reset()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, isPhone, reset])

  useEffect(() => {
    if (!open || activeIndex < 0) return
    const active = listRef.current?.querySelector<HTMLElement>('[data-active="true"]')
    active?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  const openList = (index: number) => {
    setOpen(true)
    setActiveIndex(index)
  }

  const commit = (option: Option | undefined) => {
    if (!option) return
    onChange(option.city)
    reset()
    setSheetOpen(false)
  }

  const openSheet = () => {
    setSheetOpen(true)
    setOpen(true)
    setActiveIndex(-1)
  }

  const move = (delta: number) => {
    if (options.length === 0) return
    const next = activeIndex < 0 ? (delta > 0 ? 0 : options.length - 1) : activeIndex + delta
    setActiveIndex(((next % options.length) + options.length) % options.length)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault()
        if (open) {
          move(1)
        } else {
          const selected = options.findIndex((o) => o.city.id === value?.id)
          openList(selected >= 0 ? selected : 0)
        }
        return
      }
      case 'ArrowUp': {
        event.preventDefault()
        if (open) move(-1)
        else openList(options.length - 1)
        return
      }
      case 'Home': {
        if (!open) return
        event.preventDefault()
        setActiveIndex(0)
        return
      }
      case 'End': {
        if (!open) return
        event.preventDefault()
        setActiveIndex(options.length - 1)
        return
      }
      case 'Enter': {
        if (!open || activeIndex < 0) return
        event.preventDefault()
        commit(options[activeIndex])
        return
      }
      case 'Escape': {
        if (!open && !dirty) return
        event.preventDefault()
        reset()
        return
      }
      case 'Tab': {
        // Tab leaves the field without committing the highlighted option.
        if (open || dirty) reset()
        return
      }
      default:
        return
    }
  }

  const optionId = (option: Option) => `${reactId}-${option.section}-${option.city.id}`
  const activeOption = activeIndex >= 0 ? options[activeIndex] : undefined
  const activeId = activeOption ? optionId(activeOption) : undefined
  const describedBy = error ? `${errorId} ${statusId}` : statusId

  const renderOption = (option: Option, index: number, inSheet: boolean) => {
    const { city } = option
    const active = index === activeIndex
    const chosen = city.id === value?.id
    return (
      <li
        key={`${option.section}-${city.id}`}
        id={optionId(option)}
        role="option"
        aria-selected={active}
        data-active={active}
        onMouseDown={(event) => event.preventDefault()}
        onMouseMove={() => setActiveIndex(index)}
        onClick={() => commit(option)}
        className={cn(
          'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2',
          // A thumb's row, not a pointer's: 52px tall, as the sheet's rows
          // are tapped rather than hovered.
          inSheet && 'min-h-13 rounded-xl py-2.5',
          'transition-colors duration-(--duration-fast)',
          active ? 'bg-brand/8' : 'bg-transparent',
        )}
      >
        <span
          className={cn(
            'grid size-8 shrink-0 place-items-center rounded-lg',
            active ? 'bg-brand/15 text-brand-fg' : 'bg-surface-sunken text-fg-muted',
          )}
          aria-hidden="true"
        >
          {/* A clock on the cities this browser searched before, so the
              short list at the top reads as "yours" without a word of copy. */}
          {option.section === 'recent' ? (
            <History className="size-4" />
          ) : (
            <AssetIcon src={ICON.point} className="size-4" />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'block truncate text-base text-fg',
              inSheet ? 'font-semibold' : 'font-medium',
            )}
          >
            {option.end > option.start ? (
              <>
                {city.name.slice(0, option.start)}
                <mark className="rounded-xs bg-brand/15 text-inherit">
                  {city.name.slice(option.start, option.end)}
                </mark>
                {city.name.slice(option.end)}
              </>
            ) : (
              city.name
            )}
            {inSheet ? <span className="font-normal text-fg-muted">, {city.region}</span> : null}
          </span>
        </span>

        <span
          className="shrink-0 text-2xs font-semibold text-fg-subtle"
          data-numeric
          aria-hidden="true"
        >
          {city.plate}
        </span>

        {chosen ? <Check className="size-4 shrink-0 text-brand-fg" aria-hidden="true" /> : null}
      </li>
    )
  }

  // Running index into `options`, so each row knows its place in the walk
  // the arrow keys take across all the lists.
  let flatIndex = 0

  const renderListbox = (inSheet: boolean) => {
    flatIndex = 0
    return (
      <ul
        ref={listRef}
        id={listboxId}
        role="listbox"
        aria-label={label}
        hidden={inSheet ? false : !open}
        className={cn(
          inSheet
            ? 'min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-[max(1rem,env(safe-area-inset-bottom))]'
            : [
                'absolute z-40 mt-2 max-h-72 w-full min-w-56 overflow-y-auto overscroll-contain',
                'rounded-xl border border-border bg-surface-raised p-1 shadow-xl',
                'animate-in duration-(--duration-fast) fade-in-0 slide-in-from-top-1',
              ],
        )}
      >
        {options.length === 0 ? (
          <li role="presentation" className="px-3 py-6 text-center">
            <p className="text-sm font-medium text-fg">{t('search.noResults')}</p>
            <p className="mt-1 text-xs text-fg-muted">{t('search.noResultsHint')}</p>
          </li>
        ) : (
          sections.map((section) => {
            const heading = sectionLabel[section.key]
            const rows = section.options.map((option) => renderOption(option, flatIndex++, inSheet))
            if (!heading) return rows
            // A listbox may only own options and groups, so the heading lives
            // inside its group: named for assistive tech by `aria-label`, and
            // the visible line hidden from it so the name is not read twice.
            return (
              <li key={section.key} role="none">
                <ul role="group" aria-label={heading}>
                  <li
                    role="none"
                    aria-hidden="true"
                    className="px-3 pt-2.5 pb-1 text-2xs font-semibold tracking-wide text-fg-muted uppercase"
                  >
                    {heading}
                  </li>
                  {rows}
                </ul>
              </li>
            )
          })
        )}
      </ul>
    )
  }

  return (
    <div className={cn('relative', className)} ref={rootRef}>
      {bare ? null : (
        <label
          htmlFor={id}
          className={cn(
            'mb-1.5 block text-xs font-semibold text-fg-secondary uppercase',
            // On a phone the caption sits tight above its value rather than
            // hiding: naming the field is what lets the three rows read as a
            // form instead of three anonymous boxes. It returns to its full
            // size from sm, where the layout has room for it.
            flush && 'mb-0 text-2xs sm:mb-1.5 sm:text-xs',
          )}
        >
          {label}
        </label>
      )}

      <div
        // Read by the floating label: the caption is up while the field has
        // focus or a value, and down — sitting where the value will be — when
        // the field is empty and idle.
        data-float={focused || text !== '' ? '' : undefined}
        className={cn(
          'group relative flex items-center rounded-xl border bg-surface',
          'transition-colors duration-(--duration-fast) ease-standard',
          'focus-within:border-brand hover:border-border-strong',
          error ? 'border-danger' : 'border-border',
          // Flat below sm; the card around it is already the frame. The
          // error keeps a tint, since without a border there would be no
          // sign of it beside the message.
          flush && 'border-0 sm:border',
          bare &&
            'rounded-none border-0 bg-transparent focus-within:border-transparent hover:border-transparent',
          bare && error && 'bg-danger/8',
          flush && error && 'bg-danger/8 sm:bg-surface',
        )}
      >
        <AssetIcon
          src={ICON.point}
          className={cn(
            'pointer-events-none absolute left-3 shrink-0 text-fg-muted',
            size === 'lg' ? 'size-5' : 'size-4',
          )}
        />

        <input
          ref={(node) => {
            inputRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          // On a phone the field opens a dialog rather than a listbox, and
          // takes no text: typing happens in the sheet's own search box, so
          // the keyboard never rises over a list it would hide.
          readOnly={isPhone}
          {...(isPhone
            ? { 'aria-haspopup': 'dialog' as const, 'aria-expanded': sheetOpen }
            : {
                'aria-expanded': open,
                'aria-controls': listboxId,
                'aria-autocomplete': 'list' as const,
                'aria-haspopup': 'listbox' as const,
                ...(activeId ? { 'aria-activedescendant': activeId } : {}),
              })}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          value={text}
          placeholder={placeholder ?? t('search.cityPlaceholder')}
          onClick={isPhone ? openSheet : undefined}
          onChange={(event) => {
            const next = event.target.value
            setQuery(next)
            setDirty(true)
            setOpen(true)
            setActiveIndex(next.trim().length > 0 ? 0 : -1)
          }}
          onKeyDown={(event) => {
            if (!isPhone) {
              onKeyDown(event)
              return
            }
            if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
              event.preventDefault()
              openSheet()
            }
          }}
          // No clear button any more: focusing selects the current city, so
          // one tap and typing replaces it — the same gesture, one control less.
          // On a phone focus alone opens nothing: the form moves focus here
          // to show a validation error, and a sheet springing up uninvited
          // would cover the very message it was moved for.
          onFocus={(event) => {
            setFocused(true)
            if (isPhone) return
            setOpen(true)
            event.currentTarget.select()
          }}
          onBlur={(event) => {
            if (isPhone) {
              setFocused(false)
              return
            }
            const next = event.relatedTarget
            if (next instanceof Node && rootRef.current?.contains(next)) return
            setFocused(false)
            // Leaving the field empty is a choice, not an abandoned edit: with
            // no clear button, selecting the city and deleting it is how a
            // field is cleared, and snapping the old value back undid that.
            if (dirty && query.trim() === '' && value !== null) onChange(null)
            reset()
          }}
          className={cn(
            'w-full min-w-0 bg-transparent font-medium text-fg',
            'placeholder:font-normal',
            size === 'lg' ? 'h-11 pl-10 text-base sm:h-14 sm:text-lg' : 'h-11 pl-8 text-base',
            'pr-3',
            // Under a floating label the value sits low, leaving the caption
            // its room above. The placeholder is concealed by opacity, not by a
            // transparent colour — Windows High Contrast forces `color` and
            // would print it over the label — and it fades in only once the
            // caption has finished lifting, so the two never overlap.
            bare && 'h-14 pt-6 pb-2 placeholder:opacity-0 focus:placeholder:opacity-100',
            bare &&
              'placeholder:transition-opacity placeholder:delay-(--duration-base) placeholder:duration-(--duration-fast)',
          )}
        />

        {bare ? (
          // The caption travels by `translate` and `scale`, never by `top` and
          // `font-size`: those relayout on every frame and interpolate badly,
          // and `transition-[top,translate,font-size]` did not even compile, so
          // the label was snapping. Tailwind's plain `transition` covers the
          // compositor-friendly pair. `origin-left` pins the caption's left
          // edge to the value's while it shrinks.
          <label
            htmlFor={id}
            className={cn(
              'pointer-events-none absolute top-0 left-8 origin-left',
              'text-base leading-6 font-medium text-fg-muted',
              'transition duration-(--duration-base) ease-standard',
              // At rest it sits exactly where the value will appear, so it
              // reads as the field's own prompt.
              'translate-y-6 scale-100',
              // Lifted, leaving the value its line underneath.
              'group-data-float:translate-y-0.75 group-data-float:scale-75',
            )}
          >
            {label}
          </label>
        ) : null}
      </div>

      <VisuallyHidden id={statusId} aria-live="polite">
        {open ? t('search.listing', { count: listedCount }) : ''}
      </VisuallyHidden>

      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-sm font-medium text-danger-fg">
          {error}
        </p>
      ) : null}

      {isPhone ? (
        <Dialog
          open={sheetOpen}
          onOpenChange={(next) => {
            if (next) return
            setSheetOpen(false)
            reset()
          }}
        >
          <DialogContent
            ref={sheetRef}
            side="bottom"
            title={label}
            // Nearly the whole screen, leaving a strip of the dimmed page at
            // the top so it still reads as a layer over the form.
            className="h-[calc(100dvh-2.5rem)] max-h-none"
            onOpenAutoFocus={(event) => {
              // On a touch screen focusing the search box raises the keyboard
              // over the very list the person opened the sheet to see; most
              // trips start in a handful of cities, and the list is where they
              // are. Focus goes to the sheet instead, and a tap on the box
              // brings the keyboard. A keyboard user lands in the box.
              if (!window.matchMedia('(pointer: coarse)').matches) return
              event.preventDefault()
              sheetRef.current?.focus({ preventScroll: true })
            }}
          >
            <div className="relative shrink-0 px-4 pt-3 pb-2">
              <AssetIcon
                src={ICON.magnify}
                className="pointer-events-none absolute top-1/2 left-7 size-5 -translate-y-1/2 text-fg-muted"
              />
              <input
                id={`${id}-search`}
                type="text"
                role="combobox"
                enterKeyHint="search"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label={t('search.cityPlaceholder')}
                aria-expanded
                aria-controls={listboxId}
                aria-autocomplete="list"
                {...(activeId ? { 'aria-activedescendant': activeId } : {})}
                value={dirty ? query : ''}
                placeholder={t('search.cityPlaceholder')}
                onChange={(event) => {
                  const next = event.target.value
                  setQuery(next)
                  setDirty(true)
                  setActiveIndex(next.trim().length > 0 ? 0 : -1)
                }}
                onKeyDown={(event) => {
                  // Escape belongs to the dialog, and Tab moves on to the
                  // list without throwing the query away.
                  if (event.key === 'Escape' || event.key === 'Tab') return
                  onKeyDown(event)
                }}
                className={cn(
                  'h-12 w-full rounded-xl border border-border-strong bg-surface pr-3 pl-10',
                  'text-base text-fg placeholder:font-normal',
                )}
              />
            </div>
            {renderListbox(true)}
          </DialogContent>
        </Dialog>
      ) : (
        renderListbox(false)
      )}
    </div>
  )
}
