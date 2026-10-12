import { useId } from 'react'

/** Bottom-left, just outside the band, to a head a little short of the top-right. */
const FROM = { x: -4, y: 104 }
const TO = { x: 90, y: 14 }

/**
 * A shooting star across the desktop hero's sky: one long, thin streak from
 * the band's bottom-left to its top-right, its tail fading out and its head
 * glowing.
 *
 * Static on purpose. The header already moves as the page scrolls, and a
 * second motion beside the search form would compete with it; drawn once,
 * the streak gives the band direction — onward, up and to the right — without
 * asking for attention. Decoration only: aria-hidden, no pointer events, and
 * behind everything in the hero.
 *
 * The line is an SVG stretched over the band (`preserveAspectRatio="none"`)
 * with a non-scaling stroke, so it always runs corner to corner at a constant
 * width whatever the band's proportions. The head is an HTML dot placed at the
 * same percentages, because a circle inside a stretched SVG would stretch too.
 * It stops short of the corner so the glow sits in open sky below the
 * header's buttons rather than behind them.
 *
 * White on the light sky needs a stronger tail to be seen at all, so the stop
 * opacities are theme variables: in light the tail carries further and a soft
 * halo runs beneath it; in dark, where any light line reads, it stays fine.
 * Only from lg, where the band has the room; it ends where the band does
 * (--band-cut), never across the search panel's lower half.
 */
export function HeroStreak() {
  const id = useId()
  const line = { x1: FROM.x, y1: FROM.y, x2: TO.x, y2: TO.y }
  return (
    <div
      aria-hidden="true"
      className={[
        'pointer-events-none absolute inset-x-0 top-0 bottom-[var(--band-cut,0px)] hidden overflow-hidden lg:block',
        '[--streak-halo:0.22] [--streak-high:0.95] [--streak-mid:0.45] [--streak:var(--color-neutral-0)]',
        'dark:[--streak-halo:0.1] dark:[--streak-high:0.7] dark:[--streak-mid:0.18] dark:[--streak:oklch(97%_0.02_240)]',
      ].join(' ')}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full overflow-visible"
        focusable="false"
      >
        <defs>
          <linearGradient id={id} gradientUnits="userSpaceOnUse" {...line}>
            <stop offset="0" style={{ stopColor: 'var(--streak)', stopOpacity: 0 }} />
            <stop
              offset="0.5"
              style={{ stopColor: 'var(--streak)', stopOpacity: 'var(--streak-mid)' }}
            />
            <stop
              offset="0.9"
              style={{ stopColor: 'var(--streak)', stopOpacity: 'var(--streak-high)' }}
            />
            <stop offset="1" style={{ stopColor: 'var(--streak)', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        {/* The halo: a wide, faint copy that gives the line body on a light sky. */}
        <line
          {...line}
          stroke={`url(#${id})`}
          strokeWidth="6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ opacity: 'var(--streak-halo)' }}
        />
        <line
          {...line}
          stroke={`url(#${id})`}
          strokeWidth="1.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span
        className={[
          'absolute size-[5px] -translate-1/2 rounded-full bg-(--streak)',
          'shadow-[0_0_6px_2px_color-mix(in_oklab,var(--streak)_85%,transparent),0_0_22px_8px_color-mix(in_oklab,var(--color-info)_30%,transparent)]',
        ].join(' ')}
        style={{ left: `${TO.x}%`, top: `${TO.y}%` }}
      />
    </div>
  )
}
