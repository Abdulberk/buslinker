import { slugifyTr } from '@/shared/lib/tr'

/** Reference data: cities, terminals, operators and amenities. */

export interface Terminal {
  readonly id: string
  readonly name: string
  readonly cityId: string
}

export interface City {
  readonly id: string
  readonly name: string
  readonly slug: string
  readonly plate: number
  readonly region: string
  readonly terminals: readonly Terminal[]
  /** Rough coordinates, used only to derive a plausible journey duration. */
  readonly lat: number
  readonly lon: number
}

interface CitySeed {
  name: string
  plate: number
  region: string
  lat: number
  lon: number
  terminals: string[]
}

const CITY_SEEDS: CitySeed[] = [
  {
    name: 'İstanbul',
    plate: 34,
    region: 'Marmara',
    lat: 41.015,
    lon: 28.979,
    terminals: ['Esenler Otogarı', 'Alibeyköy Cep Otogarı', 'Dudullu Otogarı', 'Harem Otogarı'],
  },
  {
    name: 'Ankara',
    plate: 6,
    region: 'İç Anadolu',
    lat: 39.933,
    lon: 32.859,
    terminals: ['AŞTİ', 'Etlik Terminali'],
  },
  {
    name: 'İzmir',
    plate: 35,
    region: 'Ege',
    lat: 38.423,
    lon: 27.142,
    terminals: ['İzmir Otogarı', 'Üçkuyular Terminali'],
  },
  {
    name: 'Antalya',
    plate: 7,
    region: 'Akdeniz',
    lat: 36.897,
    lon: 30.713,
    terminals: ['Antalya Otogarı', 'Aksu Terminali'],
  },
  {
    name: 'Bursa',
    plate: 16,
    region: 'Marmara',
    lat: 40.183,
    lon: 29.067,
    terminals: ['Bursa Terminali', 'İnegöl Terminali'],
  },
  {
    name: 'Adana',
    plate: 1,
    region: 'Akdeniz',
    lat: 37.0,
    lon: 35.321,
    terminals: ['Adana Otogarı'],
  },
  {
    name: 'Hatay',
    plate: 31,
    region: 'Akdeniz',
    lat: 36.202,
    lon: 36.161,
    terminals: ['Antakya Otogarı', 'İskenderun Terminali'],
  },
  {
    name: 'Konya',
    plate: 42,
    region: 'İç Anadolu',
    lat: 37.874,
    lon: 32.493,
    terminals: ['Konya Otogarı'],
  },
  {
    name: 'Gaziantep',
    plate: 27,
    region: 'Güneydoğu Anadolu',
    lat: 37.066,
    lon: 37.383,
    terminals: ['Gaziantep Otogarı'],
  },
  {
    name: 'Trabzon',
    plate: 61,
    region: 'Karadeniz',
    lat: 41.005,
    lon: 39.727,
    terminals: ['Trabzon Otogarı'],
  },
  {
    name: 'Muğla',
    plate: 48,
    region: 'Ege',
    lat: 37.215,
    lon: 28.363,
    terminals: ['Muğla Otogarı', 'Fethiye Otogarı', 'Bodrum Otogarı'],
  },
  {
    name: 'Mersin',
    plate: 33,
    region: 'Akdeniz',
    lat: 36.812,
    lon: 34.641,
    terminals: ['Mersin Otogarı'],
  },
  {
    name: 'Nevşehir',
    plate: 50,
    region: 'İç Anadolu',
    lat: 38.625,
    lon: 34.714,
    terminals: ['Nevşehir Otogarı', 'Göreme Terminali'],
  },
  {
    name: 'Samsun',
    plate: 55,
    region: 'Karadeniz',
    lat: 41.286,
    lon: 36.33,
    terminals: ['Samsun Otogarı'],
  },
  {
    name: 'Kayseri',
    plate: 38,
    region: 'İç Anadolu',
    lat: 38.734,
    lon: 35.467,
    terminals: ['Kayseri Otogarı'],
  },
  {
    name: 'Diyarbakır',
    plate: 21,
    region: 'Güneydoğu Anadolu',
    lat: 37.915,
    lon: 40.229,
    terminals: ['Diyarbakır Otogarı'],
  },
  {
    name: 'Eskişehir',
    plate: 26,
    region: 'İç Anadolu',
    lat: 39.776,
    lon: 30.52,
    terminals: ['Eskişehir Terminali'],
  },
  {
    name: 'Denizli',
    plate: 20,
    region: 'Ege',
    lat: 37.783,
    lon: 29.094,
    terminals: ['Denizli Otogarı'],
  },
  {
    name: 'Çanakkale',
    plate: 17,
    region: 'Marmara',
    lat: 40.155,
    lon: 26.414,
    terminals: ['Çanakkale Otogarı'],
  },
  {
    name: 'Erzurum',
    plate: 25,
    region: 'Doğu Anadolu',
    lat: 39.905,
    lon: 41.267,
    terminals: ['Erzurum Otogarı'],
  },
  {
    name: 'Van',
    plate: 65,
    region: 'Doğu Anadolu',
    lat: 38.494,
    lon: 43.38,
    terminals: ['Van Otogarı'],
  },
  {
    name: 'Balıkesir',
    plate: 10,
    region: 'Marmara',
    lat: 39.649,
    lon: 27.886,
    terminals: ['Balıkesir Otogarı', 'Ayvalık Terminali'],
  },
  {
    name: 'Aydın',
    plate: 9,
    region: 'Ege',
    lat: 37.848,
    lon: 27.845,
    terminals: ['Aydın Otogarı', 'Kuşadası Terminali'],
  },
  {
    name: 'Şanlıurfa',
    plate: 63,
    region: 'Güneydoğu Anadolu',
    lat: 37.159,
    lon: 38.796,
    terminals: ['Şanlıurfa Otogarı'],
  },
]

