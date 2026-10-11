import { Link } from 'react-router'
import { CITIES, type City, type Terminal } from '@/shared/api/catalog'
import { DEFAULT_SORT, resultsPath, serializeSearchState } from '@/shared/lib/search-params'
import { toISODate } from '@/shared/lib/tr'
import { BRAND, IMAGE } from '@/shared/config/assets'
import { Illustration } from '@/shared/ui/asset-icon'
import { SectionHeading, SectionMore } from './SectionHeading'

/** The main terminal of the twelve busiest cities — the catalog is size-ordered. */
const ENTRIES: readonly { city: City; terminal: Terminal }[] = CITIES.slice(0, 12).flatMap(
  (city) => {
    const terminal = city.terminals[0]
    return terminal ? [{ city, terminal }] : []
  },
)

function destinationFor(slug: string): string {
  return slug === 'ankara' ? 'istanbul' : 'ankara'
}

export function PopularTerminals() {
  const today = toISODate(new Date())

  return (
    <>
      <SectionHeading
        id="populer-terminaller"
        tier="secondary"
        title="Popüler terminaller"
        lead="Şehirlerin ana otogarlarından kalkan seferlere doğrudan göz atın."
        more={{ to: '/terminaller', context: 'Terminaller' }}
      />

      <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-1 sm:mt-7 sm:grid-cols-3 lg:grid-cols-4">
        {ENTRIES.map(({ city, terminal }) => {
          const params = serializeSearchState({
            sort: DEFAULT_SORT,
            filters: { fromTerminals: [terminal.id] },
          })
          return (
            <li key={terminal.id}>
              <Link
                to={resultsPath(city.slug, destinationFor(city.slug), today, params)}
                aria-label={`${terminal.name}, ${city.name} kalkışlı seferler`}
                className="group flex min-h-12 items-center gap-3 text-sm text-fg-secondary transition-colors duration-(--duration-fast) hover:text-fg"
              >
                <Illustration
                  src={BRAND.terminal}
                  alt=""
                  width={29}
                  height={42}
                  className="h-8 w-auto shrink-0"
                />
                {/* Stacked rather than "Ad · Şehir" on one line: joined, the
                    longest of these ("Gaziantep Otogarı · Gaziantep") lost 107px
                    to truncation at 320px. Split, each line fits on its own. */}
                <span className="min-w-0">
                  <span className="block truncate underline-offset-4 group-hover:underline">
                    {terminal.name}
                  </span>
                  <span className="block truncate text-xs text-fg-muted">{city.name}</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <SectionMore to="/terminaller" label="Tüm terminaller" />

      {/* The route illustration closes the section the way the original design
          did. Purely ornamental, so it is hidden from assistive tech and
          dimmed enough not to compete with the links above it.

          Not on a phone: at 390px it costs 175px of scroll to draw a doodle
          two thumbs wide. */}
      <div className="hidden sm:block">
        {/* The file has an alpha channel but was exported over opaque white,
            so on its own it draws a white box. `multiply` drops that white
            out against whatever lies beneath — which works on a light page
            and cannot work on a dark one, where it used to be dropped
            altogether. In dark mode it now sits on a light rounded plate of
            its own: the plate is the ground the white multiplies into, so the
            drawing keeps its own colours and reads as a framed print rather
            than a hole in the page. */}
        <div className="mx-auto mt-10 max-w-2xl rounded-2xl dark:bg-neutral-100 dark:px-6 dark:py-5">
          <Illustration
            src={IMAGE.routePath.src}
            alt=""
            width={IMAGE.routePath.width}
            height={IMAGE.routePath.height}
            className="h-auto w-full opacity-90 mix-blend-multiply"
          />
        </div>
      </div>
    </>
  )
}
