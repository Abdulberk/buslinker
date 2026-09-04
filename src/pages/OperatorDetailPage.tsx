import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router'
import {
  ArrowRight,
  ArrowUpRight,
  Armchair,
  BedDouble,
  Bus,
  Coffee,
  Snowflake,
  Sparkles,
  Star,
} from 'lucide-react'
import type { ComponentType, ReactNode, SVGProps } from 'react'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardBody } from '@/shared/ui/card'
import { OperatorLogo } from '@/shared/ui/operator-logo'
import { AssetIcon } from '@/shared/ui/asset-icon'
import { ICON } from '@/shared/config/assets'
import {
  AMENITIES,
  POPULAR_ROUTES,
  cityBySlug,
  operatorById,
  type AmenityId,
  type City,
  type Operator,
} from '@/shared/api/catalog'
import { searchTrips, type Trip } from '@/shared/api/mock-server'
import { resultsPath, serializeSearchState } from '@/shared/lib/search-params'
import {
  formatDateLong,
  formatDuration,
  formatPrice,
  formatTime,
  fromISODate,
  toISODate,
} from '@/shared/lib/tr'

/** Every figure on this page is quoted for tomorrow, the first bookable day. */
function tomorrowISO(): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return toISODate(date)
}

/** How many popular corridors are sampled for the "Popüler seferleri" list. */
const SAMPLED_ROUTES = 6

const ratingFmt = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

/**
 * A short editorial line per carrier. Deliberately about how the carrier shows
 * up in these listings rather than about its real fleet, which this demo has
 * no data for.
 */
const DESCRIPTIONS: Record<string, string> = {
  metro:
    'Metro Turizm, ülke genelindeki şehirler arası hatlarıyla bilinen firmalardan biridir. Aramalarınızda çoğunlukla sabahın erken saatlerinden gece yarısına uzanan geniş bir kalkış aralığıyla listelenir, bu da planınızı saate göre kurmanızı kolaylaştırır.',
  pamukkale:
    'Pamukkale Turizm, Ege ile İç Anadolu arasındaki bağlantılarda sık karşılaşacağınız firmalardandır. Fiyat aralığı listelerin orta bandında seyrettiği için konfor ile bütçe arasında denge arayan yolcular için makul bir seçenektir.',
  ulusoy:
    'Ulusoy, Türkiye’nin köklü otobüs markaları arasında yer alır ve BusLinker’da premium kategoride listelenir. Bu kategorideki seferler geniş koltuk düzeniyle planlandığı için uzun mesafede dinlenmeye daha çok yer bırakır.',
  varan:
    'Varan Turizm, kataloğumuzdaki en yüksek yolcu puanına sahip firmadır. Seferleri premium kategoride listelenir; ücretler ortalamanın üzerinde seyreder, buna karşılık yolculuk konforu listedeki en yüksek beklentiyi karşılar.',
  nilufer:
    'Nilüfer Turizm, Marmara çıkışlı hatlarda sık görünen firmalardandır. Kısa ve orta mesafede gün içine yayılmış kalkış saatleri sunduğu için son dakika planlarında elinizi rahatlatır.',
  'efe-tur':
    'Efe Tur, Ege bağlantılarında akla gelen firmalardan biridir. Listelerde genellikle daha uygun ücretlerle yer alır; bu nedenle bütçesini önceleyen yolcular için iyi bir başlangıç noktasıdır.',
}

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>
type AmenityArt = { asset: string; Icon?: never } | { asset?: never; Icon: IconComponent }

/** Same split as the results card: house artwork where it exists, lucide otherwise. */
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
  if (art.asset !== undefined) return <AssetIcon src={art.asset} className="size-5" />
  const Icon = art.Icon
  return <Icon className="size-5 shrink-0" aria-hidden="true" />
}

interface RouteOffer {
  readonly from: City
  readonly to: City
  readonly trip: Trip
}

interface AmenityRow {
  readonly id: AmenityId
  readonly label: string
  readonly frequent: boolean
}

interface OperatorSnapshot {
  readonly offers: readonly RouteOffer[]
  readonly amenities: readonly AmenityRow[]
  readonly layouts: readonly string[]
  readonly cheapest: number | null
}

