import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { Briefcase, MapPin, Send, Users } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Card, CardBody } from '@/shared/ui/card'
import { Illustration } from '@/shared/ui/asset-icon'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui/primitives'
import { VALUE_ICON } from '@/shared/config/assets'
import { pluralTr } from '@/shared/lib/tr'

interface CultureNote {
  readonly art: string
  readonly title: string
  readonly body: string
}

/**
 * Culture, not compensation: a demonstration product cannot promise a salary
 * band, a health plan or a stock grant, so nothing here is a benefit claim.
 */
const CULTURE: readonly CultureNote[] = [
  {
    art: VALUE_ICON.comfortableTravel,
    title: 'Ürünü kullanan ekip',
    body: 'Tasarım, mühendislik ve destek aynı akışı birlikte gezer. Bir ekranın nerede yorduğunu, onu kullanan kişiden önce ekip fark eder.',
  },
  {
    art: VALUE_ICON.bestPrice,
    title: 'Karar gerekçesiyle yazılır',
    body: 'Bir rengin, bir boşluğun ya da bir sorgunun neden öyle olduğunu kodun yanında okuyabilirsiniz. Tartışma kişilerle değil, gerekçelerle yapılır.',
  },
  {
    art: VALUE_ICON.securePayment,
    title: 'Erişilebilirlik sonradan eklenmez',
    body: 'Klavye ile kullanım, ekran okuyucu etiketleri ve kontrast, işin tanımının parçasıdır. Bir bileşen bunlar olmadan tamamlanmış sayılmaz.',
  },
  {
    art: VALUE_ICON.easyRefund,
    title: 'Küçük ekip, geniş sorumluluk',
    body: 'Aldığınız işin araştırmasını, tasarımını ve teslimini uçtan uca takip edersiniz. Devir teslim toplantısı yerine sahiplenme vardır.',
  },
]

interface Opening {
  readonly id: string
  readonly title: string
  readonly team: string
  readonly location: string
  readonly type: string
  readonly summary: string
  readonly duties: readonly string[]
}

const OPENINGS: readonly Opening[] = [
  {
    id: 'urun-tasarimcisi',
    title: 'Ürün Tasarımcısı',
    team: 'Tasarım',
    location: 'İstanbul / Hibrit',
    type: 'Tam zamanlı',
    summary:
      'Arama, sefer listesi ve koltuk seçimi akışlarını uçtan uca tasarlar; tasarım sistemindeki bileşenleri erişilebilirlik ölçütleriyle birlikte tanımlarsınız.',
    duties: [
      'Akışları düşük çözünürlükten yüksek çözünürlüğe taşımak ve kararları yazılı gerekçeyle bırakmak',
      'Tasarım belirteçlerini (renk, tipografi, boşluk) mühendislik ekibiyle birlikte güncel tutmak',
      'Kontrast, dokunma alanı ve klavye akışını tasarım aşamasında denetlemek',
    ],
  },
  {
    id: 'kidemli-frontend',
    title: 'Kıdemli Frontend Geliştirici',
    team: 'Mühendislik',
    location: 'Uzaktan',
    type: 'Tam zamanlı',
    summary:
      'React ve TypeScript ile arayüzü geliştirir, koltuk haritası gibi durum yönetimi ağır ekranların başarımını ve erişilebilirliğini birlikte gözetirsiniz.',
    duties: [
      'Bileşenleri tasarım sistemine bağlı kalarak yazmak ve testlerle korumak',
      'Klavye gezinmesi, odak yönetimi ve ekran okuyucu etiketlerini bileşenin parçası olarak kurmak',
      'Sayfa yüklenme ve etkileşim sürelerini ölçüp gerileme olduğunda geri almak',
    ],
  },
  {
    id: 'backend-gelistirici',
    title: 'Backend Geliştirici',
    team: 'Mühendislik',
    location: 'İstanbul / Hibrit',
    type: 'Tam zamanlı',
    summary:
      'Sefer arama, koltuk kilitleme ve bilet işlemleri için servisleri tasarlar; yoğun saatlerde tutarlılığı bozmadan yanıt süresini korursunuz.',
    duties: [
      'Arama ve koltuk servislerinin sözleşmelerini tanımlamak ve sürümlemek',
      'Eşzamanlı koltuk seçimlerinde yarış durumlarını önleyecek kilit stratejisini kurmak',
      'Hata ve gecikme ölçümlerini izlenebilir hâle getirmek',
    ],
  },
  {
    id: 'musteri-deneyimi',
    title: 'Müşteri Deneyimi Uzmanı',
    team: 'Destek',
    location: 'Uzaktan',
    type: 'Tam zamanlı',
    summary:
      'Yolculardan gelen bilet, iptal ve iade taleplerini yanıtlar; tekrar eden sorunları ürün ekibine somut örneklerle taşırsınız.',
    duties: [
      'Talepleri konu başlığına göre önceliklendirmek ve söz verilen sürede kapatmak',
      'Sık sorulan sorular içeriğini gelen taleplere göre güncel tutmak',
      'Aynı kökten gelen sorunları ürün ekibiyle birlikte kalıcı olarak çözmek',
    ],
  },
  {
    id: 'urun-analitigi-stajyeri',
    title: 'Ürün Analitiği Stajyeri',
    team: 'Büyüme',
    location: 'İstanbul / Hibrit',
    type: 'Staj',
    summary:
      'Arama ve satın alma akışındaki kopma noktalarını inceler, bulgularınızı tasarım ve mühendislik ekibinin kullanabileceği bir özete dönüştürürsünüz.',
    duties: [
      'Akış hunilerini kurmak ve düzenli olarak raporlamak',
      'Bir değişikliğin etkisini öncesi ve sonrasıyla karşılaştırmak',
      'Bulguları tek sayfalık, karar verilebilir bir özetle paylaşmak',
    ],
  },
]

