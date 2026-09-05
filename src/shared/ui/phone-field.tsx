import { useId, useMemo, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Search } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import {
  acceptTyped,
  fromE164,
  matchesCountry,
  phoneCountries,
  toE164,
  type CountryCode,
  type PhoneCountry,
} from '@/shared/lib/phone'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/primitives'

export interface PhoneFieldProps {
  label: string
  name: string
  /**
   * E.164, or an empty string. Empty is also what an incomplete number reads
   * as: a half-typed number is not a phone number, and storing the fragment
   * would let it reach the database.
   */
  value: string
  onChange: (value: string) => void
  error?: string | undefined
  hint?: string | undefined
  autoComplete?: string | undefined
  required?: boolean
  containerClassName?: string
}

/**
 * A phone number field: country picker, then the national number, formatted as
 * it is typed.
 *
 * It replaces a plain `type="tel"` box whose only rule was "not empty". That
 * box accepted letters, accepted half a number, and stored whatever shape the
 * person typed, so the same number arrived in four different forms. Here the
 * grouping comes from the country's own numbering plan and what leaves the
 * component is E.164 or nothing at all.
 *
 * The country list is every country libphonenumber knows, named by
 * `Intl.DisplayNames` so it follows the interface language, with the ones a
 * Turkish coach line actually sees pinned on top. There are no flags in it:
 * the full set is 200 kB of artwork, which is not a fair price for decoration
 * next to a dial code that already identifies the country.
 */
export function PhoneField({
  label,
  name,
  value,
  onChange,
  error,
  hint,
  autoComplete = 'tel',
  required,
  containerClassName,
}: PhoneFieldProps) {
  const { i18n } = useTranslation()
  const id = `field-${name}`
  const messageId = `${id}-message`

  const [country, setCountry] = useState<CountryCode>(() => fromE164(value).country)
  const [national, setNational] = useState(() => fromE164(value).national)

  // The parent holds E.164; this holds the text. The two disagree while a
  // number is half-typed, which is correct — so the text is re-read from the
  // parent only when the parent set a value this field did not emit. The
  // comparison keeps the last reconciled value in state rather than a ref:
  // adjusting state during render is supported, reading a ref is not.
  const [reconciled, setReconciled] = useState(value)
  if (value !== reconciled) {
    setReconciled(value)
    const next = fromE164(value)
    setCountry(next.country)
    setNational(next.national)
  }

  const emit = (nextNational: string, nextCountry: CountryCode) => {
    const e164 = toE164(nextNational, nextCountry) ?? ''
    setReconciled(e164)
    onChange(e164)
  }

  const countries = phoneCountries(i18n.language)
  const dial = countries.find((c) => c.code === country)?.dial ?? ''

  return (
    <div className={cn('mb-3 flex flex-col gap-1.5 last:mb-0', containerClassName)}>
      <label htmlFor={id} className="text-sm font-medium text-fg-secondary">
        {label}
      </label>

      <div
        className={cn(
          'flex items-stretch rounded-lg border bg-surface',
          'transition-colors duration-(--duration-fast) ease-standard',
          'focus-within:border-brand hover:border-border-strong',
          error ? 'border-danger' : 'border-border-strong',
        )}
      >
        <CountryPicker
          countries={countries}
          value={country}
          dial={dial}
          onSelect={(next) => {
            setCountry(next)
            emit(national, next)
          }}
        />

        <span aria-hidden="true" className="my-2 w-px shrink-0 bg-border" />

        <input
          id={id}
          name={name}
          type="tel"
          inputMode="tel"
          autoComplete={autoComplete}
          required={required}
          value={national}
          aria-describedby={messageId}
          aria-invalid={error ? true : undefined}
          onChange={(event) => {
            const next = acceptTyped(event.target.value, country)
            setCountry(next.country)
            setNational(next.national)
            emit(next.national, next.country)
          }}
          className={cn(
            'h-11 min-w-0 flex-1 rounded-r-lg bg-transparent px-3 text-base text-fg',
            'placeholder:text-fg-subtle focus:outline-none',
          )}
        />
      </div>

      {/* Reserved so an appearing error does not push the form down. */}
      <p
        id={messageId}
        {...(error && { role: 'alert' })}
        className={cn('min-h-4 text-xs', error ? 'font-medium text-danger-fg' : 'text-fg-muted')}
      >
        {error ?? hint ?? ''}
      </p>
    </div>
  )
}

