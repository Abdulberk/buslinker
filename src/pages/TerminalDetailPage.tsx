import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowRight, ArrowUpRight, Building2, MapPin } from 'lucide-react'
import { PageHeader, Prose } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Card, CardBody } from '@/shared/ui/card'
import { Illustration } from '@/shared/ui/asset-icon'
import { BRAND } from '@/shared/config/assets'
import { CITIES, type City, type Terminal } from '@/shared/api/catalog'
import { searchTrips } from '@/shared/api/mock-server'
import { DEFAULT_SORT, resultsPath, serializeSearchState } from '@/shared/lib/search-params'
import {
  formatDateLong,
  formatDuration,
  formatPrice,
  fromISODate,
  pluralTr,
  toISODate,
} from '@/shared/lib/tr'

/** Every figure on this page is quoted for tomorrow, the first bookable day. */
function tomorrowISO(): string {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return toISODate(date)
}

/** Candidates scanned before the list is trimmed to the five rows shown. */
const CANDIDATE_COUNT = 8
const SHOWN_ROUTES = 5

interface TerminalMatch {
  readonly city: City
  readonly terminal: Terminal
}

function findTerminal(terminalId: string): TerminalMatch | undefined {
  for (const city of CITIES) {
    const terminal = city.terminals.find((t) => t.id === terminalId)
    if (terminal) return { city, terminal }
  }
  return undefined
}

interface Departure {
  readonly to: City
  readonly price: number
  readonly durationMin: number
  readonly count: number
}

function buildDepartures(match: TerminalMatch, date: string): readonly Departure[] {
  const { city, terminal } = match

  // The catalogue is roughly size-ordered, so the first candidates are also the
  // destinations a traveller is most likely to be looking for.
  const candidates = CITIES.filter((other) => other.id !== city.id).slice(0, CANDIDATE_COUNT)

  const departures: Departure[] = []

  for (const other of candidates) {
    const result = searchTrips({
      from: city.id,
      to: other.id,
      date,
      // Prices must come from the filtered list: `priceBounds` is computed
      // before the terminal filter is applied and would undercut the rows.
      filters: { fromTerminals: [terminal.id] },
      sort: 'price_asc',
    })

    const cheapest = result.trips[0]
    if (!cheapest) continue

    departures.push({
      to: other,
      price: cheapest.price,
      durationMin: Math.min(...result.trips.map((t) => t.durationMin)),
      count: result.total,
    })
  }

  return departures.slice(0, SHOWN_ROUTES)
}

export default function TerminalDetailPage() {
  const { terminalId } = useParams<{ terminalId: string }>()
  const match = terminalId ? findTerminal(terminalId) : undefined

  useEffect(() => {
    document.title = match ? `${match.terminal.name} | BusLinker` : 'Otogar bulunamadı | BusLinker'
  }, [match])

  if (!match) return <TerminalNotFound />

  return <TerminalDetail match={match} />
}

