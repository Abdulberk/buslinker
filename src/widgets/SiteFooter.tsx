import { useId, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { cn } from '@/shared/lib/cn'
import { toISODate } from '@/shared/lib/tr'
import { resultsPath } from '@/shared/lib/search-params'
import { OPERATORS } from '@/shared/api/catalog'
import { BRAND, ICON, PAYMENT, SOCIAL } from '@/shared/config/assets'
import { AssetIcon, Illustration } from '@/shared/ui/asset-icon'
import { Button } from '@/shared/ui/button'
import { Logo } from '@/shared/ui/logo'

/**
 * A footer link is either an internal route or an external href, and its label
 * is either a translation key or a piece of catalogue data — an operator's
 * name, a city pair — which is never translated.
 */
type FooterLink = { to: string } & ({ key: string } | { label: string })

interface FooterColumn {
  id: string
  titleKey: string
  links: FooterLink[]
}

const OPERATOR_LINKS: FooterLink[] = OPERATORS.map((operator) => ({
  label: operator.name,
  to: `/otobus-firmalari/${operator.id}`,
}))

const HELP_LINKS: FooterLink[] = [
  { key: 'helpCenter', to: '/yardim' },
  { key: 'faq', to: '/sss' },
  { key: 'ticketLookup', to: '/bilet-sorgula' },
  { key: 'ticketCancel', to: '/bilet-iptal' },
  { key: 'contact', to: '/iletisim' },
]

const CORPORATE_LINKS: FooterLink[] = [
  { key: 'about', to: '/hakkimizda' },
  { key: 'blog', to: '/blog' },
  { key: 'careers', to: '/kariyer' },
  { key: 'press', to: '/basinda-biz' },
  { key: 'partner', to: '/firma-girisi' },
]

const POPULAR_ROUTE_SEEDS = [
  { from: 'istanbul', to: 'ankara', label: 'İstanbul - Ankara' },
  { from: 'istanbul', to: 'izmir', label: 'İstanbul - İzmir' },
  { from: 'ankara', to: 'izmir', label: 'Ankara - İzmir' },
  { from: 'istanbul', to: 'bursa', label: 'İstanbul - Bursa' },
  { from: 'adana', to: 'hatay', label: 'Adana - Hatay' },
] as const

const LEGAL_LINKS: FooterLink[] = [
  { key: 'terms', to: '/kullanim-kosullari' },
  { key: 'privacy', to: '/gizlilik-politikasi' },
  { key: 'cookies', to: '/cerez-politikasi' },
  { key: 'accessibility', to: '/erisilebilirlik' },
  { key: 'sitemap', to: '/site-haritasi' },
]

const LINK_CLASS = [
  '-mx-2 flex min-h-11 items-center rounded-lg px-2',
  'text-sm text-fg-secondary transition-colors duration-(--duration-fast)',
  'hover:bg-surface hover:text-brand-fg',
].join(' ')

export function SiteFooter() {
  const { t } = useTranslation()
  const emailId = useId()

  // Deep links need a date; tomorrow is the shortest honest default and keeps
  // the footer from pointing at a search that has already departed.
  const [tomorrow] = useState(() => toISODate(new Date(Date.now() + 86_400_000)))

  const columns = useMemo<FooterColumn[]>(() => {
    return [
      { id: 'firmalar', titleKey: 'footer.columns.operators', links: OPERATOR_LINKS },
      {
        id: 'seferler',
        titleKey: 'footer.columns.routes',
        links: POPULAR_ROUTE_SEEDS.map((seed) => ({
          label: seed.label,
          to: resultsPath(seed.from, seed.to, tomorrow),
        })),
      },
      { id: 'yardim', titleKey: 'footer.columns.help', links: HELP_LINKS },
      { id: 'kurumsal', titleKey: 'footer.columns.corporate', links: CORPORATE_LINKS },
    ]
  }, [tomorrow])

  const labelOf = (link: FooterLink) => ('key' in link ? t(`footer.links.${link.key}`) : link.label)

  function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    event.currentTarget.reset()
    toast.success(t('footer.subscribed'), { description: t('footer.subscribedBody') })
  }

  return (
    <footer
      role="contentinfo"
      // `isolate` keeps the art's negative z-index inside the footer rather
      // than sending it behind the page; `overflow-hidden` clips its bleed.
      className="relative isolate overflow-hidden border-t border-border bg-bg-alt"
    >
      {/* Line art embedded in the footer, not a strip appended under it: the
          columns and the legal bar sit on top of it. Decorative, so hidden from
          assistive tech and inert to the pointer. Its top is masked away so
          text never meets a hard edge, and in dark mode the ink inverts into a
          light line. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -z-10">
        <img
          src="/footer-art.webp"
          alt=""
          width={1920}
          height={491}
          loading="lazy"
          decoding="async"
          className={cn(
            // Held well back: it is the ground the footer stands on, not a
            // picture in it. Most of the drawing is dissolved by the mask and
            // what survives is faint enough to read as texture.
            'block w-full opacity-50',
            'mask-[linear-gradient(to_top,black_25%,transparent)]',
            'dark:opacity-35 dark:hue-rotate-180 dark:invert',
          )}
        />
      </div>

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
              {t('footer.newsletterTitle')}
            </h2>
            <p className="mt-1 text-sm text-fg-muted">{t('footer.newsletterBody')}</p>
          </div>

          <form onSubmit={handleSubscribe} className="lg:w-96 lg:shrink-0">
            <div className="flex gap-2">
              <label htmlFor={emailId} className="sr-only">
                {t('footer.email')}
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
                {t('footer.subscribe')}
              </Button>
            </div>
            <p id={`${emailId}-consent`} className="mt-2 text-xs text-fg-subtle">
              {t('footer.consent')}
            </p>
          </form>
        </section>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-5 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo className="text-brand" />
            <p className="mt-4 max-w-xs text-sm text-fg-secondary">{t('footer.tagline')}</p>

            {/* Six icons in a narrow column wrapped four-and-two, which reads as
                a mistake. A three-wide grid is the same six in a deliberate
                block. The frames are gone with them: a row of bordered tiles
                next to a row of bordered store badges was two competing grids
                of boxes. */}
            <ul className="mt-6 grid w-max grid-cols-3 gap-1" aria-label={t('footer.social')}>
              {SOCIAL.map((social) => (
                <li key={social.id}>
                  <a
                    href="#"
                    aria-label={social.label}
                    className={cn(
                      'grid size-11 place-items-center rounded-lg text-fg-secondary',
                      'transition-colors duration-(--duration-fast)',
                      'hover:bg-surface hover:text-brand-fg',
                    )}
                  >
                    <AssetIcon src={social.icon} className="size-5" />
                  </a>
                </li>
              ))}
            </ul>

            {/* The store badges are supplied artwork with their own wordmarks,
                so they stay images rather than being recoloured. */}
            <ul className="mt-4 flex flex-wrap gap-2" aria-label={t('footer.apps')}>
              <li>
                <a href="#" aria-label="App Store" className="inline-flex rounded-lg">
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
                <a href="#" aria-label="Google Play" className="inline-flex rounded-lg">
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
                {t(column.titleKey)}
              </h3>
              <ul className="mt-3 flex flex-col">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className={LINK_CLASS}>
                      {labelOf(link)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        {/* Room at the foot so the drawing under the text is never crowded
            by it. */}
        <div className="app-container flex flex-col gap-6 pt-6 pb-40 sm:pb-48 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:pb-56">
          <div className="flex flex-col gap-x-6 gap-y-1 sm:flex-row sm:items-center">
            <p className="text-xs text-fg-muted">
              {t('footer.rights', { year: new Date().getFullYear() })}
            </p>
            <nav aria-label={t('footer.legal')}>
              <ul className="flex flex-wrap items-center gap-x-5">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="inline-flex min-h-11 items-center text-xs text-fg-muted transition-colors duration-(--duration-fast) hover:text-brand-fg"
                    >
                      {labelOf(link)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Six card marks wrapped five-and-one against the legal links. A
              fixed six-column grid that refuses to shrink keeps them on one
              line and lets the links wrap instead, which they do gracefully. */}
          <ul className="grid shrink-0 grid-cols-6 gap-1.5" aria-label={t('footer.payments')}>
            {/* Card marks are multi-colour and brand-owned, so they keep their
                own palette on a white tile that survives dark mode. */}
            {PAYMENT.map((method) => (
              <li
                key={method.id}
                className="grid h-9 w-13 place-items-center rounded-md border border-border bg-neutral-0 p-1"
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
