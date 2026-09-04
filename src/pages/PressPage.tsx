import { useEffect } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { Download, Mail, Palette, Type } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Card, CardBody } from '@/shared/ui/card'
import { Logo } from '@/shared/ui/logo'

interface Swatch {
  readonly step: string
  readonly hex: string
  /** Written out so Tailwind's scanner sees a complete class name. */
  readonly tile: string
  /** Paired so the hex label stays readable on its own tile. */
  readonly label: string
}

/**
 * The brand ramp exactly as `src/styles/theme.css` defines it. The tokens are
 * authored in oklch, so the hex beside each step is the sRGB rendering the
 * design file documents — that is the value a press kit actually needs.
 */
const RAMP: readonly Swatch[] = [
  { step: '50', hex: '#FCF3F1', tile: 'bg-brand-50', label: 'text-brand-950' },
  { step: '100', hex: '#FAE4E0', tile: 'bg-brand-100', label: 'text-brand-950' },
  { step: '200', hex: '#F7CEC7', tile: 'bg-brand-200', label: 'text-brand-950' },
  { step: '300', hex: '#F4ABA0', tile: 'bg-brand-300', label: 'text-brand-950' },
  { step: '400', hex: '#ED786C', tile: 'bg-brand-400', label: 'text-brand-950' },
  { step: '500', hex: '#E5534B', tile: 'bg-brand-500', label: 'text-neutral-0' },
  { step: '600', hex: '#D23B38', tile: 'bg-brand-600', label: 'text-neutral-0' },
  { step: '700', hex: '#AF302F', tile: 'bg-brand-700', label: 'text-neutral-0' },
  { step: '800', hex: '#902B2A', tile: 'bg-brand-800', label: 'text-neutral-0' },
  { step: '900', hex: '#762928', tile: 'bg-brand-900', label: 'text-neutral-0' },
  { step: '950', hex: '#3F1212', tile: 'bg-brand-950', label: 'text-neutral-0' },
]

