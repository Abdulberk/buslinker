import type { CSSProperties } from 'react'
import { SearchForm } from '@/features/search-form/SearchForm'
import { ICON, IMAGE } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'
import { AssetIcon } from '@/shared/ui/asset-icon'

/**
 * Only the bus search exists, so the other three modes render as genuinely
 * disabled buttons rather than links that go nowhere: pressing one does
 * nothing, and there is no handler behind it to do anything. From sm they
 * carry a "Yakında" caption as well; a phone has no room for a line of text
 * under every tab, and dimmed-and-inert already says it cannot be pressed.
 */
const TRAVEL_MODES = [
  { id: 'bus', label: 'Otobüs', icon: ICON.bus, available: true },
  { id: 'plane', label: 'Uçak', icon: ICON.plane, available: false },
  { id: 'hotel', label: 'Otel', icon: ICON.hotel, available: false },
  { id: 'ferry', label: 'Feribot', icon: ICON.ferry, available: false },
] as const

/**
 * The smallest transparent GIF. It is what a phone's <img> loads instead of
 * the coach: the coach is only ever shown from lg, and an <img> fetches its
 * file even inside a `display: none` box, so without a <picture> source gated
 * by media every phone paid for a picture it never displayed.
 */
const BLANK_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAAAACw='

/**
 * The coach's width, and how far its front is held in from the card's right
 * edge. Both are variables because the heading's measure is derived from
 * them: the heading block ends where the coach begins, so the two can never
 * overlap at any width from lg up.
 */
const COACH_VARS = {
  '--coach-w': 'clamp(16rem, 26vw, 25rem)',
  '--coach-inset': '1.5rem',
} as CSSProperties

/**
 * The hero height comes from padding alone: a fixed height would either clip
 * the search form when it grows on mobile or strand it in dead space.
 */
