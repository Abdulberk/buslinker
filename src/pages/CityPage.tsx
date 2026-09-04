import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowRight, ArrowUpRight, Building2, MapPin } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardBody } from '@/shared/ui/card'
import { SearchForm } from '@/features/search-form/SearchForm'
import { CITY_PHOTO } from '@/shared/config/assets'
import { CITIES, POPULAR_ROUTES, cityBySlug, type City } from '@/shared/api/catalog'
import { searchTrips } from '@/shared/api/mock-server'
import { routePath } from '@/shared/lib/search-params'
import {
  ablativeTr,
  dativeTr,
  formatDateLong,
  formatDuration,
  formatPrice,
  fromISODate,
  pluralTr,
  toISODate,
  upperTr,
} from '@/shared/lib/tr'

/** Every figure on this page is quoted for tomorrow, the first bookable day. */
function tomorrowISO(): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return toISODate(date)
}

/** Destinations shown in each direction. */
const SHOWN_ROUTES = 6

/**
 * Corridors this city is already known for come first; the rest of the list is
 * filled from the catalogue, which is roughly ordered by city size.
 */
function pickCities(city: City, direction: 'from' | 'to'): readonly City[] {
  const preferred = POPULAR_ROUTES.flatMap((route) => {
    const anchor = direction === 'from' ? route.from : route.to
    const other = direction === 'from' ? route.to : route.from
    if (anchor !== city.slug) return []
    const resolved = cityBySlug(other)
    return resolved && resolved.id !== city.id ? [resolved] : []
  })

  const seen = new Set(preferred.map((c) => c.id))
  const rest = CITIES.filter((c) => c.id !== city.id && !seen.has(c.id))

  return [...preferred, ...rest].slice(0, SHOWN_ROUTES)
}

interface Connection {
  readonly from: City
  readonly to: City
  readonly cheapest: number | null
  readonly shortestMin: number | null
  readonly departures: number
}

function buildConnections(
  city: City,
  direction: 'from' | 'to',
  date: string,
): readonly Connection[] {
  return pickCities(city, direction).map((other) => {
    const from = direction === 'from' ? city : other
    const to = direction === 'from' ? other : city
    const result = searchTrips({ from: from.id, to: to.id, date, sort: 'price_asc' })
    const cheapest = result.trips[0]

    return {
      from,
      to,
      cheapest: cheapest?.price ?? null,
      shortestMin:
        result.trips.length > 0 ? Math.min(...result.trips.map((t) => t.durationMin)) : null,
      departures: result.totalUnfiltered,
    }
  })
}

export default function CityPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const city = slug ? cityBySlug(slug) : undefined

  useEffect(() => {
    document.title = city
      ? `${city.name} Otobüs Bileti | BusLinker`
      : 'Şehir bulunamadı | BusLinker'
  }, [city])

  if (!city) return <CityNotFound />

  return <CityDetail city={city} />
}

