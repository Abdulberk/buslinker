import { useEffect, useMemo } from 'react'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { OperatorLogo } from '@/shared/ui/operator-logo'
import { CITIES, OPERATORS, POPULAR_ROUTES, cityBySlug } from '@/shared/api/catalog'
import { cityPath, routePath } from '@/shared/lib/search-params'
import { compareTr, pluralTr } from '@/shared/lib/tr'

interface Entry {
  readonly to: string
  readonly label: string
  readonly note?: string
}

interface Group {
  readonly id: string
  readonly title: string
  readonly entries: readonly Entry[]
}

const GROUPS: readonly Group[] = [
  {
    id: 'ana',
    title: 'Ana sayfalar',
    entries: [
      { to: '/', label: 'Ana sayfa', note: 'Sefer arama' },
      { to: '/giris', label: 'Giriş yapın' },
      { to: '/kayit', label: 'Üye olun' },
      { to: '/site-haritasi', label: 'Site haritası' },
    ],
  },
  {
    id: 'bilet',
    title: 'Bilet işlemleri',
    entries: [
      { to: '/bilet-sorgula', label: 'Bilet sorgulayın', note: 'PNR ve soyad ile' },
      { to: '/bilet-iptal', label: 'Bilet iptal edin' },
      { to: '/hediye-kart', label: 'Hediye kart' },
    ],
  },
  {
    id: 'hesap',
    title: 'Hesabım',
    entries: [
      { to: '/hesabim', label: 'Hesap özeti' },
      { to: '/hesabim/seferlerim', label: 'Seferlerim' },
      { to: '/hesabim/bilgilerim', label: 'Bilgilerim' },
      { to: '/hesabim/kayitli-yolcular', label: 'Kayıtlı yolcular' },
    ],
  },
  {
    id: 'kesfet',
    title: 'Keşfet',
    entries: [
      { to: '/otobus-firmalari', label: 'Otobüs firmaları' },
      { to: '/terminaller', label: 'Terminaller' },
      { to: '/populer-seferler', label: 'Popüler seferler' },
      { to: '/blog', label: 'Blog' },
    ],
  },
  {
    id: 'kurumsal',
    title: 'Kurumsal',
    entries: [
      { to: '/hakkimizda', label: 'Hakkımızda' },
      { to: '/iletisim', label: 'İletişim' },
      { to: '/sss', label: 'Sık sorulan sorular' },
      { to: '/yardim', label: 'Yardım merkezi' },
      { to: '/kariyer', label: 'Kariyer' },
      { to: '/basinda-biz', label: 'Basında biz' },
      { to: '/firma-girisi', label: 'Firma iş birliği' },
      { to: '/erisilebilirlik', label: 'Erişilebilirlik' },
    ],
  },
  {
    id: 'yasal',
    title: 'Yasal',
    entries: [
      { to: '/kvkk', label: 'KVKK aydınlatma metni' },
      { to: '/gizlilik-politikasi', label: 'Gizlilik politikası' },
      { to: '/kullanim-kosullari', label: 'Kullanım koşulları' },
      { to: '/cerez-politikasi', label: 'Çerez politikası' },
    ],
  },
]

