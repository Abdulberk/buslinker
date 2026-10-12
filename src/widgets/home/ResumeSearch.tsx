import { Fragment, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, History, X } from 'lucide-react'
import { lastSearch } from '@/features/search-form/recent-searches'
import { cn } from '@/shared/lib/cn'
import { resultsPath } from '@/shared/lib/search-params'
import { toISODate } from '@/shared/lib/tr'
import { linkCard } from './card-recipes'
import {
  RESUME_CAPTION,
  dismissResume,
  isResumeDismissed,
  resumeKey,
  resumeSummary,
} from './resume-search'
import { routeStats } from './route-stats'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * The visible control that comes before `element` in tab order. Closing the
 * card removes the button that has focus, and focus left to fall back to
 * <body> sends a keyboard user back to the top of the page; the control just
 * before the card — "Bilet Bul" — is where they already were.
 */
function focusBefore(element: HTMLElement): void {
  const visible = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0,
  )
  visible[visible.indexOf(element) - 1]?.focus()
}

/**
 * "Kaldığınız yerden devam edin": the trip this browser looked up last, with
 * what that day holds right now, one tap from its results.
 *
 * The hero form already opens holding the same search, but it takes a press
 * of "Bilet Bul" to learn anything from it. The card answers what a returning
 * visitor came back to ask — is it still running, and from how much — before
 * they press anything. It is a secondary card and never a second red fill:
 * the red on this screen belongs to "Bilet Bul".
 *
 * A first-time visitor gets nothing at all, not an empty frame. The root
 * carries `data-resume` so the hero can tell, from CSS alone, that a card is
 * there (see Hero).
 */
export function ResumeSearch({ className }: { className?: string }) {
  // One reading of the clock per mount, as on the popular-route cards: the
  // facts only need to leave out the coaches that have already gone, not tick.
  const [now] = useState(Date.now)
  const today = toISODate(new Date(now))
  // Storage is read once, in the initializer, so rendering stays pure.
  const [search, setSearch] = useState(() => {
    const last = lastSearch(today)
    return last && !isResumeDismissed(resumeKey(last)) ? last : null
  })
  // The same search the results page runs, for the same day and the same
  // clock, so the count and the fare are the ones the click delivers.
  const summary = useMemo(
    () =>
      search &&
      resumeSummary(routeStats(search.from, search.to, search.date, now), search.date, today),
    [search, now, today],
  )
  const linkRef = useRef<HTMLAnchorElement>(null)

  if (!search || !summary) return null

  const dismiss = () => {
    dismissResume(resumeKey(search))
    const link = linkRef.current
    if (link?.parentElement?.contains(document.activeElement)) focusBefore(link)
    setSearch(null)
  }

  return (
    // The outer box is the hero's to place; the inner one is the card's own
    // positioning context, so a gap the hero adds above it as padding never
    // moves the close button.
    <div data-resume className={className}>
      <div className="relative">
        <Link
          ref={linkRef}
          to={resultsPath(search.from.slug, search.to.slug, search.date)}
          aria-label={summary.label}
          // The home page's link-card recipe — the lift, and the border warming
          // toward brand that still reads in dark mode — on a resting shadow,
          // since this card stands on the hero's ground rather than in a grid.
          // `peer` lets the close button rise with it.
          className={cn(
            linkCard,
            'peer group flex items-center gap-3 rounded-2xl p-3.5 shadow-sm sm:gap-4 sm:p-4',
          )}
        >
          {/* From sm only: on a phone the card already stands on the sky sheet,
              and the tile's width is worth more to the facts line. */}
          <span
            aria-hidden="true"
            className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-info-tint text-info-fg sm:flex"
          >
            <History className="size-5" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-xs text-fg-muted">{RESUME_CAPTION}</span>

            {/* Wraps rather than truncating, like the popular-route cards: the
                arrow stays with the departure city, so a pair too long for a
                narrow card breaks after the arrow and still reads as a route. */}
            <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 font-display text-base font-semibold text-fg">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                {search.from.name}
                <ArrowRight className="size-3.5 shrink-0 text-fg-subtle" aria-hidden="true" />
              </span>
              <span className="whitespace-nowrap">{search.to.name}</span>
            </span>

            {/* Each fact holds together, and the space before a dot does not
                break: a narrow card wraps after a dot, never in the middle of
                "En düşük 605 TL" or at the start of a line. */}
            <span className="mt-0.5 block text-sm text-fg-secondary">
              {summary.facts.map((fact, index) => (
                <Fragment key={fact.text}>
                  {index > 0 ? (
                    <>
                      <span aria-hidden="true" className="text-fg-subtle">
                        &nbsp;·
                      </span>{' '}
                    </>
                  ) : null}
                  <span className="whitespace-nowrap">
                    {fact.lead ? (
                      <>
                        {fact.lead}{' '}
                        <span className="font-semibold text-fg" data-numeric>
                          {fact.text}
                        </span>
                      </>
                    ) : (
                      fact.text
                    )}
                  </span>
                </Fragment>
              ))}
            </span>
          </span>

          {/* Bottom-aligned, on the facts line, so it sits well clear of the
              close button above it: the two never compete for the same tap. */}
          <ArrowRight
            aria-hidden="true"
            className="size-5 shrink-0 self-end text-brand-fg transition-transform duration-(--duration-base) ease-out group-hover:translate-x-0.5"
          />
        </Link>

        {/* A sibling of the link, never inside it: a button within an <a> is
            invalid, and its press would navigate as well. It is raised above
            the link, which the focus ring lifts to z-index 1 while it has
            focus, and its hit area grows to 44px without growing the glyph. */}
        <button
          type="button"
          aria-label="Kapat"
          onClick={dismiss}
          className={cn(
            'tap-44 absolute top-2 right-2 z-10 flex size-7 items-center justify-center rounded-full',
            'text-fg-muted hover:bg-hover hover:text-fg',
            'transition-[translate,background-color,color] duration-(--duration-base) ease-standard',
            'peer-hover:-translate-y-0.5',
          )}
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