function buildSnapshot(operatorId: string, date: string): OperatorSnapshot {
  const offers: RouteOffer[] = []
  const trips: Trip[] = []

  for (const { from, to } of POPULAR_ROUTES.slice(0, SAMPLED_ROUTES)) {
    const origin = cityBySlug(from)
    const destination = cityBySlug(to)
    if (!origin || !destination) continue

    const result = searchTrips({
      from: origin.id,
      to: destination.id,
      date,
      filters: { operators: [operatorId] },
      sort: 'price_asc',
    })

    trips.push(...result.trips)
    const cheapest = result.trips[0]
    // A corridor the carrier does not serve tomorrow is left out entirely
    // rather than rendered as an empty row.
    if (cheapest) offers.push({ from: origin, to: destination, trip: cheapest })
  }

  const amenities: AmenityRow[] =
    trips.length === 0
      ? []
      : AMENITIES.flatMap((amenity) => {
          const share = trips.filter((t) => t.amenities.includes(amenity.id)).length / trips.length
          if (share === 0) return []
          return [{ id: amenity.id, label: amenity.label, frequent: share >= 0.5 }]
        })

  const prices = trips.map((t) => t.price)

  return {
    offers,
    amenities,
    layouts: (['2+1', '2+2'] as const).filter((layout) =>
      trips.some((t) => t.seatLayout === layout),
    ),
    cheapest: prices.length > 0 ? Math.min(...prices) : null,
  }
}

export default function OperatorDetailPage() {
  const { operatorId } = useParams<{ operatorId: string }>()
  const operator = operatorId ? operatorById(operatorId) : undefined

  useEffect(() => {
    document.title = operator ? `${operator.name} | BusLinker` : 'Firma bulunamadı | BusLinker'
  }, [operator])

  if (!operator) return <OperatorNotFound />

  return <OperatorDetail operator={operator} />
}