function CityDetail({ city }: { city: City }) {
  const date = useMemo(() => tomorrowISO(), [])
  const outbound = useMemo(() => buildConnections(city, 'from', date), [city, date])
  const inbound = useMemo(() => buildConnections(city, 'to', date), [city, date])

  const photo = CITY_PHOTO[city.slug]
  const dateLabel = formatDateLong(fromISODate(date))

  return (
    <>
      <PageHeader
        title={`${city.name} Otobüs Bileti`}
        lead={`${ablativeTr(city.name)} kalkan ve ${dativeTr(city.name)} gelen otobüs seferlerini, otogarları ve güncel ücretleri tek sayfada inceleyebilirsiniz.`}
        breadcrumbs={[
          { label: 'Ana sayfa', to: '/' },
          { label: 'Popüler Seferler', to: '/populer-seferler' },
        ]}
      />

      <div className="app-container section-y">
        {photo ? (
          <figure className="relative overflow-hidden rounded-2xl border border-border">
            <img
              src={photo}
              alt={`${city.name} şehrinden bir görünüm`}
              width={320}
              height={200}
              loading="eager"
              decoding="async"
              className="aspect-16/10 w-full object-cover xs:aspect-2/1 sm:aspect-3/1"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-t from-neutral-1000/80 via-neutral-1000/20 to-transparent"
            />
            <figcaption className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <span className="block text-2xs text-neutral-200">{upperTr(city.region)}</span>
              <span className="mt-0.5 block font-display text-lg font-semibold text-neutral-0 sm:text-xl">
                {city.name} otogarları ve seferleri
              </span>
            </figcaption>
          </figure>
        ) : null}

        <section className={photo ? 'mt-10 sm:mt-12' : ''} aria-labelledby="sehir-bilgileri">
          <h2 id="sehir-bilgileri" className="text-xl sm:text-2xl">
            Şehir bilgileri
          </h2>

          <Card className="mt-4">
            <CardBody>
              <dl className="grid gap-5 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-fg-muted">Plaka kodu</dt>
                  <dd className="mt-1 font-display text-lg font-semibold text-fg" data-numeric>
                    {String(city.plate).padStart(2, '0')}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-fg-muted">Bölge</dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-base font-medium text-fg">
                    <MapPin className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
                    {city.region}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-fg-muted">Otogar sayısı</dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-base font-medium text-fg">
                    <Building2 className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
                    <span data-numeric>{pluralTr(city.terminals.length, 'otogar')}</span>
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>
        </section>

        <section className="mt-12 sm:mt-16" aria-labelledby="otogarlar">
          <h2 id="otogarlar" className="text-xl sm:text-2xl">
            {city.name} otogarları
          </h2>
          <p className="mt-2 max-w-prose text-base text-fg-secondary">
            Biletinizdeki otogarı seçerek peron, kalkış ve ulaşım bilgilerine ulaşabilirsiniz.
          </p>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {city.terminals.map((terminal) => (
              <li key={terminal.id}>
                <Link
                  to={`/terminaller/${terminal.id}`}
                  className="group flex h-full items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-[border-color,box-shadow] duration-(--duration-base) ease-standard hover:border-brand/40 hover:shadow-md"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface-sunken text-fg-secondary">
                    <Building2 className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-sm font-semibold text-fg">
                      {terminal.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-fg-muted">{city.name}</span>
                  </span>
                  <ArrowUpRight
                    className="size-4 shrink-0 text-fg-subtle transition-colors duration-(--duration-fast) group-hover:text-brand-fg"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <ConnectionSection
          id="giden-seferler"
          title={`${ablativeTr(city.name)} popüler seferler`}
          lead={`${dateLabel} tarihli aramalarda çıkan en uygun ücretler ve en kısa yolculuk süreleri.`}
          connections={outbound}
        />

        <ConnectionSection
          id="gelen-seferler"
          title={`${dativeTr(city.name)} gelen seferler`}
          lead={`Dönüş yönündeki hatlar. Ücretler ${dateLabel} tarihli aramalardan alınmıştır.`}
          connections={inbound}
        />

        <section className="mt-12 sm:mt-16" aria-labelledby="sehir-arama">
          <h2 id="sehir-arama" className="text-xl sm:text-2xl">
            Kendi seferinizi arayın
          </h2>
          <p className="mt-2 max-w-prose text-base text-fg-secondary">
            Kalkış şehri olarak {city.name} hazır seçili. Varış şehrini ve tarihi girerek güncel
            sefer listesine geçebilirsiniz.
          </p>
          <SearchForm variant="compact" initial={{ from: city }} className="mt-5" />
        </section>
      </div>
    </>
  )
}

function ConnectionSection({
  id,
  title,
  lead,
  connections,
}: {
  id: string
  title: string
  lead: string
  connections: readonly Connection[]
}) {
  return (
    <section className="mt-12 sm:mt-16" aria-labelledby={id}>
      <h2 id={id} className="text-xl sm:text-2xl">
        {title}
      </h2>
      <p className="mt-2 max-w-prose text-base text-fg-secondary">{lead}</p>

      {connections.length > 0 ? (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {connections.map((connection) => (
            <li key={`${connection.from.slug}-${connection.to.slug}`}>
              <Link
                to={routePath(connection.from.slug, connection.to.slug)}
                aria-label={`${connection.from.name} ${connection.to.name} otobüs biletlerini görüntüleyin`}
                className="group flex h-full flex-col gap-2 rounded-xl border border-border bg-surface p-4 transition-[border-color,box-shadow] duration-(--duration-base) ease-standard hover:border-brand/40 hover:shadow-md sm:p-5"
              >
                <span className="flex min-w-0 items-center gap-2 font-display text-base font-semibold text-fg">
                  <span className="truncate">{connection.from.name}</span>
                  <ArrowRight
                    className="size-4 shrink-0 text-fg-subtle transition-colors duration-(--duration-fast) group-hover:text-brand-fg"
                    aria-hidden="true"
                  />
                  <span className="truncate">{connection.to.name}</span>
                </span>

                {connection.cheapest === null || connection.shortestMin === null ? (
                  <span className="text-sm text-fg-secondary">
                    Yarın için sefer listelenmedi, başka bir tarih deneyebilirsiniz.
                  </span>
                ) : (
                  <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
                    <span className="text-fg-muted">
                      Günlük <span data-numeric>{pluralTr(connection.departures, 'sefer')}</span>
                    </span>
                    <span className="text-fg-muted">
                      En kısa{' '}
                      <span className="text-fg-secondary" data-numeric>
                        {formatDuration(connection.shortestMin)}
                      </span>
                    </span>
                    <span
                      className="ms-auto font-display text-base font-semibold text-fg"
                      data-numeric
                    >
                      {formatPrice(connection.cheapest)}
                    </span>
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 rounded-xl border border-dashed border-border bg-surface-sunken p-5 text-sm text-fg-secondary">
          Bu yön için listelenecek güzergâh bulunamadı. Aşağıdaki arama formundan istediğiniz şehri
          ve tarihi seçebilirsiniz.
        </p>
      )}
    </section>
  )
}

function CityNotFound() {
  return (
    <div className="app-container section-y">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-5 text-center" role="alert">
        <span className="grid size-14 place-items-center rounded-full bg-surface-sunken text-fg-muted">
          <MapPin className="size-7" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-balance-tr text-fg">
            Şehir bulunamadı
          </h1>
          <p className="text-sm text-balance-tr text-fg-secondary">
            Aradığınız şehir kataloğumuzda yer almıyor. Bağlantı eski ya da hatalı yazılmış
            olabilir.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild variant="primary" size="lg">
            <Link to="/">Ana sayfaya dönün</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link to="/terminaller">Otogarları görüntüleyin</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
