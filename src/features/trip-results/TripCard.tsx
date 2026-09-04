import { Link } from 'react-router'
import { Armchair, BedDouble, Bus, Coffee, Snowflake, Sparkles, Star } from 'lucide-react'
import type { CSSProperties, ComponentType, ReactNode, SVGProps } from 'react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { VisuallyHidden } from '@/shared/ui/visually-hidden'
import { IconWithLabel } from '@/shared/ui/primitives'
import { AssetIcon } from '@/shared/ui/asset-icon'
import { OperatorLogo } from '@/shared/ui/operator-logo'
import { ICON } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'
import { formatDuration, formatPrice, formatTime } from '@/shared/lib/tr'
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
  '[--card-min-h:18.25rem] lg:[--card-min-h:11rem]',
  'flex min-h-[var(--card-min-h)]',
)

const CARD_BOX_STYLE: CSSProperties = {
  contentVisibility: 'auto',
  containIntrinsicSize: '0 var(--card-min-h)',
}

const GRID = cn(
  'grid flex-1 gap-4 p-4 sm:p-5',
  // `items-stretch` is what lets the fare column's leading rule run the full
  // height of the row instead of stopping at its own content.
  'lg:grid-cols-[9.5rem_minmax(0,1fr)_11rem] lg:items-stretch lg:gap-6',
)

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

/**
 * Amenity art, per amenity.
 *
 * The project ships its own 25x24 line icons for five of the eight amenities;
 * those go through `AssetIcon` so they keep the house drawing while still
 * inheriting `text-fg-secondary` from the chip. The remaining three have no
 * artwork of our own, so they stay on lucide rather than being mapped to a
 * near-miss icon that would tell the user the wrong thing.
 */
type AmenityArt = { asset: string; Icon?: never } | { asset?: never; Icon: IconComponent }

const AMENITY_ICONS: Record<AmenityId, AmenityArt> = {
  wifi: { asset: ICON.wireless },
  usb: { asset: ICON.charge },
  tv: { asset: ICON.tv },
  refreshment: { Icon: Coffee },
  ac: { Icon: Snowflake },
  blanket: { Icon: BedDouble },
  hygiene: { asset: ICON.hygiene },
  'free-cancel': { asset: ICON.cancel },
}

function amenityArt(art: AmenityArt): ReactNode {
  if (art.asset !== undefined) return <AssetIcon src={art.asset} className="size-4" />
  const Icon = art.Icon
  return <Icon className="size-4" aria-hidden="true" />
}

const MAX_AMENITY_ICONS = 4

/** Ratings are the one decimal number on this page with no formatter of its own. */
const ratingFmt = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

function terminalName(cityId: string, terminalId: string): string {
  const city = cityById(cityId)
  return city?.terminals.find((t) => t.id === terminalId)?.name ?? city?.name ?? ''
}

export interface TripCardProps {
  trip: Trip
  className?: string
}

