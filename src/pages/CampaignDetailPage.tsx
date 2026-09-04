import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { toast } from 'sonner'
import { ArrowRight, CalendarClock, Copy, TicketPercent } from 'lucide-react'
import { PageHeader, Prose } from '@/shared/ui/page-header'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { CAMPAIGN_GRADIENT, CAMPAIGNS, type Campaign } from '@/shared/config/campaigns'
import { campaignPath } from '@/shared/lib/search-params'
import { formatDateLong, formatDateMedium } from '@/shared/lib/tr'

/** Ink for each tone's motif — low contrast, because it is texture not content. */
/**
 * Campaign terms, written per offer rather than shared, because a blanket
 * paragraph is exactly what makes conditions unreadable.
 */
const TERMS: Record<string, readonly string[]> = {
  'ilk-bilet': [
    'İndirim yalnızca BusLinker hesabınızla yaptığınız ilk bilet alımında bir kez kullanılabilir.',
    'İndirim tutarı bilet bedelinden düşülür; bilet bedeli indirim tutarının altındaysa kalan kısım bir sonraki alışverişe aktarılmaz.',
    'Kampanya, aynı işlemde en fazla iki koltuk için geçerlidir.',
    'İptal edilen biletlerde iade, indirim düşüldükten sonra ödenen tutar üzerinden yapılır.',
    'Bir hesabın kapatılıp yeniden açılması yeni üyelik sayılmaz; indirim tekrar tanımlanmaz.',
    'Kampanya diğer indirim kodlarıyla birlikte kullanılamaz.',
  ],
  'hafta-sonu': [
    'İndirim yalnızca cuma ve cumartesi günü kalkışlı seçili seferlerde geçerlidir; biletin alındığı gün fark etmez.',
    'Kampanyaya dâhil sefer sayısı sınırlıdır ve kontenjan dolduğunda kod çalışmaz.',
    'İndirim, sefer bedeline uygulanır; hizmet bedeli varsa indirim dışında tutulur.',
    'Sefer saatinin değişmesi hâlinde indirim, yeni saatte de geçerli kalır.',
    'Tarih değişikliği yapılan biletlerde indirim yeni tarihe taşınmaz.',
    'Kampanya, aynı işlemde en fazla dört koltuk için uygulanır.',
  ],
  ogrenci: [
    'İndirimden yararlanmak için öğrenci belgenizin geçerli olması ve hesabınızda doğrulanmış görünmesi gerekir.',
    'Doğrulama bir kez yapılır ve öğrencilik durumunuz sürdüğü sürece geçerlidir.',
    'İndirim, bilet sahibi ile doğrulanan öğrencinin aynı kişi olduğu biletlerde uygulanır.',
    'Yolculuk sırasında öğrenci kimliğinizin yanınızda bulunması istenebilir.',
    'İndirim oranı seferi işleten firmanın kurallarına göre değişebilir.',
    'Kampanya, öğrenci bileti dışındaki indirimli tarifelerle birleştirilemez.',
  ],
  'erken-rezervasyon': [
    'İade, kalkış tarihinden en az 30 gün önce alınan biletlerde uygulanır.',
    'Tutar bilet bedelinden düşülmez; satın alma tamamlandıktan sonra cüzdanınıza tanımlanır.',
    'Cüzdana aktarılan tutar yalnızca yeni bilet alımlarında kullanılır, nakde çevrilmez.',
    'Bilet iptal edilirse cüzdana aktarılan tutar geri alınır.',
    'Kampanya, bir takvim ayında en fazla iki bilet için geçerlidir.',
    'Tarihi öne alınan biletlerde 30 günlük koşul yeniden değerlendirilir.',
  ],
  uygulama: [
    'İndirim yalnızca BusLinker mobil uygulaması üzerinden tamamlanan ilk bilet alımında geçerlidir.',
    'Aynı hesap, aynı telefon numarası ve aynı cihaz için kampanya bir kez uygulanır.',
    'İndirim, web sitesi üzerinden yapılan alımlarda tanımlanmaz.',
    'Kod, ödeme adımında kampanya alanına yazıldığında tutardan düşülür.',
    'İptal edilen biletlerde kod yeniden kullanılabilir hâle gelmez.',
    'Kampanya, uygulama üzerinden sunulan diğer kampanyalarla birleştirilemez.',
  ],
}

const FALLBACK_TERMS: readonly string[] = [
  'Kampanya, geçerlilik süresi içinde ve kontenjan sürdüğü müddetçe uygulanır.',
  'İndirim yalnızca sefer bedeline uygulanır ve diğer kampanyalarla birleştirilemez.',
  'İptal edilen biletlerde iade, ödenen tutar üzerinden yapılır.',
  'BusLinker, kampanyayı önceden duyurarak sonlandırma hakkını saklı tutar.',
  'Koşullarda belirtilmeyen durumlarda seferi işleten firmanın kuralları geçerlidir.',
]

