import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Armchair,
  ArrowRight,
  BedDouble,
  Bus,
  Coffee,
  Snowflake,
  Sparkles,
  Star,
} from 'lucide-react'
import type { ComponentType, ReactNode, SVGProps } from 'react'
import { PageHeader, Prose } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardBody } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { OperatorLogo } from '@/shared/ui/operator-logo'
import { AssetIcon } from '@/shared/ui/asset-icon'
import { VisuallyHidden } from '@/shared/ui/visually-hidden'
import { ICON } from '@/shared/config/assets'
import {
  amenityById,
  cityById,
  operatorById,
  type AmenityId,
  type City,
} from '@/shared/api/catalog'
import { searchTrips, type Trip } from '@/shared/api/mock-server'
import { seatMapQuery, tripQuery } from '@/shared/api/queries'
import { getDeck } from '@/entities/deck/layouts'
import type { SeatMap } from '@/entities/seat/model'
import { resultsPath, seatPath, tripPath } from '@/shared/lib/search-params'
import {
  formatDateLong,
  formatDuration,
  formatPrice,
  formatTime,
  pluralTr,
  toISODate,
} from '@/shared/lib/tr'

/** How many alternatives are offered at the foot of the page. */
const SIMILAR_COUNT = 3

const ratingFmt = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

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

function terminalName(city: City | undefined, terminalId: string): string {
  return city?.terminals.find((t) => t.id === terminalId)?.name ?? city?.name ?? ''
}

export default function TripDetailPage() {
  const { tripId = '' } = useParams<{ tripId: string }>()
  const enabled = tripId !== ''

  const tripResult = useQuery({ ...tripQuery(tripId), enabled })
  const seatMapResult = useQuery({ ...seatMapQuery(tripId), enabled })

  const trip = tripResult.data
  const fromCity = trip ? cityById(trip.fromCityId) : undefined
  const toCity = trip ? cityById(trip.toCityId) : undefined
  const routeLabel = fromCity && toCity ? `${fromCity.name} - ${toCity.name}` : ''

  useEffect(() => {
    document.title = routeLabel ? `${routeLabel} Seferi | BusLinker` : 'Sefer | BusLinker'
  }, [routeLabel])

  if (!enabled || tripResult.isError) return <TripNotFound />
  if (!trip || !fromCity || !toCity) return <TripDetailLoading />

  return (
    <TripDetail
      trip={trip}
      from={fromCity}
      to={toCity}
      seatMap={seatMapResult.data}
      seatMapFailed={seatMapResult.isError}
    />
  )
}

