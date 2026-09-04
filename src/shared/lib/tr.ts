/**
 * The single Turkish formatting and collation boundary.
 *
 * Every user-facing number, price, date, time and sort comparison goes through
 * here. The reason is not tidiness: `'İstanbul'.toLowerCase()` yields
 * `'i̇stanbul'` (i + combining dot) under an English default locale, so a city
 * search silently stops matching — and it only breaks for Turkish users, which
 * is exactly the class of bug English-locale tests never catch.
 *
 * Intl handles display. date-fns handles arithmetic. The two never swap jobs.
 */

const LOCALE = 'tr-TR'
const TIME_ZONE = 'Europe/Istanbul'

/** Intl formatters are expensive to construct; build each one once. */
const priceFmt = new Intl.NumberFormat(LOCALE, {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})

const priceDecimalFmt = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const timeFmt = new Intl.DateTimeFormat(LOCALE, {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: TIME_ZONE,
})

const dateLongFmt = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  weekday: 'long',
  timeZone: TIME_ZONE,
})

const dateMediumFmt = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'long',
  weekday: 'short',
  timeZone: TIME_ZONE,
})

const dateShortFmt = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
  timeZone: TIME_ZONE,
})

const weekdayShortFmt = new Intl.DateTimeFormat(LOCALE, {
  weekday: 'short',
  timeZone: TIME_ZONE,
})

/** `959 TL`, `1.099 TL` — the symbol trails the number in Turkish usage. */
export function formatPrice(value: number): string {
  return `${priceFmt.format(Math.round(value))} TL`
}

/** For a total that must reconcile to the kuruş, e.g. an itemised summary. */
export function formatPriceExact(value: number): string {
  return `${priceDecimalFmt.format(value)} TL`
}

/** 24-hour, zero-padded: `08:30`, `23:15`. */
export function formatTime(date: Date | string): string {
  return timeFmt.format(toDate(date))
}

/** `6s 59dk` — the form Turkish travel sites use for a journey duration. */
export function formatDuration(minutes: number): string {
  const total = Math.max(0, Math.round(minutes))
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m}dk`
  if (m === 0) return `${h}s`
  return `${h}s ${m}dk`
}

/** `4 Eylül 2026 Cuma` */
export function formatDateLong(date: Date | string): string {
  return dateLongFmt.format(toDate(date))
}

/** `4 Eylül Cum` */
export function formatDateMedium(date: Date | string): string {
  return dateMediumFmt.format(toDate(date))
}

/** `4 Eyl` */
export function formatDateShort(date: Date | string): string {
  return dateShortFmt.format(toDate(date))
}

/** `Cum` */
export function formatWeekdayShort(date: Date | string): string {
  return weekdayShortFmt.format(toDate(date))
}

/**
 * Turkish-correct casing. `toLocaleUpperCase('tr-TR')` maps i -> İ and
 * ı -> I, which the default locale gets wrong in both directions.
 */
export function upperTr(value: string): string {
  return value.toLocaleUpperCase(LOCALE)
}

export function lowerTr(value: string): string {
  return value.toLocaleLowerCase(LOCALE)
}

/**
 * ASCII upper-casing, for machine identifiers — PNRs, coupon codes, plate
 * strings — which are NOT Turkish text.
 *
 * This is the one place the Turkish locale is the wrong tool: `upperTr('i')`
 * is 'İ', which is not in `[A-Z0-9]`, so a perfectly valid code typed in lower
 * case would fail its own format check. Use `upperTr` for anything a human
 * reads as a word, and this for anything a system parses.
 */
export function upperAscii(value: string): string {
  return value.replace(/[a-z]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 32))
}

/**
 * Folds a string for accent-insensitive search: `Çanakkale` and `canakkale`
 * must both match. Lowercases in Turkish first so İ/I are handled, then
 * strips the diacritics that remain.
 */
export function foldTr(value: string): string {
  return lowerTr(value)
    .replaceAll('ı', 'i')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replaceAll('ğ', 'g')
    .replaceAll('ş', 's')
    .replaceAll('ç', 'c')
    .replaceAll('ö', 'o')
    .replaceAll('ü', 'u')
    .trim()
}

// ---------------------------------------------------------------------------
// Case suffixes
//
// Turkish suffixes obey vowel harmony, so a heading cannot simply append `'dan`:
// it is "İstanbul'dan" but "İzmir'den" and "Gaziantep'ten". Appending a fixed
// suffix misspells more than half the city catalogue, and it is the kind of
// error that reads as machine-generated to every Turkish speaker.
// ---------------------------------------------------------------------------

