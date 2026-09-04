import type { Geometry } from '@/entities/deck/geometry'

/**
 * The coach chassis: nose, windshield, wheels, aisle floor, driver, and the
 * door / WC apertures.
 *
 * Entirely decorative. It is `aria-hidden` so it contributes nothing to the
 * accessibility tree, and `pointer-events: none` so it cannot swallow a click
 * meant for a seat button sitting on top of it. That separation is what lets
 * the art be restyled freely without any risk to interaction or a11y.
 *
 * What makes it read as considered rather than clip-art is the four-weight
 * stroke system — 3 for the shell, 1.5 for a seat body, 1 for detail, 0.75 for
 * a hairline — held consistently, more than any individual flourish.
 */
export function BusShell({ geometry }: { geometry: Geometry }) {
  const { viewBox, chrome, fixtures } = geometry

  return (
    <svg
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
      className="pointer-events-none absolute inset-0 size-full"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="bl-windshield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-deck-chrome)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--color-deck-chrome)" stopOpacity="0.12" />
        </linearGradient>
        <pattern
          id="bl-door-hatch"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--color-deck-chrome)" strokeWidth="1.2" />
        </pattern>
      </defs>

      {/* Wheels sit behind the body so the shell paints over their inner half
          and they read as arches rather than pasted-on rectangles. */}
      {chrome.wheels.map((w, i) => (
        <rect
          key={i}
          x={w.x}
          y={w.y}
          width={w.w}
          height={w.h}
          rx={w.w / 2}
          fill="var(--color-deck-chrome)"
        />
      ))}

      <path
        d={chrome.shellPath}
        fill="var(--color-deck-shell)"
        stroke="var(--color-deck-shell-border)"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Windshield: a band between two concentric nose arcs. */}
      <path d={chrome.windshieldOuter} fill="none" stroke="url(#bl-windshield)" strokeWidth="9" />
      <path
        d={chrome.windshieldInner}
        fill="none"
        stroke="var(--color-deck-shell-border)"
        strokeWidth="1"
        opacity="0.5"
      />

      {/* Aisle floor, running the length of the cabin behind the nose. */}
      <rect
        x={chrome.floor.x}
        y={chrome.floor.y}
        width={chrome.floor.w}
        height={chrome.floor.h}
        rx={chrome.floor.w / 2}
        fill="var(--color-deck-floor)"
      />

      {/* Driver: steering wheel plus a hint of the seat, front-left. */}
      <circle
        cx={chrome.wheel.cx}
        cy={chrome.wheel.cy + 34}
        r={chrome.wheel.r}
        fill="none"
        stroke="var(--color-deck-shell-border)"
        strokeWidth="2.5"
      />
      <circle
        cx={chrome.wheel.cx}
        cy={chrome.wheel.cy + 34}
        r="2"
        fill="var(--color-deck-shell-border)"
      />
      <path
        d={`M ${chrome.wheel.cx - chrome.wheel.r} ${chrome.wheel.cy + 34} H ${chrome.wheel.cx + chrome.wheel.r}`}
        stroke="var(--color-deck-shell-border)"
        strokeWidth="1.5"
      />

      {/* Doors, WCs and stairwells — drawn from the merged fixture boxes, so a
          two-row door is one shape rather than four abutting tiles. */}
      {fixtures.map((f) => {
        if (f.kind === 'door') {
          const treadCount = Math.max(2, Math.floor(f.h / 22))
          return (
            <g key={f.key}>
              <rect
                x={f.x}
                y={f.y}
                width={f.w}
                height={f.h}
                rx="8"
                fill="var(--color-deck-floor)"
                stroke="var(--color-deck-chrome)"
                strokeWidth="1"
                strokeDasharray="5 4"
              />
              {Array.from({ length: treadCount }, (_, i) => (
                <rect
                  key={i}
                  x={f.x + 10}
                  y={f.y + 12 + i * ((f.h - 24) / treadCount)}
                  width={f.w - 20}
                  height="6"
                  rx="3"
                  fill="var(--color-deck-chrome)"
                  opacity="0.7"
                />
              ))}
            </g>
          )
        }
        if (f.kind === 'wc') {
          return (
            <g key={f.key}>
              <rect
                x={f.x}
                y={f.y}
                width={f.w}
                height={f.h}
                rx="8"
                fill="url(#bl-door-hatch)"
                fillOpacity="0.25"
                stroke="var(--color-deck-chrome)"
                strokeWidth="1"
              />
              <text
                x={f.x + f.w / 2}
                y={f.y + f.h / 2 + 5}
                textAnchor="middle"
                fontSize="14"
                fontWeight="600"
                fill="var(--color-deck-shell-border)"
                fontFamily="var(--font-sans)"
              >
                WC
              </text>
            </g>
          )
        }
        return (
          <rect
            key={f.key}
            x={f.x}
            y={f.y}
            width={f.w}
            height={f.h}
            rx="8"
            fill="url(#bl-door-hatch)"
            fillOpacity="0.2"
            stroke="var(--color-deck-chrome)"
            strokeWidth="1"
          />
        )
      })}

      {/* Rear engine grille. */}
      {Array.from({ length: 5 }, (_, i) => (
        <line
          key={i}
          x1={viewBox.w * 0.3}
          x2={viewBox.w * 0.7}
          y1={viewBox.h - 13 + i * 2.4}
          y2={viewBox.h - 13 + i * 2.4}
          stroke="var(--color-deck-chrome)"
          strokeWidth="0.75"
        />
      ))}
    </svg>
  )
}
