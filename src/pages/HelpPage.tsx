import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowRight, CalendarDays, Mail, Ticket, XCircle } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardBody } from '@/shared/ui/card'
import { AssetIcon, Illustration } from '@/shared/ui/asset-icon'
import { ICON, VALUE_ICON } from '@/shared/config/assets'

interface Topic {
  readonly art: string
  readonly title: string
  readonly body: string
  readonly to: string
  readonly linkLabel: string
  readonly note?: string
}

const TOPICS: readonly Topic[] = [
  {
    art: VALUE_ICON.bestPrice,
    title: 'Bilet alma',
    body: 'Sefer arama, sıralama, filtreler ve bilet alırken sorulan bilgiler.',
    to: '/sss',
    linkLabel: 'Sık sorulan sorulara gidin',
  },
  {
    art: VALUE_ICON.easyRefund,
    title: 'İptal ve iade',
    body: 'Hangi biletler iptal edilebilir, kesinti nasıl hesaplanır, iade ne zaman yansır.',
    to: '/bilet-iptal',
    linkLabel: 'Bilet iptal sayfasına gidin',
  },
  {
    art: VALUE_ICON.comfortableTravel,
    title: 'Koltuk seçimi',
    body: '2+1 ve 2+2 düzenler, cinsiyet kuralı ve kapalı görünen koltukların nedeni.',
    to: '/sss',
    linkLabel: 'Koltuk sorularını okuyun',
  },
  {
    art: VALUE_ICON.securePayment,
    title: 'Ödeme',
    body: 'Ödeme adımının nasıl işlediğini anlatıyoruz; bu sürümde ödeme alınmaz.',
    to: '/sss',
    linkLabel: 'Ödeme sorularını okuyun',
    note: 'Yakında',
  },
  {
    art: VALUE_ICON.giftCards,
    title: 'Hesap işlemleri',
    body: 'Üyelik, bilgilerinizi güncelleme, kayıtlı yolcular ve bilet geçmişiniz.',
    to: '/hesabim',
    linkLabel: 'Hesabınıza gidin',
  },
  {
    art: VALUE_ICON.noFees,
    title: 'Otobüs firmaları',
    body: 'Firmaların koltuk düzenleri, sundukları hizmetler ve hangi hatlarda sefer yaptıkları.',
    to: '/otobus-firmalari',
    linkLabel: 'Firmaları inceleyin',
  },
]

interface QuickAction {
  readonly Icon: typeof Ticket
  readonly label: string
  readonly description: string
  readonly to: string
}

const QUICK_ACTIONS: readonly QuickAction[] = [
  {
    Icon: Ticket,
    label: 'Bilet sorgulayın',
    description: 'PNR kodunuz ve soyadınızla biletinizi görüntüleyin.',
    to: '/bilet-sorgula',
  },
  {
    Icon: XCircle,
    label: 'Bilet iptal edin',
    description: 'İptal koşullarını görün, iade tutarını hesaplatın.',
    to: '/bilet-iptal',
  },
  {
    Icon: CalendarDays,
    label: 'Seferlerinizi görün',
    description: 'Yaklaşan ve geçmiş biletleriniz hesabınızda listelenir.',
    to: '/hesabim/seferlerim',
  },
]

