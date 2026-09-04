/**
 * Campaign slides.
 *
 * `image` is the finished card artwork: a generated photograph with the
 * audience chip, headline and offer already set into it — see
 * scripts/campaign-art.mjs for why the words are composited by a browser
 * rather than asked of the image model.
 *
 * Because the offer lives in pixels there, every part of it is repeated as
 * real text on the card and on the detail page. Nothing in a picture reaches
 * a screen reader, a translator, or a text search.
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
  /** Finished 6:5 card artwork, generated and composited by scripts/. */
  readonly image: string
  readonly validUntil: string
}

export const CAMPAIGNS: readonly Campaign[] = [
  {
    id: 'ilk-bilet',
    image: '/campaigns/ilk-bilet.webp',
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
    image: '/campaigns/hafta-sonu.webp',
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
    image: '/campaigns/ogrenci.webp',
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
    image: '/campaigns/erken-rezervasyon.webp',
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
    image: '/campaigns/uygulama.webp',
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
