import { useEffect, useRef, useState } from 'react'
import { useNavigation } from 'react-router'

/** Below this a navigation is over before anyone would notice it waiting. */
const SHOW_AFTER_MS = 300
/** Once shown, long enough to read as a state rather than a flicker. */
const MIN_VISIBLE_MS = 450

/**
 * The pending indicator: the tittle of the "i" from the wordmark, pinging —
 * but only while a navigation is genuinely waiting on something.
 *
 * It used to be a veil that washed every page change for a fixed 560ms,
 * whether or not anything was loading. A fixed wait is a delay pretending to
 * be a load: it slowed the fast changes, said nothing true about the slow
 * ones, and covered the card the eye was following when a page morphed in.
 * Now it is driven by the router's own navigation state, the way pending UI
 * usually is: nothing for the first 300ms, so quick changes never show it;
 * then the mark, until the navigation settles; and once it has appeared it
 * stays at least 450ms, so it reads as a state instead of a flash.
 *
 * What it covers is the route-level loading the router knows about — today
 * the seat page, whose code loads before its navigation commits so the trip
 * card can morph into it. Pages that load behind Suspense show PageFallback
 * instead, which is delayed the same way.
 *
 * It takes no pointer events, so a link underneath stays clickable, and it
 * announces itself once to assistive tech.
 */
export function RouteTransition() {
  const navigation = useNavigation()
  const pending = navigation.state !== 'idle'
  const [visible, setVisible] = useState(false)
  const shownAt = useRef(0)

  useEffect(() => {
    if (pending) {
      if (visible) return
      const timer = window.setTimeout(() => {
        shownAt.current = Date.now()
        setVisible(true)
      }, SHOW_AFTER_MS)
      return () => window.clearTimeout(timer)
    }
    if (!visible) return
    const remaining = MIN_VISIBLE_MS - (Date.now() - shownAt.current)
    const timer = window.setTimeout(() => setVisible(false), Math.max(0, remaining))
    return () => window.clearTimeout(timer)
  }, [pending, visible])

  if (!visible) return null

  return (
    <div
      data-print-hide
      // Translucent, not opaque: the page behind stays visible, so this reads
      // as a wash over the wait rather than a blank screen. The blur is what
      // keeps the mark legible over whatever happens to be underneath.
      className="pointer-events-none fixed inset-0 z-300 grid animate-in place-items-center bg-bg/65 backdrop-blur-md duration-(--duration-base) fade-in-0"
    >
      <span role="status" className="sr-only">
        Sayfa yükleniyor
      </span>
      {/* The wordmark's tittle: a solid dot at r=3 inside a ring at r=5.5, both
          centred on the origin so the rings scale outward from the dot. */}
      <svg
        viewBox="-24 -24 48 48"
        className="size-28 text-brand sm:size-32"
        aria-hidden="true"
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
