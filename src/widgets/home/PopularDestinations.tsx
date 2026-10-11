import { Link } from 'react-router'
import { ArrowRight, MapPinned } from 'lucide-react'
import { CITIES, cityBySlug, type City } from '@/shared/api/catalog'
import { cityPath } from '@/shared/lib/search-params'
import { CITY_PHOTO } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'
import { linkCard, mediaCard } from './card-recipes'
import { SectionHeading } from './SectionHeading'

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

const DESTINATIONS: readonly { city: City; src: string }[] = PHOTO_ORDER.flatMap((slug) => {
  const src = CITY_PHOTO[slug]
  const city = cityBySlug(slug)
  return src && city ? [{ city, src }] : []
})

/** Where "all cities" lives: the city list on the site map, the only index of them. */
const ALL_CITIES = '/site-haritasi#sehir-baslik'

/**
 * Each tile opens the city's own page rather than a search. A search needs an
 * origin, and the old cards assumed İstanbul for everyone, so "Antalya" opened
 * İstanbul–Antalya for a reader in Ankara. The city page lists routes into the
 * city from several origins, with fares, next to a search form.
 */
export function PopularDestinations() {
  return (
    <>
      <SectionHeading
        id="populer-destinasyonlar"
        title="Popüler destinasyonlar"
        lead="Bir şehir seçin; otogarları, oraya giden güzergâhlar ve ücretler tek sayfada."
        more={{ to: ALL_CITIES, context: 'Şehirler' }}
      />

      {/* Eleven photographs and a twelfth tile that leads to the rest: twelve
          divides by the 3, 4 and 6 columns used here, so no breakpoint is left
          with a broken last row and the way onward is part of the grid.

          On a phone the same list is a rail. Stacked two across it was 1.5k px
          — almost two screens of photos between the routes and the promises —
          and a rail shows two and a third tiles, which is what tells a thumb
          that it scrolls. py-1 gives a focused tile's ring room inside the
          scroller, which clips. */}
      <ul
        className={cn(
          'mt-5 -mb-1 scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto py-1',
          '-mx-(--app-pad) scroll-px-(--app-pad) px-(--app-pad)',
          'sm:mx-0 sm:mt-8 sm:mb-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:p-0',
          'md:grid-cols-4 xl:grid-cols-6',
        )}
      >
        {DESTINATIONS.map(({ city, src }) => (
          <li key={city.slug} className="w-[42%] shrink-0 snap-start sm:w-auto">
            <DestinationTile city={city} src={src} />
          </li>
        ))}
        <li className="w-[42%] shrink-0 snap-start sm:w-auto">
          <AllCitiesTile />
        </li>
      </ul>
    </>
  )
}

function DestinationTile({ city, src }: { city: City; src: string }) {
  return (
    <Link
      to={cityPath(city.slug)}
      // Opens with the visible city name (SC 2.5.3) and matches the title of
      // the page it opens, "Antalya Otobüs Bileti".
      aria-label={`${city.name} otobüs bileti, ${city.region}`}
      className={cn(mediaCard, 'group relative')}
    >
      <img
        src={src}
        // The link already names the city; a description of the view would
        // only be read again after it.
        alt=""
        width={480}
        height={600}
        loading="lazy"
        decoding="async"
        className="aspect-4/5 w-full object-cover transition-transform duration-(--duration-slower) ease-out group-hover:scale-105"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-neutral-1000/85 via-neutral-1000/25 to-transparent"
      />
      <span className="absolute inset-x-0 bottom-0 p-3">
        <span className="block truncate font-display text-base font-semibold text-neutral-0">
          {city.name}
        </span>
        {/* Uppercased by CSS under lang="tr", not by upperTr: the text a
            screen reader gets stays "Ege", which it pronounces, instead of
            "EGE", which some spell out letter by letter — and the Turkish rule
            (i -> İ) holds even when the page around it is in English.

            Region names run long in Turkish. Truncating them produced
            "GÜNEYDOĞU ANADO…", so instead the tracking the 2xs step adds is
            dropped — uppercase Turkish is wide enough without it — and a
            second line is allowed for the few that still do not fit. */}
        <span
          lang="tr"
          className="line-clamp-2 text-2xs tracking-normal text-neutral-200 uppercase"
        >
          {city.region}
        </span>
      </span>
    </Link>
  )
}

function AllCitiesTile() {
  return (
    <Link
      to={ALL_CITIES}
      className={cn(
        linkCard,
        'group flex aspect-4/5 h-full w-full flex-col justify-between p-3 sm:p-4',
      )}
    >
      <span className="grid size-10 place-items-center rounded-lg bg-surface-sunken text-fg-secondary transition-colors duration-(--duration-fast) group-hover:text-brand-fg">
        <MapPinned className="size-5" aria-hidden="true" />
      </span>
      <span className="block">
        <span className="flex items-center gap-1.5 font-display text-base font-semibold text-fg">
          Tüm şehirler
          <ArrowRight
            className="size-4 shrink-0 text-fg-subtle transition-[color,translate] duration-(--duration-fast) group-hover:translate-x-0.5 group-hover:text-brand-fg"
            aria-hidden="true"
          />
        </span>
        <span className="mt-1 block text-xs text-fg-muted">
          <span data-numeric>{CITIES.length}</span> şehrin otogar ve sefer bilgileri
        </span>
      </span>
    </Link>
  )
}