function OperatorDetail({ operator }: { operator: Operator }) {
  const date = useMemo(() => tomorrowISO(), [])
  const snapshot = useMemo(() => buildSnapshot(operator.id, date), [operator.id, date])

  const searchParams = useMemo(
    () => serializeSearchState({ sort: 'price_asc', filters: { operators: [operator.id] } }),
    [operator.id],
  )

  const description =
    DESCRIPTIONS[operator.id] ??
    `${operator.name}, BusLinker listelerinde yer alan otobüs firmalarından biridir. Güncel sefer ve ücret bilgisi için güzergâhınızı aratabilirsiniz.`

  return (
    <>
      <PageHeader
        title={operator.name}
        lead={`${operator.name} seferlerinin koltuk düzenini, sunduğu hizmetleri ve popüler hatlardaki güncel ücretlerini inceleyin.`}
        breadcrumbs={[
          { label: 'Ana sayfa', to: '/' },
          { label: 'Otobüs Firmaları', to: '/otobus-firmalari' },
        ]}
      />

      <div className="app-container section-y">
        <section aria-labelledby="firma-hakkinda">
          <h2 id="firma-hakkinda" className="text-xl sm:text-2xl">
            Firma hakkında
          </h2>

          <Card className="mt-4">
            <CardBody className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
              <OperatorLogo operatorId={operator.id} className="size-20 shrink-0" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-sm text-fg-secondary">
                    <Star className="size-4 text-warning" fill="currentColor" aria-hidden="true" />
                    <span data-numeric>{ratingFmt.format(operator.rating)}</span>
                    <span className="sr-only">puan, 10 üzerinden</span>
                  </span>
                  {operator.premium ? (
                    <Badge tone="brand" size="md">
                      <Sparkles aria-hidden="true" />
                      Premium
                    </Badge>
                  ) : null}
                  {snapshot.layouts.map((layout) => (
                    <Badge key={layout} tone="outline" size="md">
                      <Armchair aria-hidden="true" />
                      {layout}
                      <span className="sr-only"> koltuk düzeni</span>
                    </Badge>
                  ))}
                </div>

                <p className="mt-3 max-w-prose text-base text-fg-secondary">{description}</p>

                {snapshot.cheapest !== null ? (
                  <p className="mt-4 text-sm text-fg-muted">
                    Popüler hatlarda yarının en uygun ücreti{' '}
                    <span className="font-medium text-fg" data-numeric>
                      {formatPrice(snapshot.cheapest)}
                    </span>
                    .
                  </p>
                ) : null}
              </div>
            </CardBody>
          </Card>
        </section>

        <section className="mt-12 sm:mt-16" aria-labelledby="one-cikan-ozellikler">
          <h2 id="one-cikan-ozellikler" className="text-xl sm:text-2xl">
            Öne çıkan özellikler
          </h2>
          <p className="mt-2 max-w-prose text-base text-fg-secondary">
            Seferlerde sunulan hizmetler araca göre değişir. Aşağıdaki liste{' '}
            {formatDateLong(fromISODate(date))} tarihli popüler hat aramalarında görülen özellikleri
            gösterir.
          </p>

          {snapshot.amenities.length > 0 ? (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {snapshot.amenities.map((amenity) => (
                <li
                  key={amenity.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4"
                >
                  <span className="text-brand-fg">{amenityArt(AMENITY_ICONS[amenity.id])}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-fg">{amenity.label}</span>
                    <span className="block text-xs text-fg-muted">
                      {amenity.frequent ? 'Çoğu seferde' : 'Bazı seferlerde'}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 rounded-lg border border-dashed border-border bg-surface-sunken p-5 text-sm text-fg-secondary">
              Yarın için bu firmaya ait sefer listelenmediğinden özellik bilgisi gösterilemiyor.
              Farklı bir tarih için arama yapabilirsiniz.
            </p>
          )}
        </section>

        <section className="mt-12 sm:mt-16" aria-labelledby="populer-seferleri">
          <h2 id="populer-seferleri" className="text-xl sm:text-2xl">
            Popüler seferleri
          </h2>
          <p className="mt-2 max-w-prose text-base text-fg-secondary">
            {formatDateLong(fromISODate(date))} tarihinde {operator.name} ile gidebileceğiniz
            hatların en uygun ücretleri.
          </p>

          {snapshot.offers.length > 0 ? (
            <ul className="mt-5 flex flex-col gap-3">
              {snapshot.offers.map(({ from, to, trip }) => (
                <li key={trip.id}>
                  <Link
                    to={resultsPath(from.slug, to.slug, date, searchParams)}
                    aria-label={`${from.name} ${to.name} arası ${operator.name} seferlerini görüntüleyin`}
                    className="group flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl border border-border bg-surface p-4 transition-[border-color,box-shadow] duration-(--duration-base) ease-standard hover:border-brand/40 hover:shadow-md sm:p-5"
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 font-display text-base font-semibold text-fg">
                        <span className="truncate">{from.name}</span>
                        <ArrowRight
                          className="size-4 shrink-0 text-fg-subtle transition-colors duration-(--duration-fast) group-hover:text-brand-fg"
                          aria-hidden="true"
                        />
                        <span className="truncate">{to.name}</span>
                      </span>
                      <span className="mt-1 block text-sm text-fg-muted">
                        <span data-numeric>{formatTime(trip.departsAt)}</span> kalkış ·{' '}
                        <span data-numeric>{formatDuration(trip.durationMin)}</span> ·{' '}
                        {trip.seatLayout} düzen
                      </span>
                    </span>

                    <span className="flex items-baseline gap-3">
                      <span className="font-display text-lg font-semibold text-fg" data-numeric>
                        {formatPrice(trip.price)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-fg">
                        Seferler
                        <ArrowUpRight
                          className="size-4 transition-transform duration-(--duration-fast) ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          aria-hidden="true"
                        />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 flex flex-col items-start gap-4 rounded-xl border border-dashed border-border bg-surface-sunken p-6">
              <span className="grid size-12 place-items-center rounded-full bg-surface text-fg-muted">
                <Bus className="size-6" aria-hidden="true" />
              </span>
              <p className="max-w-prose text-sm text-fg-secondary">
                {operator.name} için yarın popüler hatlarda sefer listelenmedi. Gitmek istediğiniz
                güzergâhı ve tarihi girerek arama yapabilirsiniz.
              </p>
              <Button asChild variant="primary" size="md">
                <Link to="/">Sefer arayın</Link>
              </Button>
            </div>
          )}
        </section>
      </div>
    </>
  )
}

function OperatorNotFound() {
  return (
    <div className="app-container section-y">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-5 text-center" role="alert">
        <span className="grid size-14 place-items-center rounded-full bg-surface-sunken text-fg-muted">
          <Bus className="size-7" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-balance-tr text-fg">
            Firma bulunamadı
          </h1>
          <p className="text-sm text-balance-tr text-fg-secondary">
            Aradığınız otobüs firması kataloğumuzda yer almıyor. Bağlantı eski ya da hatalı yazılmış
            olabilir.
          </p>
        </div>
        <Button asChild variant="primary" size="lg">
          <Link to="/otobus-firmalari">Firmaları görüntüleyin</Link>
        </Button>
      </div>
    </div>
  )
}
