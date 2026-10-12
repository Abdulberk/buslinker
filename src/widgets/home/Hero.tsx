import type { CSSProperties } from 'react'
import { SearchForm } from '@/features/search-form/SearchForm'
import { ICON, IMAGE } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'
import { AssetIcon } from '@/shared/ui/asset-icon'
import { HeroStreak } from './HeroStreak'
import { ResumeSearch } from './ResumeSearch'

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
      // From sm the hero stands on a band of sky — the phone sheet's, a step
      // deeper — that runs up behind the transparent header: the section
      // slides up under the header by exactly its height and pads the same
      // amount back, so the content stays where it was. From lg the band
      // stops halfway down the search panel (--band-cut), so the panel sits
      // half on the sky and half on the page and the depth, not a line, is
      // what separates the hero from what follows. The hairline under the
      // section goes for the same reason.
      //
      // The cut is measured from the section's bottom, so a returning
      // visitor's resume card under the panel would push the panel up onto
      // the sky. When the card is there (`data-resume`), the cut moves down
      // by its block, which is a fixed height from lg for exactly this
      // reason (see the card's placement below).
      className={cn(
        'relative isolate border-b border-border bg-chrome sm:bg-bg sm:hero-band',
        'sm:-mt-16 sm:pt-16 lg:-mt-18 lg:border-b-0 lg:pt-18 lg:[--band-cut:7rem]',
        'lg:[--resume-block:8rem] lg:has-data-resume:[--band-cut:calc(7rem+var(--resume-block))]',
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* The dotted world map from the original design. Masked rather than
            drawn, so it takes a token colour, stays a texture rather than a
            picture, and follows the theme instead of needing a dark twin.
            The colour is the band's own blue, not the brand red it used to
            be: red dots on a blue sky were a second accent competing with
            the one red thing on the screen meant to be pressed. */}
        <div
          // Desktop only. On a phone the map has no room to be a backdrop —
          // it lands directly behind the search card and reads as a red haze.
          className="absolute inset-0 hidden text-info/22 sm:block dark:text-info/25"
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

        {/* From lg, a shooting star across the band; see HeroStreak. */}
        <HeroStreak />
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
            tiles. The sheet's ground is a cool sky wash (hero-sheet) — the
            flat grey it started on read as dirty under white cards — and in
            dark it is only a trace, so the cards still stand above it.

            From sm the block is unstyled again, and the mode strip sits ON
            the search card rather than floating above it as chips: the active
            tab shares the card's surface and loses its bottom corner radius,
            so the two read as one control. */}
        <div
          className={cn(
            'sm:mt-10',
            'max-sm:-mx-(--app-pad) max-sm:rounded-t-[1.75rem] max-sm:hero-sheet',
            'max-sm:px-(--app-pad) max-sm:pt-4 max-sm:pb-12',
          )}
        >
          <div className="relative sm:pb-4">
            <div
              role="group"
              aria-label="Seyahat türü"
              className={cn(
                // A segmented control: one white pill track. On a phone the
                // four modes share its width, so nothing scrolls; from sm the
                // track hugs its segments and sits above the search panel, the
                // same control on every screen instead of folder tabs on one
                // and pills on the other.
                'flex gap-1 rounded-full bg-surface p-1 shadow-xs ring-1 ring-border sm:inline-flex',
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
                    // A phone gets four equal segments; from sm each takes its
                    // own width.
                    'h-10 justify-center gap-1.5 rounded-full',
                    'flex-1 basis-0 px-1 sm:flex-none sm:basis-auto sm:px-4',
                    'transition-colors duration-(--duration-fast) ease-standard',
                    // The selected segment is a tinted pill, not a solid one:
                    // the red fill on this screen belongs to "Bilet Bul". The
                    // modes that do not exist yet take the faintest text tone
                    // and no hover at all: a hover tint is a promise that
                    // pressing does something. From sm the "Yakında" caption
                    // explains them, so the label can come up a step.
                    available ? 'bg-brand/10 text-brand-fg' : 'cursor-not-allowed text-fg-subtle',
                  )}
                >
                  {/* Below 360 four icon-and-label segments no longer fit the
                      track, and the words are what say which mode is which. */}
                  <AssetIcon src={icon} className="size-4.5 max-[360px]:hidden" />
                  <span className="text-sm font-semibold">{label}</span>
                  {/* From sm the unavailable modes say why, inside the pill.
                      Not on a phone, where the four segments share one width
                      and the dimmed, inert label already says it. */}
                  {available ? null : (
                    <span className="hidden text-2xs font-medium text-fg-subtle sm:inline">
                      Yakında
                    </span>
                  )}
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

          <SearchForm variant="hero" className="mt-3 sm:mt-0" />

          {/* Returning visitors only; it renders nothing for a first visit.
              On a phone it stands in the sky sheet under "Bilet Bul"; from sm
              it sits under the search card, held to a card's width at the
              left edge rather than stretched under the whole form, and from
              lg that puts it on the page's ground below the band. There its
              block, the gap above it included, is a fixed height that the
              section adds to the band's cut: the card is shorter than the
              block, and anything that makes it taller spills into the padding
              below instead of lifting the panel off the cut. */}
          <ResumeSearch className="pt-5 sm:max-w-md lg:h-(--resume-block)" />
        </div>
      </div>
    </section>
  )
}
