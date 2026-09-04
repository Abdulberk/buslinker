import { useId, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { toISODate } from '@/shared/lib/tr'
import { resultsPath } from '@/shared/lib/search-params'
import { OPERATORS } from '@/shared/api/catalog'
import { BRAND, ICON, PAYMENT, SOCIAL } from '@/shared/config/assets'
import { AssetIcon, Illustration } from '@/shared/ui/asset-icon'
import { Button } from '@/shared/ui/button'
import { Logo } from '@/shared/ui/logo'

type FooterLink = { label: string; href: string } | { label: string; to: string }

interface FooterColumn {
  id: string
  title: string
  links: FooterLink[]
}

const OPERATOR_LINKS: FooterLink[] = OPERATORS.map((operator) => ({
  label: operator.name,
  to: `/otobus-firmalari/${operator.id}`,
}))

const HELP_LINKS: FooterLink[] = [
  { label: 'Yardım Merkezi', to: '/yardim' },
  { label: 'Sıkça Sorulan Sorular', to: '/sss' },
  { label: 'Bilet Sorgula', to: '/bilet-sorgula' },
  { label: 'Bilet İptali', to: '/bilet-iptal' },
  { label: 'İletişim', to: '/iletisim' },
]

const CORPORATE_LINKS: FooterLink[] = [
  { label: 'Hakkımızda', to: '/hakkimizda' },
  { label: 'Blog', to: '/blog' },
  { label: 'Kariyer', to: '/kariyer' },
  { label: 'Basında Biz', to: '/basinda-biz' },
  { label: 'Firma İş Birliği', to: '/firma-girisi' },
]

const POPULAR_ROUTE_SEEDS = [
  { from: 'istanbul', to: 'ankara', label: 'İstanbul - Ankara' },
  { from: 'istanbul', to: 'izmir', label: 'İstanbul - İzmir' },
  { from: 'ankara', to: 'izmir', label: 'Ankara - İzmir' },
  { from: 'istanbul', to: 'bursa', label: 'İstanbul - Bursa' },
  { from: 'adana', to: 'hatay', label: 'Adana - Hatay' },
] as const

const LEGAL_LINKS: FooterLink[] = [
  { label: 'Kullanım Koşulları', to: '/kullanim-kosullari' },
  { label: 'Gizlilik Politikası', to: '/gizlilik-politikasi' },
  { label: 'Çerez Politikası', to: '/cerez-politikasi' },
  { label: 'Erişilebilirlik', to: '/erisilebilirlik' },
  { label: 'Site Haritası', to: '/site-haritasi' },
]

const LINK_CLASS = [
  '-mx-2 flex min-h-11 items-center rounded-lg px-2',
  'text-sm text-fg-secondary transition-colors duration-(--duration-fast)',
  'hover:bg-surface hover:text-brand-fg',
].join(' ')

export function SiteFooter() {
  const emailId = useId()

  // Deep links need a date; tomorrow is the shortest honest default and keeps
  // the footer from pointing at a search that has already departed.
  const [tomorrow] = useState(() => toISODate(new Date(Date.now() + 86_400_000)))

  const columns = useMemo<FooterColumn[]>(() => {
    return [
      { id: 'firmalar', title: 'Otobüs Firmaları', links: OPERATOR_LINKS },
      {
        id: 'seferler',
        title: 'Popüler Seferler',
        links: POPULAR_ROUTE_SEEDS.map((seed) => ({
          label: seed.label,
          to: resultsPath(seed.from, seed.to, tomorrow),
        })),
      },
      { id: 'yardim', title: 'Yardım', links: HELP_LINKS },
      { id: 'kurumsal', title: 'Kurumsal', links: CORPORATE_LINKS },
    ]
  }, [tomorrow])

  function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    event.currentTarget.reset()
    toast.success('Bültenimize kaydoldunuz.', {
      description: 'Kampanyalardan ve yeni hatlardan ilk siz haberdar olacaksınız.',
    })
  }

  return (
    <footer role="contentinfo" className="border-t border-border bg-bg-alt">
      <div className="app-container section-y">
        {/* Deliberately not a card. It is a secondary ask sitting above the
            footer columns, so it gets a rule and nothing else — a tinted panel
            with its own illustration competed with the page's real CTA. */}
        <section
          aria-labelledby="footer-newsletter-title"
          className="flex flex-col gap-5 border-b border-border pb-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:pb-10"
        >
          <div>
            <h2
              id="footer-newsletter-title"
              className="flex items-center gap-2 font-display text-lg font-bold text-fg"
            >
              <AssetIcon src={ICON.subscribe} className="size-4 shrink-0 text-brand" />
              Fırsatları kaçırmayın
            </h2>
            <p className="mt-1 text-sm text-fg-muted">
              Kampanyalardan ve indirimli biletlerden ilk siz haberdar olun.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="lg:w-96 lg:shrink-0">
            <div className="flex gap-2">
              <label htmlFor={emailId} className="sr-only">
                E-posta adresiniz
              </label>
              <input
                id={emailId}
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="ornek@eposta.com"
                aria-describedby={`${emailId}-consent`}
                className="h-11 min-w-0 flex-1 rounded-lg border border-border-strong bg-surface px-3.5 text-base text-fg transition-colors duration-(--duration-fast) placeholder:text-fg-subtle hover:border-fg-muted"
              />
              <Button type="submit" variant="brand-outline" size="md" className="shrink-0">
                Kaydol
              </Button>
            </div>
            <p id={`${emailId}-consent`} className="mt-2 text-xs text-fg-subtle">
              Dilediğiniz an çıkabilirsiniz.
            </p>
          </form>
        </section>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-5 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo className="text-brand" />
            <p className="mt-4 max-w-xs text-sm text-fg-secondary">
              Türkiye&apos;nin dört bir yanındaki otobüs firmalarını tek ekranda karşılaştırın,
              koltuğunuzu saniyeler içinde seçin.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="BusLinker sosyal medya hesapları">
              {SOCIAL.map((social) => (
                <li key={social.id}>
                  <a
                    href="#"
                    aria-label={social.label}
                    className="grid size-11 place-items-center rounded-lg border border-border bg-surface text-fg-secondary transition-colors duration-(--duration-fast) hover:border-border-strong hover:text-brand-fg"
                  >
                    <AssetIcon src={social.icon} className="size-5" />
                  </a>
                </li>
              ))}
            </ul>

            {/* The store badges are supplied artwork with their own wordmarks,
                so they stay images rather than being recoloured. */}
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Mobil uygulamayı indir">
              <li>
                <a href="#" aria-label="App Store'dan indir" className="inline-flex rounded-lg">
                  <Illustration
                    src={BRAND.appStore}
                    alt=""
                    width={164}
                    height={49}
                    className="h-10 w-auto"
                  />
                </a>
              </li>
              <li>
                <a href="#" aria-label="Google Play'den indir" className="inline-flex rounded-lg">
                  <Illustration
                    src={BRAND.playStore}
                    alt=""
                    width={164}
                    height={49}
                    className="h-10 w-auto"
                  />
                </a>
              </li>
            </ul>
          </div>

          {columns.map((column) => (
            <nav key={column.id} aria-labelledby={`footer-col-${column.id}`}>
              <h3 id={`footer-col-${column.id}`} className="text-sm font-semibold text-fg">
                {column.title}
              </h3>
              <ul className="mt-3 flex flex-col">
                {column.links.map((link) => (
                  <li key={link.label}>
                    {'to' in link ? (
                      <Link to={link.to} className={LINK_CLASS}>
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className={LINK_CLASS}>
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="app-container flex flex-col gap-4 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-x-6 sm:flex-row sm:items-center">
            <p className="text-xs text-fg-muted">© 2026 BusLinker. Tüm hakları saklıdır.</p>
            <nav aria-label="Yasal bilgiler">
              <ul className="flex flex-wrap items-center gap-x-5">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={'to' in link ? link.to : '/'}
                      className="inline-flex min-h-11 items-center text-xs text-fg-muted transition-colors duration-(--duration-fast) hover:text-brand-fg"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <ul
            className="flex flex-wrap items-center gap-2"
            aria-label="Kabul edilen ödeme yöntemleri"
          >
            {/* Card marks are multi-colour and brand-owned, so they keep their
                own palette on a white tile that survives dark mode. */}
            {PAYMENT.map((method) => (
              <li
                key={method.id}
                className="bg-white grid h-10 w-15 place-items-center rounded-lg border border-border p-1.5"
              >
                <Illustration
                  src={method.src}
                  alt={method.label}
                  width={120}
                  height={96}
                  className="size-full object-contain"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
