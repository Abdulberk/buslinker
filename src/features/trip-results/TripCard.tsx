import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import {
  Armchair,
  BedDouble,
  Bus,
  ChevronDown,
  CircleCheck,
  Coffee,
  Moon,
  ShieldCheck,
  Snowflake,
  Tv,
  Usb,
  Wifi,
  type LucideIcon,
} from 'lucide-react'
import type { CSSProperties } from 'react'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { VisuallyHidden } from '@/shared/ui/visually-hidden'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/primitives'
import { OperatorLogo } from '@/shared/ui/operator-logo'
import { cn } from '@/shared/lib/cn'
import {
  formatDuration,
  formatPrice,
  formatTime,
  formatWeekdayShort,
  isNightDeparture,
  nightOfLabel,
} from '@/shared/lib/tr'
import { amenityById, cityById, operatorById } from '@/shared/api/catalog'
import type { AmenityId } from '@/shared/api/catalog'
import { seatPath } from '@/shared/lib/search-params'
import type { Trip } from '@/shared/api/mock-server'

/**
 * The card and its skeleton share one box, expressed as a custom property so
 * the two can never drift: `--card-min-h` drives both `min-height` and
 * `contain-intrinsic-size`, and a wrong intrinsic size is exactly what makes
 * `content-visibility: auto` cause the scroll jumping it is meant to avoid.
 */
const CARD_BOX = cn(
  '[--card-min-h:14rem] lg:[--card-min-h:11rem]',
  'flex min-h-[var(--card-min-h)]',
  // The shadow is on this box, not on the card inside it. `content-visibility:
  // auto` brings paint containment, which clips whatever a descendant paints
  // outside the box — and a shadow is painted outside. On the card it survived
  // only in the four wedges between the rounded corner and the rectangular
  // clip, which is what showed as dark triangles on hover.
  'rounded-xl shadow-lg',
)

/** The lift on hover and on keyboard focus within; the skeleton has none. */
const CARD_LIFT = cn(
  'transition-shadow duration-(--duration-base) ease-standard',
  'hover:shadow-lift has-[a:focus-visible]:shadow-lift',
)

const CARD_BOX_STYLE: CSSProperties = {
  contentVisibility: 'auto',
  containIntrinsicSize: '0 var(--card-min-h)',
}

const GRID = cn(
  // Tighter on a phone: at gap-4 and p-4 the three rows carried 48px of air
  // they had no use for, on a card that repeats nine times down the page.
  'grid flex-1 gap-2.5 p-3.5',
  'sm:gap-4 sm:p-5',
  'lg:grid-cols-[9.5rem_minmax(0,1fr)_auto] lg:items-center lg:gap-6',
)

/** The plate is wider on the desktop card, where the carrier has a column. */
const LOGO_PLATE = 'lg:h-14 lg:w-36'

/**
 * One icon family for every amenity. The house set drew five of the eight
 * and lucide the other three, at different stroke weights side by side.
 * Free cancellation has no icon in the row: it is written out as words, since
 * it decides a purchase in a way a blanket does not.
 */
const AMENITY_ICONS: Record<Exclude<AmenityId, 'free-cancel'>, LucideIcon> = {
  wifi: Wifi,
  usb: Usb,
  tv: Tv,
  refreshment: Coffee,
  ac: Snowflake,
  blanket: BedDouble,
  hygiene: ShieldCheck,
}

type IconAmenity = keyof typeof AMENITY_ICONS

function isIconAmenity(id: AmenityId): id is IconAmenity {
  return id !== 'free-cancel'
}

const MAX_AMENITY_ICONS = 4

function terminalName(cityId: string, terminalId: string): string {
  const city = cityById(cityId)
  return city?.terminals.find((t) => t.id === terminalId)?.name ?? city?.name ?? ''
}

export interface TripCardProps {
  trip: Trip
  className?: string
}

