import { Link } from 'react-router'
import { CITIES, type City, type Terminal } from '@/shared/api/catalog'
import { DEFAULT_SORT, resultsPath, serializeSearchState } from '@/shared/lib/search-params'
import { toISODate } from '@/shared/lib/tr'
import { BRAND, ICON, IMAGE } from '@/shared/config/assets'
import { AssetIcon, Illustration } from '@/shared/ui/asset-icon'

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
      <h2 id="populer-terminaller" className="flex items-center gap-2.5 text-2xl sm:text-3xl">
        <AssetIcon src={ICON.linker} className="size-5 shrink-0 text-brand" />
        Popüler terminaller
      </h2>
      <p className="mt-2 max-w-prose text-base text-fg-secondary">
        Şehirlerin ana otogarlarından kalkan seferlere doğrudan göz atın.
      </p>

      <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-1 sm:mt-8 sm:grid-cols-3 lg:grid-cols-4">
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

      {/* The route illustration closes the section the way the original design
          did. Purely ornamental, so it is hidden from assistive tech and
          dimmed enough not to compete with the links above it.

          Not on a phone: at 390px it costs 175px of scroll to draw a doodle
          two thumbs wide. The wrapper carries that rule rather than the image,
          so it cannot race the dark-mode rule below. */}
      <div className="hidden sm:block">
        <Illustration
          src={IMAGE.routePath.src}
          alt=""
          width={IMAGE.routePath.width}
          height={IMAGE.routePath.height}
          // The file has an alpha channel but was exported over opaque white,
          // so it draws a white box on the tinted section. `multiply` drops
          // the white out against any lighter ground. It cannot do that on a
          // dark ground, and this is ornament, so dark mode simply omits it.
          className="mx-auto mt-10 h-auto w-full max-w-2xl opacity-90 mix-blend-multiply dark:hidden"
        />
      </div>
    </>
  )
}
