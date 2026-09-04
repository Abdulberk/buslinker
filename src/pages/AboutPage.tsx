import { useEffect } from 'react'
import { Link } from 'react-router'
import { Search } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Illustration } from '@/shared/ui/asset-icon'
import { IMAGE, VALUE_ICON } from '@/shared/config/assets'
import { CITIES, OPERATORS } from '@/shared/api/catalog'
import { pluralTr } from '@/shared/lib/tr'

interface Difference {
  readonly art: string
  readonly title: string
  readonly body: string
}

/**
 * Deliberately a different set of promises from the home page's value props:
 * these describe how the product is built, not what the ticket costs.
 */
const DIFFERENCES: readonly Difference[] = [
  {
    art: VALUE_ICON.bestPrice,
    title: 'Tek ekranda karşılaştırma',
    body: 'Firmayı, kalkış saatini, yolculuk süresini ve koltuk düzenini yan yana görürsünüz. Karar vermek için sekme değiştirmeniz gerekmez.',
  },
  {
    art: VALUE_ICON.comfortableTravel,
    title: 'Otobüsün kendi planı',
    body: 'Koltuk haritası, seferi yapan aracın kat ve sıra düzenine göre çizilir. Camın yanını ya da ön tarafı gözünüzle bakarak seçersiniz.',
  },
  {
    art: VALUE_ICON.easyRefund,
    title: 'Kuralları önden okursunuz',
    body: 'Tekli koltuk farkı, yan koltuktaki yolcunun cinsiyetinden doğan kısıtlar ve iptal süresi ödeme adımına gelmeden önce yazar.',
  },
  {
    art: VALUE_ICON.giftCards,
    title: 'Kampanya fiyata yansır',
    body: 'İndirim ve hediye çeki kampanyaları, ayrı bir kod ekranı beklemeden doğrudan listelenen tutarın içinde gösterilir.',
  },
]

interface Stat {
  readonly value: string
  readonly label: string
  readonly note: string
  /** Illustrative figures are badged so they are never read as a claim. */
  readonly illustrative: boolean
}

const STATS: readonly Stat[] = [
  {
    value: pluralTr(CITIES.length, 'şehir'),
    label: 'Arama yapabileceğiniz şehir',
    note: 'Uygulamanın şehir kataloğundan sayılır.',
    illustrative: false,
  },
  {
    value: pluralTr(OPERATORS.length, 'firma'),
    label: 'Listelenen otobüs firması',
    note: 'Logosu ve puanı tanımlı firmalar.',
    illustrative: false,
  },
  {
    value: '90 saniye',
    label: 'Aramadan koltuğa ortalama süre',
    note: 'Akışın hedeflediği süre; ölçülmüş bir değer değildir.',
    illustrative: true,
  },
  {
    value: '4 koltuk',
    label: 'Tek işlemde seçilebilen koltuk',
    note: 'Sektörde yaygın olan üst sınır esas alınmıştır.',
    illustrative: true,
  },
]