function TerminalDetail({ match }: { match: TerminalMatch }) {
  const { city, terminal } = match

  const date = useMemo(() => tomorrowISO(), [])
  const departures = useMemo(() => buildDepartures(match, date), [match, date])

  const searchParams = useMemo(
    () =>
      serializeSearchState({
        sort: DEFAULT_SORT,
        filters: { fromTerminals: [terminal.id] },
      }),
    [terminal.id],
  )

  return (
    <>
      <PageHeader
        title={terminal.name}
        lead={`${terminal.name}, ${city.name} otogarları arasında yer alır. Buradan kalkan seferleri, güncel ücretleri ve yolculuk sürelerini inceleyebilirsiniz.`}
        breadcrumbs={[
          { label: 'Ana sayfa', to: '/' },
          { label: 'Otogarlar', to: '/terminaller' },
        ]}
      />

      <div className="app-container section-y">
        <section aria-labelledby="otogar-bilgileri">
          <h2 id="otogar-bilgileri" className="text-xl sm:text-2xl">
            Otogar bilgileri
          </h2>

          <Card className="mt-4">
            <CardBody className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
              <Illustration
                src={BRAND.terminal}
                alt=""
                width={29}
                height={42}
                className="h-14 w-auto shrink-0"
              />

              <dl className="grid flex-1 gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-fg-muted">Şehir</dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-base font-medium text-fg">
                    <Building2 className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
                    {city.name}
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
                  <dt className="text-xs text-fg-muted">Plaka kodu</dt>
                  <dd className="mt-1 text-base font-medium text-fg" data-numeric>
                    {String(city.plate).padStart(2, '0')}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>
        </section>

        <section className="mt-12 sm:mt-16" aria-labelledby="buradan-kalkan-seferler">
          <h2 id="buradan-kalkan-seferler" className="text-xl sm:text-2xl">
            Buradan kalkan popüler seferler
          </h2>
          <p className="mt-2 max-w-prose text-base text-fg-secondary">
            {formatDateLong(fromISODate(date))} tarihinde {terminal.name} kalkışlı seferlerin en
            uygun ücretleri ve en kısa yolculuk süreleri.
          </p>

          {departures.length > 0 ? (
            <ul className="mt-5 flex flex-col gap-3">
              {departures.map((departure) => (
                <li key={departure.to.id}>
                  <Link
                    to={resultsPath(city.slug, departure.to.slug, date, searchParams)}
                    aria-label={`${terminal.name} kalkışlı ${departure.to.name} seferlerini görüntüleyin`}
                    className="group flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl border border-border bg-surface p-4 transition-[border-color,box-shadow] duration-(--duration-base) ease-standard hover:border-brand/40 hover:shadow-md sm:p-5"
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 font-display text-base font-semibold text-fg">
                        <span className="truncate">{city.name}</span>
                        <ArrowRight
                          className="size-4 shrink-0 text-fg-subtle transition-colors duration-(--duration-fast) group-hover:text-brand-fg"
                          aria-hidden="true"
                        />
                        <span className="truncate">{departure.to.name}</span>
                      </span>
                      <span className="mt-1 block text-sm text-fg-muted">
                        {pluralTr(departure.count, 'sefer')} · en kısa{' '}
                        <span data-numeric>{formatDuration(departure.durationMin)}</span>
                      </span>
                    </span>

                    <span className="flex items-baseline gap-3">
                      <span className="font-display text-lg font-semibold text-fg" data-numeric>
                        {formatPrice(departure.price)}
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
              <p className="max-w-prose text-sm text-fg-secondary">
                Bu otogardan yarın için sefer listelenmedi. Gitmek istediğiniz şehri ve tarihi
                girerek arama yapabilirsiniz.
              </p>
              <Button asChild variant="primary" size="md">
                <Link to="/">Sefer arayın</Link>
              </Button>
            </div>
          )}
        </section>

        <section className="mt-12 sm:mt-16" aria-labelledby="yolculuk-notu">
          <h2 id="yolculuk-notu" className="text-xl sm:text-2xl">
            Yolculuk öncesi notlar
          </h2>
          <Prose className="mt-4">
            <p>
              Otogara kalkış saatinden en az 30 dakika önce varmanızı öneririz. Yoğun saatlerde
              otogar girişinde ve bagaj teslim noktasında sıra oluşabiliyor.
            </p>
            <ul>
              <li>
                Peron numarası kalkıştan kısa süre önce kesinleşir; bilet üzerindeki peronu
                otogardaki ekranlardan yeniden kontrol edin.
              </li>
              <li>
                Bagajınızı teslim ederken etiket aldığınızdan emin olun, iniş noktasında bu etiket
                istenebilir.
              </li>
              <li>
                Şehir içi servisle otogara geleceksiniz ise servis saatlerini firmanızdan önceden
                teyit edin.
              </li>
              <li>
                Kimlik belgenizi yanınızda bulundurun; biletinizi telefonunuzdan gösterebilirsiniz.
              </li>
            </ul>
          </Prose>
        </section>
      </div>
    </>
  )
}

function TerminalNotFound() {
  return (
    <div className="app-container section-y">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-5 text-center" role="alert">
        <span className="grid size-14 place-items-center rounded-full bg-surface-sunken text-fg-muted">
          <MapPin className="size-7" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-balance-tr text-fg">
            Otogar bulunamadı
          </h1>
          <p className="text-sm text-balance-tr text-fg-secondary">
            Aradığınız otogar listemizde yer almıyor. Bağlantı eski ya da hatalı yazılmış olabilir.
          </p>
        </div>
        <Button asChild variant="primary" size="lg">
          <Link to="/terminaller">Otogarları görüntüleyin</Link>
        </Button>
      </div>
    </div>
  )
}
