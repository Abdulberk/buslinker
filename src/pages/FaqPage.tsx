import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { SearchX } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui/primitives'
import { AssetIcon } from '@/shared/ui/asset-icon'
import { ICON } from '@/shared/config/assets'
import { foldTr, pluralTr } from '@/shared/lib/tr'

interface Faq {
  readonly id: string
  readonly question: string
  readonly answer: string
}

interface FaqCategory {
  readonly id: string
  readonly title: string
  readonly items: readonly Faq[]
}

const CATEGORIES: readonly FaqCategory[] = [
  {
    id: 'bilet-alma',
    title: 'Bilet alma',
    items: [
      {
        id: 'bilet-1',
        question: 'Bilet almak için üye olmam gerekiyor mu?',
        answer:
          'Hayır. Kalkış, varış ve tarih seçip sefer listesine geçebilir, koltuğunuzu seçip ödeme adımına kadar üyeliksiz ilerleyebilirsiniz. Üyelik yalnızca biletlerinizi tek yerde görmek ve bilgilerinizi tekrar yazmamak için işe yarar.',
      },
      {
        id: 'bilet-2',
        question: 'Tek seferde en fazla kaç bilet alabilirim?',
        answer:
          'Bir işlemde en fazla dört koltuk seçebilirsiniz. Bu sınır sektörde yaygın olan üst sınırdır; daha kalabalık bir grup için aynı seferde ikinci bir işlem başlatmanız gerekir.',
      },
      {
        id: 'bilet-3',
        question: 'Arama sonuçlarını nasıl daraltabilirim?',
        answer:
          'Sonuç listesinin üzerindeki sıralama seçenekleriyle fiyata, kalkış saatine veya yolculuk süresine göre sıralayabilirsiniz. Filtreler bölümünden firma, kalkış saati aralığı, koltuk düzeni ve otobüs donanımlarını da işaretleyerek listeyi daraltabilirsiniz.',
      },
      {
        id: 'bilet-4',
        question: 'Gördüğüm sefer ve fiyatlar gerçek mi?',
        answer:
          'Hayır. BusLinker bir tanıtım uygulamasıdır; seferler, saatler, doluluklar ve fiyatlar örnek verilerle üretilir. Firma isimleri ve logoları arayüzü gerçekçi göstermek için kullanılır, gerçek bir sefer programını yansıtmaz.',
      },
      {
        id: 'bilet-5',
        question: 'Biletimi aldıktan sonra PNR numarasını nerede bulurum?',
        answer:
          'PNR numarası, ödeme adımı tamamlandıktan sonra bilet özetinde gösterilir. Bilet sorgulama ekranında bu numarayı yolcunun soyadıyla birlikte girerek biletinize ulaşabilirsiniz.',
      },
    ],
  },
  {
    id: 'iptal-iade',
    title: 'İptal ve iade',
    items: [
      {
        id: 'iptal-1',
        question: 'Biletimi hangi süreye kadar iptal edebilirim?',
        answer:
          'İptal süresi seferi işleten firmaya göre değişir. Uygun seferlerde kalkıştan on iki saat öncesine kadar iptal edebilirsiniz; kalkışa daha az süre kalan biletlerde iptal seçeneği kapanır.',
      },
      {
        id: 'iptal-2',
        question: 'İade ücreti hesabıma ne zaman geçer?',
        answer:
          'İade, ödemenin yapıldığı yönteme geri gönderilir. Talep onaylandıktan sonra tutarın hesabınıza yansıması bankanıza bağlı olarak birkaç iş günü sürebilir.',
      },
      {
        id: 'iptal-3',
        question: 'Bilet listemde bazı biletlerde iptal seçeneği neden yok?',
        answer:
          'Her bilet iade edilebilir değildir. Bilet ayrıntısında iade durumu ayrıca yazar; iade edilemeyen biletlerde iptal düğmesi hiç gösterilmez, böylece işlem yarıda kalmaz.',
      },
      {
        id: 'iptal-4',
        question: 'Tarihimi değiştirebilir miyim?',
        answer:
          'Tarih ve saat değişikliği, firmanın kurallarına ve koltuk durumuna bağlıdır. Uygulanabildiği durumda mevcut bilet iptal edilip yeni sefere bilet düzenlenir; aradaki fiyat farkı varsa tahsil edilir veya iade edilir.',
      },
      {
        id: 'iptal-5',
        question: 'İptal işlemi tanıtım sürümünde çalışıyor mu?',
        answer:
          'Hayır. Bu sürümde iptal ve iade akışları yalnızca arayüzü göstermek için vardır; hiçbir bilet gerçekten iptal edilmez ve hiçbir tutar iade edilmez.',
      },
    ],
  },
  {
    id: 'koltuk-secimi',
    title: 'Koltuk seçimi',
    items: [
      {
        id: 'koltuk-1',
        question: 'Koltuk planı otobüsün gerçek düzeniyle aynı mı?',
        answer:
          'Plan, seferin koltuk düzenine göre çizilir ve 2+1 ile 2+2 araçlar farklı görünür. Yine de araç son anda değiştirilebileceği için plan bir tahsis şemasıdır; kesin yerleşim otobüse binerken geçerlidir. Bu tanıtım sürümünde ise plan tamamen örnek verilerle üretilir.',
      },
      {
        id: 'koltuk-2',
        question: 'Bazı koltukları neden seçemiyorum?',
        answer:
          'Bir koltuk dolu olabilir, satışa kapatılmış olabilir ya da yanındaki yolcunun cinsiyeti nedeniyle size kapalı olabilir. Koltuğun üzerine geldiğinizde nedenini yazılı olarak görürsünüz; renk tek başına anlam taşımaz.',
      },
      {
        id: 'koltuk-3',
        question: 'Cinsiyet kuralı tam olarak nasıl işliyor?',
        answer:
          'Yan yana iki koltuktan biri satıldığında, diğeri yalnızca aynı cinsiyetteki yolculara açılır. Koltuğa dokunduğunuzda kadın ve erkek seçenekleri birlikte çıkar; kapalı olan seçenek üzerinde kırmızı işaretle gösterilir ve tıklanamaz.',
      },
      {
        id: 'koltuk-4',
        question: 'Aynı biletle kadın ve erkek yolcu için koltuk seçebilir miyim?',
        answer:
          'Bu, firmanın kuralına bağlıdır. Bazı firmalar tek bir biletle farklı cinsiyetteki yolcular için koltuk seçilmesine izin vermez; böyle bir seferde ikinci koltuğu farklı cinsiyetle seçtiğinizde uyarı alırsınız ve seçim eklenmez.',
      },
      {
        id: 'koltuk-5',
        question: 'Tekli koltuk neden daha pahalı?',
        answer:
          '2+1 düzenindeki tek kişilik koltuklar için bazı firmalar ek bir fark uygular. Bu fark bilet ücretinin içine gizlenmez; fiyat özetinde “Tekli koltuk farkı” olarak ayrı bir satırda görünür.',
      },
      {
        id: 'koltuk-6',
        question: 'Koltuk planında klavyeyle gezinebilir miyim?',
        answer:
          'Evet. Koltuklar arasında sekme ve ok tuşlarıyla dolaşabilir, boşluk veya enter tuşuyla seçim yapabilirsiniz. Her koltuk “12 numaralı koltuk” biçiminde okunur ve durumu ekran okuyucuya ayrıca bildirilir.',
      },
    ],
  },
  {
    id: 'odeme',
    title: 'Ödeme',
    items: [
      {
        id: 'odeme-1',
        question: 'Hangi ödeme yöntemlerini kullanabilirim?',
        answer:
          'Gerçek bir uygulamada kredi kartı, banka kartı ve dijital cüzdanlar desteklenir. Bu tanıtım sürümünde ödeme adımı yalnızca akışı göstermek için vardır ve sizden kart numarası istemez.',
      },
      {
        id: 'odeme-2',
        question: 'Kart bilgilerim saklanıyor mu?',
        answer:
          'Hayır. Kart bilgileri lisanslı ödeme kuruluşunda işlenir ve platformun kendi veri tabanına yazılmaz. Bu tanıtım sürümünde ise hiçbir ödeme bilgisi toplanmaz.',
      },
      {
        id: 'odeme-3',
        question: 'Listede gördüğüm fiyat ödeme ekranında değişir mi?',
        answer:
          'Hayır. Sefer kartında gördüğünüz tutar, koltuk farkı gibi kalemler eklendiğinde bile özet içinde ayrı ayrı gösterilir ve toplam kalemlerin toplamına eşit olur. Kalemlerle uyuşmayan bir toplam görürseniz işlemi tamamlamadan bize yazın.',
      },
      {
        id: 'odeme-4',
        question: 'Ödeme sırasında bağlantım koparsa ne olur?',
        answer:
          'Koltuk, ödeme tamamlanana kadar kesin olarak size ayrılmış sayılmaz. İşlem yarıda kaldıysa aramayı yenileyip koltuğu tekrar seçmeniz gerekir; aynı sefer için iki kez ücret alınmaz.',
      },
      {
        id: 'odeme-5',
        question: 'Fatura alabilir miyim?',
        answer:
          'Gerçek bir uygulamada bilet bedeline ait belge, satın alma sonrasında bilet ayrıntısından indirilebilir. Tanıtım sürümünde belge oluşturulmaz.',
      },
    ],
  },
]