export default function AboutPage() {
  useEffect(() => {
    document.title = 'Hakkımızda | BusLinker'
  }, [])

  return (
    <>
      <PageHeader
        title="Hakkımızda"
        lead="BusLinker, şehirlerarası otobüs biletini aramaktan koltuğu seçmeye kadar tek bir akışta toplayan bir arayüz tasarımı çalışmasıdır."
        breadcrumbs={[{ label: 'Ana sayfa', to: '/' }]}
      />

      <div className="app-container section-y">
        <section
          aria-labelledby="hikaye-baslik"
          className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
        >
          <div className="min-w-0">
            <Badge tone="brand" size="md">
              Ürün tanıtımı
            </Badge>
            <h2 id="hikaye-baslik" className="mt-4 text-2xl text-balance-tr sm:text-3xl">
              Bilet almak, yolculuğun en kolay adımı olmalı
            </h2>
            <p className="mt-4 text-base text-fg-secondary">
              Otobüs bileti alırken en çok vakit kaybettiren şey, seferi bulmak değil; aynı seferi
              farklı ekranlarda tekrar tekrar aramaktır. Fiyat bir yerde, koltuk planı başka bir
              yerde, iptal koşulu ise çoğu zaman ödeme adımının hemen öncesinde ortaya çıkar.
            </p>
            <p className="mt-3 text-base text-fg-secondary">
              BusLinker bu üç bilgiyi aynı ekrana taşır. Arama sonucunda gördüğünüz kartın üzerinde
              kalkış saati, süre, koltuk düzeni ve donanımlar birlikte durur; koltuk adımında ise
              otobüsün gerçek planı üzerinde ilerlersiniz.
            </p>
            <p className="mt-3 text-base text-fg-muted">
              Bu sürüm bir tanıtım uygulamasıdır: seferler örnek verilerle üretilir ve hiçbir bilet
              gerçekten satılmaz.
            </p>
          </div>

          <div className="order-first flex justify-center lg:order-none">
            <Illustration
              src={IMAGE.coach.src}
              alt="Kırmızı BusLinker otobüsünün yandan görünümü"
              width={IMAGE.coach.width}
              height={IMAGE.coach.height}
              priority
              className="h-auto w-full max-w-md"
            />
          </div>
        </section>
      </div>

      <div className="border-y border-border bg-bg-alt">
        <div className="app-container section-y">
          <section aria-labelledby="fark-baslik">
            <h2 id="fark-baslik" className="text-2xl text-balance-tr sm:text-3xl">
              Neyi farklı yapıyoruz
            </h2>
            <p className="mt-2 max-w-prose text-base text-fg-secondary">
              Dört tasarım kararı, akışın geri kalanını belirliyor.
            </p>

            <ul className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2">
              {DIFFERENCES.map((item) => (
                <li
                  key={item.title}
                  className="flex h-full gap-4 rounded-xl border border-border bg-surface p-5"
                >
                  <Illustration
                    src={item.art}
                    alt=""
                    width={80}
                    height={80}
                    className="size-12 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-base">{item.title}</h3>
                    <p className="mt-1.5 text-sm text-fg-secondary">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="app-container section-y">
        <section aria-labelledby="rakam-baslik">
          <h2 id="rakam-baslik" className="text-2xl text-balance-tr sm:text-3xl">
            Rakamlarla BusLinker
          </h2>
          <p className="mt-2 max-w-prose text-base text-fg-secondary">
            İlk iki değer uygulamanın kendi kataloğundan gelir. “Temsilî” etiketli değerler ise
            tanıtım amacıyla yazılmış örnek rakamlardır, ölçüme dayanmaz.
          </p>

          <dl className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-surface p-5">
                <dt className="text-sm font-medium text-fg-secondary">{stat.label}</dt>
                <dd className="mt-2">
                  <p className="font-display text-3xl font-semibold text-fg tabular-nums">
                    {stat.value}
                  </p>
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
                    {stat.illustrative ? <Badge tone="warning">Temsilî</Badge> : null}
                    <span>{stat.note}</span>
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          aria-labelledby="cta-baslik"
          className="mt-12 rounded-2xl border border-brand/25 bg-brand/8 p-6 sm:mt-16 sm:p-10"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-prose">
              <h2 id="cta-baslik" className="text-xl text-balance-tr sm:text-2xl">
                Anlatmak yerine deneyin
              </h2>
              <p className="mt-2 text-base text-fg-secondary">
                Kalkış ve varış şehrini seçip tarihi girin; sefer listesinden koltuk planına kadar
                akışın tamamını birkaç adımda görebilirsiniz.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:shrink-0">
              <Button variant="primary" size="lg" asChild>
                <Link to="/">
                  <Search className="size-4" aria-hidden="true" />
                  Sefer arayın
                </Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link to="/sss">Sık sorulan sorular</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
