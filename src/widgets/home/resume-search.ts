import type { City } from '@/shared/api/catalog'
import { formatDateLong, formatDateMedium, formatPrice, pluralTr, trInstant } from '@/shared/lib/tr'
import type { RouteStats } from './route-stats'

/**
 * One fact on the resume card's facts line. A figure that changes every day
 * is introduced by words of its own (`lead`) rather than carrying a suffix:
 * "En düşük 605 TL" stays correct whatever the number is.
 */
export interface ResumeFact {
  readonly text: string
  readonly lead?: string
}

export interface ResumeSummary {
  /** The visible facts line, in order: the day, then what it holds. */
  readonly facts: readonly ResumeFact[]
  /** The card's accessible name. It opens with the visible caption and route (SC 2.5.3). */
  readonly label: string
}

export const RESUME_CAPTION = 'Kaldığınız yerden devam edin'

/**
 * What the resume card says about the day it links to.
 *
 * `date` is today or later — `lastSearch` has already moved a day that has
 * passed up to today. The day is read at noon in Istanbul, so the label names
 * the same calendar day in every viewer's time zone.
 *
 * With nothing left that day the line drops the fare instead of quoting
 * a floor the click would not deliver. Today that is "Bugün sefer kalmadı",
 * which already names the day, so the day is not said twice.
 */
export function resumeSummary(stats: RouteStats, date: string, today: string): ResumeSummary {
  const { from, to, departures, cheapest } = stats
  const isToday = date === today
  const day = trInstant(date, 12, 0)
  const head = `${RESUME_CAPTION}: ${from.name} ${to.name}`
  // Spelled out for the ear: "Sal" read aloud is a different word.
  const spokenDay = isToday ? 'bugün' : formatDateLong(day)

  if (departures === 0 || cheapest === null) {
    return isToday
      ? { facts: [{ text: 'Bugün sefer kalmadı' }], label: `${head}, bugün sefer kalmadı` }
      : {
          facts: [{ text: formatDateMedium(day) }, { text: 'Sefer yok' }],
          label: `${head}, ${spokenDay}, sefer yok`,
        }
  }

  const count = pluralTr(departures, 'sefer')
  const price = formatPrice(cheapest)
  return {
    facts: [
      { text: isToday ? 'Bugün' : formatDateMedium(day) },
      { text: count },
      { lead: 'En düşük', text: price },
    ],
    label: `${head}, ${spokenDay}, ${count}, en düşük ücret ${price}`,
  }
}

/**
 * A dismissal lasts for the browser session and covers one search, not the
 * card itself: someone who closes "İstanbul → Ankara" and then looks up
 * another trip has a new place to continue from, and is offered it.
 */
const DISMISSED_KEY = 'bl-resume-dismissed'

export function resumeKey(search: { from: City; to: City; date: string }): string {
  return `${search.from.id}>${search.to.id}@${search.date}`
}

/** Wrapped like every storage call here: a blocked store means "not dismissed", never a crash. */
export function isResumeDismissed(key: string): boolean {
  try {
    return window.sessionStorage.getItem(DISMISSED_KEY) === key
  } catch {
    return false
  }
}

export function dismissResume(key: string): void {
  try {
    window.sessionStorage.setItem(DISMISSED_KEY, key)
  } catch {
    // Storage is unavailable. The card still closes; it just returns on the next visit.
  }
}
