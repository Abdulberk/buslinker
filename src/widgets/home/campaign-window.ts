import type { Campaign } from '@/shared/config/campaigns'
import { formatDateMedium, formatDateWithYear } from '@/shared/lib/tr'

/** Inside this many days a deadline is worth pointing out, not just stating. */
export const CLOSING_SOON_DAYS = 7

/**
 * A campaign's last day as the card states it.
 *
 * Without a year while it falls in the current one, where the year is noise.
 * With it once it does not: "30 Haziran Sal" read in October means next June
 * only if the reader works it out, and an offer that runs into next year is
 * exactly the one whose deadline should not be misread as months away.
 */
export function deadlineLabel(until: string, today: string): string {
  return until.slice(0, 4) === today.slice(0, 4)
    ? formatDateMedium(until)
    : formatDateWithYear(until)
}

function utcDay(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number)
  return Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

/**
 * Whole calendar days from `today` to `until`, both `YYYY-MM-DD`: 0 on the
 * last day itself, negative once it has passed.
 *
 * Counted on UTC midnights rather than on `Date` objects in the viewer's zone,
 * so a daylight-saving change in between can never make a day 23 hours long
 * and round the count down.
 */
export function daysLeft(until: string, today: string): number {
  return Math.round((utcDay(until) - utcDay(today)) / 86_400_000)
}

/**
 * The campaigns that can still be used today.
 *
 * `validUntil` is inclusive. An expired offer is dropped rather than shown
 * greyed out: the rail exists to be acted on, and a deal the visitor can no
 * longer take is only a way of being told no.
 */
export function activeCampaigns(
  campaigns: readonly Campaign[],
  today: string,
): readonly Campaign[] {
  return campaigns.filter((campaign) => daysLeft(campaign.validUntil, today) >= 0)
}
