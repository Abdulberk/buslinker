import { useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowRight, ArrowUpRight, Building2, Bus, Clock, Star, Ticket } from 'lucide-react'
import type { ReactNode } from 'react'
import { PageHeader, Prose } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { OperatorLogo } from '@/shared/ui/operator-logo'
import { VisuallyHidden } from '@/shared/ui/visually-hidden'
import {
  POPULAR_ROUTES,
  cityBySlug,
  distanceKm,
  operatorById,
  type City,
} from '@/shared/api/catalog'
import { datePrices, searchTrips, type SearchResult, type Trip } from '@/shared/api/mock-server'
import {
  parseRouteParam,
  resultsPath,
  routePath,
  seatPath,
  tripPath,
} from '@/shared/lib/search-params'
import {
  ablativeTr,
  dativeTr,
  formatDateLong,
  formatDateShort,
  formatDuration,
  formatPrice,
  formatTime,
  formatWeekdayShort,
  fromISODate,
  pluralTr,
  toISODate,
  toISODateLocal,
} from '@/shared/lib/tr'

/** How many of today's departures are previewed before the full list. */
const PREVIEW_COUNT = 5
/** How many other corridors are offered at the foot of the page. */
const RELATED_COUNT = 6

const ratingFmt = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

interface DayPrice {
  readonly date: string
  readonly minPrice: number | null
  readonly count: number
}

/**
 * `datePrices` is centred on its anchor day, so asking for today would spend
 * three of the seven cells on days that can no longer be booked. Anchoring
 * three days ahead makes the window start today and run a full week forward.
 */
function upcomingWeek(fromId: string, toId: string, today: string): readonly DayPrice[] {
  const anchor = fromISODate(today)
  anchor.setDate(anchor.getDate() + 3)
  return datePrices(fromId, toId, toISODateLocal(anchor), 3)
}

interface RouteStats {
  readonly departures: number
  readonly cheapest: number | null
  readonly shortestMin: number | null
  readonly averageMin: number | null
  readonly overnight: number
  readonly operatorIds: readonly string[]
}

function summarise(result: SearchResult): RouteStats {
  const trips = result.trips
  if (trips.length === 0) {
    return {
      departures: 0,
      cheapest: null,
      shortestMin: null,
      averageMin: null,
      overnight: 0,
      operatorIds: [],
    }
  }

  const durations = trips.map((t) => t.durationMin)
  return {
    departures: result.totalUnfiltered,
    cheapest: result.priceBounds.min,
    shortestMin: Math.min(...durations),
    averageMin: Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length),
    overnight: trips.filter((t) => t.overnight).length,
    operatorIds: result.facets.operators.map((bucket) => bucket.value),
  }
}

function terminalList(city: City): string {
  return city.terminals.map((terminal) => terminal.name).join(', ')
}

/**
 * Route copy, written per distance band rather than from one template: a
 * two-hour hop and a fourteen-hour overnight ask completely different
 * questions of the traveller, and a single paragraph that fits both says
 * nothing useful about either.
 */
