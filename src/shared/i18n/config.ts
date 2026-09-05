/**
 * What the product can be shown in, and what it can be priced in.
 *
 * Kept apart from the i18next instance so that non-React code — the money
 * formatter, the mock server, a test — can read the catalogue without pulling
 * in the whole translation runtime.
 */

export const LANGUAGES = [
  {
    code: 'tr',
    /** The language's name in itself, which is how a language picker names it. */
    label: 'Türkçe',
    /** Intl locale used for dates and digit grouping. */
    locale: 'tr-TR',
    /** Suffixes for `formatDuration`: `6s 59dk`. */
    duration: { h: 's', m: 'dk' },
  },
  {
    code: 'en',
    label: 'English',
    // en-GB, not en-US: 24-hour clock and day-before-month, which is what a
    // Turkish coach timetable reads like.
    locale: 'en-GB',
    duration: { h: 'h', m: 'm' },
  },
] as const

export type LanguageCode = (typeof LANGUAGES)[number]['code']
export type Language = (typeof LANGUAGES)[number]

export const DEFAULT_LANGUAGE: LanguageCode = 'tr'

/**
 * Prices in the catalogue are Turkish lira. Everything else is derived from
 * them at display time, so there is exactly one number stored per fare.
 *
 * `tryPerUnit` is what one unit costs in lira. A real deployment replaces this
 * table with a rates feed; the shape is what a feed would fill in, and the
 * `asOf` date is here so a stale table is visible rather than silent.
 */
export const RATES_AS_OF = '2026-09-01'

export const CURRENCIES = [
  {
    code: 'TRY',
    // Turkish usage puts the unit after the number — `1.250 TL`, never `₺1.250`
    // — which is the opposite of what Intl's currency style produces for
    // tr-TR. The placement is ours for that reason.
    display: 'TL',
    position: 'suffix',
    decimals: 0,
    tryPerUnit: 1,
  },
  { code: 'EUR', display: '€', position: 'prefix', decimals: 2, tryPerUnit: 48 },
  { code: 'USD', display: '$', position: 'prefix', decimals: 2, tryPerUnit: 44 },
  { code: 'GBP', display: '£', position: 'prefix', decimals: 2, tryPerUnit: 56 },
] as const

export type CurrencyCode = (typeof CURRENCIES)[number]['code']
export type Currency = (typeof CURRENCIES)[number]

export const DEFAULT_CURRENCY: CurrencyCode = 'TRY'

export const LANGUAGE_STORAGE_KEY = 'bl-lang'
export const CURRENCY_STORAGE_KEY = 'bl-currency'

export function languageOf(code: string): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0]
}

export function currencyOf(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0]
}

export function isLanguageCode(value: unknown): value is LanguageCode {
  return LANGUAGES.some((l) => l.code === value)
}

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return CURRENCIES.some((c) => c.code === value)
}
