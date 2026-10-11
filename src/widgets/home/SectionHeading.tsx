import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { ICON } from '@/shared/config/assets'
import { AssetIcon } from '@/shared/ui/asset-icon'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/cn'

/**
 * `primary` is for the sections that sell (routes, campaigns, destinations,
 * the promises); `secondary` for the directories (operators, terminals). Six
 * headings at one size read as six equal chapters, and the page has a clear
 * order of importance that the type should show.
 */
export type SectionTier = 'primary' | 'secondary'

export interface SectionLink {
  readonly to: string
  /**
   * What "all" refers to. Read after the visible label by a screen reader, so
   * the link is "Tümünü gör: Popüler seferler" in a links list — and the
   * visible words still open its accessible name (SC 2.5.3).
   */
  readonly context: string
}

export interface SectionHeadingProps {
  readonly id: string
  readonly title: string
  readonly lead?: ReactNode
  readonly tier?: SectionTier
  /** The index page this section is a sample of. Phones get `SectionMore` instead. */
  readonly more?: SectionLink
  /** Controls that belong at the heading's end, e.g. the campaign rail's arrows. */
  readonly aside?: ReactNode
}

const TITLE: Record<SectionTier, string> = {
  primary: 'text-2xl sm:text-3xl',
  secondary: 'text-xl sm:text-2xl',
}

const LEAD: Record<SectionTier, string> = {
  primary: 'mt-2 text-base text-fg-secondary',
  secondary: 'mt-1.5 text-sm text-fg-muted',
}

/**
 * The heading every home section opens with.
 *
 * The mark before the title is the tittle of the logo's "i" — the same ring
 * around a dot — so it stays. What changes is how it is set. At a fixed 20px,
 * vertically centred on the block, it was the size and the placement of a
 * checked radio button, a red control that did nothing. It is now sized in
 * `em`, so it is a little smaller than the capitals beside it at either tier
 * (never under 10px, where the 1px ring would break up), it takes the logo's
 * own red rather than the CTA's, and it is centred on the FIRST line box
 * rather than on the whole heading, so a title that wraps keeps the mark
 * beside its first word and the second line hangs under the text.
 */
export function SectionHeading({
  id,
  title,
  lead,
  tier = 'primary',
  more,
  aside,
}: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <h2 id={id} className={cn('flex items-start gap-[0.32em]', TITLE[tier])}>
          <span aria-hidden="true" className="flex h-[1lh] shrink-0 items-center">
            <AssetIcon src={ICON.linker} className="size-[max(0.625rem,0.34em)] text-logo" />
          </span>
          <span className="min-w-0">{title}</span>
        </h2>
        {lead ? <p className={cn('max-w-prose', LEAD[tier])}>{lead}</p> : null}
      </div>

      {more || aside ? (
        <div className="flex shrink-0 items-center gap-2">
          {aside}
          {more ? (
            <Button
              asChild
              variant="link"
              size="sm"
              // The button's own padding is pulled back out on the trailing
              // side, so the chevron lines up with the right edge of the
              // content below instead of sitting 12px inside it.
              className="tap-44 -me-3 hidden gap-1 sm:inline-flex"
            >
              <Link to={more.to}>
                Tümünü gör<span className="sr-only">: {more.context}</span>
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/**
 * The same way onward, for phones, placed after the list.
 *
 * Next to a 28px heading at 390px there is no room for a link that does not
 * squeeze the title onto a third line, and a phone reader arrives at the end
 * of a list with their thumb, not at its top — which is where the next step
 * belongs. Full width, so it is an easy target and plainly not a card.
 */
export function SectionMore({
  to,
  label,
  className,
}: {
  to: string
  label: string
  className?: string
}) {
  return (
    <Button
      asChild
      variant="secondary"
      size="md"
      full
      className={cn('mt-5 gap-1.5 hover:bg-hover sm:hidden', className)}
    >
      <Link to={to}>
        {label}
        <ChevronRight className="size-4" aria-hidden="true" />
      </Link>
    </Button>
  )
}
