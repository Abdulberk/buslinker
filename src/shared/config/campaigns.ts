/**
 * Campaign slides.
 *
 * `image` is optional on purpose. Until real artwork exists each slide renders
 * a token-built gradient, so the carousel is never a row of grey placeholders —
 * and dropping generated art in later is a one-field change per slide with no
 * layout consequences.
 *
 * The headline, the offer and the code are DOM text, never baked into the
 * image: that keeps them selectable, translatable, readable by a screen
 * reader, crisp at any density, and correct in Turkish — image models still
 * mangle ş/ğ/ı/İ far too often to trust with copy.
 */

export type CampaignTone = 'brand' | 'info' | 'success' | 'warning'

export interface Campaign {
  readonly id: string
  readonly badge: string
  readonly title: string
  readonly body: string
  /** Shown as a monospace-ish pill when present. */
  readonly code?: string
  readonly cta: string
  readonly href: string
  readonly tone: CampaignTone
  /**
   * A monochrome motif laid over the tone gradient as a CSS mask, so it takes
   * the campaign's own colour and follows the theme. Deliberately text-free:
   * the headline is DOM text, which stays selectable, translatable, crisp at
   * any density and correctly spelled in Turkish.
   */
  readonly art: string
  readonly validUntil: string
}

export const CAMPAIGNS: readonly Campaign[] = [
  {
    id: 'ilk-bilet',
    art: '/campaigns/ticket.svg',
    badge: 'Yeni üyelere',
    title: 'İlk biletinizde 150 TL indirim',
    body: 'BusLinker hesabınızı açın, ilk seferinizde anında indirimi kullanın.',
    code: 'ILKBILET',
    cta: 'Hemen üye olun',
    href: '/kayit',
    tone: 'brand',
    validUntil: '2026-12-31',
  },
  {
    id: 'hafta-sonu',
    art: '/campaigns/road.svg',
    badge: 'Hafta sonu',
    title: 'Cuma ve cumartesi seferlerinde %20',
    body: 'Hafta sonu kalkışlı seçili seferlerde geçerli, kontenjan sınırlıdır.',
    code: 'HAFTASONU',
    cta: 'Seferleri görün',
    href: '/otobus-bileti/istanbul-izmir/2026-09-12',
    tone: 'info',
    validUntil: '2026-11-30',
  },
  {
    id: 'ogrenci',
    art: '/campaigns/study.svg',
    badge: 'Öğrencilere',
    title: 'Öğrenci biletlerinde sürekli %15',
    body: 'Öğrenci belgenizi bir kez doğrulayın, indirim tüm seferlerinize işlensin.',
    cta: 'Nasıl çalışır?',
    href: '#',
    tone: 'success',
    validUntil: '2027-06-30',
  },
  {
    id: 'erken-rezervasyon',
    art: '/campaigns/calendar.svg',
    badge: 'Erken rezervasyon',
    title: '30 gün önce alana 100 TL iade',
    body: 'Planınızı erken yapın, bilet farkını cüzdanınıza geri alın.',
    code: 'ERKEN30',
    cta: 'Tarih seçin',
    href: '/',
    tone: 'warning',
    validUntil: '2026-10-31',
  },
  {
    id: 'uygulama',
    art: '/campaigns/mobile.svg',
    badge: 'Mobil uygulama',
    title: 'Uygulamadan alana ek 50 TL',
    body: 'BusLinker uygulamasından aldığınız ilk bilette geçerlidir.',
    code: 'MOBIL50',
    cta: 'Uygulamayı indirin',
    href: '#',
    tone: 'brand',
    validUntil: '2026-12-31',
  },
]

/**
 * Slide backgrounds, built from the palette rather than shipped as files, so
 * they follow the theme and cost nothing to download.
 */
export const CAMPAIGN_GRADIENT: Record<CampaignTone, string> = {
  brand:
    'linear-gradient(135deg, color-mix(in oklab, var(--color-brand) 22%, var(--color-surface)) 0%, color-mix(in oklab, var(--color-brand) 6%, var(--color-surface)) 100%)',
  info: 'linear-gradient(135deg, color-mix(in oklab, var(--color-info) 22%, var(--color-surface)) 0%, color-mix(in oklab, var(--color-info) 6%, var(--color-surface)) 100%)',
  success:
    'linear-gradient(135deg, color-mix(in oklab, var(--color-success) 20%, var(--color-surface)) 0%, color-mix(in oklab, var(--color-success) 6%, var(--color-surface)) 100%)',
  warning:
    'linear-gradient(135deg, color-mix(in oklab, var(--color-warning) 24%, var(--color-surface)) 0%, color-mix(in oklab, var(--color-warning) 7%, var(--color-surface)) 100%)',
}