function RouteCopy({
  from,
  to,
  km,
  stats,
}: {
  from: City
  to: City
  km: number
  stats: RouteStats
}): ReactNode {
  const duration = stats.averageMin !== null ? formatDuration(stats.averageMin) : null
  const cheapest = stats.cheapest !== null ? formatPrice(stats.cheapest) : null
  const sameRegion = from.region === to.region

  const distanceLine = (
    <>
      {ablativeTr(from.name)} {dativeTr(to.name)} olan mesafe yaklaşık{' '}
      <span data-numeric>{pluralTr(Math.round(km), 'kilometredir')}</span>
      {duration ? (
        <>
          {' '}
          ve otobüsle yolculuk ortalama <span data-numeric>{duration}</span> sürer
        </>
      ) : null}
      .{' '}
    </>
  )

  const terminalLine = (
    <>
      Kalkışlar {from.name} tarafında {terminalList(from)} üzerinden yapılır; varışta ise{' '}
      {terminalList(to)} kullanılır.
    </>
  )

  if (km < 250) {
    return (
      <>
        <p>
          {distanceLine}
          {sameRegion
            ? `Aynı bölge içindeki bu kısa hatta kalkışlar güne yayılır, bu yüzden sabah gidip akşam dönmek isteyen yolcular için elverişlidir.`
            : `${from.region} ile ${to.region} bölgelerini bağlayan bu kısa hatta kalkışlar güne yayılır, bu yüzden aynı gün içinde gidiş dönüş yapmak mümkündür.`}{' '}
          {terminalLine}
        </p>
        <p>
          Kısa hatlarda koltuk bulmak çoğu zaman kolaydır; yine de hafta sonu dönüşlerinde ve resmî
          tatillerin son gününde araçlar dolabiliyor, bu günlerde biletinizi birkaç gün önceden
          almanızı öneririz.{' '}
          {cheapest ? (
            <>
              Bugün için listelenen en düşük ücret <span data-numeric>{cheapest}</span>; günün ilk
              seferleri ile gece geç saatteki kalkışlar genellikle listenin en uygun fiyatlı
              seferleri olur.
            </>
          ) : (
            'Ücretler kalkış saatine göre değişir; günün ilk ve son seferleri çoğunlukla daha uygundur.'
          )}
        </p>
        <p>
          Bu mesafede 2+2 düzenli araçlar yaygındır ve yolculuk kısa sürdüğü için çoğu yolcuya
          yeterli gelir. Daha geniş bir koltuk isterseniz arama sonuçlarında 2+1 düzeni
          seçebilirsiniz; tek seyahat ediyorsanız 2+1 araçlardaki tek koltuklar yanınıza kimsenin
          oturmamasını sağlar. Bagajınız varsa orta sıraları tercih edin, iniş binişte kapıya en
          yakın sıralar en hızlı boşalan bölümdür.
        </p>
      </>
    )
  }

  if (km < 600) {
    return (
      <>
        <p>
          {distanceLine}
          {sameRegion
            ? 'Yol boyunca genellikle bir dinlenme molası verilir; mola yeri ve süresi firmaya göre değişir.'
            : `${from.region} bölgesinden ${to.region} bölgesine uzanan bu hatta yol boyunca genellikle bir dinlenme molası verilir; mola yeri ve süresi firmaya göre değişir.`}{' '}
          {terminalLine}
        </p>
        <p>
          Orta mesafeli hatlarda sefer sayısı yüksektir, buna karşılık en uygun saatler önce dolar.
          Biletinizi üç ile beş gün önceden almanız hem saat seçiminizi hem de ücreti korumanızı
          sağlar.{' '}
          {cheapest ? (
            <>
              Bugünkü aramada en düşük ücret <span data-numeric>{cheapest}</span> olarak
              listeleniyor.
            </>
          ) : null}{' '}
          {stats.overnight > 0
            ? 'Akşam kalkışlı bazı seferler varışını ertesi güne taşır; dönüş planınızı yaparken varış gününü kontrol edin.'
            : 'Seferlerin tamamı kalktığı gün içinde varışını tamamlar.'}
        </p>
        <p>
          Bu mesafede hem 2+1 hem 2+2 düzenli araçlar listelenir. Gündüz yolculuklarında güneş uzun
          süre aynı taraftan geldiği için koltuk seçiminde yönü gözetmek işinizi kolaylaştırır;
          koltuk planında camlı ve koridor koltukları ayrı ayrı işaretlidir. Uykusunu almak isteyen
          yolcular için 2+1 düzendeki tek koltuklar, ekran ve prizden yararlanmak isteyenler için
          ise USB şarj ve koltuk ekranı sunan seferler öne çıkar.
        </p>
      </>
    )
  }

  return (
    <>
      <p>
        {distanceLine}
        Uzun mesafeli bu hatta seferlerin önemli bölümü akşam saatlerinde kalkar ve sabah varır;
        böylece yolculuk uyku saatine denk gelir.{' '}
        {sameRegion ? null : `Güzergâh ${from.region} bölgesinden ${to.region} bölgesine uzanır. `}
        {terminalLine}
      </p>
      <p>
        Uzun hatlarda günlük sefer sayısı kısa hatlara göre sınırlıdır
        {stats.departures > 0 ? (
          <>
            ; bugün için <span data-numeric>{pluralTr(stats.departures, 'kalkış')}</span>{' '}
            listeleniyor
          </>
        ) : null}
        . Bu yüzden biletinizi bir hafta öncesinden almanızı öneririz. Bayram dönemlerinde ve okul
        tatillerinin başlangıcında bu hatlar en erken dolan güzergâhlar arasındadır.{' '}
        {cheapest ? (
          <>
            Bugünkü en düşük ücret <span data-numeric>{cheapest}</span>.
          </>
        ) : null}
      </p>
      <p>
        Gece boyunca süren yolculukta koltuk düzeni doğrudan konforu belirler: 2+1 düzenli lüks
        araçlarda koltuklar daha geniş açılır ve tek koltuklarda yanınızda kimse olmaz. Arka sıra
        koltukların çoğu tam yatmaz, motor sesi de burada daha belirgindir; dinlenmeyi
        önemsiyorsanız aracın orta bölümünü seçin. Battaniye, ikram servisi ve tuvaletli araç gibi
        özellikler firmadan firmaya değiştiği için sefer listesindeki özellik filtrelerini
        kullanmanızı öneririz.
      </p>
    </>
  )
}

