import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'

/** Matches --animate-route-veil in theme.css; the overlay unmounts when it ends. */
const VEIL_MS = 560

/**
 * A full-screen flash is exactly what this setting exists to refuse, and
 * shortening it would still leave a flash — so the veil simply does not run.
 */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * The between-pages veil: the tittle of the "i" from the wordmark, pinging.
 *
 * It is decoration, and it is built so it can never become an obstacle. It
 * takes no pointer events, so a link underneath stays clickable throughout; it
 * is aria-hidden, because PageFallback already announces loading and a screen
 * reader gains nothing from a second voice; and it never gates the route — the
 * new page has already swapped in underneath by the time the veil lifts.
 */
export function RouteTransition() {
  const { pathname } = useLocation()
  const [previous, setPrevious] = useState(pathname)
  const [veiling, setVeiling] = useState<string | null>(null)

  // Adjusting state during render is React's supported way to respond to a
  // changed input. An effect would paint the new page first and only then
  // raise the veil, which is the one frame the veil exists to cover.
  if (previous !== pathname) {
    setPrevious(pathname)
    if (!prefersReducedMotion()) setVeiling(pathname)
  }

  useEffect(() => {
    if (veiling === null) return
    const timer = window.setTimeout(() => setVeiling(null), VEIL_MS)
    return () => window.clearTimeout(timer)
  }, [veiling])

  if (veiling === null) return null

  return (
    <div
      // Keyed by path so a second navigation restarts the veil rather than
      // riding out the one already running.
      key={veiling}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-300 grid animate-route-veil place-items-center bg-bg"
    >
      {/* The wordmark's tittle: a solid dot at r=3 inside a ring at r=5.5, both
          centred on the origin so the rings scale outward from the dot. */}
      <svg
        viewBox="-24 -24 48 48"
        className="size-28 text-brand sm:size-32"
        role="presentation"
        focusable="false"
      >
        {[0, 230, 460].map((delay) => (
          <circle
            key={delay}
            r="5.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="animate-sonar"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
        <circle r="5.5" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle r="3" fill="currentColor" />
      </svg>
    </div>
  )
}