export function Hero() {
  return (
    // `overflow-hidden` lives on the gradient wrapper, not the section: on the
    // section it also clipped the city dropdown, which opens downward and has
    // to escape the hero.
    <section
      style={COACH_VARS}
      // A phone stacks white cards on this, and on --color-bg they were one
      // pale mass: ground and card sat about a point and a half apart in
      // lightness. --color-surface-sunken is seven apart, which is what makes
      // a card read as a card — and it is the tone the filters and the search
      // boxes already use, not a colour invented for the hero. A ground rather
      // than a red header, so the brand colour stays the thing you press.
      //
      // On a phone the section itself is the header's chrome, and that ground
      // lives on the sheet below instead (see the sheet's comment).
      //
      // From sm the hero has its own heading, artwork and single card, and
      // keeps the page ground. It also slides up under the header by exactly
      // the header's height and pads the same amount back, so the wash and
      // the map run on behind the header while the content stays where it
      // was.
      className={cn(
        'relative isolate border-b border-border bg-chrome sm:bg-bg',
        'sm:-mt-16 sm:pt-16 lg:-mt-18 lg:pt-18',
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* A whisper of cool wash so the hero still separates from the page
            below it. The heavy red gradient that used to sit here competed
            with the CTA and tinted the coach. Not on a phone: there the strip
            above the sheet has to be exactly the header's chrome, and a tint
            would show as a seam under the bar. */}
        <div
          className="absolute inset-0 hidden sm:block"
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
          className="absolute inset-0 hidden text-brand/40 sm:block dark:text-brand/50"
          style={{
            backgroundColor: 'currentColor',
            // Three masks intersected: the map itself; a vertical fade that
            // dissolves it before it reaches the search card, without which
            // the dots run under the card and read as dirt; and a sideways
            // ramp that holds it at a third of its strength on the left,
            // where the heading is, so the dots stay texture behind the words
            // rather than speckle through them.
            maskImage: `url("${IMAGE.worldMap.src}"), linear-gradient(180deg, #000 0%, #000 48%, transparent 82%), linear-gradient(90deg, rgb(0 0 0 / 0.35) 0%, rgb(0 0 0 / 0.35) 40%, #000 66%)`,
            WebkitMaskImage: `url("${IMAGE.worldMap.src}"), linear-gradient(180deg, #000 0%, #000 48%, transparent 82%), linear-gradient(90deg, rgb(0 0 0 / 0.35) 0%, rgb(0 0 0 / 0.35) 40%, #000 66%)`,
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center 14%, center, center',
            WebkitMaskPosition: 'center 14%, center, center',
            maskSize: 'min(100rem, 150%) auto, 100% 100%, 100% 100%',
            WebkitMaskSize: 'min(100rem, 150%) auto, 100% 100%, 100% 100%',
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
          }}
        />
      </div>

      <div className="app-container pt-1.5 sm:pt-14 sm:pb-16 lg:pt-14 lg:pb-18">
        {/* From lg the heading block stops where the coach begins: it is
            bounded by the coach's width rather than by a grid column, so the
            coach can sit on the card instead of in a column of its own. */}
        <div className="max-w-2xl lg:max-w-[min(42rem,calc(100%-var(--coach-w)-var(--coach-inset)-2rem))]">
          {/* Kept in the document but not on screen below sm: on a phone the
              search form has to be the first thing, the way every travel app
              does it. sr-only rather than hidden so the page keeps its h1 for
              assistive tech and for crawlers. */}
          <h1 className="sr-only text-4xl text-balance-tr sm:not-sr-only sm:text-5xl">
            Türkiye’nin her yerine otobüs bileti
          </h1>

          <p className="mt-4 hidden max-w-prose text-lg text-fg-secondary sm:block">
            Yüzlerce firmanın seferini tek ekranda karşılaştırın, koltuğunuzu kendiniz seçin,
            biletiniz saniyeler içinde telefonunuza gelsin.
          </p>
        </div>

        {/* On a phone this block is a sheet: full-bleed, on the hero's own
            ground, with large rounded top corners rising out of the header's
            chrome. The first version stacked three bands under the bar — the
            header, a bordered mode rail, then the ground — and drew a hairline
            between each; the curve now does the separating, with no line at
            all, and the header is left as nothing but the logo and its three
            tiles. Dark keeps the page ground here, since sunken would sit
            above the card surface there and the cards would sink into it.

            From sm the block is unstyled again, and the mode strip sits ON
            the search card rather than floating above it as chips: the active
            tab shares the card's surface and loses its bottom corner radius,
            so the two read as one control. */}
        <div
          className={cn(
            'sm:mt-10',
            'max-sm:-mx-(--app-pad) max-sm:rounded-t-[1.75rem] max-sm:bg-surface-sunken',
            'max-sm:px-(--app-pad) max-sm:pt-4 max-sm:pb-12 max-sm:dark:bg-bg',
          )}
        >
          <div className="relative">
            <div
              role="group"
              aria-label="Seyahat türü"
              className={cn(
                // On a phone a segmented control at the top of the sheet: one
                // white pill track with the four modes sharing its width, so
                // nothing scrolls. From sm a row of folder tabs on the search
                // card again, which scrolls if it must.
                'scrollbar-none flex gap-1 sm:overflow-x-auto',
                'max-sm:rounded-full max-sm:bg-surface max-sm:p-1 max-sm:shadow-xs',
                'max-sm:ring-1 max-sm:ring-border',
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
                    'group relative flex items-center',
                    // A phone gets four equal segments, icon beside label; from
                    // sm the tabs take their own width back, stack icon over
                    // label, and the folder shape returns.
                    'max-sm:h-10 max-sm:flex-1 max-sm:basis-0 max-sm:justify-center',
                    'max-sm:gap-1.5 max-sm:rounded-full max-sm:px-1',
                    'sm:min-w-28 sm:shrink-0 sm:flex-col sm:gap-1 sm:rounded-t-xl sm:px-5 sm:pt-3 sm:pb-3.5',
                    'transition-colors duration-(--duration-fast) ease-standard',
                    // The selected segment is a tinted pill, not a solid one:
                    // the red fill on this screen belongs to "Bilet Bul". The
                    // modes that do not exist yet take the faintest text tone
                    // and no hover at all: a hover tint is a promise that
                    // pressing does something. From sm the "Yakında" caption
                    // explains them, so the label can come up a step.
                    available
                      ? 'text-brand-fg max-sm:bg-brand/10 sm:bg-surface sm:shadow-[0_-2px_12px_oklch(0.36_0.045_245/0.06)]'
                      : 'cursor-not-allowed text-fg-subtle sm:text-fg-muted',
                  )}
                >
                  {/* Below 360 four icon-and-label segments no longer fit the
                      track, and the words are what say which mode is which. */}
                  <AssetIcon src={icon} className="size-4.5 max-[360px]:hidden sm:size-7" />
                  <span className="text-sm font-semibold">{label}</span>
                  {/* Plain caption, not a badge: a pill inside a tab made the
                      row lumpy and fought the tab's own shape.

                      Not on a phone. It is a whole line under every tab, and
                      the line is what made the bar tall; the disabled modes
                      are already dimmed, inert and announced as such. The
                      desktop tabs have the room, so they keep the words. */}
                  <span
                    className={cn(
                      'hidden text-2xs leading-none font-medium sm:block',
                      available ? 'text-transparent' : 'text-fg-subtle',
                    )}
                  >
                    {available ? '·' : 'Yakında'}
                  </span>
                  {available ? (
                    <span
                      aria-hidden="true"
                      // The folder tab's top edge, from sm. A phone's pill is
                      // its own marker and needs no bar.
                      className="absolute inset-x-4 top-0 hidden h-0.5 rounded-full bg-brand sm:block"
                    />
                  ) : null}
                </button>
              ))}
            </div>

            {/* From lg the coach is parked on the search card: its front
                wheels stand on the card's top edge, right of the tabs, where
                there used to be nothing. That retires the separate column it
                had beside the heading, and the hero is shorter for it.

                Phones never download it (see BLANK_PIXEL). On desktop it is
                above the fold and a candidate for LCP, so it loads eagerly at
                high priority. The image has a band of transparent ground
                under the wheels — 8.8% of its height — and the translate
                lowers it by exactly that, so the paint, not the box, meets
                the edge. The shadow is a cool slate, the hue of the rest of
                the UI's shadows, not the warm brown it had. */}
            <picture className="pointer-events-none absolute right-(--coach-inset) bottom-0 hidden lg:block">
              <source media="(min-width: 64rem)" srcSet={IMAGE.coach.src} />
              <img
                src={BLANK_PIXEL}
                alt="BusLinker otobüsü"
                width={IMAGE.coach.width}
                height={IMAGE.coach.height}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="block h-auto w-(--coach-w) translate-y-[8.8%] drop-shadow-[0_10px_14px_oklch(0.32_0.035_245/0.2)]"
              />
            </picture>
          </div>

          <SearchForm variant="hero" className="mt-3 rounded-tl-none sm:mt-0" />
        </div>
      </div>
    </section>
  )
}