const BACK_VOWELS = 'aıou'
const FRONT_VOWELS = 'eiöü'
/** After these, a voiced suffix consonant devoices: d -> t. */
const VOICELESS_FINALS = 'pçtkfhsş'

function lastVowelOf(word: string): string {
  const lower = lowerTr(word)
  for (let i = lower.length - 1; i >= 0; i--) {
    const ch = lower[i]!
    if (BACK_VOWELS.includes(ch) || FRONT_VOWELS.includes(ch)) return ch
  }
  return 'a'
}

const isBack = (word: string) => BACK_VOWELS.includes(lastVowelOf(word))
const isVowel = (ch: string) => BACK_VOWELS.includes(ch) || FRONT_VOWELS.includes(ch)

/** `İstanbul'dan`, `İzmir'den`, `Gaziantep'ten` — ablative ("from"). */
export function ablativeTr(name: string): string {
  const consonant = VOICELESS_FINALS.includes(lowerTr(name).slice(-1)) ? 't' : 'd'
  return `${name}'${consonant}${isBack(name) ? 'an' : 'en'}`
}

/** `Ankara'ya`, `İzmir'e`, `İstanbul'a` — dative ("to"), with a y-buffer after a vowel. */
export function dativeTr(name: string): string {
  const buffer = isVowel(lowerTr(name).slice(-1)) ? 'y' : ''
  return `${name}'${buffer}${isBack(name) ? 'a' : 'e'}`
}

/** `İstanbul'da`, `İzmir'de`, `Gaziantep'te` — locative ("in/at"). */
export function locativeTr(name: string): string {
  const consonant = VOICELESS_FINALS.includes(lowerTr(name).slice(-1)) ? 't' : 'd'
  return `${name}'${consonant}${isBack(name) ? 'a' : 'e'}`
}

/** Turkish alphabetical order: ç follows c, ğ follows g, ı precedes i, and so on. */
const collator = new Intl.Collator(LOCALE, { sensitivity: 'base', numeric: true })

export function compareTr(a: string, b: string): number {
  return collator.compare(a, b)
}

/** URL-safe slug that survives Turkish characters: `Nevşehir` -> `nevsehir`. */
export function slugifyTr(value: string): string {
  return foldTr(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** `2026-09-04` in Istanbul time, independent of the viewer's own zone. */
export function toISODate(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: TIME_ZONE,
  }).format(date)
  return parts
}

/** Parses `2026-09-04` as a local calendar day, not a UTC instant. */
export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

/**
 * Builds the instant for a Turkish wall-clock time on a given day.
 *
 * A departure is "08:30 in Istanbul" — it is not 08:30 wherever the viewer
 * happens to be. Constructing it with `setHours` would bake in the runtime's
 * zone, so a trip generated as 09:00 would display as 12:30 to a UTC viewer
 * and get bucketed into the wrong departure-time band.
 *
 * Turkey has been a fixed UTC+03 with no DST since September 2016, so the
 * literal offset is exact rather than an approximation.
 */
export function trInstant(isoDate: string, hour: number, minute: number): Date {
  const hh = String(hour).padStart(2, '0')
  const mm = String(minute).padStart(2, '0')
  return new Date(`${isoDate}T${hh}:${mm}:00+03:00`)
}

const hourFmt = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric',
  hourCycle: 'h23',
  timeZone: TIME_ZONE,
})

/**
 * The hour of an instant as seen in Istanbul, for bucketing into the
 * morning/noon/evening/night bands the UI advertises.
 *
 * Read from `formatToParts` under `hourCycle: 'h23'` rather than `hour12:
 * false`, which yields "24" for midnight on some ICU builds.
 */
export function istanbulHour(value: Date | string): number {
  const part = hourFmt.formatToParts(toDate(value)).find((p) => p.type === 'hour')
  return Number(part?.value ?? 0) % 24
}

export function isValidISODate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false
  const d = fromISODate(iso)
  return !Number.isNaN(d.getTime()) && toISODateLocal(d) === iso
}

function toISODateLocal(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export { toISODateLocal }

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value)
}

/** `2 sefer`, with the count emphasised by the caller. */
export function pluralTr(count: number, word: string): string {
  return `${priceFmt.format(count)} ${word}`
}