const ALL_COUNT = CATEGORIES.reduce((sum, category) => sum + category.items.length, 0)

export default function FaqPage() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState('')

  useEffect(() => {
    document.title = 'Sık Sorulan Sorular | BusLinker'
  }, [])

  const filtered = useMemo(() => {
    const needle = foldTr(query)
    if (!needle) return CATEGORIES

    return CATEGORIES.map((category) => ({
      ...category,
      items: category.items.filter(
        (item) => foldTr(item.question).includes(needle) || foldTr(item.answer).includes(needle),
      ),
    })).filter((category) => category.items.length > 0)
  }, [query])

  const matchCount = filtered.reduce((sum, category) => sum + category.items.length, 0)

  return (
    <>
      <PageHeader
        title="Sık Sorulan Sorular"
        lead="Bilet alma, iptal, koltuk seçimi ve ödeme başlıklarında en çok merak edilenleri topladık."
        breadcrumbs={[{ label: 'Ana sayfa', to: '/' }]}
      />

      <div className="app-container section-y">
        <div className="max-w-xl">
          <label htmlFor="sss-arama" className="text-sm font-medium text-fg-secondary">
            Soru arayın
          </label>
          <div className="mt-1.5 flex items-center rounded-lg border border-border-strong bg-surface transition-colors duration-(--duration-fast) focus-within:border-brand hover:border-border-strong">
            <span className="pointer-events-none pl-3 text-fg-muted">
              <AssetIcon src={ICON.magnify} className="size-4" />
            </span>
            <input
              id="sss-arama"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                // A previously opened answer may be filtered away; closing
                // avoids an accordion that reopens something unexpected.
                setOpen('')
              }}
              placeholder="Örn. iptal, koltuk, PNR"
              className="h-11 w-full min-w-0 rounded-lg bg-transparent px-3 text-base text-fg placeholder:text-fg-subtle"
            />
          </div>
          <p role="status" className="mt-2 text-xs text-fg-muted">
            {query.trim()
              ? `${pluralTr(matchCount, 'soru')} bulundu.`
              : `Toplam ${pluralTr(ALL_COUNT, 'soru')} listeleniyor.`}
          </p>
        </div>

        {filtered.length === 0 ? (
          <EmptyState query={query} onClear={() => setQuery('')} />
        ) : (
          <Accordion
            type="single"
            collapsible
            value={open}
            onValueChange={setOpen}
            className="mt-10 flex flex-col gap-10"
          >
            {filtered.map((category) => (
              <section key={category.id} aria-labelledby={`sss-${category.id}`}>
                <h2 id={`sss-${category.id}`} className="text-xl sm:text-2xl">
                  {category.title}
                </h2>
                <div className="mt-3 border-t border-border">
                  {category.items.map((item) => (
                    <AccordionItem key={item.id} value={item.id} className="border-b border-border">
                      <AccordionTrigger className="text-base">{item.question}</AccordionTrigger>
                      <AccordionContent>
                        <p className="max-w-prose text-sm text-fg-secondary">{item.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </div>
              </section>
            ))}
          </Accordion>
        )}
      </div>
    </>
  )
}

function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-border-strong bg-surface-sunken p-8 text-center sm:p-12">
      <SearchX className="mx-auto size-8 text-fg-subtle" aria-hidden="true" />
      <h2 className="mt-4 text-lg text-balance-tr">“{query.trim()}” için bir yanıt bulamadık</h2>
      <p className="mx-auto mt-2 max-w-prose text-base text-fg-secondary">
        Daha kısa bir kelime deneyebilir ya da sorunuzu doğrudan bize iletebilirsiniz. Destek
        ekibimiz sık sorulanlarda yer almayan durumlar için de yanıt veriyor.
      </p>
      <div className="mt-6 flex flex-col items-stretch justify-center gap-3 xs:flex-row xs:items-center">
        <Button variant="primary" asChild>
          <Link to="/iletisim">Bize yazın</Link>
        </Button>
        <Button variant="secondary" onClick={onClear}>
          Aramayı temizleyin
        </Button>
      </div>
    </div>
  )
}