export function TripCard({ trip, className }: TripCardProps) {
  const operator = operatorById(trip.operatorId)
  const fromCity = cityById(trip.fromCityId)
  const toCity = cityById(trip.toCityId)
  const operatorName = operator?.name ?? 'Otobüs firması'

  const departure = formatTime(trip.departsAt)
  const arrival = formatTime(trip.arrivesAt)
  const fromTerminal = terminalName(trip.fromCityId, trip.fromTerminalId)
  const toTerminal = terminalName(trip.toCityId, trip.toTerminalId)

  const shownAmenities = trip.amenities.slice(0, MAX_AMENITY_ICONS)
  const hiddenAmenityCount = trip.amenities.length - shownAmenities.length
  const scarce = trip.seatsLeft <= 5

  return (
    <article className={cn(CARD_BOX, className)} style={CARD_BOX_STYLE}>
      <Card
        className={cn(
          'flex w-full flex-col overflow-hidden',
          'transition-[border-color,box-shadow] duration-(--duration-base) ease-standard',
          'hover:border-brand/30 hover:shadow-md',
          'has-[a:focus-visible]:border-brand/30 has-[a:focus-visible]:shadow-md',
        )}
      >
        <div className={GRID}>
          {/* 1 — carrier */}
          <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-2.5">
            <OperatorLogo operatorId={trip.operatorId} className="size-16 lg:size-20" />
            <div className="min-w-0 flex-1 lg:flex-none">
              <h3 className="truncate font-display text-sm font-semibold text-fg">
                {operatorName}
              </h3>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-fg-muted">
                <Star className="size-3.5 text-warning" fill="currentColor" aria-hidden="true" />
                <span data-numeric>{ratingFmt.format(trip.rating)}</span>
                <span className="sr-only">puan, 10 üzerinden</span>
              </p>
            </div>
            {trip.premium ? (
              <Badge tone="brand" size="sm" className="shrink-0">
                <Sparkles aria-hidden="true" />
                Premium
              </Badge>
            ) : null}
          </div>

          {/* 2 — journey */}
          <div className="min-w-0">
            <div className="flex items-start gap-2 sm:gap-4">
              <div className="min-w-14 flex-1">
                <p className="font-display text-xl font-semibold text-fg" data-numeric>
                  {departure}
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
                      <VisuallyHidden> ertesi gün varış</VisuallyHidden>
                    </sup>
                  ) : null}
                </p>
                <p className="mt-0.5 truncate text-sm text-fg-muted">{toTerminal}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone="outline" size="sm">
                <Armchair aria-hidden="true" />
                {trip.seatLayout}
                <VisuallyHidden> koltuk düzeni</VisuallyHidden>
              </Badge>
              {shownAmenities.map((id) => {
                const amenity = amenityById(id)
                if (!amenity) return null
                return (
                  <IconWithLabel
                    key={id}
                    label={amenity.label}
                    icon={amenityArt(AMENITY_ICONS[id])}
                  />
                )
              })}
              {hiddenAmenityCount > 0 ? (
                <span className="text-xs font-medium text-fg-muted" data-numeric>
                  +{hiddenAmenityCount}
                  <VisuallyHidden> özellik daha</VisuallyHidden>
                </span>
              ) : null}
            </div>
          </div>

          {/* 3 — fare and action */}
          <div
            className={cn(
              'flex items-end justify-between gap-3 border-t border-border pt-4',
              'lg:flex-col lg:items-stretch lg:justify-center lg:gap-3',
              'lg:border-s lg:border-t-0 lg:ps-6 lg:pt-0',
            )}
          >
            <div className="lg:text-end">
              <p className="font-display text-2xl font-semibold text-fg" data-numeric>
                {formatPrice(trip.price)}
              </p>
              {scarce ? (
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-warning-fg lg:justify-end">
                  <Armchair className="size-3.5 shrink-0" aria-hidden="true" />
                  <span data-numeric>Son {trip.seatsLeft} koltuk</span>
                </p>
              ) : null}
            </div>

            <Button asChild variant="brand-outline" size="md" className="shrink-0 lg:w-full">
              <Link to={seatPath(trip.id)}>
                Seç
                <VisuallyHidden>
                  {` — ${departure} ${fromCity?.name ?? ''} ${toCity?.name ?? ''} seferi, ${formatPrice(trip.price)}`}
                </VisuallyHidden>
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </article>
  )
}

export function TripCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(CARD_BOX, className)} style={CARD_BOX_STYLE} aria-hidden="true">
      <Card className="flex w-full flex-col overflow-hidden">
        <div className={GRID}>
          <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-2.5">
            <Skeleton className="size-11 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-1.5 lg:w-full lg:flex-none">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-12" />
            </div>
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
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="size-8 rounded-lg" />
              <Skeleton className="size-8 rounded-lg" />
              <Skeleton className="size-8 rounded-lg" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
          </div>

          <div
            className={cn(
              'flex items-end justify-between gap-3 border-t border-border pt-4',
              'lg:flex-col lg:items-stretch lg:justify-center lg:gap-3',
              'lg:border-s lg:border-t-0 lg:ps-6 lg:pt-0',
            )}
          >
            <Skeleton className="h-8 w-24 lg:ms-auto" />
            <Skeleton className="h-11 w-24 rounded-lg lg:w-full" />
          </div>
        </div>
      </Card>
    </div>
  )
}