/**
 * The country half of the field.
 *
 * A native `<select>` was the cheap option and the wrong one: 245 options with
 * no search means scrolling past two hundred countries to reach Türkiye, and
 * its list is drawn by the operating system, so it could not carry the dial
 * codes in the shape the rest of the product uses.
 */
function CountryPicker({
  countries,
  value,
  dial,
  onSelect,
}: {
  countries: readonly PhoneCountry[]
  value: CountryCode
  dial: string
  onSelect: (code: CountryCode) => void
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const listId = useId()
  const reactId = useId()

  const matches = useMemo(
    () => countries.filter((c) => matchesCountry(c, query)),
    [countries, query],
  )

  const commit = (option: PhoneCountry | undefined) => {
    if (!option) return
    onSelect(option.code)
    setOpen(false)
    setQuery('')
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (matches.length === 0) return
      const delta = event.key === 'ArrowDown' ? 1 : -1
      const next = (activeIndex + delta + matches.length) % matches.length
      setActiveIndex(next)
      document.getElementById(`${reactId}-${matches[next]?.code}`)?.scrollIntoView({
        block: 'nearest',
      })
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      commit(matches[activeIndex])
    }
  }

  const active = matches[activeIndex]

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setQuery('')
          setActiveIndex(
            Math.max(
              0,
              countries.findIndex((c) => c.code === value),
            ),
          )
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          // The dial code is the value; the country's name is what a screen
          // reader needs, since "+90" alone does not say Türkiye.
          aria-label={`${t('phone.country')}: ${countries.find((c) => c.code === value)?.name ?? value}`}
          className={cn(
            'flex h-11 shrink-0 items-center gap-1 rounded-l-lg px-3',
            'text-base font-medium text-fg transition-colors duration-(--duration-fast)',
            'hover:bg-surface-sunken focus:outline-none data-[state=open]:bg-surface-sunken',
          )}
        >
          <span data-numeric>+{dial}</span>
          <ChevronDown className="size-4 text-fg-muted" aria-hidden="true" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-72 p-0">
        <div className="border-b border-border p-2">
          <div className="relative flex items-center">
            <Search
              className="pointer-events-none absolute left-2.5 size-4 text-fg-muted"
              aria-hidden="true"
            />
            <input
              autoFocus
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              {...(active ? { 'aria-activedescendant': `${reactId}-${active.code}` } : {})}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setActiveIndex(0)
              }}
              onKeyDown={onKeyDown}
              placeholder={t('phone.search')}
              aria-label={t('phone.search')}
              className={cn(
                'h-9 w-full rounded-md bg-surface-sunken pr-2 pl-8 text-sm text-fg',
                'placeholder:text-fg-subtle focus:outline-none',
              )}
            />
          </div>
        </div>

        <ul
          id={listId}
          role="listbox"
          aria-label={t('phone.country')}
          className="max-h-64 overflow-y-auto p-1"
        >
          {matches.length === 0 ? (
            <li role="presentation" className="px-3 py-6 text-center text-sm text-fg-muted">
              {t('phone.noResults')}
            </li>
          ) : (
            matches.map((option, index) => (
              <li
                key={option.code}
                id={`${reactId}-${option.code}`}
                role="option"
                aria-selected={option.code === value}
                data-active={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onMouseMove={() => setActiveIndex(index)}
                onClick={() => commit(option)}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-sm',
                  'transition-colors duration-(--duration-fast)',
                  index === activeIndex ? 'bg-surface-sunken' : 'bg-transparent',
                  option.code === value ? 'font-semibold text-brand-fg' : 'text-fg',
                )}
              >
                <span className="min-w-0 flex-1 truncate">{option.name}</span>
                <span className="shrink-0 text-fg-muted" data-numeric>
                  +{option.dial}
                </span>
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
