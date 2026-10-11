/**
 * The time left before a coach leaves, in words.
 *
 * Minutes are the finest unit on purpose. A ticking seconds counter on a
 * boarding pass reads as a timer running out, and it would have to repaint
 * every second for no decision the traveller can make with it. Above a day the
 * minutes go too: "2 gün 4 saat" is the useful shape there.
 *
 * Turkish keeps the noun singular after a number (`3 saat`, never `3 saatler`),
 * so the words are fixed strings rather than a plural rule.
 */

export interface Countdown {
  /** `Kalkışa 2 gün 4 saat`, `Kalkışa 3 saat 20 dakika`, `Kalkışa 12 dakika`. */
  readonly text: string
  /** Half an hour or less: the moment to head for the platform. */
  readonly soon: boolean
}

const MINUTE = 60_000
const SOON_MINUTES = 30

export function departureCountdown(departsAt: Date | string, now: Date): Countdown | null {
  const departs = departsAt instanceof Date ? departsAt : new Date(departsAt)
  const ms = departs.getTime() - now.getTime()
  if (!(ms > 0)) return null

  // Rounded up: a coach 40 seconds away is "1 dakika" away, never "0 dakika".
  const minutes = Math.ceil(ms / MINUTE)
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  const mins = minutes % 60

  let text: string
  if (days > 0) text = hours > 0 ? `Kalkışa ${days} gün ${hours} saat` : `Kalkışa ${days} gün`
  else if (hours > 0) {
    text = mins > 0 ? `Kalkışa ${hours} saat ${mins} dakika` : `Kalkışa ${hours} saat`
  } else text = `Kalkışa ${mins} dakika`

  return { text, soon: minutes <= SOON_MINUTES }
}
