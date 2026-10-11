import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Info } from 'lucide-react'
import { DECK_TOKENS, layoutDeck, type Geometry, type PlacedCell } from '@/entities/deck/geometry'
import { getDeck } from '@/entities/deck/layouts'
import {
  seatVisualState,
  type Gender,
  type Seat,
  type SeatMap as SeatMapData,
  type SeatPick,
} from '@/entities/seat/model'
import { planPick, seatLabel, type GenderOption } from '@/entities/seat/rules'
import { cn } from '@/shared/lib/cn'
import { useIsDesktop } from '@/shared/lib/use-media-query'

/**
 * A lying-down coach is drawn at whatever height its width allows, so every
 * unit of length costs seat size. Upright, the 12-unit row gap and the long
 * nose read as air; turned, they are the difference between a 37px seat and
 * a 46px one. The seats themselves keep their proportions.
 */
const TURNED_TOKENS = Object.freeze({
  ...DECK_TOKENS,
  rowGap: 6,
  noseLen: 72,
  // Lying down, the coach's width is its height on screen — and at 202 units
  // against ~790 of length it read as a strip, not a body. Wider walls and a
  // wider aisle put air above, below and between the seats; the seats keep
  // their own size, since width is what fixes that.
  padX: 30,
  aisleW: 34,
  padTop: 10,
  padBottom: 12,
})
import { formatPrice } from '@/shared/lib/tr'
import { GENDER_ART } from '@/shared/config/assets'
import { Illustration } from '@/shared/ui/asset-icon'
import { Popover, PopoverAnchor, PopoverContent } from '@/shared/ui/primitives'
import { BusShell } from './BusShell'
import { GenderMark, SeatGlyph } from './SeatGlyph'

/**
 * The seat map.
 *
 * Architecture: one decorative SVG for the chassis, plus real HTML `<button>`
 * elements positioned as PERCENTAGES of the same viewBox box
 * (`left: calc(144 / 202 * 100%)`). Both layers read the same geometry, so
 * drift between the drawing and the controls is structurally impossible — no
 * ResizeObserver, no JS measurement, no tuning.
 *
 * Real buttons rather than `<g role="button" tabindex="0">` inside the SVG:
 * `<g>` has no default role, SVG accessibility mapping is still uneven across
 * engines, `outline` is not reliably painted on SVG elements, and a `tabindex`
 * on an unnamed SVG node corrupts screen-reader name computation for the nodes
 * that follow it. With a button we get native focus, native Enter/Space, and
 * `:focus-visible` for free.
 *
 * ARIA: the APG grid pattern with `role="gridcell"` overridden onto the
 * button. `aria-selected` is invalid on a plain button, and `aria-pressed`
 * would announce "pressed" — the wrong mental model for choosing from a set.
 */

export interface SeatMapProps {
  data: SeatMapData
  picks: readonly SeatPick[]
  onPick: (seat: Seat, gender: Gender) => void
  onRemove: (key: string) => void
  className?: string
}