export default function SitemapPage() {
  useEffect(() => {
    document.title = 'Site Haritası | BusLinker'
  }, [])

  const routes = useMemo(
    () =>
      POPULAR_ROUTES.flatMap(({ from, to }) => {
        const origin = cityBySlug(from)
        const destination = cityBySlug(to)
        if (!origin || !destination) return []
        return [{ from: origin, to: destination }]
      }),
    [],
  )

  // Sorted with the Turkish collator, so Ç, Ğ, İ, Ö, Ş and Ü land where a
  // Turkish reader expects rather than after Z.
  const cities = useMemo(() => [...CITIES].sort((a, b) => compareTr(a.name, b.name)), [])

  const pageCount = GROUPS.reduce((total, group) => total + group.entries.length, 0)

  return (
    <>
      <PageHeader
        title="Site Haritası"
        lead="BusLinker'daki bütün sayfalar tek listede. Aradığınız sayfaya buradan doğrudan geçebilirsiniz."
        breadcrumbs={[{ label: 'Ana sayfa', to: '/' }]}
      />

      <div className="app-container section-y">
        <p className="max-w-prose text-sm text-fg-muted">
          {pluralTr(pageCount, 'sayfa')}, {pluralTr(routes.length, 'popüler güzergâh')} ve{' '}
          {pluralTr(cities.length, 'şehir')} sayfası listeleniyor.
        </p>

        <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {GROUPS.map((group) => (
            <section key={group.id} aria-labelledby={`harita-${group.id}`} className="min-w-0">
              <h2 id={`harita-${group.id}`} className="text-base">
                {group.title}
              </h2>
              <ul className="mt-3 flex flex-col border-t border-border">
                {group.entries.map((entry) => (
                  <li key={entry.to} className="border-b border-border">
                    <Link
                      to={entry.to}
                      className="flex min-h-11 flex-col justify-center gap-0.5 py-2 text-sm font-medium text-fg-secondary underline-offset-4 transition-colors duration-(--duration-fast) hover:text-brand-fg hover:underline"
                    >
                      {entry.label}
                      {entry.note ? (
                        <span className="text-xs font-normal text-fg-muted no-underline">
                          {entry.note}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <div className="border-y border-border bg-bg-alt">
        <div className="app-container section-y">
          <section aria-labelledby="guzergah-baslik">
            <h2 id="guzergah-baslik" className="text-2xl text-balance-tr sm:text-3xl">
              Popüler güzergâhlar
            </h2>
            <p className="mt-2 max-w-prose text-base text-fg-secondary">
              Her güzergâhın kendi sayfası vardır; sefer saatlerini, ortalama süreyi ve fiyat
              aralığını orada bulursunuz.
            </p>

            <ul className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
              {routes.map((route) => (
                <li key={`${route.from.slug}-${route.to.slug}`}>
                  <Link
                    to={routePath(route.from.slug, route.to.slug)}
                    className="group flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-fg transition-[border-color,box-shadow] duration-(--duration-base) ease-standard hover:border-brand/40 hover:shadow-sm"
                  >
                    <span className="truncate">{route.from.name}</span>
                    <ArrowRight
                      className="size-4 shrink-0 text-fg-subtle transition-colors duration-(--duration-fast) group-hover:text-brand-fg"
                      aria-hidden="true"
                    />
                    <span className="truncate">{route.to.name}</span>
                    <span className="sr-only"> otobüs bileti sayfası</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="sehir-baslik" className="mt-12 sm:mt-16">
            <h2 id="sehir-baslik" className="text-2xl text-balance-tr sm:text-3xl">
              Şehirler
            </h2>
            <p className="mt-2 max-w-prose text-base text-fg-secondary">
              Bir şehir sayfasında o şehrin terminalleri, en çok gidilen varış noktaları ve güncel
              sefer bilgileri yer alır.
            </p>

            <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-1 sm:mt-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {cities.map((city) => (
                <li key={city.slug}>
                  <Link
                    to={cityPath(city.slug)}
                    className="flex min-h-11 items-center text-sm font-medium text-fg-secondary underline-offset-4 transition-colors duration-(--duration-fast) hover:text-brand-fg hover:underline"
                  >
                    {city.name}
                    <span className="sr-only"> otobüs bileti sayfası</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="firma-baslik" className="mt-12 sm:mt-16">
            <h2 id="firma-baslik" className="text-2xl text-balance-tr sm:text-3xl">
              Otobüs firmaları
            </h2>
            <p className="mt-2 max-w-prose text-base text-fg-secondary">
              Her firmanın sayfasında yolcu puanı, koltuk düzeni ve sefer verdiği hatlar listelenir.
            </p>

            <ul className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
              {OPERATORS.map((operator) => (
                <li key={operator.id}>
                  <Link
                    to={`/otobus-firmalari/${operator.id}`}
                    className="flex min-h-11 items-center gap-3 rounded-lg border border-border bg-surface p-2.5 transition-[border-color,box-shadow] duration-(--duration-base) ease-standard hover:border-brand/40 hover:shadow-sm"
                  >
                    <OperatorLogo operatorId={operator.id} className="size-10" />
                    <span className="min-w-0 truncate text-sm font-medium text-fg">
                      {operator.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  )
}
