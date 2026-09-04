import { BadgePercent, Headset, ShieldCheck, TicketX } from 'lucide-react'
import { SearchForm } from '@/features/search-form/SearchForm'
import { HeroCoach } from './HeroCoach'
import { ICON, IMAGE } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'
import { AssetIcon } from '@/shared/ui/asset-icon'

const TRUST_POINTS = [
  { icon: TicketX, label: 'Ücretsiz iptal' },
  { icon: ShieldCheck, label: 'Güvenli ödeme' },
  { icon: Headset, label: '7/24 destek' },
  { icon: BadgePercent, label: 'En iyi fiyat garantisi' },
] as const

/**
 * Only the bus search exists, so the other three modes render as genuinely
 * disabled buttons with a "Yakında" cue rather than links that go nowhere.
 */
const TRAVEL_MODES = [
  { id: 'bus', label: 'Otobüs', icon: ICON.bus, available: true },
  { id: 'plane', label: 'Uçak', icon: ICON.plane, available: false },
  { id: 'hotel', label: 'Otel', icon: ICON.hotel, available: false },
  { id: 'ferry', label: 'Feribot', icon: ICON.ferry, available: false },
] as const

/**
 * The hero height comes from padding alone: a fixed height would either clip
 * the search form when it grows on mobile or strand it in dead space.
 */
export function Hero() {
  return (
    // `overflow-hidden` lives on the gradient wrapper, not the section: on the
    // section it also clipped the city dropdown, which opens downward and has
    // to escape the hero.
    <section className="relative isolate border-b border-border bg-bg">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* A whisper of cool wash so the hero still separates from the page
            below it. The heavy red gradient that used to sit here competed
            with the CTA and tinted the coach. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, color-mix(in oklab, var(--color-info) 7%, transparent) 0%, transparent 62%)',
          }}
        />

        {/* The dotted world map from the original design. Masked rather than
            drawn, so it takes a token colour, stays a texture rather than a
            picture, and follows the theme instead of needing a dark twin. */}
        <div
          className="absolute inset-0 text-brand/45 dark:text-brand/55"
          style={{
            backgroundColor: 'currentColor',
            // Two masks intersected: the map itself, and a vertical fade that
            // dissolves it before it reaches the search card. Without the
            // second one the dots run under the card and read as dirt.
            maskImage: `url("${IMAGE.worldMap.src}"), linear-gradient(180deg, #000 0%, #000 48%, transparent 82%)`,
            WebkitMaskImage: `url("${IMAGE.worldMap.src}"), linear-gradient(180deg, #000 0%, #000 48%, transparent 82%)`,
            maskRepeat: 'no-repeat, no-repeat',
            WebkitMaskRepeat: 'no-repeat, no-repeat',
            maskPosition: 'center 14%, center',
            WebkitMaskPosition: 'center 14%, center',
            maskSize: 'min(100rem, 150%) auto, 100% 100%',
            WebkitMaskSize: 'min(100rem, 150%) auto, 100% 100%',
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
          }}
        />
      </div>

      <div className="app-container pt-10 pb-12 sm:pt-14 sm:pb-16 lg:pt-20 lg:pb-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-center lg:gap-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl text-balance-tr sm:text-5xl">
              Türkiye'nin her yerine otobüs bileti
            </h1>

            <p className="mt-4 max-w-prose text-lg text-fg-secondary">
              Yüzlerce firmanın seferini tek ekranda karşılaştırın, koltuğunuzu kendiniz seçin,
              biletiniz saniyeler içinde telefonunuza gelsin.
            </p>
          </div>

          <div className="hidden lg:block">
            {/* The coach is the brand's own artwork on a transparent ground, so
                it sits straight on the gradient — a card frame around it would
                box in a cut-out. Above the fold on desktop and therefore the
                LCP element: `loading="lazy"` would defer the very image the
                metric is measured against. */}
            <HeroCoach />
          </div>
        </div>

        {/* The mode strip sits ON the search card rather than floating above
            it as chips: the active tab shares the card's surface and loses its
            bottom corner radius, so the two read as one control. */}
        <div className="mt-8 sm:mt-10">
          <div
            role="group"
            aria-label="Seyahat türü"
            // The rail scrolls when the four modes do not fit, which below ~430px
            // they do not. Without the fade the last tab just stops at the edge
            // and reads as clipped rather than scrollable.
            className={cn(
              '-mx-4 scrollbar-none flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0',
              '[mask-image:linear-gradient(to_right,#000_calc(100%-2.5rem),transparent)]',
              'sm:[mask-image:none]',
            )}
          >
            {TRAVEL_MODES.map(({ id, label, icon, available }) => (
              <button
                key={id}
                type="button"
                disabled={!available}
                aria-disabled={!available}
                aria-pressed={available}
                title={available ? undefined : `${label} aramaları yakında açılıyor`}
                className={cn(
                  'group relative flex min-w-24 shrink-0 flex-col items-center gap-1 rounded-t-xl px-5 pt-3 pb-3.5 sm:min-w-28',
                  'transition-colors duration-(--duration-fast) ease-standard',
                  available
                    ? 'bg-surface text-brand-fg shadow-[0_-2px_12px_oklch(0.36_0.045_245/0.06)]'
                    : 'cursor-not-allowed text-fg-muted hover:bg-surface/50',
                )}
              >
                <AssetIcon src={icon} className="size-7" />
                <span className="text-sm font-semibold">{label}</span>
                {/* Plain caption, not a badge: a pill inside a tab made the row
                    lumpy and fought the tab's own shape. */}
                <span
                  className={cn(
                    'text-2xs leading-none font-medium',
                    available ? 'text-transparent' : 'text-fg-subtle',
                  )}
                >
                  {available ? '·' : 'Yakında'}
                </span>
                {available ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-brand"
                  />
                ) : null}
              </button>
            ))}
          </div>

          <SearchForm variant="hero" className="rounded-tl-none" />
        </div>

        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg-muted">
          {TRUST_POINTS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-1.5">
              <Icon className="size-4 text-fg-subtle" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