export function TripCard({ trip, className }: TripCardProps) {
  const { t } = useTranslation()
  const operator = operatorById(trip.operatorId)
  const fromCity = cityById(trip.fromCityId)
  const toCity = cityById(trip.toCityId)
  const operatorName = operator?.name ?? t('results.operatorFallback')

  const departure = formatTime(trip.departsAt)
  const arrival = formatTime(trip.arrivesAt)
  const fromTerminal = terminalName(trip.fromCityId, trip.fromTerminalId)
  const toTerminal = terminalName(trip.toCityId, trip.toTerminalId)

  // "Çarşamba 01:30" is read as Wednesday night by most travellers, who then
  // arrive a day late; the card names the night instead. Turkish takes the
  // inflected form from `nightOfLabel`, other languages the two weekday names.
  const night = isNightDeparture(trip.departsAt)
    ? t('results.nightOf', {
        night: nightOfLabel(trip.departsAt),
        eve: formatWeekdayShort(new Date(Date.parse(trip.departsAt) - 86_400_000)),
        morning: formatWeekdayShort(trip.departsAt),
      })
    : null

  const freeCancel = trip.amenities.includes('free-cancel')
  const iconAmenities = trip.amenities.filter(isIconAmenity)
  const shownAmenities = iconAmenities.slice(0, MAX_AMENITY_ICONS)
  const hiddenAmenityCount = iconAmenities.length - shownAmenities.length
  const amenityLabels = iconAmenities.map((id) => amenityById(id)?.label ?? id)
  const scarce = trip.seatsLeft <= 5

  return (
    <article className={cn(CARD_BOX, CARD_LIFT, className)} style={CARD_BOX_STYLE}>
      {/* No hairline and no shadow of its own: the box above carries both. */}
      <Card className="flex w-full flex-col overflow-hidden border-0 shadow-none">
        <div className={GRID}>
          {/* 1 — carrier, and on a phone the fare beside it */}
          <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-2.5">
            <OperatorLogo operatorId={trip.operatorId} variant="plate" className={LOGO_PLATE} />
            {/* On a phone the plate's wordmark is the name, legible at last, so
                the text is left to screen readers there; the column on a
                desktop card has room for both. A monogram is not a name, so
                without a logo file the text always shows. */}
            <div className="min-w-0 flex-1 lg:flex-none">
              <h3
                className={cn(
                  'truncate font-display text-sm font-semibold text-fg',
                  operator?.logo && 'max-lg:sr-only',
                )}
              >
                {operatorName}
              </h3>
            </div>

            {/* The price sits here on a phone, in the space the operator's name
                leaves empty, and in the fare column from lg. Two elements, one
                displayed at a time — `hidden` is display:none, so only one ever
                reaches the accessibility tree. */}
            <p
              className="shrink-0 font-display text-xl font-semibold text-fg lg:hidden"
              data-numeric
            >
              {formatPrice(trip.price)}
            </p>
          </div>

          {/* 2 — journey */}
          <div className="min-w-0">
            <div className="flex items-start gap-2 sm:gap-4">
              <div className="min-w-14 flex-1">
                <p className="flex items-center gap-1 font-display text-xl font-semibold text-fg">
                  {night ? (
                    <Moon className="size-4 shrink-0 text-info-fg" aria-hidden="true" />
                  ) : null}
                  <span data-numeric>{departure}</span>
                </p>
                <p className="mt-0.5 truncate text-sm text-fg-muted">{fromTerminal}</p>
              </div>

              <div className="w-16 shrink-0 pt-0.5 sm:w-24">
                <p className="mb-1 text-center text-xs font-medium text-fg-muted" data-numeric>
                  {formatDuration(trip.durationMin)}
                </p>
                {/* The rule needs `border-strong`, not `border`: the hairline
                    divider token is 1.42:1 and disappears at 1px, which left
                    the journey reading as two unrelated times. */}
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="size-2 shrink-0 rounded-full ring-2 ring-border-strong ring-inset" />
                  <span className="h-px flex-1 bg-border-strong" />
                  <Bus className="size-4 shrink-0 text-fg-muted" />
                  <span className="h-px flex-1 bg-border-strong" />
                  <span className="size-2 shrink-0 rounded-full bg-border-strong" />
                </div>
              </div>

              <div className="min-w-14 flex-1 text-end">
                <p className="font-display text-xl font-semibold text-fg">
                  <span data-numeric>{arrival}</span>
                  {trip.overnight ? (
                    <sup className="ms-0.5 text-2xs font-bold text-warning-fg">
                      +1
                      <VisuallyHidden> {t('results.nextDay')}</VisuallyHidden>
                    </sup>
                  ) : null}
                </p>
                <p className="mt-0.5 truncate text-sm text-fg-muted">{toTerminal}</p>
              </div>
            </div>

            {night ? <p className="mt-1.5 text-xs text-fg-secondary">{night}</p> : null}

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:mt-3">
              {/* The layout is a fact about the coach, not a status: text, not
                  a badge. */}
              <span className="inline-flex items-center gap-1 text-xs font-medium text-fg-secondary">
                <Armchair className="size-3.5" aria-hidden="true" />
                {trip.seatLayout}
                <VisuallyHidden> {t('results.seatLayout')}</VisuallyHidden>
              </span>

              {freeCancel ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-success-fg">
                  <CircleCheck className="size-3.5" aria-hidden="true" />
                  {t('results.freeCancel')}
                </span>
              ) : null}

              {iconAmenities.length > 0 ? (
                <AmenityList
                  ids={iconAmenities}
                  shown={shownAmenities}
                  hiddenCount={hiddenAmenityCount}
                  label={t('results.amenitiesList', { list: amenityLabels.join(', ') })}
                  title={t('results.group.amenities')}
                />
              ) : null}
            </div>
          </div>

          {/* 3 — fare and action */}
          <div
            className={cn(
              // No rule between the journey and the fare: the price is set
              // large enough to be its own column.
              'flex items-center justify-between gap-3',
              'lg:flex-col lg:items-end lg:justify-center lg:gap-3 lg:pt-0',
            )}
          >
            <div className="lg:text-end">
              <p
                className="hidden font-display text-2xl font-semibold text-fg lg:block"
                data-numeric
              >
                {formatPrice(trip.price)}
              </p>
              {scarce ? (
                <p className="flex items-center gap-1 text-xs font-medium text-warning-fg lg:mt-1 lg:justify-end">
                  <Armchair className="size-3.5 shrink-0" aria-hidden="true" />
                  <span data-numeric>{t('results.seatsLeft', { count: trip.seatsLeft })}</span>
                </p>
              ) : null}
            </div>

            <Button asChild variant="primary" size="md" className="shrink-0">
              <Link to={seatPath(trip.id)}>
                {t('results.select')}
                <VisuallyHidden>
                  {` — ${departure} ${fromCity?.name ?? ''} ${toCity?.name ?? ''} seferi, ${formatPrice(trip.price)}`}
                  {night ? `, ${night}` : ''}
                </VisuallyHidden>
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </article>
  )
}