function TripDetail({
  trip,
  from,
  to,
  seatMap,
  seatMapFailed,
}: {
  trip: Trip
  from: City
  to: City
  seatMap: SeatMap | undefined
  seatMapFailed: boolean
}) {
  const operator = operatorById(trip.operatorId)
  const operatorName = operator?.name ?? 'Otobüs firması'
  const date = toISODate(new Date(trip.departsAt))
  const freeCancel = trip.amenities.includes('free-cancel')

  const similar = useMemo(
    () =>
      searchTrips({ from: from.id, to: to.id, date, sort: 'price_asc' })
        .trips.filter((candidate) => candidate.id !== trip.id)
        .slice(0, SIMILAR_COUNT),
    [from.id, to.id, date, trip.id],
  )

  return (
    <>
      <PageHeader
        title={`${from.name} - ${to.name} Seferi`}
        lead={`${operatorName} · ${formatDateLong(trip.departsAt)} · ${formatTime(trip.departsAt)} kalkışlı seferin saatleri, araç özellikleri ve koltuk düzeni.`}
        breadcrumbs={[
          { label: 'Ana sayfa', to: '/' },
          {
            label: `${from.name} - ${to.name} seferleri`,
            to: resultsPath(from.slug, to.slug, date),
          },
        ]}
      />

      <div className="app-container section-y">
        <Card>
          <CardBody className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-4">
              <OperatorLogo operatorId={trip.operatorId} className="size-16 shrink-0" />
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg font-semibold text-fg">{operatorName}</h2>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fg-muted">
                  <span className="inline-flex items-center gap-1">
                    <Star className="size-4 text-warning" fill="currentColor" aria-hidden="true" />
                    <span data-numeric>{ratingFmt.format(trip.rating)}</span>
                    <span className="sr-only">puan, 10 üzerinden</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDateLong(trip.departsAt)}</span>
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Badge tone="outline" size="md">
                  <Armchair aria-hidden="true" />
                  {trip.seatLayout}
                  <VisuallyHidden> koltuk düzeni</VisuallyHidden>
                </Badge>
                {trip.premium ? (
                  <Badge tone="brand" size="md">
                    <Sparkles aria-hidden="true" />
                    Premium
                  </Badge>
                ) : null}
                {trip.overnight ? (
                  <Badge tone="warning" size="md">
                    <BedDouble aria-hidden="true" />
                    Gece yolculuğu
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="flex items-start gap-3 border-t border-border pt-6 sm:gap-6">
              <div className="min-w-16 flex-1">
                <p className="font-display text-2xl font-semibold text-fg" data-numeric>
                  {formatTime(trip.departsAt)}
                </p>
                <p className="mt-1 text-sm text-fg-secondary">{from.name}</p>
                <p className="text-sm text-fg-muted">{terminalName(from, trip.fromTerminalId)}</p>
              </div>

              <div className="w-20 shrink-0 pt-1 sm:w-32">
                <p className="mb-1 text-center text-xs font-medium text-fg-muted" data-numeric>
                  {formatDuration(trip.durationMin)}
                </p>
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="size-2 shrink-0 rounded-full ring-2 ring-border-strong ring-inset" />
                  <span className="h-px flex-1 bg-border-strong" />
                  <Bus className="size-4 shrink-0 text-fg-muted" />
                  <span className="h-px flex-1 bg-border-strong" />
                  <span className="size-2 shrink-0 rounded-full bg-border-strong" />
                </div>
              </div>

              <div className="min-w-16 flex-1 text-end">
                <p className="font-display text-2xl font-semibold text-fg">
                  <span data-numeric>{formatTime(trip.arrivesAt)}</span>
                  {trip.overnight ? (
                    <sup className="ms-0.5 text-2xs font-bold text-warning-fg">
                      +1
                      <VisuallyHidden> ertesi gün varış</VisuallyHidden>
                    </sup>
                  ) : null}
                </p>
                <p className="mt-1 text-sm text-fg-secondary">{to.name}</p>
                <p className="text-sm text-fg-muted">{terminalName(to, trip.toTerminalId)}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
              <div>
                <p className="text-xs text-fg-muted">Kişi başı ücret</p>
                <p className="font-display text-3xl font-semibold text-fg" data-numeric>
                  {formatPrice(trip.price)}
                </p>
                {trip.seatsLeft <= 5 ? (
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-warning-fg">
                    <Armchair className="size-3.5 shrink-0" aria-hidden="true" />
                    <span data-numeric>Son {trip.seatsLeft} koltuk</span>
                  </p>
                ) : null}
              </div>

              <Button asChild variant="primary" size="lg">
                <Link to={seatPath(trip.id)}>
                  Koltuk Seç
                  <ArrowRight className="size-5" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </CardBody>
        </Card>

        <section className="mt-12 sm:mt-16" aria-labelledby="arac-ozellikleri">
          <h2 id="arac-ozellikleri" className="text-xl sm:text-2xl">
            Araç özellikleri
          </h2>
          <p className="mt-2 max-w-prose text-base text-fg-secondary">
            Bu seferde sunulan hizmetler. Özellikler araca göre değişebildiği için kalkıştan önce
            firmadan teyit almanızı öneririz.
          </p>

          {trip.amenities.length > 0 ? (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {trip.amenities.map((id) => {
                const amenity = amenityById(id)
                if (!amenity) return null
                return (
                  <li
                    key={id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4"
                  >
                    <span className="text-brand-fg">{amenityArt(AMENITY_ICONS[id])}</span>
                    <span className="text-sm font-medium text-fg">{amenity.label}</span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="mt-5 rounded-lg border border-dashed border-border bg-surface-sunken p-5 text-sm text-fg-secondary">
              Bu sefer için ek hizmet bilgisi paylaşılmamış. Aracın donanımını firmadan öğrenmeniz
              gerekebilir.
            </p>
          )}
        </section>

        <section className="mt-12 sm:mt-16" aria-labelledby="koltuk-duzeni">
          <h2 id="koltuk-duzeni" className="text-xl sm:text-2xl">
            Koltuk düzeni
          </h2>
          <SeatSummary trip={trip} seatMap={seatMap} failed={seatMapFailed} />
        </section>

        <section className="mt-12 sm:mt-16" aria-labelledby="iptal-degisiklik">
          <h2 id="iptal-degisiklik" className="text-xl sm:text-2xl">
            İptal ve değişiklik
          </h2>
          <Prose className="mt-4">
            {freeCancel ? (
              <p>
                Bu sefer <strong>ücretsiz iptal</strong> seçeneğiyle listelenmektedir: kalkış
                saatinden önce yaptığınız iptallerde kesinti uygulanmaz. İptal talebiniz onaylandığı
                anda bilet geçerliliğini yitirir, koltuk yeniden satışa açılır.
              </p>
            ) : (
              <p>
                Bu seferde ücretsiz iptal hakkı tanımlı değildir. İptal ve değişiklik koşulları
                seferi düzenleyen firmanın kurallarına göre işler; kalkışa yakın yapılan iptallerde
                kesinti oranı yükselir.
              </p>
            )}
            <ul>
              <li>
                İptal ve değişiklik işlemleri PNR kodunuz ve soyadınızla{' '}
                <Link to="/bilet-iptal">bilet iptal sayfasından</Link> yürütülür.
              </li>
              <li>
                Sefer saatinde firmadan kaynaklanan bir değişiklik olursa bilette yer alan iletişim
                bilgilerinden bilgilendirilirsiniz.
              </li>
              <li>
                Koltuk değişikliği yalnızca aynı seferde boş koltuk bulunduğunda mümkündür;
                kalkıştan sonra bilet üzerinde işlem yapılamaz.
              </li>
            </ul>
          </Prose>
        </section>

        <section className="mt-12 sm:mt-16" aria-labelledby="yolculuk-oncesi">
          <h2 id="yolculuk-oncesi" className="text-xl sm:text-2xl">
            Yolculuk öncesi
          </h2>
          <Prose className="mt-4">
            <p>
              Kalkış saatinden en az 30 dakika önce{' '}
              <strong>{terminalName(from, trip.fromTerminalId)}</strong> alanında olmanızı öneririz.
              Peron numarası kalkışa yakın kesinleşir, bu yüzden otogardaki ekranları yeniden
              kontrol edin.
            </p>
            <ul>
              <li>
                Kimlik belgenizi yanınızda bulundurun; biletinizi telefonunuzdan gösterebilirsiniz.
              </li>
              <li>
                Bagajınızı teslim ederken etiket aldığınızdan emin olun, iniş noktasında bu etiket
                istenebilir.
              </li>
              {trip.overnight ? (
                <li>
                  Gece yolculuğunda mola sayısı azdır; yanınıza küçük bir su ve gerekiyorsa boyun
                  yastığı almanız yolu rahatlatır.
                </li>
              ) : (
                <li>
                  Yol boyunca verilen mola sayısı ve süresi firmaya göre değişir; molalarda araç
                  plakasını not etmeniz işinizi kolaylaştırır.
                </li>
              )}
              <li>
                Şehir içi servis kullanacaksanız servis saatlerini firmadan önceden teyit edin.
              </li>
            </ul>
          </Prose>
        </section>

        <section className="mt-12 sm:mt-16" aria-labelledby="benzer-seferler">
          <h2 id="benzer-seferler" className="text-xl sm:text-2xl">
            Benzer seferler
          </h2>
          <p className="mt-2 max-w-prose text-base text-fg-secondary">
            Aynı gün, aynı güzergâhta listelenen en uygun ücretli diğer seferler.
          </p>

          {similar.length > 0 ? (
            <ul className="mt-5 flex flex-col gap-3">
              {similar.map((candidate) => (
                <li key={candidate.id}>
                  <SimilarRow trip={candidate} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 rounded-xl border border-dashed border-border bg-surface-sunken p-5 text-sm text-fg-secondary">
              Bu güzergâhta aynı gün için başka sefer listelenmedi. Farklı bir tarih seçmek için
              sefer listesine dönebilirsiniz.
            </p>
          )}

          <Button asChild variant="brand-outline" size="md" className="mt-5">
            <Link to={resultsPath(from.slug, to.slug, date)}>
              Tüm seferleri görün
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </section>
      </div>
    </>
  )
}

function SeatSummary({
  trip,
  seatMap,
  failed,
}: {
  trip: Trip
  seatMap: SeatMap | undefined
  failed: boolean
}) {
  if (failed) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-border bg-surface-sunken p-5 text-sm text-fg-secondary">
        Koltuk planı şu anda getirilemedi. Koltuk seçimi sayfasında güncel doluluk bilgisini
        görebilirsiniz.
      </p>
    )
  }

  if (!seatMap) {
    return (
      <div className="mt-4 rounded-xl border border-border bg-surface p-4 sm:p-5" aria-busy="true">
        <span className="sr-only">Koltuk planı yükleniyor</span>
        <Skeleton className="h-4 w-40" />
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <Skeleton className="mt-5 h-11 w-40 rounded-lg" />
      </div>
    )
  }

  const deck = getDeck(seatMap.deckId)
  const total = seatMap.seats.length
  const free = seatMap.seats.filter((seat) => seat.availableFor !== 'NO').length
  const singles = seatMap.seats.filter((seat) => seat.isSingle).length

  return (
    <div className="mt-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
      <p className="text-base text-fg-secondary">
        Bu seferde <strong className="font-medium text-fg">{deck.name}</strong> tipinde bir araç
        kullanılıyor. Koltukları seçim sayfasında görüp yolcu cinsiyetiyle birlikte
        işaretleyebilirsiniz.
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <dt className="text-xs text-fg-muted">Düzen</dt>
          <dd className="mt-1 font-display text-lg font-semibold text-fg">{deck.family}</dd>
        </div>
        <div>
          <dt className="text-xs text-fg-muted">Toplam koltuk</dt>
          <dd className="mt-1 font-display text-lg font-semibold text-fg" data-numeric>
            {total}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-fg-muted">Boş koltuk</dt>
          <dd
            className="mt-1 font-display text-lg font-semibold text-fg"
            data-numeric
            role="status"
          >
            {free}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-fg-muted">Tek koltuk</dt>
          <dd className="mt-1 font-display text-lg font-semibold text-fg" data-numeric>
            {singles}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-sm text-fg-muted">
        {seatMap.policy.hasGenderSelection
          ? 'Yan yana iki koltuktan biri doluysa diğeri aynı cinsiyete ayrılır; tek koltuklarda bu kural işlemez.'
          : 'Bu firmada cinsiyet kuralı uygulanmaz, koltukları serbestçe seçebilirsiniz.'}
        {seatMap.policy.singleSeatFee > 0 ? (
          <>
            {' '}
            Tek koltuk seçimlerinde{' '}
            <span data-numeric>{formatPrice(seatMap.policy.singleSeatFee)}</span> ek ücret
            uygulanır.
          </>
        ) : null}
      </p>

      <Button asChild variant="brand-outline" size="md" className="mt-5">
        <Link to={seatPath(trip.id)}>
          Koltuk planını açın
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  )
}

function SimilarRow({ trip }: { trip: Trip }) {
  const operator = operatorById(trip.operatorId)
  const operatorName = operator?.name ?? 'Otobüs firması'

  return (
    <Link
      to={tripPath(trip.id)}
      aria-label={`${formatTime(trip.departsAt)} kalkışlı ${operatorName} seferini inceleyin`}
      className="group flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-border bg-surface p-4 transition-[border-color,box-shadow] duration-(--duration-base) ease-standard hover:border-brand/40 hover:shadow-md"
    >
      <OperatorLogo operatorId={trip.operatorId} className="size-12 shrink-0" />

      <span className="min-w-0 flex-1 basis-32">
        <span className="block truncate font-display text-sm font-semibold text-fg">
          {operatorName}
        </span>
        <span className="mt-0.5 block text-xs text-fg-muted">
          <span data-numeric>{formatDuration(trip.durationMin)}</span> · {trip.seatLayout} düzen ·{' '}
          <span data-numeric>{pluralTr(trip.seatsLeft, 'boş koltuk')}</span>
        </span>
      </span>

      <span className="font-display text-base font-semibold text-fg" data-numeric>
        {formatTime(trip.departsAt)} – {formatTime(trip.arrivesAt)}
        {trip.overnight ? (
          <sup className="ms-0.5 text-2xs font-bold text-warning-fg">
            +1
            <VisuallyHidden> ertesi gün varış</VisuallyHidden>
          </sup>
        ) : null}
      </span>

      <span className="ms-auto flex items-center gap-3">
        <span className="font-display text-lg font-semibold text-fg" data-numeric>
          {formatPrice(trip.price)}
        </span>
        <ArrowRight
          className="size-4 shrink-0 text-fg-subtle transition-transform duration-(--duration-fast) ease-out group-hover:translate-x-0.5 group-hover:text-brand-fg"
          aria-hidden="true"
        />
      </span>
    </Link>
  )
}

function TripDetailLoading() {
  return (
    <>
      <div className="border-b border-border bg-bg-alt">
        <div className="app-container py-8 sm:py-10" aria-busy="true">
          <span className="sr-only">Sefer bilgileri yükleniyor</span>
          <Skeleton className="h-4 w-56" />
          <Skeleton className="mt-4 h-9 w-80 max-w-full" />
          <Skeleton className="mt-3 h-5 w-full max-w-md" />
        </div>
      </div>

      <div className="app-container section-y" aria-hidden="true">
        <div className="rounded-xl border border-border bg-surface-raised p-4 shadow-sm sm:p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56 max-w-full" />
            </div>
          </div>
          <div className="mt-6 flex items-start gap-6 border-t border-border pt-6">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="mt-2 h-4 w-20 sm:w-32" />
            <div className="flex-1 space-y-2">
              <Skeleton className="ms-auto h-8 w-20" />
              <Skeleton className="ms-auto h-4 w-28" />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-13 w-40 rounded-full" />
          </div>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16">
          <Skeleton className="h-7 w-44" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </>
  )
}

function TripNotFound() {
  return (
    <div className="app-container section-y">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-5 text-center" role="alert">
        <span className="grid size-14 place-items-center rounded-full bg-surface-sunken text-fg-muted">
          <Bus className="size-7" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-balance-tr text-fg">
            Sefer bulunamadı
          </h1>
          <p className="text-sm text-balance-tr text-fg-secondary">
            Aradığınız sefer kaldırılmış ya da bağlantı geçerliliğini yitirmiş olabilir. Güncel
            seferler için yeni bir arama yapabilirsiniz.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild variant="primary" size="lg">
            <Link to="/">Sefer arayın</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link to="/populer-seferler">Popüler seferler</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