export function SeatMap({ data, picks, onPick, onRemove, className }: SeatMapProps) {
  // A coach is far longer than it is wide. Given width it lies down and the
  // whole deck fits at once, which is how every Turkish ticketing site draws
  // it; on a phone there is no width to give, and turning it would leave the
  // seats too small to hit. So the plan follows the screen.
  const wide = useIsDesktop()
  const geometry = useMemo(
    () =>
      wide
        ? layoutDeck(getDeck(data.deckId), TURNED_TOKENS, 'horizontal')
        : layoutDeck(getDeck(data.deckId)),
    [data.deckId, wide],
  )
  const seatByKey = useMemo(() => new Map(data.seats.map((s) => [s.key, s])), [data.seats])
  const pickedGender = useMemo(() => new Map(picks.map((p) => [p.key, p.gender])), [picks])

  const [focusedKey, setFocusedKey] = useState<string>(() => initialFocusKey(geometry, seatByKey))
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  // Outlives `pendingKey`, which is already cleared when the chooser closes.
  const askedFor = useRef<string | null>(null)
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>())
  const shouldFocus = useRef(false)

  // Move focus in an effect, never during render, and only when the change
  // came from a key press — otherwise a re-render would steal focus.
  useEffect(() => {
    if (!shouldFocus.current) return
    shouldFocus.current = false
    const el = buttonRefs.current.get(focusedKey)
    el?.focus()
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [focusedKey])

  // Only seats are focusable. Doors and WCs are announced but carry no button,
  // so letting `focusedKey` land on one leaves NO cell with tabIndex 0 and the
  // whole grid silently drops out of the tab order.
  const moveTo = useCallback(
    (key: string | null | undefined) => {
      if (!key || geometry.byKey.get(key)?.kind !== 'seat') return
      shouldFocus.current = true
      setFocusedKey(key)
    },
    [geometry],
  )

  /**
   * Walks past non-seat cells in one direction. The mid door occupies two
   * rows of the right-hand pair, so ArrowDown from the seat above it has to
   * step over both to reach the seat below; running off the end of a row
   * returns null and the key press becomes a no-op.
   */
  const seatward = useCallback(
    (start: string | null, dir: keyof PlacedCell['nb']): string | null => {
      const seen = new Set<string>()
      let key = start
      while (key && !seen.has(key)) {
        const cell = geometry.byKey.get(key)
        if (!cell) return null
        if (cell.kind === 'seat') return key
        seen.add(key)
        key = cell.nb[dir]
      }
      return null
    },
    [geometry],
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, cell: PlacedCell) => {
      const rowSeats = geometry.seats.filter((c) => c.row === cell.row).sort((a, b) => a.x - b.x)

      const jumpRows = (delta: number) => {
        const step = Math.sign(delta) || 1
        // A target row can be entirely door or WC, so walk back toward the
        // current row until one with seats is found.
        for (
          let target = Math.min(Math.max(cell.row + delta, 0), geometry.rowCount - 1);
          target >= 0 && target < geometry.rowCount;
          target -= step
        ) {
          const candidates = geometry.seats.filter((c) => c.row === target)
          if (candidates.length === 0) continue
          const best = candidates.reduce((acc, c) =>
            Math.abs(c.ariaColIndex - cell.ariaColIndex) <
            Math.abs(acc.ariaColIndex - cell.ariaColIndex)
              ? c
              : acc,
          )
          moveTo(best.key)
          return
        }
      }

      switch (event.key) {
        case 'ArrowRight':
          moveTo(seatward(cell.nb.right, 'right'))
          break
        case 'ArrowLeft':
          moveTo(seatward(cell.nb.left, 'left'))
          break
        case 'ArrowDown':
          moveTo(seatward(cell.nb.down, 'down'))
          break
        case 'ArrowUp':
          moveTo(seatward(cell.nb.up, 'up'))
          break
        case 'Home':
          if (event.ctrlKey) moveTo(geometry.seats[0]?.key)
          else moveTo(rowSeats[0]?.key)
          break
        case 'End':
          if (event.ctrlKey) moveTo(geometry.seats.at(-1)?.key)
          else moveTo(rowSeats.at(-1)?.key)
          break
        case 'PageDown':
          jumpRows(5)
          break
        case 'PageUp':
          jumpRows(-5)
          break
        default:
          return
      }
      // Stop the page scrolling out from under the caret.
      event.preventDefault()
    },
    [geometry, moveTo, seatward],
  )

  const activate = useCallback(
    (cell: PlacedCell) => {
      const seat = cell.seatNo !== null ? seatByKey.get(cell.key) : undefined
      if (!seat) return
      if (pickedGender.has(seat.key)) {
        onRemove(seat.key)
        setPendingKey(null)
        return
      }
      // Nothing to ask — no gender rule, or no answer could be added. The
      // pick goes straight to the cart rules, which either add it or say why
      // not; a sold seat or a full booking is explained on the tap instead of
      // after a question whose every answer would have been refused.
      const plan = planPick(picks, seat, data.policy)
      if (plan.kind === 'commit') {
        setPendingKey(null)
        onPick(seat, plan.gender)
        return
      }
      askedFor.current = seat.key
      setPendingKey(seat.key)
    },
    [data.policy, onPick, onRemove, pickedGender, picks, seatByKey],
  )

  const rows = useMemo(() => {
    const map = new Map<number, PlacedCell[]>()
    for (const cell of geometry.cells) {
      const list = map.get(cell.ariaRowIndex) ?? []
      list.push(cell)
      map.set(cell.ariaRowIndex, list)
    }
    for (const list of map.values()) list.sort((a, b) => a.ariaColIndex - b.ariaColIndex)
    return [...map.entries()].sort((a, b) => a[0] - b[0])
  }, [geometry])

  const turned = geometry.orientation === 'horizontal'
  const pendingSeat = pendingKey ? seatByKey.get(pendingKey) : undefined
  const pendingPlan = pendingSeat ? planPick(picks, pendingSeat, data.policy) : undefined
  const { w: W, h: H } = geometry.viewBox
  const pct = (value: number, total: number) => `${(value / total) * 100}%`

  return (
    <div
      className={cn(
        'relative mx-auto w-full',
        // A turned coach wants all the width there is. An upright one is
        // capped, because its height follows its width: on a phone the cap
        // never bit — the deck simply took the card's 325px and stood 1407px
        // tall, four and a half screens of coach. 15rem puts a seat at 47px,
        // still past the 44px touch target, and the deck at 1039.
        geometry.orientation === 'horizontal' ? 'max-w-full' : 'max-w-60 sm:max-w-[22rem]',
        className,
      )}
      style={{ aspectRatio: `${W} / ${H}` }}
    >
      <BusShell geometry={geometry} />

      <div
        role="grid"
        lang="tr"
        aria-label={`Otobüs koltuk planı, ${geometry.spec.family} düzen, ${geometry.seatCount} koltuk`}
        aria-multiselectable="true"
        aria-rowcount={geometry.ariaRowCount}
        aria-colcount={geometry.ariaColCount}
        className="absolute inset-0"
      >
        {rows.map(([rowIndex, cells]) => (
          // `display: contents` keeps the required grid > row > gridcell
          // structure for assistive tech while letting the cells position
          // absolutely against the deck box.
          <div key={rowIndex} role="row" aria-rowindex={rowIndex} style={{ display: 'contents' }}>
            {cells.map((cell) => {
              const seat = cell.seatNo !== null ? seatByKey.get(cell.key) : undefined
              const style = {
                left: pct(cell.x, W),
                top: pct(cell.y, H),
                width: pct(cell.w, W),
                height: pct(cell.h, H),
              } as const

              if (!seat) {
                // Doors and WCs are announced — a seat beside the door or the
                // lavatory is exactly the spatial context a blind passenger
                // needs — but they are not selectable.
                return (
                  <div
                    key={cell.key}
                    role="gridcell"
                    aria-colindex={cell.ariaColIndex}
                    aria-disabled="true"
                    aria-label={FIXTURE_LABEL[cell.kind] ?? 'Boş alan'}
                    className="absolute"
                    style={style}
                  />
                )
              }

              const pickGender = pickedGender.get(seat.key)
              const selected = pickGender !== undefined
              const state = seatVisualState(seat, selected)
              const interactive = state === 'available' || selected

              return (
                <SeatButton
                  turned={turned}
                  key={cell.key}
                  ref={(el) => {
                    if (el) buttonRefs.current.set(cell.key, el)
                    else buttonRefs.current.delete(cell.key)
                  }}
                  cell={cell}
                  seat={seat}
                  state={state}
                  selected={selected}
                  mark={markFor(state, pickGender)}
                  interactive={interactive}
                  tabIndex={focusedKey === cell.key ? 0 : -1}
                  style={style}
                  isPending={pendingKey === cell.key}
                  onFocus={() => setFocusedKey(cell.key)}
                  onClick={() => activate(cell)}
                  onKeyDown={(event) => handleKeyDown(event, cell)}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* The gender step. Turkish carriers ask for it after the seat is
          chosen, and the illegal option is shown switched off, with its reason
          in plain text, rather than hidden — so the restriction is learnt. */}
      <Popover
        open={pendingPlan?.kind === 'ask'}
        onOpenChange={(open) => {
          if (!open) setPendingKey(null)
        }}
      >
        <PopoverAnchor asChild>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={
              pendingKey && geometry.byKey.get(pendingKey)
                ? {
                    left: pct(geometry.byKey.get(pendingKey)!.x, W),
                    top: pct(geometry.byKey.get(pendingKey)!.y, H),
                    width: pct(geometry.byKey.get(pendingKey)!.w, W),
                    height: pct(geometry.byKey.get(pendingKey)!.h, H),
                  }
                : { left: '50%', top: '50%' }
            }
          />
        </PopoverAnchor>
        <PopoverContent
          align="center"
          // Above or below the seat, never beside it: a side placement can only
          // slide vertically, and beside a seat on a 390px phone the chooser
          // ran off the screen's left edge. The padding keeps it clear of the
          // sticky header and the phone's sticky bar.
          side={turned ? 'top' : 'bottom'}
          collisionPadding={{ top: 88, bottom: 96, left: 12, right: 12 }}
          className="w-64 max-w-[calc(100vw-2rem)] p-3"
          // The anchor is not a trigger, so Radix has nowhere to send focus on
          // close and it fell to the page. Back to the seat keeps a keyboard
          // user's place in the coach.
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            const key = askedFor.current
            if (!key) return
            setFocusedKey(key)
            buttonRefs.current.get(key)?.focus({ preventScroll: true })
          }}
        >
          {pendingSeat && pendingPlan?.kind === 'ask' ? (
            <GenderChoice
              seat={pendingSeat}
              options={pendingPlan.options}
              singleSeatFee={pendingSeat.isSingle ? data.policy.singleSeatFee : 0}
              onChoose={(gender) => {
                onPick(pendingSeat, gender)
                setPendingKey(null)
              }}
            />
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  )
}

const FIXTURE_LABEL: Partial<Record<PlacedCell['kind'], string>> = {
  door: 'Orta kapı',
  wc: 'Tuvalet',
  stairs: 'Merdiven',
}

function SeatButton({
  ref,
  cell,
  turned,
  seat,
  state,
  selected,
  mark,
  interactive,
  isPending,
  style,
  ...props
}: {
  ref: (el: HTMLButtonElement | null) => void
  cell: PlacedCell
  turned: boolean
  seat: Seat
  state: ReturnType<typeof seatVisualState>
  selected: boolean
  mark: 'M' | 'F' | null
  interactive: boolean
  isPending: boolean
  style: React.CSSProperties
} & Omit<React.ComponentProps<'button'>, 'style' | 'ref'>) {
  return (
    <button
      ref={ref}
      type="button"
      role="gridcell"
      aria-colindex={cell.ariaColIndex}
      aria-rowindex={cell.ariaRowIndex}
      aria-selected={selected}
      aria-roledescription="Koltuk"
      aria-label={seatLabel(seat)}
      // `aria-disabled`, never the HTML `disabled` attribute: an occupied seat
      // must stay arrow-reachable so the coach is explorable, and `disabled`
      // would drop it out of the roving tabindex.
      aria-disabled={!interactive || undefined}
      data-state={state}
      className={cn(
        'absolute grid place-items-center rounded-md',
        'transition-transform duration-(--duration-fast) ease-standard',
        interactive && 'cursor-pointer hover:-translate-y-px active:scale-95',
        !interactive && 'cursor-not-allowed',
        // The seat being asked about stays marked while the chooser covers
        // part of the coach — dashed, because it is not picked yet.
        isPending &&
          'z-10 -translate-y-px outline-2 outline-offset-2 outline-success outline-dashed',
      )}
      style={style}
      {...props}
    >
      <SeatGlyph state={state} turned={turned} />

      {/* The number is HTML, not SVG text: it stays legible at any deck scale
          instead of shrinking with the drawing. The gender mark sits under it
          in the same colour, so occupied-male and occupied-female differ by
          shape as well as hue, and a picked seat shows whom it was taken for. */}
      <span
        className={cn(
          'pointer-events-none absolute flex flex-col items-center gap-px font-semibold',
          'text-[clamp(0.6875rem,2.6vw,0.875rem)] leading-none',
          seat.label.length > 2 && 'text-[clamp(0.5625rem,2vw,0.75rem)]',
        )}
        style={
          turned
            ? { color: SEAT_TEXT[state], marginRight: '0.2em' }
            : { color: SEAT_TEXT[state], marginTop: mark ? '0.35em' : '0.15em' }
        }
      >
        <span data-numeric className="tabular-nums">
          {seat.label}
        </span>
        {mark ? <GenderMark gender={mark} className="size-[0.85em]" /> : null}
      </span>

      {selected ? (
        <span
          className="pointer-events-none absolute -top-1 -right-1 grid size-4 animate-seat-pop place-items-center rounded-full bg-surface shadow-sm"
          aria-hidden="true"
        >
          <svg viewBox="0 0 12 12" className="size-2.5">
            <path
              d="M2.5 6.2 L4.8 8.5 L9.5 3.6"
              fill="none"
              stroke="var(--seat-selected-fill)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ) : null}
    </button>
  )
}

const SEAT_TEXT: Record<string, string> = {
  available: 'var(--seat-available-text)',
  selected: 'var(--seat-selected-text)',
  'occupied-male': 'var(--seat-male-text)',
  'occupied-female': 'var(--seat-female-text)',
  disabled: 'var(--seat-disabled-text)',
}

/** Occupied seats show who sits there; picked ones show whom they were taken for. */
function markFor(state: ReturnType<typeof seatVisualState>, picked: Gender | undefined) {
  if (state === 'occupied-male') return 'M'
  if (state === 'occupied-female') return 'F'
  return picked === 'M' || picked === 'F' ? picked : null
}

function GenderChoice({
  seat,
  options,
  singleSeatFee,
  onChoose,
}: {
  seat: Seat
  options: readonly [GenderOption, GenderOption]
  singleSeatFee: number
  onChoose: (gender: Gender) => void
}) {
  const id = useId()
  // At most one answer is ever ruled out here — with both ruled out there is
  // no question, and `planPick` commits instead — so one reason line serves.
  const reason = options.find((o) => o.blockedBy !== null)?.blockedBy ?? null

  return (
    <div role="group" aria-labelledby={`${id}-title`} aria-describedby={`${id}-prompt`}>
      <div className="flex items-baseline justify-between gap-3">
        <p id={`${id}-title`} className="text-sm font-semibold text-fg">
          {seat.label} numaralı koltuk
        </p>
        <p className="text-sm font-semibold text-fg tabular-nums">{formatPrice(seat.price)}</p>
      </div>
      <p className="mt-0.5 text-xs text-fg-muted">
        {seat.isSingle ? 'Tekli koltuk' : seat.isWindow ? 'Pencere kenarı' : 'Koridor kenarı'}
        {singleSeatFee > 0 ? (
          <span className="tabular-nums"> · +{formatPrice(singleSeatFee)} tekli koltuk farkı</span>
        ) : null}
      </p>
      <p id={`${id}-prompt`} className="mt-2 text-xs text-fg-secondary">
        Yolcunun cinsiyetini seçin
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {options.map((option) => (
          <GenderButton
            key={option.gender}
            gender={option.gender}
            enabled={option.blockedBy === null}
            describedBy={option.blockedBy === null ? undefined : `${id}-reason`}
            onChoose={onChoose}
          />
        ))}
      </div>
      {reason ? (
        <p id={`${id}-reason`} className="mt-2.5 flex gap-1.5 text-xs text-fg-secondary">
          <Info className="mt-px size-3.5 shrink-0 text-fg-muted" aria-hidden="true" />
          {reason}
        </p>
      ) : null}
    </div>
  )
}

function GenderButton({
  gender,
  enabled,
  describedBy,
  onChoose,
}: {
  gender: 'M' | 'F'
  enabled: boolean
  describedBy: string | undefined
  onChoose: (gender: Gender) => void
}) {
  const label = gender === 'M' ? 'Erkek' : 'Kadın'

  // The original passenger figures. The `passive` file is a different drawing
  // that already carries a red "not allowed" mark, so an unavailable gender is
  // shown rather than merely dimmed — the restriction reads at a glance
  // instead of depending on opacity.
  const art =
    gender === 'M'
      ? enabled
        ? GENDER_ART.maleActive
        : GENDER_ART.malePassive
      : enabled
        ? GENDER_ART.femaleActive
        : GENDER_ART.femalePassive

  return (
    // `aria-disabled` rather than `disabled`: the switched-off answer stays
    // focusable, so a screen-reader user reaches it and hears the reason
    // through `aria-describedby` instead of finding one button missing.
    <button
      type="button"
      aria-disabled={!enabled || undefined}
      aria-describedby={describedBy}
      onClick={() => {
        if (enabled) onChoose(gender)
      }}
      className={cn(
        'flex flex-col items-center gap-1 rounded-lg border px-3 py-2 text-xs font-medium',
        'transition-colors duration-(--duration-fast)',
        enabled
          ? gender === 'M'
            ? 'border-border text-(--seat-male-text) hover:bg-(--seat-male-fill)'
            : 'border-border text-(--seat-female-text) hover:bg-(--seat-female-fill)'
          : 'cursor-not-allowed border-dashed border-border text-fg-subtle',
      )}
    >
      <Illustration src={art} alt="" width={64} height={64} className="size-9" />
      {label}
    </button>
  )
}

/** First tab stop: the first free seat, else the first seat. Never a fixture. */
function initialFocusKey(geometry: Geometry, seatByKey: Map<string, Seat>): string {
  const free = geometry.seats.find((cell) => seatByKey.get(cell.key)?.availableFor === 'ALL')
  return free?.key ?? geometry.seats[0]?.key ?? ''
}
