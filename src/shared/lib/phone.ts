import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js'
import { foldTr } from './tr'

/**
 * Phone numbers, as data rather than as text.
 *
 * A `<input type="tel">` with a placeholder reading `5XX XXX XX XX` is not a
 * phone field: it accepts `abc`, it accepts `0532 12`, and it stores whatever
 * shape the user happened to type, so two people who entered the same number
 * are stored differently. libphonenumber-js knows every country's numbering
 * plan, which is the only honest way to format and validate one.
 *
 * The stored value is always E.164 — `+905321234567` — because that is the one
 * form an SMS gateway takes and the one form that compares equal. Formatting
 * for the eye happens at the edge, on the way in and on the way out.
 */

export type { CountryCode }

export const DEFAULT_COUNTRY: CountryCode = 'TR'

/**
 * Pinned to the top of the picker. A domestic coach ticket is bought from
 * Türkiye or by someone with a number from where its diaspora and its
 * neighbours are; everything else follows alphabetically.
 */
const PINNED: readonly CountryCode[] = ['TR', 'DE', 'NL', 'FR', 'AT', 'BE', 'GB', 'US']

export interface PhoneCountry {
  code: CountryCode
  /** The country's name in the reader's language. */
  name: string
  /** Dial prefix without the plus, e.g. `90`. */
  dial: string
}

/** Country names come from the platform, so they follow the interface language. */
const listCache = new Map<string, readonly PhoneCountry[]>()

export function phoneCountries(locale: string): readonly PhoneCountry[] {
  const cached = listCache.get(locale)
  if (cached) return cached

  const names = new Intl.DisplayNames([locale], { type: 'region' })
  const collator = new Intl.Collator(locale)
  const all = getCountries().map((code) => ({
    code,
    name: names.of(code) ?? code,
    dial: getCountryCallingCode(code),
  }))

  const pinned = PINNED.map((code) => all.find((c) => c.code === code)).filter(
    (c): c is PhoneCountry => c !== undefined,
  )
  const rest = all
    .filter((c) => !PINNED.includes(c.code))
    .sort((a, b) => collator.compare(a.name, b.name))

  const list = [...pinned, ...rest]
  listCache.set(locale, list)
  return list
}

/**
 * Digits as the user types them, grouped the way that country groups them:
 * `5321234567` becomes `532 123 45 67` for Türkiye and `7911 123456` for the
 * United Kingdom.
 *
 * `AsYouType` is stateful and formats incrementally, so it is fed the whole
 * string each call rather than kept between keystrokes — that way deleting a
 * character reformats correctly instead of leaving the old grouping behind.
 */
export function formatAsTyped(input: string, country: CountryCode): string {
  const digits = input.replace(/\D/g, '')
  if (digits.length === 0) return ''
  return new AsYouType(country).input(digits)
}

/**
 * One keystroke, or one paste, turned into a country and a national string.
 *
 * Typing a plain national number keeps the chosen country. Typing or pasting
 * one that starts with a plus switches to the country that prefix belongs to
 * and strips it from the field — otherwise `+90 532 …` pasted into a field
 * already set to Türkiye would be read as the national number `90532…`, which
 * is a different, invalid number.
 */
export function acceptTyped(
  raw: string,
  country: CountryCode,
): { country: CountryCode; national: string } {
  const trimmed = raw.trim()
  if (!trimmed.startsWith('+')) {
    return { country, national: formatAsTyped(trimmed, country) }
  }

  const digits = trimmed.replace(/\D/g, '')
  const typed = new AsYouType()
  const international = typed.input(`+${digits}`)
  const detected = typed.getCountry()
  if (!detected) {
    // Not enough digits to know the country yet; show what was typed so the
    // caret does not jump, and keep the field's current country.
    return { country, national: international }
  }
  return { country: detected, national: nationalOf(`+${digits}`, detected) }
}

/**
 * The national string to show for a number we can already place.
 *
 * Not `formatAsTyped` on the bare national digits: several plans — Germany's
 * among them — only group once the trunk prefix is there, so a pasted
 * +49 151 23456789 would sit in the field as one unbroken run. Formatting from
 * the parsed number gives the country's real grouping, and the trunk zero is
 * then dropped because the dial code beside the field already stands in for it.
 */
function nationalOf(e164: string, country: CountryCode): string {
  const parsed = parsePhoneNumberFromString(e164)
  if (!parsed) return formatAsTyped(e164.replace(/\D/g, ''), country)
  return parsed.formatNational().replace(/^0\s*/, '')
}

/** The E.164 form to store, or null while the number is still incomplete. */
export function toE164(national: string, country: CountryCode): string | null {
  const parsed = parsePhoneNumberFromString(national, country)
  return parsed?.isValid() ? parsed.number : null
}

export function isValidPhone(national: string, country: CountryCode): boolean {
  return toE164(national, country) !== null
}

/**
 * Splits a stored E.164 number back into a country and a national string the
 * field can show. Falls back to the default country for anything unparseable,
 * so a half-typed value from an older record still lands in the field.
 */
export function fromE164(value: string): { country: CountryCode; national: string } {
  const parsed = value ? parsePhoneNumberFromString(value) : undefined
  if (parsed?.country) {
    return { country: parsed.country, national: nationalOf(parsed.number, parsed.country) }
  }
  return { country: DEFAULT_COUNTRY, national: formatAsTyped(value, DEFAULT_COUNTRY) }
}

/**
 * Does this country answer to what was typed in the picker's search box?
 *
 * The dial-code arm only runs when the query actually contains digits.
 * Without that guard the digits of a word like "almanya" reduce to the empty
 * string, and every dial code starts with the empty string — so the filter
 * quietly matched all 245 countries.
 */
export function matchesCountry(country: PhoneCountry, query: string): boolean {
  const folded = foldTr(query)
  if (folded === '') return true
  if (foldTr(country.name).includes(folded)) return true
  const digits = folded.replace(/\D/g, '')
  return digits !== '' && country.dial.startsWith(digits)
}

/** `+90 532 123 45 67` — for display where the number is read, not edited. */
export function formatPhoneDisplay(value: string): string {
  const parsed = value ? parsePhoneNumberFromString(value) : undefined
  return parsed?.isValid() ? parsed.formatInternational() : value
}