export default function HelpPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  useEffect(() => {
    document.title = 'Yardım Merkezi | BusLinker'
  }, [])

  // The live filter lives on the FAQ page, so this field is a signpost to it
  // rather than a second search implementation.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void navigate('/sss')
  }

  return (
    <>
      <PageHeader
        title="Yardım Merkezi"
        lead="Bilet alma, iptal, koltuk seçimi ve hesap işlemleriyle ilgili aradığınız yanıta buradan ulaşabilirsiniz."
        breadcrumbs={[{ label: 'Ana sayfa', to: '/' }]}
      />

      <div className="app-container section-y">
        <section aria-labelledby="yardim-arama-baslik" className="max-w-2xl">
          <h2 id="yardim-arama-baslik" className="text-xl sm:text-2xl">
            Sık sorulan sorularda arayın
          </h2>
          <form role="search" onSubmit={handleSubmit} className="mt-4">
            <label htmlFor="yardim-arama" className="text-sm font-medium text-fg-secondary">
              Aradığınız konuyu yazın
            </label>
            <div className="mt-1.5 flex flex-col gap-3 xs:flex-row">
              <div className="flex min-w-0 flex-1 items-center rounded-lg border border-border-strong bg-surface transition-colors duration-(--duration-fast) focus-within:border-brand">
                <span className="pointer-events-none pl-3 text-fg-muted">
                  <AssetIcon src={ICON.magnify} className="size-4" />
                </span>
                <input
                  id="yardim-arama"
                  name="yardim-arama"
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value)
                  }}
                  placeholder="Örn. iptal, koltuk, PNR"
                  aria-describedby="yardim-arama-aciklama"
                  className="h-11 w-full min-w-0 rounded-lg bg-transparent px-3 text-base text-fg placeholder:text-fg-subtle"
                />
              </div>
              <Button type="submit" size="md" className="shrink-0">
                Yanıtları görün
              </Button>
            </div>
            <p id="yardim-arama-aciklama" className="mt-2 text-sm text-fg-muted">
              Gönderdiğinizde sık sorulan sorular sayfasına geçersiniz; aramanızı oradaki canlı
              filtreyle sürdürebilirsiniz.
            </p>
          </form>
        </section>

        <section aria-labelledby="yardim-konulari-baslik" className="mt-12 sm:mt-14">
          <h2 id="yardim-konulari-baslik" className="text-xl sm:text-2xl">
            Yardım konuları
          </h2>
          <p className="mt-2 max-w-prose text-base text-fg-secondary">
            En çok başvurulan altı başlık. Her biri sizi doğrudan ilgili sayfaya götürür.
          </p>

          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOPICS.map((topic) => (
              <li key={topic.title}>
                <Link
                  to={topic.to}
                  className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-5 transition-[border-color,box-shadow,translate] duration-(--duration-base) ease-standard hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
                >
                  {/* These illustrations carry their own two-tone palette, so
                      they are images rather than masked icons. */}
                  <Illustration src={topic.art} alt="" width={80} height={80} className="size-12" />
                  <div className="min-w-0">
                    <h3 className="flex flex-wrap items-center gap-2 font-display text-base font-semibold text-fg">
                      {topic.title}
                      {topic.note ? (
                        <Badge tone="neutral" size="sm">
                          {topic.note}
                        </Badge>
                      ) : null}
                    </h3>
                    <p className="mt-1.5 text-sm text-fg-secondary">{topic.body}</p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-brand-fg">
                    {topic.linkLabel}
                    <ArrowRight
                      className="size-4 transition-transform duration-(--duration-fast) ease-out group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="hizli-islemler-baslik" className="mt-12 sm:mt-14">
          <h2 id="hizli-islemler-baslik" className="text-xl sm:text-2xl">
            Hızlı işlemler
          </h2>
          <p className="mt-2 max-w-prose text-base text-fg-secondary">
            Yanıt aramak yerine doğrudan işlem yapmak isterseniz üç adımın tamamı buradan başlar.
          </p>

          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {QUICK_ACTIONS.map(({ Icon, label, description, to }) => (
              <li
                key={to}
                className="flex h-full flex-col rounded-xl border border-border bg-surface-sunken p-5"
              >
                <span className="grid size-10 place-items-center rounded-full bg-brand/10 text-brand-fg">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-3 font-display text-base font-semibold text-fg">{label}</h3>
                <p className="mt-1.5 text-sm text-fg-secondary">{description}</p>
                <Button variant="brand-outline" full asChild className="mt-4">
                  <Link to={to}>{label}</Link>
                </Button>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="yardim-iletisim-baslik" className="mt-12 sm:mt-14">
          <Card>
            <CardBody className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2
                  id="yardim-iletisim-baslik"
                  className="flex items-center gap-2 font-display text-lg font-semibold text-fg"
                >
                  <Mail className="size-4 shrink-0 text-brand-fg" aria-hidden="true" />
                  Aradığınızı bulamadınız mı?
                </h2>
                <p className="mt-2 max-w-prose text-sm text-fg-secondary">
                  Sorunuz bu başlıkların dışındaysa bize yazın. İletişim formunda konu seçtiğinizde
                  mesajınız doğru ekibe yönlendirilir. BusLinker bir tanıtım uygulamasıdır; formlar
                  arayüzü göstermek içindir ve hiçbir kişisel veri saklanmaz.
                </p>
              </div>
              <Button variant="brand-outline" size="lg" asChild className="shrink-0">
                <Link to="/iletisim">Bize yazın</Link>
              </Button>
            </CardBody>
          </Card>
        </section>
      </div>
    </>
  )
}
