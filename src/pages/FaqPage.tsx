import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { SearchX } from 'lucide-react'
import { PageHeader, useScrollToHash } from '@/shared/ui/page-header'
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
import { QUIET_NAV, isQuietNav } from '@/shared/lib/quiet-nav'

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
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const urlQuery = searchParams.get('q') ?? ''

  // The search lives in the URL (?q=), so a filtered list can be linked to,
  // survives a reload, and is what the help centre's search box opens.
  //
  // The field still keeps its own copy of the text. Driving a text input
  // straight from the URL makes every keystroke wait on a navigation, and a
  // late one can put back a letter the user has already deleted. So typing
  // writes the URL, and the URL is read back only when it changed for some
  // other reason — a link, the header's "SSS", the back button — which is
  // exactly a navigation without QUIET_NAV, the state this page's own writes
  // carry. Adjusted during render rather than in an effect, so the field and
  // the list never draw one frame apart.
  const [query, setQuery] = useState(urlQuery)
  const [seenKey, setSeenKey] = useState(location.key)
  if (location.key !== seenKey) {
    setSeenKey(location.key)
    if (!isQuietNav(location.state)) setQuery(urlQuery)
  }

  const [open, setOpen] = useState('')

  useEffect(() => {
    document.title = 'Sık Sorulan Sorular | BusLinker'
  }, [])

  // The help centre's topic cards link to a category, e.g. /sss#odeme.
  useScrollToHash()

  const updateQuery = (value: string) => {
    setQuery(value)
    // A previously opened answer may be filtered away; closing avoids an
    // accordion that reopens something unexpected.
    setOpen('')
    const next = new URLSearchParams(searchParams)
    if (value.trim()) next.set('q', value)
    else next.delete('q')
    // Replace, not push: one history entry per visit rather than one per
    // letter, and no jump back to the top of the page while typing.
    void setSearchParams(next, { replace: true, preventScrollReset: true, state: QUIET_NAV })
  }

  const filtered = useMemo(() => {
    // Every word has to appear somewhere in the question or the answer, in any
    // order. Matched as one string, "koltuk değiştir" — which is what the help
    // centre's search box hands over — found nothing, though one answer is
    // about exactly that.
    const words = foldTr(query).split(/\s+/).filter(Boolean)
    if (words.length === 0) return CATEGORIES

    return CATEGORIES.map((category) => ({
      ...category,
      items: category.items.filter((item) => {
        const text = `${foldTr(item.question)} ${foldTr(item.answer)}`
        return words.every((word) => text.includes(word))
      }),
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
                updateQuery(event.target.value)
              }}
              placeholder="Örn. iptal, koltuk, PNR"
              className="h-11 w-full min-w-0 rounded-lg bg-transparent px-3 text-base text-fg"
            />
          </div>
          <p role="status" className="mt-2 text-xs text-fg-muted">
            {query.trim()
              ? `${pluralTr(matchCount, 'soru')} bulundu.`
              : `Toplam ${pluralTr(ALL_COUNT, 'soru')} listeleniyor.`}
          </p>
        </div>

        {/* The way into a category without scrolling past the ones before it.
            Plain fragment links, so the browser moves focus and scroll on its
            own and the search in the URL is kept. Only the categories the
            current search left standing are offered, so no chip ever points
            at a heading that is not there. */}
        {filtered.length > 1 ? (
          <nav aria-label="Soru başlıkları" className="mt-6">
            <ul className="flex flex-wrap gap-2">
              {filtered.map((category) => (
                <li key={category.id}>
                  <a
                    href={`#${category.id}`}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border-strong bg-surface px-3.5 text-sm text-fg-secondary transition-colors duration-(--duration-fast) hover:bg-hover hover:text-fg"
                  >
                    {category.title}
                    <span className="text-xs text-fg-muted" data-numeric>
                      {category.items.length}
                      <span className="sr-only"> soru</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        {filtered.length === 0 ? (
          <EmptyState
            query={query}
            onClear={() => {
              updateQuery('')
              // The button that was pressed goes away with the empty state;
              // the field is where the next search starts.
              document.getElementById('sss-arama')?.focus()
            }}
          />
        ) : (
          <Accordion
            type="single"
            collapsible
            value={open}
            onValueChange={setOpen}
            className="mt-10 flex flex-col gap-10"
          >
            {filtered.map((category) => (
              <section key={category.id} id={category.id} aria-labelledby={`sss-${category.id}`}>
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