export default function CareersPage() {
  const [open, setOpen] = useState('')

  useEffect(() => {
    document.title = 'Kariyer | BusLinker'
  }, [])

  const apply = (title: string) => {
    toast.info('Başvuru gönderimi bu tanıtım sürümünde etkin değil.', {
      description: `“${title}” ilanı örnek bir ilandır; hiçbir başvuru kaydedilmez.`,
    })
  }

  return (
    <>
      <PageHeader
        title="Kariyer"
        lead="BusLinker'ı geliştiren ekibin nasıl çalıştığını okuyun, örnek açık pozisyonlara göz atın."
        breadcrumbs={[{ label: 'Ana sayfa', to: '/' }]}
      />

      <div className="app-container section-y">
        <section aria-labelledby="neden-baslik">
          <h2 id="neden-baslik" className="text-2xl text-balance-tr sm:text-3xl">
            Neden BusLinker?
          </h2>
          <p className="mt-2 max-w-prose text-base text-fg-secondary">
            Aşağıdakiler bir yan hak listesi değil, ekibin gündelik çalışma biçimidir. Bir tanıtım
            ürünü olarak veremeyeceğimiz sözleri vermiyoruz.
          </p>

          <ul className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2">
            {CULTURE.map((item) => (
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

      <div className="border-y border-border bg-bg-alt">
        <div className="app-container section-y">
          <section aria-labelledby="pozisyon-baslik">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <div className="min-w-0">
                <h2 id="pozisyon-baslik" className="text-2xl text-balance-tr sm:text-3xl">
                  Açık pozisyonlar
                </h2>
                <p className="mt-2 max-w-prose text-base text-fg-secondary">
                  Bir başlığa dokunduğunuzda ilanın ayrıntısı açılır. İlgilendiğiniz pozisyonu
                  bulamazsanız bize yine de yazabilirsiniz.
                </p>
              </div>
              <p className="text-sm text-fg-muted">{pluralTr(OPENINGS.length, 'örnek ilan')}</p>
            </div>

            <Accordion asChild type="single" collapsible value={open} onValueChange={setOpen}>
              <ul className="mt-6 flex flex-col gap-3 sm:mt-8">
                {OPENINGS.map((opening) => (
                  <AccordionItem asChild key={opening.id} value={opening.id}>
                    <li className="rounded-xl border border-border bg-surface px-4 sm:px-5">
                      <AccordionTrigger className="py-4 text-base">
                        <span className="flex min-w-0 flex-col gap-2 pe-2">
                          <span className="font-display font-semibold text-balance-tr text-fg">
                            {opening.title}
                          </span>
                          <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-normal text-fg-muted">
                            <span className="inline-flex items-center gap-1.5">
                              <Users className="size-3.5 shrink-0" aria-hidden="true" />
                              {opening.team}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                              {opening.location}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Briefcase className="size-3.5 shrink-0" aria-hidden="true" />
                              {opening.type}
                            </span>
                          </span>
                        </span>
                      </AccordionTrigger>

                      <AccordionContent>
                        <div className="max-w-prose">
                          <p className="text-sm text-fg-secondary">{opening.summary}</p>
                          <h4 className="mt-4 text-sm font-semibold text-fg">
                            Bu rolde ne yaparsınız?
                          </h4>
                          <ul className="mt-2 flex flex-col gap-2 text-sm text-fg-secondary">
                            {opening.duties.map((duty) => (
                              <li key={duty} className="flex gap-2">
                                <span
                                  className="mt-2 size-1.5 shrink-0 rounded-full bg-brand/50"
                                  aria-hidden="true"
                                />
                                {duty}
                              </li>
                            ))}
                          </ul>
                          <Button
                            type="button"
                            variant="brand-outline"
                            className="mt-5"
                            onClick={() => {
                              apply(opening.title)
                            }}
                          >
                            <Send className="size-4" aria-hidden="true" />
                            Başvurun
                            <span className="sr-only">: {opening.title}</span>
                          </Button>
                        </div>
                      </AccordionContent>
                    </li>
                  </AccordionItem>
                ))}
              </ul>
            </Accordion>

            <p className="mt-6 flex flex-wrap items-center gap-2 text-sm text-fg-muted">
              <Badge tone="warning">Temsilî</Badge>
              <span>
                Yukarıdaki ilanlar bu tanıtım sürümü için yazılmış örneklerdir; açık bir işe alım
                sürecine karşılık gelmez.
              </span>
            </p>
          </section>
        </div>
      </div>

      <div className="app-container section-y">
        <Card>
          <CardBody className="flex flex-col gap-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-prose">
              <h2 className="text-xl text-balance-tr sm:text-2xl">Aradığınız pozisyon yok mu?</h2>
              <p className="mt-2 text-base text-fg-secondary">
                Ne yaptığınızı ve BusLinker'da neyi değiştirmek istediğinizi kısaca yazın. İletişim
                formundaki “Öneri” başlığı bu tür mesajlar için uygundur.
              </p>
            </div>
            <div className="lg:shrink-0">
              <Button variant="primary" size="lg" asChild>
                <Link to="/iletisim">Bize yazın</Link>
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  )
}
