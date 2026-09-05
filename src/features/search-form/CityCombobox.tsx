import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, Ref } from 'react'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { CITIES, type City } from '@/shared/api/catalog'
import { compareTr, foldTr } from '@/shared/lib/tr'
import { cn } from '@/shared/lib/cn'
import { ICON } from '@/shared/config/assets'
import { AssetIcon } from '@/shared/ui/asset-icon'
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
  className?: string | undefined
  ref?: Ref<HTMLInputElement>
}

interface Option {
  city: City
  /** Slice of `city.name` that matched, for the <mark>. Empty for plate hits. */
  start: number
  end: number
  /** 0 = name prefix, 1 = name substring, 2 = plate. Lower sorts first. */
  rank: number
}

const ALL_OPTIONS: readonly Option[] = [...CITIES]
  .sort((a, b) => compareTr(a.name, b.name))
  .map((city) => ({ city, start: 0, end: 0, rank: 0 }))

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
    if (at === 0) return { city, start: 0, end: folded.length, rank: 0 }
    if (at > 0) return { city, start: at, end: at + folded.length, rank: 1 }
  } else if (name.includes(folded)) {
    return { city, start: 0, end: 0, rank: 1 }
  }
  if (String(city.plate).startsWith(folded)) return { city, start: 0, end: 0, rank: 2 }
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

  const [open, setOpen] = useState(false)
  /** Drives the floating label. `open` is not a proxy for it: Escape closes
   *  the list while the field keeps focus. */
  const [focused, setFocused] = useState(false)
  const [query, setQuery] = useState('')
  /** True once the user edits the text; until then the field mirrors `value`. */
  const [dirty, setDirty] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const text = dirty ? query : (value?.name ?? '')

  const options = useMemo<readonly Option[]>(() => {
    const pool = excludeCityId
      ? ALL_OPTIONS.filter((o) => o.city.id !== excludeCityId)
      : ALL_OPTIONS
    const folded = dirty ? foldTr(query) : ''
    if (folded.length === 0) return pool
    const hits: Option[] = []
    for (const option of pool) {
      const hit = match(option.city, folded)
      if (hit) hits.push(hit)
    }
    return hits.sort((a, b) => a.rank - b.rank || compareTr(a.city.name, b.city.name))
  }, [dirty, query, excludeCityId])

  const reset = useCallback(() => {
    setOpen(false)
    setDirty(false)
    setQuery('')
    setActiveIndex(-1)
  }, [])

  // Pointerdown rather than click: a drag that starts on an option and ends
  // outside must still count as a selection, not a dismissal.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Node && rootRef.current?.contains(target)) return
      reset()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, reset])

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

  const activeOption = activeIndex >= 0 ? options[activeIndex] : undefined
  const activeId = activeOption ? `${reactId}-${activeOption.city.id}` : undefined
  const describedBy = error ? `${errorId} ${statusId}` : statusId

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
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          {...(activeId ? { 'aria-activedescendant': activeId } : {})}
          value={text}
          placeholder={placeholder ?? t('search.cityPlaceholder')}
          onChange={(event) => {
            const next = event.target.value
            setQuery(next)
            setDirty(true)
            setOpen(true)
            setActiveIndex(next.trim().length > 0 ? 0 : -1)
          }}
          onKeyDown={onKeyDown}
          // No clear button any more: focusing selects the current city, so
          // one tap and typing replaces it — the same gesture, one control less.
          onFocus={(event) => {
            setOpen(true)
            setFocused(true)
            event.currentTarget.select()
          }}
          onBlur={(event) => {
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
            'placeholder:font-normal placeholder:text-fg-subtle',
            size === 'lg' ? 'h-14 pl-10 text-lg' : 'h-11 pl-8 text-base',
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
              'group-data-float:translate-y-[3px] group-data-float:scale-75',
            )}
          >
            {label}
          </label>
        ) : null}
      </div>

      <VisuallyHidden id={statusId} aria-live="polite">
        {open ? t('search.listing', { count: options.length }) : ''}
      </VisuallyHidden>

      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-sm font-medium text-danger-fg">
          {error}
        </p>
      ) : null}

      <ul
        ref={listRef}
        id={listboxId}
        role="listbox"
        aria-label={label}
        hidden={!open}
        className={cn(
          'absolute z-40 mt-2 max-h-72 w-full min-w-56 overflow-y-auto overscroll-contain',
          'rounded-xl border border-border bg-surface-raised p-1 shadow-xl',
          'animate-in duration-(--duration-fast) fade-in-0 slide-in-from-top-1',
        )}
      >
        {options.length === 0 ? (
          <li role="presentation" className="px-3 py-6 text-center">
            <p className="text-sm font-medium text-fg">{t('search.noResults')}</p>
            <p className="mt-1 text-xs text-fg-muted">{t('search.noResultsHint')}</p>
          </li>
        ) : (
          options.map((option, index) => {
            const { city } = option
            const active = index === activeIndex
            const chosen = city.id === value?.id
            return (
              <li
                key={city.id}
                id={`${reactId}-${city.id}`}
                role="option"
                aria-selected={active}
                data-active={active}
                onMouseDown={(event) => event.preventDefault()}
                onMouseMove={() => setActiveIndex(index)}
                onClick={() => commit(option)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2',
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
                  <AssetIcon src={ICON.point} className="size-4" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-medium text-fg">
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
                  </span>
                </span>

                <span
                  className="shrink-0 text-2xs font-semibold text-fg-subtle"
                  data-numeric
                  aria-hidden="true"
                >
                  {city.plate}
                </span>

                {chosen ? (
                  <Check className="size-4 shrink-0 text-brand-fg" aria-hidden="true" />
                ) : null}
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}