export default function PressPage() {
  useEffect(() => {
    document.title = 'Basında Biz | BusLinker'
  }, [])

  const notAvailable = (what: string) => {
    toast.info('İndirme bu tanıtım sürümünde etkin değil.', {
      description: `${what} için hazırlanmış indirilebilir bir dosya bulunmuyor.`,
    })
  }

  return (
    <>
      <PageHeader
        title="Basında Biz"
        lead="BusLinker'ı bir haberde, sunumda ya da incelemede kullanacaksanız markanın doğru görünmesi için gereken her şey bu sayfada."
        breadcrumbs={[{ label: 'Ana sayfa', to: '/' }]}
      />

      <div className="app-container section-y">
        <p className="flex max-w-prose flex-wrap items-center gap-2 text-sm text-fg-muted">
          <Badge tone="warning">Tanıtım ürünü</Badge>
          <span>
            BusLinker bir arayüz tasarımı çalışmasıdır. Bu sayfada gerçek bir basın yansıması, ödül
            ya da açıklama yer almaz; yalnızca markanın kendi görsel kuralları anlatılır.
          </span>
        </p>

        <section aria-labelledby="kit-baslik" className="mt-8 sm:mt-10">
          <h2 id="kit-baslik" className="text-2xl text-balance-tr sm:text-3xl">
            Basın kiti
          </h2>
          <p className="mt-2 max-w-prose text-base text-fg-secondary">
            Logo tek renklidir ve bulunduğu yüzeyin metin rengini alır. Açık zeminde marka
            kırmızısıyla, kırmızı zeminde beyazla kullanın; iki kullanımın canlı önizlemesi
            aşağıdadır.
          </p>

          <ul className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2">
            <li>
              <Card className="h-full">
                <CardBody className="flex h-full flex-col">
                  <h3 className="text-base">Açık zemin</h3>
                  <p className="mt-1.5 text-sm text-fg-secondary">
                    Beyaz ya da açık gri yüzeylerde logoyu marka kırmızısıyla kullanın.
                  </p>
                  <div className="mt-4 grid min-h-32 place-items-center rounded-xl border border-border bg-neutral-0 p-6">
                    <Logo className="h-9 w-auto text-brand-600" />
                  </div>
                  <p className="mt-3 text-xs text-fg-muted">
                    Logo rengi <span data-numeric>#D23B38</span> · zemin{' '}
                    <span data-numeric>#FFFFFF</span>
                  </p>
                  <Button
                    type="button"
                    variant="brand-outline"
                    full
                    className="mt-4"
                    onClick={() => {
                      notAvailable('Açık zemin logosu')
                    }}
                  >
                    <Download className="size-4" aria-hidden="true" />
                    Açık zemin logosunu indirin
                  </Button>
                </CardBody>
              </Card>
            </li>

            <li>
              <Card className="h-full">
                <CardBody className="flex h-full flex-col">
                  <h3 className="text-base">Marka zemini</h3>
                  <p className="mt-1.5 text-sm text-fg-secondary">
                    Kırmızı zeminde logo beyaza döner; başka bir renk kullanılmaz.
                  </p>
                  <div className="on-brand mt-4 grid min-h-32 place-items-center rounded-xl bg-brand p-6">
                    <Logo className="h-9 w-auto text-on-brand" />
                  </div>
                  <p className="mt-3 text-xs text-fg-muted">
                    Logo rengi <span data-numeric>#FFFFFF</span> · zemin{' '}
                    <span data-numeric>#D23B38</span>
                  </p>
                  <Button
                    type="button"
                    variant="brand-outline"
                    full
                    className="mt-4"
                    onClick={() => {
                      notAvailable('Marka zemini logosu')
                    }}
                  >
                    <Download className="size-4" aria-hidden="true" />
                    Marka zemini logosunu indirin
                  </Button>
                </CardBody>
              </Card>
            </li>
          </ul>

          <ul className="mt-6 flex flex-col gap-2 text-sm text-fg-secondary">
            <li className="flex gap-2">
              <span
                className="mt-2 size-1.5 shrink-0 rounded-full bg-brand/50"
                aria-hidden="true"
              />
              Logonun çevresinde en az harf yüksekliği kadar boşluk bırakın.
            </li>
            <li className="flex gap-2">
              <span
                className="mt-2 size-1.5 shrink-0 rounded-full bg-brand/50"
                aria-hidden="true"
              />
              Logoyu germeyin, döndürmeyin, gölge veya kontur eklemeyin.
            </li>
            <li className="flex gap-2">
              <span
                className="mt-2 size-1.5 shrink-0 rounded-full bg-brand/50"
                aria-hidden="true"
              />
              Fotoğraf üzerinde kullanacaksanız yeterli kontrastı olan sakin bir alan seçin.
            </li>
          </ul>
        </section>
      </div>

      <div className="border-y border-border bg-bg-alt">
        <div className="app-container section-y">
          <section aria-labelledby="renk-baslik">
            <h2
              id="renk-baslik"
              className="flex items-center gap-2 text-2xl text-balance-tr sm:text-3xl"
            >
              <Palette className="size-5 shrink-0 text-brand-fg" aria-hidden="true" />
              Marka renkleri
            </h2>
            <p className="mt-2 max-w-prose text-base text-fg-secondary">
              Marka kırmızısı <span data-numeric>brand-600</span> adımıdır; düğmelerin dolgusu
              budur. Metin olarak kullanıldığında açık temada <span data-numeric>brand-700</span>,
              koyu temada <span data-numeric>brand-400</span> adımına geçer, çünkü kontrast oranı
              ancak öyle AA eşiğinin üzerinde kalır.
            </p>

            <ul className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-3 lg:grid-cols-6">
              {RAMP.map((swatch) => (
                <li key={swatch.step} className="overflow-hidden rounded-xl border border-border">
                  <div className={`flex h-20 items-end p-3 ${swatch.tile}`}>
                    <span className={`text-2xs font-medium ${swatch.label}`} data-numeric>
                      {swatch.hex}
                    </span>
                  </div>
                  <p className="bg-surface px-3 py-2 text-xs font-medium text-fg-secondary">
                    brand-<span data-numeric>{swatch.step}</span>
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="tipografi-baslik" className="mt-12 sm:mt-16">
            <h2
              id="tipografi-baslik"
              className="flex items-center gap-2 text-2xl text-balance-tr sm:text-3xl"
            >
              <Type className="size-5 shrink-0 text-brand-fg" aria-hidden="true" />
              Tipografi
            </h2>
            <p className="mt-2 max-w-prose text-base text-fg-secondary">
              İki yazı tipi kullanılır: başlıklarda Archivo, metinde Inter. Her ikisi de Türkçe için
              gerekli aksanlı karakterleri eksiksiz taşır.
            </p>

            <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface p-5">
                <p className="text-sm font-medium text-fg-secondary">Başlıklar · Archivo</p>
                <p className="mt-3 font-display text-3xl font-semibold text-fg">
                  Şehirlerarası yolculuk
                </p>
                <p className="mt-3 font-display text-base text-fg-muted">
                  ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ · 0123456789
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-5">
                <p className="text-sm font-medium text-fg-secondary">Metin · Inter</p>
                <p className="mt-3 font-sans text-xl text-fg">
                  Kalkış saatini, süreyi ve koltuk düzenini aynı ekranda görürsünüz.
                </p>
                <p className="mt-3 font-sans text-base text-fg-muted">
                  ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ · 0123456789
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-prose text-sm text-fg-muted">
              Marka adı her zaman tek kelime ve iki büyük harfle yazılır: BusLinker. “Bus Linker” ya
              da “BUSLINKER” yazımları kullanılmaz.
            </p>
          </section>
        </div>
      </div>

      <div className="app-container section-y">
        <Card>
          <CardBody className="flex flex-col gap-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-prose">
              <h2 className="flex items-center gap-2 text-xl text-balance-tr sm:text-2xl">
                <Mail className="size-5 shrink-0 text-brand-fg" aria-hidden="true" />
                Basın iletişim
              </h2>
              <p className="mt-2 text-base text-fg-secondary">
                Ekran görüntüsü, ürün ayrıntısı ya da bir kullanım izni için iletişim formundaki
                “Diğer” başlığından yazın. Yanıtı, formda bıraktığınız e-posta adresine göndeririz.
              </p>
              <p className="mt-2 text-sm text-fg-muted">
                Bu tanıtım sürümünde form hiçbir bilgiyi kaydetmez ve bir sunucuya göndermez.
              </p>
            </div>
            <div className="lg:shrink-0">
              <Button variant="primary" size="lg" asChild>
                <Link to="/iletisim">İletişim sayfasına gidin</Link>
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  )
}