function stepsFor(campaign: Campaign): readonly string[] {
  return campaign.code
    ? [
        'Kalkış, varış ve tarih seçerek uygun seferi bulun ve koltuğunuzu seçin.',
        `Ödeme adımındaki kampanya alanına ${campaign.code} kodunu yazın.`,
        'İndirimin toplam tutara işlendiğini görün ve alımı tamamlayın.',
      ]
    : [
        'BusLinker hesabınıza giriş yapın ve kampanyanın istediği bilgiyi bir kez doğrulayın.',
        'Kalkış, varış ve tarih seçerek uygun seferi bulun ve koltuğunuzu seçin.',
        'İndirimin ödeme özetine kendiliğinden işlendiğini görün ve alımı tamamlayın.',
      ]
}

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const campaign = CAMPAIGNS.find((item) => item.id === id)

  useEffect(() => {
    document.title = `${campaign ? campaign.title : 'Kampanya bulunamadı'} | BusLinker`
  }, [campaign])

  if (!campaign) return <CampaignNotFound />

  return <CampaignDetail campaign={campaign} />
}

function CampaignDetail({ campaign }: { campaign: Campaign }) {
  const terms = TERMS[campaign.id] ?? FALLBACK_TERMS
  const steps = stepsFor(campaign)
  const others = CAMPAIGNS.filter((item) => item.id !== campaign.id)
  const code = campaign.code

  const handleCopy = async (code: string) => {
    // A page served without a secure context has no clipboard at all, so the
    // capability is checked rather than assumed and the failure is honest.
    if (typeof navigator.clipboard?.writeText !== 'function') {
      toast.error('Kampanya kodu kopyalanamadı.', {
        description: 'Tarayıcınız kopyalamayı desteklemiyor. Kodu elle not alabilirsiniz.',
      })
      return
    }
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Kampanya kodu kopyalandı.')
    } catch {
      toast.error('Kampanya kodu kopyalanamadı.', {
        description: 'Kodu elle not alabilirsiniz.',
      })
    }
  }

  return (
    <>
      <PageHeader
        title={campaign.title}
        lead={campaign.body}
        breadcrumbs={[
          { label: 'Ana sayfa', to: '/' },
          { label: 'Kampanyalar', to: '/#kampanyalar' },
        ]}
      />

      <div className="app-container section-y">
        {/* The artwork already carries the audience chip and the headline, so
            the hero is the image alone. The code stays real UI below it: it has
            to be copyable, and one that exists only in pixels is unusable. */}
        <img
          src={campaign.image}
          alt=""
          width={800}
          height={667}
          className="w-full max-w-lg rounded-2xl border border-border object-cover"
        />

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {code ? (
            <>
              <span className="rounded-lg border border-dashed border-fg-muted/50 bg-surface/85 px-3 py-2 font-display text-base font-semibold tracking-wider text-fg backdrop-blur-sm">
                {code}
                <span className="sr-only"> indirim kodu</span>
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="tap-44"
                onClick={() => {
                  void handleCopy(code)
                }}
              >
                <Copy className="size-4" aria-hidden="true" />
                Kopyala
                <span className="sr-only"> — {code} kodunu panoya kopyalar</span>
              </Button>
            </>
          ) : (
            <span className="rounded-lg border border-border bg-surface/85 px-3 py-2 text-sm text-fg-secondary backdrop-blur-sm">
              Bu kampanyada koda gerek yoktur; indirim koşulları sağlandığında kendiliğinden
              uygulanır.
            </span>
          )}
        </div>

        <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-fg-muted">
          <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
          <span>
            Kampanya <span data-numeric>{formatDateLong(campaign.validUntil)}</span> tarihine kadar
            geçerlidir.
          </span>
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <div className="min-w-0">
            <section aria-labelledby="nasil-yararlanirim-baslik">
              <h2 id="nasil-yararlanirim-baslik" className="text-xl sm:text-2xl">
                Nasıl yararlanırım?
              </h2>
              <ol className="mt-4 flex max-w-prose flex-col gap-4">
                {steps.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span
                      className="grid size-7 shrink-0 place-items-center rounded-full bg-brand/10 text-sm font-semibold text-brand-fg tabular-nums"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0 pt-0.5 text-base text-fg-secondary">{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="kampanya-kosullari-baslik" className="mt-12">
              <h2 id="kampanya-kosullari-baslik" className="text-xl sm:text-2xl">
                Kampanya koşulları
              </h2>
              <Prose className="mt-4">
                <p>
                  Aşağıdaki koşullar bu kampanyaya özeldir ve{' '}
                  <strong>{formatDateLong(campaign.validUntil)}</strong> tarihine kadar geçerlidir.
                  Koşullarda yer almayan durumlarda seferi işleten firmanın kuralları uygulanır.
                </p>
                <ul>
                  {terms.map((term) => (
                    <li key={term.slice(0, 40)}>{term}</li>
                  ))}
                </ul>
                <p>
                  BusLinker bir tanıtım uygulamasıdır; bu sayfadaki kampanya, koşullar ve tutarlar
                  örnek içeriklerdir ve gerçek bir satış taahhüdü oluşturmaz. Ayrıntılı bilgi için{' '}
                  <Link to="/sss">sık sorulan sorular</Link> sayfasına bakabilir ya da{' '}
                  <Link to="/iletisim">bize yazabilirsiniz</Link>.
                </p>
              </Prose>
            </section>
          </div>

          <aside
            aria-labelledby="kampanya-cta-baslik"
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="rounded-2xl border border-border bg-surface-sunken p-5 sm:p-6">
              <h2
                id="kampanya-cta-baslik"
                className="flex items-center gap-2 font-display text-base font-semibold text-fg"
              >
                <TicketPercent className="size-4 shrink-0 text-brand-fg" aria-hidden="true" />
                Kampanyayı kullanın
              </h2>
              <p className="mt-2 text-sm text-fg-secondary">
                {campaign.code
                  ? 'Kodu kopyalayın, uygun seferi seçin ve ödeme adımında kampanya alanına yapıştırın.'
                  : 'Uygun seferi seçin; koşulları sağlıyorsanız indirim ödeme özetinde görünür.'}
              </p>
              <div className="mt-5">
                <CampaignCta campaign={campaign} />
              </div>
              <p className="mt-3 text-xs text-fg-muted">
                Son geçerlilik: <span data-numeric>{formatDateMedium(campaign.validUntil)}</span>
              </p>
            </div>
          </aside>
        </div>

        {others.length > 0 ? (
          <section aria-labelledby="diger-kampanyalar-baslik" className="mt-14 sm:mt-16">
            <h2 id="diger-kampanyalar-baslik" className="text-xl sm:text-2xl">
              Diğer kampanyalar
            </h2>
            <ul className="mt-4 grid gap-4 sm:mt-6 sm:grid-cols-2 lg:grid-cols-4">
              {others.map((item) => (
                <li key={item.id}>
                  <CompactCampaignCard campaign={item} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </>
  )
}

/**
 * `href` is a slide field, so it may be an internal route, an outside address
 * or the placeholder `#` used by the offers that have no destination yet —
 * each of which needs a different element to stay honest.
 */
function CampaignCta({ campaign }: { campaign: Campaign }) {
  if (campaign.href === '#') {
    return (
      <Button
        type="button"
        variant="primary"
        size="lg"
        full
        onClick={() => {
          toast.info('Bu kampanya sayfası tanıtım sürümünde henüz açılmadı.', {
            description: 'Arayüzü görmek için kampanya koşullarını inceleyebilirsiniz.',
          })
        }}
      >
        {campaign.cta}
      </Button>
    )
  }

  if (campaign.href.startsWith('/')) {
    return (
      <Button variant="primary" size="lg" full asChild>
        <Link to={campaign.href}>
          {campaign.cta}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </Button>
    )
  }

  return (
    <Button variant="primary" size="lg" full asChild>
      <a href={campaign.href}>
        {campaign.cta}
        <ArrowRight className="size-4" aria-hidden="true" />
      </a>
    </Button>
  )
}

function CompactCampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <Link
      to={campaignPath(campaign.id)}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-[border-color,box-shadow,translate] duration-(--duration-base) ease-standard hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
    >
      <div
        className="h-16"
        style={{ background: CAMPAIGN_GRADIENT[campaign.tone] }}
        aria-hidden="true"
      />
      <div className="flex flex-1 flex-col p-4">
        <Badge tone="neutral" size="sm" className="self-start">
          {campaign.badge}
        </Badge>
        <h3 className="mt-2.5 font-display text-base font-bold text-balance-tr text-fg">
          {campaign.title}
        </h3>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-4 text-xs text-fg-muted">
          <span data-numeric>{formatDateMedium(campaign.validUntil)}&apos;e kadar</span>
          <span className="inline-flex items-center gap-1 font-medium text-brand-fg">
            İnceleyin
            <ArrowRight
              className="size-3.5 transition-transform duration-(--duration-fast) ease-out group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </div>
    </Link>
  )
}

function CampaignNotFound() {
  return (
    <div className="app-container section-y">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-5 text-center" role="alert">
        <span className="grid size-14 place-items-center rounded-full bg-surface-sunken text-fg-muted">
          <TicketPercent className="size-7" aria-hidden="true" />
        </span>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-balance-tr text-fg">
            Kampanya bulunamadı
          </h1>
          <p className="text-sm text-balance-tr text-fg-secondary">
            Aradığınız kampanya sona ermiş ya da bağlantı hatalı yazılmış olabilir. Güncel
            kampanyaların tamamını ana sayfada görebilirsiniz.
          </p>
        </div>
        <Button asChild variant="primary" size="lg">
          <Link to="/#kampanyalar">Güncel kampanyaları görün</Link>
        </Button>
      </div>
    </div>
  )
}
