import { useEffect, useMemo, useRef } from 'react'
import { interpolate } from 'flubber'
import { cn } from '@/shared/lib/cn'
import { useTheme } from '@/shared/lib/use-theme'
import { Button } from '@/shared/ui/button'

/**
 * The two ends of the morph, and the rays, taken from lucide's own `sun` and
 * `moon` — the same icons this button rendered before, and the same set the
 * rest of the product draws from. Nothing here is redrawn by hand.
 *
 * The sun's disc is lucide's `<circle cx="12" cy="12" r="4">` written as the
 * path it already is, because an interpolator needs a path and a circle
 * element is not one. Same centre, same radius.
 */
const SUN_PATH = 'M12 8A4 4 0 1 1 12 16A4 4 0 1 1 12 8Z'

const MOON_PATH =
  'M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401'

/** lucide's eight rays, verbatim. */
const RAYS = [
  'M12 2v2',
  'M12 20v2',
  'm4.93 4.93 1.41 1.41',
  'm17.66 17.66 1.41 1.41',
  'M2 12h2',
  'M20 12h2',
  'm6.34 17.66-1.41 1.41',
  'm19.07 4.93-1.41 1.41',
]

const DURATION_MS = 520

/** Ease in and out, so the shape leaves and arrives without a jolt. */
function ease(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2
}

/**
 * The theme switch, with the sun morphing into the moon.
 *
 * The two icons used to cross-fade, which is the gesture every site uses and
 * reads as one thing vanishing while another appears. Here a single outline
 * travels between them: flubber resamples both paths onto a shared ring of
 * points and interpolates those, which is what makes a circle become a
 * crescent instead of jumping. It stays a line drawing throughout, so it
 * matches every other icon on the page.
 *
 * The path is written straight onto the DOM node inside the frame loop rather
 * than through state — sixty renders a second to set one attribute would be
 * waste, and React has nothing to reconcile here.
 *
 * The label names the ACTION, not the current state: a screen-reader user has
 * no way to see which theme is on, so "Koyu temaya geç" is the only phrasing
 * that says what pressing it does.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  const pathRef = useRef<SVGPathElement>(null)
  const raysRef = useRef<SVGGElement>(null)
  const frameRef = useRef(0)
  /** Where the morph currently stands: 0 is the sun, 1 the moon. */
  const progressRef = useRef(isDark ? 1 : 0)

  const morph = useMemo(
    // Finer sampling costs points and buys a cleaner in-between; about 150
    // points per frame, which is nothing to set once a frame.
    () => interpolate(SUN_PATH, MOON_PATH, { maxSegmentLength: 0.4 }),
    [],
  )

  useEffect(() => {
    const path = pathRef.current
    const rays = raysRef.current
    if (!path) return

    const target = isDark ? 1 : 0
    const from = progressRef.current
    if (from === target) return

    const draw = (p: number) => {
      progressRef.current = p
      path.setAttribute('d', morph(p))
      if (rays) {
        rays.style.opacity = String(1 - p)
        // The rays turn with the disc rather than merely fading, so they read
        // as part of the same object instead of a layer on top of it.
        rays.style.transform = `rotate(${p * 45}deg)`
      }
    }

    const reduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      draw(target)
      return
    }

    const start = performance.now()
    const step = (now: number) => {
      const elapsed = Math.min(1, (now - start) / DURATION_MS)
      draw(from + (target - from) * ease(elapsed))
      if (elapsed < 1) frameRef.current = requestAnimationFrame(step)
    }
    frameRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameRef.current)
  }, [isDark, morph])

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      aria-label={isDark ? 'Açık temaya geç' : 'Koyu temaya geç'}
      // 36px keeps the header compact; `tap-44` restores the 44px hit area.
      className={cn('tap-44', className)}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <g
          ref={raysRef}
          style={{
            transformOrigin: '12px 12px',
            opacity: isDark ? 0 : 1,
            transform: isDark ? 'rotate(45deg)' : 'none',
          }}
        >
          {RAYS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <path ref={pathRef} d={isDark ? MOON_PATH : SUN_PATH} />
      </svg>
    </Button>
  )
}
