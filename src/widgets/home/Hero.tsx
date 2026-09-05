import { SearchForm } from '@/features/search-form/SearchForm'
import { ICON, IMAGE } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'
import { AssetIcon, Illustration } from '@/shared/ui/asset-icon'

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
          // Desktop only. On a phone the map has no room to be a backdrop —
          // it lands directly behind the search card and reads as a red haze.
          className="absolute inset-0 hidden text-brand/45 sm:block dark:text-brand/55"
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

      <div className="app-container pb-12 sm:pt-14 sm:pb-16 lg:pt-20 lg:pb-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-center lg:gap-16">
          <div className="max-w-2xl">
            {/* Kept in the document but not on screen below sm: on a phone the
                search form has to be the first thing, the way every travel app
                does it. sr-only rather than hidden so the page keeps its h1 for
                assistive tech and for crawlers. */}
            <h1 className="sr-only text-4xl text-balance-tr sm:not-sr-only sm:text-5xl">
              Türkiye'nin her yerine otobüs bileti
            </h1>

            <p className="mt-4 hidden max-w-prose text-lg text-fg-secondary sm:block">
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
            <Illustration
              src={IMAGE.coach.src}
              alt="BusLinker otobüsü"
              width={IMAGE.coach.width}
              height={IMAGE.coach.height}
              priority
              sizes="(min-width: 1024px) 24rem, 0px"
              className="h-auto w-full drop-shadow-[0_24px_32px_oklch(0.30_0.03_35/0.22)]"
            />
          </div>
        </div>

        {/* The mode strip sits ON the search card rather than floating above
            it as chips: the active tab shares the card's surface and loses its
            bottom corner radius, so the two read as one control. */}
        <div className="sm:mt-10">
          <div
            role="group"
            aria-label="Seyahat türü"
            // The rail scrolls when the four modes do not fit, which below ~430px
            // they do not. Without the fade the last tab just stops at the edge
            // and reads as clipped rather than scrollable.
            className={cn(
              // On a phone this is the bar under the header: bled to the
              // viewport edges, sitting on its own surface, with the four
              // modes sharing the width — so nothing scrolls and nothing has
              // to be faded off at the edge. From sm it is a row of folder
              // tabs on the search card again, and scrolls if it must.
              'scrollbar-none flex gap-1',
              '-mx-(--app-pad) border-b border-border bg-surface px-(--app-pad)',
              'sm:mx-0 sm:overflow-x-auto sm:border-b-0 sm:bg-transparent sm:px-0',
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
                  'group relative flex flex-col items-center gap-1 pt-3 pb-3.5',
                  // A phone gets four equal columns; from sm the tabs take
                  // their own width back and the folder shape returns.
                  'flex-1 basis-0 px-1',
                  'sm:min-w-28 sm:flex-none sm:shrink-0 sm:basis-auto sm:rounded-t-xl sm:px-5',
                  'transition-colors duration-(--duration-fast) ease-standard',
                  available
                    ? 'text-brand-fg sm:bg-surface sm:shadow-[0_-2px_12px_oklch(0.36_0.045_245/0.06)]'
                    : 'cursor-not-allowed text-fg-muted sm:hover:bg-surface/50',
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
                    // Underneath the label on a phone, which is where a tab
                    // bar puts it; back on top of the folder tab from sm.
                    className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-brand sm:top-0 sm:bottom-auto"
                  />
                ) : null}
              </button>
            ))}
          </div>

          <SearchForm variant="hero" className="mt-3 rounded-tl-none sm:mt-0" />
        </div>
      </div>
    </section>
  )
}