export default function RouteLandingPage() {
  const { route = '' } = useParams<{ route: string }>()

  const pair = useMemo(() => parseRoute(route), [route])
  const from = pair?.from
  const to = pair?.to

  useEffect(() => {
    document.title =
      from && to
        ? `${from.name} ${to.name} Otobüs Bileti | BusLinker`
        : 'Güzergâh bulunamadı | BusLinker'
  }, [from, to])

  if (!from || !to) return <RouteNotFound />

  return <RouteLanding from={from} to={to} />
}

/** A slug may itself contain a hyphen, so the split is delegated, not guessed. */
function parseRoute(raw: string): { from: City; to: City } | null {
  const parsed = raw ? parseRouteParam(raw, cityBySlug) : null
  if (!parsed) return null
  const from = cityBySlug(parsed.from)
  const to = cityBySlug(parsed.to)
  // A pair of identical cities parses, but no coach runs it.
  if (!from || !to || from.id === to.id) return null
  return { from, to }
}

function RouteLanding({ from, to }: { from: City; to: City }) {
  const today = useMemo(() => toISODate(new Date()), [])
  const days = useMemo(() => upcomingWeek(from.id, to.id, today), [from.id, to.id, today])

  const result = useMemo(
    () => searchTrips({ from: from.id, to: to.id, date: today, sort: 'dep_asc' }),
    [from.id, to.id, today],
  )
  const stats = useMemo(() => summarise(result), [result])
  const km = useMemo(() => distanceKm(from, to), [from, to])

  const preview = result.trips.slice(0, PREVIEW_COUNT)
  const hasTrips = result.trips.length > 0

  const related = POPULAR_ROUTES.flatMap(({ from: fromSlug, to: toSlug }) => {
    if (fromSlug === from.slug && toSlug === to.slug) return []
    const origin = cityBySlug(fromSlug)
    const destination = cityBySlug(toSlug)
    if (!origin || !destination) return []
    return [{ from: origin, to: destination }]
  }).slice(0, RELATED_COUNT)

  return (
    <>
      <PageHeader
        title={`${from.name} - ${to.name} Otobüs Bileti`}
        lead={`${ablativeTr(from.name)} ${dativeTr(to.name)} giden otobüs seferlerini, güncel ücretleri ve yolculuk sürelerini karşılaştırın. Tarihi seçerek doğrudan sefer listesine geçebilirsiniz.`}
        breadcrumbs={[
          { label: 'Ana sayfa', to: '/' },
          { label: 'Popüler Seferler', to: '/populer-seferler' },
        ]}
      />

      <div className="app-container section-y">
        <section aria-labelledby="tarih-secimi">
          <h2 id="tarih-secimi" className="text-xl sm:text-2xl">
            Tarih seçin
          </h2>
          <p className="mt-2 max-w-prose text-base text-fg-secondary">
            Önümüzdeki yedi günün en uygun ücretleri. Bir güne dokunduğunuzda o tarihin sefer
            listesi açılır.
          </p>

          <nav aria-label="Tarihe göre en uygun ücretler" className="mt-5">
            <ul className="scrollbar-none flex gap-2 overflow-x-auto pb-1 sm:gap-3">
              {days.map((day, index) => {
                const label =
                  index === 0 ? 'Bugün' : index === 1 ? 'Yarın' : formatWeekdayShort(day.date)
                const body = (
                  <>
                    <span className="text-xs font-medium text-fg-secondary">{label}</span>
                    <span className="font-display text-sm font-semibold text-fg" data-numeric>
                      {formatDateShort(day.date)}
                    </span>
                    <span
                      className={
                        day.minPrice !== null
                          ? 'text-xs font-medium whitespace-nowrap text-brand-fg'
                          : 'text-xs whitespace-nowrap text-fg-subtle'
                      }
                      data-numeric
                    >
                      {day.minPrice !== null ? (
                        <>
                          <VisuallyHidden>en ucuz </VisuallyHidden>
                          {formatPrice(day.minPrice)}
                        </>
                      ) : (
                        'sefer yok'
                      )}
                    </span>
                  </>
                )

                return (
                  <li key={day.date} className="w-26 shrink-0 sm:w-auto sm:flex-1">
                    {day.count === 0 ? (
                      <span
                        aria-disabled="true"
                        className="flex h-full w-full cursor-not-allowed flex-col items-center gap-0.5 rounded-xl border border-border bg-surface px-2 py-3 text-center opacity-55"
                      >
                        {body}
                        <span className="sr-only">{formatDateLong(day.date)} — sefer yok</span>
                      </span>
                    ) : (
                      <Link
                        to={resultsPath(from.slug, to.slug, day.date)}
                        className={
                          'tap-44 flex h-full w-full flex-col items-center gap-0.5 rounded-xl border px-2 py-3 text-center transition-colors duration-(--duration-fast) ease-standard ' +
                          (index === 0
                            ? 'border-brand bg-brand/8 hover:bg-brand/12'
                            : 'border-border bg-surface hover:border-brand/40 hover:bg-surface-sunken')
                        }
                      >
                        {body}
                        <span className="sr-only">
                          {formatDateLong(day.date)} seferlerini görüntüleyin
                        </span>
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>
        </section>

        <section className="mt-12 sm:mt-16" aria-labelledby="bugunun-seferleri">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="bugunun-seferleri" className="text-xl sm:text-2xl">
                Bugünün seferleri
              </h2>
              <p className="mt-2 max-w-prose text-base text-fg-secondary">
                {formatDateLong(fromISODate(today))} tarihinde listelenen ilk{' '}
                <span data-numeric>{pluralTr(preview.length, 'kalkış')}</span>.
              </p>
            </div>
            {hasTrips ? (
              <Button asChild variant="primary" size="md" className="shrink-0">
                <Link to={resultsPath(from.slug, to.slug, today)}>
                  Tüm seferleri görün
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            ) : null}
          </div>

          {hasTrips ? (
            <ul className="mt-5 flex flex-col gap-3">
              {preview.map((trip) => (
                <li key={trip.id}>
                  <TripRow trip={trip} from={from} to={to} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 flex flex-col items-start gap-4 rounded-xl border border-dashed border-border bg-surface-sunken p-6">
              <span className="grid size-12 place-items-center rounded-full bg-surface text-fg-muted">
                <Bus className="size-6" aria-hidden="true" />
              </span>
              <p className="max-w-prose text-sm text-fg-secondary">
                Bugün için bu güzergâhta sefer listelenmedi. Yukarıdaki tarih şeridinden başka bir
                gün seçebilir ya da yeni bir arama yapabilirsiniz.
              </p>
              <Button asChild variant="brand-outline" size="md">
                <Link to="/">Sefer arayın</Link>
              </Button>
            </div>
          )}
        </section>

        <section className="mt-12 sm:mt-16" aria-labelledby="hat-ozeti">
          <h2 id="hat-ozeti" className="text-xl sm:text-2xl">
            Hat özeti
          </h2>
          <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
            <StatCell
              icon={<Bus className="size-4" aria-hidden="true" />}
              label="Günlük sefer"
              value={stats.departures > 0 ? pluralTr(stats.departures, 'sefer') : 'Sefer yok'}
            />
            <StatCell
              icon={<Ticket className="size-4" aria-hidden="true" />}
              label="En düşük ücret"
              value={stats.cheapest !== null ? formatPrice(stats.cheapest) : '—'}
            />
            <StatCell
              icon={<Clock className="size-4" aria-hidden="true" />}
              label="En kısa süre"
              value={stats.shortestMin !== null ? formatDuration(stats.shortestMin) : '—'}
            />
            <StatCell
              icon={<Building2 className="size-4" aria-hidden="true" />}
              label="Firma sayısı"
              value={
                stats.operatorIds.length > 0 ? pluralTr(stats.operatorIds.length, 'firma') : '—'
              }
            />
          </dl>
        </section>

        <section className="mt-12 sm:mt-16" aria-labelledby="sefer-bilgileri">
          <h2 id="sefer-bilgileri" className="text-xl sm:text-2xl">
            Sefer bilgileri
          </h2>
          <dl className="mt-5 grid gap-x-10 gap-y-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-fg-muted">Mesafe</dt>
              <dd className="mt-1 text-base font-medium text-fg" data-numeric>
                Yaklaşık {pluralTr(Math.round(km), 'km')}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-fg-muted">Ortalama yolculuk süresi</dt>
              <dd className="mt-1 text-base font-medium text-fg" data-numeric>
                {stats.averageMin !== null ? formatDuration(stats.averageMin) : 'Bilgi yok'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-fg-muted">Kalkış terminalleri</dt>
              <dd className="mt-1">
                <TerminalLinks city={from} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-fg-muted">Varış terminalleri</dt>
              <dd className="mt-1">
                <TerminalLinks city={to} />
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-12 sm:mt-16" aria-labelledby="guzergah-firmalari">
          <h2 id="guzergah-firmalari" className="text-xl sm:text-2xl">
            Bu güzergâhta çalışan firmalar
          </h2>
          <p className="mt-2 max-w-prose text-base text-fg-secondary">
            Bugünkü listede yer alan firmalar. Sefer sayıları güne göre değişebilir.
          </p>

          {stats.operatorIds.length > 0 ? (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {result.facets.operators.map((bucket) => {
                const operator = operatorById(bucket.value)
                if (!operator) return null
                return (
                  <li key={bucket.value}>
                    <Link
                      to={`/otobus-firmalari/${operator.id}`}
                      className="group flex h-full items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-[border-color,box-shadow] duration-(--duration-base) ease-standard hover:border-brand/40 hover:shadow-md"
                    >
                      <OperatorLogo operatorId={operator.id} className="size-12 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-sm font-semibold text-fg">
                          {operator.name}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1 text-xs text-fg-muted">
                          <Star
                            className="size-3.5 text-warning"
                            fill="currentColor"
                            aria-hidden="true"
                          />
                          <span data-numeric>{ratingFmt.format(operator.rating)}</span>
                          <span className="sr-only">puan, 10 üzerinden</span>
                          <span aria-hidden="true">·</span>
                          <span data-numeric>{pluralTr(bucket.count, 'sefer')}</span>
                        </span>
                      </span>
                      <ArrowUpRight
                        className="size-4 shrink-0 text-fg-subtle transition-colors duration-(--duration-fast) group-hover:text-brand-fg"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="mt-5 rounded-xl border border-dashed border-border bg-surface-sunken p-5 text-sm text-fg-secondary">
              Bugün için bu güzergâhta firma listelenmedi. Başka bir tarih seçtiğinizde sefer
              düzenleyen firmaları görebilirsiniz.
            </p>
          )}
        </section>

        <section className="mt-12 sm:mt-16" aria-labelledby="guzergah-rehberi">
          <h2 id="guzergah-rehberi" className="text-xl sm:text-2xl">
            {from.name} - {to.name} yolculuğu hakkında
          </h2>
          <Prose className="mt-4">
            <RouteCopy from={from} to={to} km={km} stats={stats} />
          </Prose>
        </section>

        <section className="mt-12 sm:mt-16" aria-labelledby="diger-guzergahlar">
          <h2 id="diger-guzergahlar" className="text-xl sm:text-2xl">
            Diğer popüler güzergâhlar
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((pair) => (
              <li key={`${pair.from.slug}-${pair.to.slug}`}>
                <Link
                  to={routePath(pair.from.slug, pair.to.slug)}
                  className="group flex h-full items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 transition-[border-color,box-shadow] duration-(--duration-base) ease-standard hover:border-brand/40 hover:shadow-md"
                >
                  <span className="flex min-w-0 items-center gap-2 font-display text-sm font-semibold text-fg">
                    <span className="truncate">{pair.from.name}</span>
                    <ArrowRight
                      className="size-4 shrink-0 text-fg-subtle transition-colors duration-(--duration-fast) group-hover:text-brand-fg"
                      aria-hidden="true"
                    />
                    <span className="truncate">{pair.to.name}</span>
                  </span>
                  <span className="shrink-0 text-xs text-fg-muted">otobüs bileti</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}

function StatCell({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="bg-surface p-4 sm:p-5">
      <dt className="flex items-center gap-1.5 text-xs text-fg-muted">
        <span className="text-fg-subtle">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 font-display text-lg font-semibold text-fg sm:text-xl" data-numeric>
        {value}
      </dd>
    </div>
  )
}

function TerminalLinks({ city }: { city: City }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {city.terminals.map((terminal) => (
        <li key={terminal.id}>
          <Link
            to={`/terminaller/${terminal.id}`}
            className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-fg-secondary transition-colors duration-(--duration-fast) hover:border-brand/40 hover:text-brand-fg"
          >
            {terminal.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}

function TripRow({ trip, from, to }: { trip: Trip; from: City; to: City }) {
  const operator = operatorById(trip.operatorId)
  const operatorName = operator?.name ?? 'Otobüs firması'
  const departure = formatTime(trip.departsAt)

  return (
    <article className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-border bg-surface p-4 transition-[border-color,box-shadow] duration-(--duration-base) ease-standard hover:border-brand/30 hover:shadow-md">
      <OperatorLogo operatorId={trip.operatorId} className="size-12 shrink-0" />

      <div className="min-w-0 flex-1 basis-32">
        <h3 className="truncate font-display text-sm font-semibold text-fg">{operatorName}</h3>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-fg-muted">
          <Star className="size-3.5 text-warning" fill="currentColor" aria-hidden="true" />
          <span data-numeric>{ratingFmt.format(trip.rating)}</span>
          <span className="sr-only">puan, 10 üzerinden</span>
          <span aria-hidden="true">·</span>
          <span>{trip.seatLayout} düzen</span>
        </p>
      </div>

      <div className="flex items-baseline gap-3">
        <p className="font-display text-base font-semibold text-fg" data-numeric>
          {departure} – {formatTime(trip.arrivesAt)}
          {trip.overnight ? (
            <sup className="ms-0.5 text-2xs font-bold text-warning-fg">
              +1
              <VisuallyHidden> ertesi gün varış</VisuallyHidden>
            </sup>
          ) : null}
        </p>
        <p className="text-sm text-fg-muted" data-numeric>
          {formatDuration(trip.durationMin)}
        </p>
      </div>

      <p className="ms-auto font-display text-lg font-semibold text-fg" data-numeric>
        {formatPrice(trip.price)}
      </p>

      <div className="flex shrink-0 items-center gap-2">
        <Button asChild variant="ghost" size="md">
          <Link to={tripPath(trip.id)}>
            Detay
            <VisuallyHidden>{` — ${departure} ${operatorName} seferi`}</VisuallyHidden>
          </Link>
        </Button>
        <Button asChild variant="brand-outline" size="md">
          <Link to={seatPath(trip.id)}>
            Seç
            <VisuallyHidden>{` — ${departure} ${from.name} ${to.name} seferi, ${formatPrice(trip.price)}`}</VisuallyHidden>
          </Link>
        </Button>
      </div>
    </article>
  )
}

function RouteNotFound() {
  return (
    <div className="app-container section-y">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-5 text-center" role="alert">
        <span className="grid size-14 place-items-center rounded-full bg-surface-sunken text-fg-muted">
          <Bus className="size-7" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-balance-tr text-fg">
            Güzergâh bulunamadı
          </h1>
          <p className="text-sm text-balance-tr text-fg-secondary">
            Aradığınız kalkış ve varış şehri kataloğumuzda eşleşmedi. Bağlantı eski ya da hatalı
            yazılmış olabilir.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild variant="primary" size="lg">
            <Link to="/">Ana sayfaya dönün</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link to="/populer-seferler">Popüler seferler</Link>
          </Button>
        </div>
        <Badge tone="neutral" size="md">
          Örnek bağlantı: /otobus-bileti/istanbul-ankara
        </Badge>
      </div>
    </div>
  )
}
