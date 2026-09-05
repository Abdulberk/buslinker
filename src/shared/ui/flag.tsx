import TurkiyeFlag from 'country-flag-icons/react/3x2/TR'
import UnitedKingdomFlag from 'country-flag-icons/react/3x2/GB'
import { cn } from '@/shared/lib/cn'
import type { LanguageCode } from '@/shared/i18n/config'

/**
 * Flags for the language picker.
 *
 * The artwork comes from `country-flag-icons`, not from this file. Hand-drawn
 * flags are a trap: the first version here had a five-pointed star built by
 * eye, and it rendered as a blob. A flag is a specified object with official
 * geometry, so it belongs in a maintained package. Imported per country, so the
 * bundle carries two flags rather than the set of 250.
 *
 * Emoji were the other candidate and are worse: Windows ships no glyphs for the
 * regional-indicator pairs, so 🇹🇷 falls back to the letters "TR" in a box on
 * the majority of this product's desktop traffic.
 */
const FLAGS: Record<LanguageCode, typeof TurkiyeFlag> = {
  tr: TurkiyeFlag,
  // English is flagged with the Union Jack rather than the Stars and Stripes:
  // the copy is en-GB, down to the 24-hour clock and the day-before-month date.
  en: UnitedKingdomFlag,
}

export function Flag({ code, className }: { code: LanguageCode; className?: string }) {
  const Art = FLAGS[code]
  return (
    <span
      aria-hidden="true"
      className={cn(
        // A hairline so a flag with a white edge still reads as a disc against a
        // white surface. The border token rather than black: a black ring at any
        // opacity looks like a drawn outline in dark mode.
        'inline-flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full',
        'ring-1 ring-border',
        className,
      )}
    >
      {/* Cropped, not squashed. The flag is filled to the circle's height and
          left to take its natural 3:2 width, which the round mask then trims
          either side of centre — so the crescent keeps its own centre line.
          Done in CSS rather than with preserveAspectRatio because the package's
          per-country components type their props as HTML attributes only. */}
      <Art className="h-full w-auto max-w-none shrink-0" />
    </span>
  )
}
