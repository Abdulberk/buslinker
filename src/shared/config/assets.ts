/**
 * The asset registry.
 *
 * Every file under `public/` that the UI references is named here once, so a
 * renamed or missing file is a TypeScript error rather than a silently broken
 * image. Split by rendering technique: `ICON` entries are monochrome and go
 * through `AssetIcon` (mask + currentColor); everything else is multi-colour
 * artwork rendered as an `<img>`.
 */

/** Monochrome — safe to recolour with `AssetIcon`. */
export const ICON = {
  // Amenities (25x24 line icons)
  tv: '/icons/tv.svg',
  wireless: '/icons/wireless.svg',
  charge: '/icons/charge.svg',
  seat: '/icons/seat.svg',
  hygiene: '/icons/hygiene.svg',
  cancel: '/icons/cancel.svg',

  // Departure-time bands
  morning: '/icons/morning.svg',
  morningSelected: '/icons/morning-selected.svg',
  noon: '/icons/noon.svg',
  noonSelected: '/icons/noon-selected.svg',
  evening: '/icons/evening.svg',
  eveningSelected: '/icons/evening-selected.svg',
  night: '/icons/night.svg',
  nightSelected: '/icons/night-selected.svg',

  // UI glyphs
  swap: '/icons/swap.svg',
  mobileSwap: '/icons/mobile-swap.svg',
  sort: '/icons/sort.svg',
  filters: '/icons/filters.svg',
  hamburger: '/icons/hamburger.svg',
  leftArrow: '/icons/left-arrow.svg',
  rightArrow: '/icons/right-arrow.svg',

  // Filter-group headers
  departureHour: '/departure-hour.svg',
  seatLayout: '/seat-layout.svg',
  from: '/from.svg',
  ticketPrice: '/ticket-price.svg',
  extraServices: '/extra-services.svg',

  // Form and navigation
  point: '/point.svg',
  date: '/date.svg',
  magnify: '/magnify.svg',
  subscribe: '/subscribe.svg',
  linker: '/linker.svg',

  // Transport modes. Each also ships a `*red.svg` twin, but masking with
  // currentColor makes the active state a class rather than a second file.
  bus: '/bus.svg',
  plane: '/plane1.svg',
  hotel: '/hotel.svg',
  ferry: '/ferry.svg',

  // Social
  facebook: '/Facebook.svg',
  instagram: '/Instagram.svg',
  twitter: '/Twitter.svg',
  youtube: '/YouTube.svg',
  tiktok: '/TikTok.svg',
  telegram: '/Telegram.svg',
} as const

export type IconName = keyof typeof ICON

/**
 * The passenger-gender figures from the original seat picker (64x64).
 *
 * The `passive` variants already carry a red "not allowed" mark, which is
 * exactly the affordance a gender-locked seat needs — so the disabled state is
 * a genuinely different drawing rather than the same one at lower opacity.
 */
export const GENDER_ART = {
  maleActive: '/icons/male-active.svg',
  malePassive: '/icons/male-passive.svg',
  femaleActive: '/icons/female-active.svg',
  femalePassive: '/icons/female-passive.svg',
} as const

/** Two-tone 80x80 value-prop illustrations. */
export const VALUE_ICON = {
  cancelAnytime: '/cancel-anytime.svg',
  easyRefund: '/easy-refund.svg',
  comfortableTravel: '/comfortable-travel.svg',
  securePayment: '/secure-payment.svg',
  giftCards: '/giftcards.svg',
  noFees: '/no-fees.svg',
  bestPrice: '/best-price-guarantee.svg',
} as const

/** Full-colour marks — masking would flatten these to a silhouette. */
export const BRAND = {
  terminal: '/terminal.svg',
  frontBus: '/front-bus.svg',
  appStore: '/appstore.svg',
  playStore: '/playstore.svg',
} as const

export const PAYMENT = [
  { id: 'visa', label: 'Visa', src: '/visa.svg' },
  { id: 'mastercard', label: 'Mastercard', src: '/mastercard.svg' },
  { id: 'amex', label: 'American Express', src: '/amex.svg' },
  { id: 'paypal', label: 'PayPal', src: '/paypal.svg' },
  { id: 'discover', label: 'Discover', src: '/discover.svg' },
  { id: 'stripe', label: 'Stripe', src: '/stripe.svg' },
] as const

export const SOCIAL = [
  { id: 'instagram', label: 'BusLinker Instagram sayfası', icon: ICON.instagram },
  { id: 'facebook', label: 'BusLinker Facebook sayfası', icon: ICON.facebook },
  { id: 'twitter', label: 'BusLinker X hesabı', icon: ICON.twitter },
  { id: 'youtube', label: 'BusLinker YouTube kanalı', icon: ICON.youtube },
  { id: 'tiktok', label: 'BusLinker TikTok hesabı', icon: ICON.tiktok },
  { id: 'telegram', label: 'BusLinker Telegram kanalı', icon: ICON.telegram },
] as const

/** Photography and decorative art. */
export const IMAGE = {
  /** The branded red coach, transparent background. */
  coach: { src: '/whybus.png', width: 555, height: 398 },
  /** Faded travel collage, used as a section watermark. */
  collage: { src: '/tour.png', width: 593, height: 552 },
  worldMap: { src: '/worldmap.png', width: 1440, height: 611 },
  routePath: { src: '/path.png', width: 720, height: 250 },
  banner: { src: '/back.png', width: 1440, height: 333 },
} as const

/** City photographs, keyed by slug. Only cities with real art are listed. */
export const CITY_PHOTO: Record<string, string> = {
  istanbul: '/istanbul.webp',
  ankara: '/ankara.webp',
  izmir: '/izmir.webp',
  antalya: '/antalya.webp',
  hatay: '/hatay.webp',
  adana: '/adana.webp',
  mugla: '/mugla.webp',
  trabzon: '/trabzon.webp',
  gaziantep: '/gaziantep.webp',
  nevsehir: '/nevsehir.webp',
  mersin: '/mersin.webp',
}

/** Departure-band icon pair, so a selected band can swap to its filled variant. */
export const BAND_ICON: Record<string, { base: string; selected: string }> = {
  morning: { base: ICON.morning, selected: ICON.morningSelected },
  noon: { base: ICON.noon, selected: ICON.noonSelected },
  evening: { base: ICON.evening, selected: ICON.eveningSelected },
  night: { base: ICON.night, selected: ICON.nightSelected },
}
