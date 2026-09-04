import { Link } from 'react-router'
import { cityBySlug, type City } from '@/shared/api/catalog'
import { resultsPath } from '@/shared/lib/search-params'
import { toISODate, upperTr } from '@/shared/lib/tr'
import { CITY_PHOTO, ICON } from '@/shared/config/assets'
import { AssetIcon } from '@/shared/ui/asset-icon'

/** Display order. The registry is what decides which cities have real photos. */
const PHOTO_ORDER = [
  'istanbul',
  'ankara',
  'izmir',
  'antalya',
  'mugla',
  'nevsehir',
  'trabzon',
  'adana',
  'gaziantep',
  'hatay',
  'mersin',
]

const PHOTOS: readonly { slug: string; src: string }[] = PHOTO_ORDER.flatMap((slug) => {
  const src = CITY_PHOTO[slug]
  return src ? [{ slug, src }] : []
})

/** A card must never link to a search that departs from its own destination. */
function originFor(slug: string): string {
  return slug === 'istanbul' ? 'ankara' : 'istanbul'
}

const DESTINATIONS: readonly { city: City; src: string }[] = PHOTOS.flatMap(({ slug, src }) => {
  const city = cityBySlug(slug)
  return city ? [{ city, src }] : []
})

export function PopularDestinations() {
  const today = toISODate(new Date())

  return (
    <>
      <h2 id="populer-destinasyonlar" className="flex items-center gap-2.5 text-2xl sm:text-3xl">
        <AssetIcon src={ICON.linker} className="size-5 shrink-0 text-brand" />
        Popüler destinasyonlar
      </h2>
      <p className="mt-2 max-w-prose text-base text-fg-secondary">
        Tatil planı da olsa, memleket yolu da — gidilen şehirlerin seferleri burada başlıyor.
      </p>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
        {DESTINATIONS.map(({ city, src }) => (
          <li key={city.slug}>
            <Link
              to={resultsPath(originFor(city.slug), city.slug, today)}
              aria-label={`${city.name} otobüs biletlerini ara`}
              className="group block rounded-xl transition-[translate,box-shadow] duration-(--duration-base) ease-standard hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative overflow-hidden rounded-xl border border-border">
                <img
                  src={src}
                  alt={`${city.name} şehrinden bir görünüm`}
                  width={480}
                  height={600}
                  loading="lazy"
                  decoding="async"
                  className="aspect-4/5 w-full object-cover transition-transform duration-(--duration-slower) ease-out group-hover:scale-105"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-t from-neutral-1000/85 via-neutral-1000/25 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <span className="block truncate font-display text-base font-semibold text-neutral-0">
                    {city.name}
                  </span>
                  {/* Region names run long in Turkish ("Güneydoğu Anadolu") and
                      wrapped straight out of the card, so this line clips. */}
                  <span className="block truncate text-2xs text-neutral-200">
                    {upperTr(city.region)}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