/**
 * The amenity icons, as one button that lists them by name.
 *
 * A tooltip per icon only ever opened on hover or keyboard focus, so on a
 * phone the icons were unexplained. Tapping the row now opens the whole list
 * with labels, and the button's own name reads every amenity out at once.
 */
function AmenityList({
  ids,
  shown,
  hiddenCount,
  label,
  title,
}: {
  ids: readonly IconAmenity[]
  shown: readonly IconAmenity[]
  hiddenCount: number
  label: string
  title: string
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'group -mx-1.5 inline-flex h-8 items-center gap-1.5 rounded-lg px-1.5 text-fg-muted',
            'transition-colors duration-(--duration-fast) hover:bg-hover hover:text-fg',
            'data-[state=open]:bg-hover data-[state=open]:text-fg',
          )}
        >
          {shown.map((id) => {
            const Icon = AMENITY_ICONS[id]
            return <Icon key={id} className="size-4 shrink-0" aria-hidden="true" />
          })}
          {hiddenCount > 0 ? (
            <span className="text-xs font-medium" aria-hidden="true" data-numeric>
              +{hiddenCount}
            </span>
          ) : null}
          <ChevronDown
            className="size-3.5 shrink-0 transition-transform duration-(--duration-fast) group-data-[state=open]:rotate-180"
            aria-hidden="true"
          />
          <VisuallyHidden>{label}</VisuallyHidden>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-3">
        <p className="mb-2 text-xs font-semibold text-fg-muted">{title}</p>
        <ul className="space-y-2">
          {ids.map((id) => {
            const Icon = AMENITY_ICONS[id]
            return (
              <li key={id} className="flex items-center gap-2 text-sm text-fg">
                <Icon className="size-4 shrink-0 text-fg-muted" aria-hidden="true" />
                {amenityById(id)?.label ?? id}
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

export function TripCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(CARD_BOX, className)} style={CARD_BOX_STYLE} aria-hidden="true">
      <Card className="flex w-full flex-col overflow-hidden border-0 shadow-none">
        <div className={GRID}>
          <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-2.5">
            <Skeleton className={cn('h-10 w-28 shrink-0 rounded-lg', LOGO_PLATE)} />
            <div className="flex-1 lg:w-full lg:flex-none">
              <Skeleton className="hidden h-4 w-28 lg:block" />
            </div>
            {/* Stands in for the fare that sits here below lg. */}
            <Skeleton className="h-6 w-20 shrink-0 lg:hidden" />
          </div>

          <div className="min-w-0">
            <div className="flex items-start gap-2 sm:gap-4">
              <div className="min-w-14 flex-1 space-y-1.5">
                <Skeleton className="h-6 w-14" />
                <Skeleton className="h-4 w-full max-w-28" />
              </div>
              <div className="w-16 shrink-0 space-y-1.5 pt-0.5 sm:w-24">
                <Skeleton className="mx-auto h-3 w-12" />
                <Skeleton className="h-px w-full" />
              </div>
              <div className="min-w-14 flex-1 space-y-1.5">
                <Skeleton className="ms-auto h-6 w-14" />
                <Skeleton className="ms-auto h-4 w-full max-w-28" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-5 rounded" />
              <Skeleton className="size-5 rounded" />
              <Skeleton className="size-5 rounded" />
            </div>
          </div>

          <div
            className={cn(
              'flex items-end justify-between gap-3 pt-1',
              'lg:flex-col lg:items-end lg:justify-center lg:gap-3 lg:pt-0',
            )}
          >
            <Skeleton className="h-8 w-24 lg:ms-auto" />
            <Skeleton className="h-11 w-28 rounded-lg" />
          </div>
        </div>
      </Card>
    </div>
  )
}