export const CITIES: readonly City[] = CITY_SEEDS.map((seed) => {
  const slug = slugifyTr(seed.name)
  return {
    id: String(seed.plate),
    name: seed.name,
    slug,
    plate: seed.plate,
    region: seed.region,
    lat: seed.lat,
    lon: seed.lon,
    terminals: seed.terminals.map((name, i) => ({
      id: `${seed.plate}-${i}`,
      name,
      cityId: String(seed.plate),
    })),
  }
})

const bySlug = new Map(CITIES.map((c) => [c.slug, c]))
const byId = new Map(CITIES.map((c) => [c.id, c]))

export function cityBySlug(slug: string): City | undefined {
  return bySlug.get(slug)
}

export function cityById(id: string): City | undefined {
  return byId.get(id)
}

/** Great-circle distance in km — used only to make durations plausible. */
export function distanceKm(a: City, b: City): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export interface Operator {
  readonly id: string
  readonly name: string
  readonly rating: number
  /** Brand colour, used behind the monogram when no logo file exists. */
  readonly color: string
  readonly premium: boolean
  /** The carrier's own logo under `public/`. */
  readonly logo: string
}

/**
 * Only carriers whose real logo ships in `public/` are listed, so the results
 * list never mixes real marks with invented monograms. `OperatorLogo` still
 * falls back to a monogram, but nothing in the catalogue triggers it today.
 */
export const OPERATORS: readonly Operator[] = [
  {
    id: 'metro',
    name: 'Metro Turizm',
    rating: 8.4,
    color: 'oklch(45% 0.16 275)',
    premium: false,
    logo: '/metro.png',
  },
  {
    id: 'pamukkale',
    name: 'Pamukkale Turizm',
    rating: 8.2,
    color: 'oklch(52% 0.15 145)',
    premium: false,
    logo: '/pamukkale.png',
  },
  {
    id: 'ulusoy',
    name: 'Ulusoy',
    rating: 8.9,
    color: 'oklch(48% 0.14 265)',
    premium: true,
    logo: '/ulusoy.png',
  },
  {
    id: 'varan',
    name: 'Varan Turizm',
    rating: 9.1,
    color: 'oklch(45% 0.09 40)',
    premium: true,
    logo: '/varan.png',
  },
  {
    id: 'nilufer',
    name: 'Nilüfer Turizm',
    rating: 8.5,
    color: 'oklch(54% 0.16 300)',
    premium: false,
    logo: '/nilufer.png',
  },
  {
    id: 'efe-tur',
    name: 'Efe Tur',
    rating: 7.9,
    color: 'oklch(58% 0.16 60)',
    premium: false,
    logo: '/efetur.png',
  },
]

export function operatorById(id: string): Operator | undefined {
  return OPERATORS.find((o) => o.id === id)
}

export const AMENITIES = [
  { id: 'wifi', label: 'Ücretsiz Wi-Fi', icon: 'wifi' },
  { id: 'usb', label: 'USB şarj', icon: 'charge' },
  { id: 'tv', label: 'Koltuk ekranı', icon: 'tv' },
  { id: 'refreshment', label: 'İkram servisi', icon: 'coffee' },
  { id: 'ac', label: 'Klima', icon: 'snow' },
  { id: 'blanket', label: 'Battaniye', icon: 'blanket' },
  { id: 'hygiene', label: 'Hijyen sertifikası', icon: 'shield' },
  { id: 'free-cancel', label: 'Ücretsiz iptal', icon: 'cancel' },
] as const

export type AmenityId = (typeof AMENITIES)[number]['id']

export function amenityById(id: string) {
  return AMENITIES.find((a) => a.id === id)
}

/** Departure time bands, as travellers actually think about them. */
export const TIME_BANDS = [
  { id: 'morning', label: 'Sabah', hint: '06:00 – 11:59', from: 6, to: 12 },
  { id: 'noon', label: 'Öğle', hint: '12:00 – 17:59', from: 12, to: 18 },
  { id: 'evening', label: 'Akşam', hint: '18:00 – 23:59', from: 18, to: 24 },
  { id: 'night', label: 'Gece', hint: '00:00 – 05:59', from: 0, to: 6 },
] as const

export type TimeBandId = (typeof TIME_BANDS)[number]['id']

export function bandForHour(hour: number): TimeBandId {
  const band = TIME_BANDS.find((b) => hour >= b.from && hour < b.to)
  return band?.id ?? 'night'
}

/** Popular routes shown on the home page. */
export const POPULAR_ROUTES = [
  { from: 'istanbul', to: 'ankara' },
  { from: 'istanbul', to: 'izmir' },
  { from: 'istanbul', to: 'bursa' },
  { from: 'ankara', to: 'istanbul' },
  { from: 'izmir', to: 'antalya' },
  { from: 'istanbul', to: 'antalya' },
  { from: 'ankara', to: 'izmir' },
  { from: 'adana', to: 'hatay' },
] as const
