/**
 * The campaign artwork manifest, shared by the generate and compose steps.
 *
 * The look follows the retail-promo convention Turkish travel sites use: a
 * bright sunlit scene, a coloured chip naming the audience, a big headline, and
 * a ribbon along the bottom carrying the offer. Loud on purpose — a campaign
 * card has to read at a glance from a scrolling carousel.
 *
 * `scene` describes the photograph ONLY. The words are never asked of the image
 * model: across two runs of an identical prompt it produced a clean
 * "İlk biletinizde 150 TL indirim" once, then "Çlk biletinizde 150 TL indiirim"
 * over "yleniyle" the next time. Copy that is wrong half the time cannot ship,
 * so compose-campaign-art.mjs paints it on with a real font engine instead.
 *
 * Every scene must leave the top third and bottom third quiet, because that is
 * where the headline and the ribbon land.
 */

export const RAW_DIR = '.campaign-src'
export const OUT_DIR = 'public/campaigns'

/** Square, matching how the carousel crops the card. */
export const ASPECT_RATIO = '1:1'

/** Card artwork, in carousel order. */
export const CAMPAIGN_ART = [
  {
    id: 'ilk-bilet',
    tone: 'brand',
    kicker: 'Yeni üyelere',
    headline: 'İlk biletinizde',
    offer: '150 TL indirim',
    code: 'ILKBILET',
    scene:
      'A gleaming modern white intercity coach on an open coastal road, seen head-on in three-quarter view in the middle band of the frame, turquoise sea and sunlit cliffs behind it, brilliant blue sky above.',
  },
  {
    id: 'hafta-sonu',
    tone: 'info',
    kicker: 'Hafta sonu',
    headline: 'Cuma ve cumartesi',
    offer: '%20 indirim',
    code: 'HAFTASONU',
    scene:
      'A white coach seen from BEHIND and slightly above, driving away from the camera around a curve on a mountain road, in the middle band of the frame. Only its rear and side are visible — the front of the vehicle faces away and is never in shot. Rolling green hills and a bright lake beyond, vivid blue sky.',
  },
  {
    id: 'ogrenci',
    tone: 'success',
    kicker: 'Öğrencilere',
    headline: 'Öğrenci biletlerinde',
    offer: 'sürekli %15',
    scene:
      'A cheerful young traveller with a backpack stepping through the open passenger door of a white coach at a sunlit terminal, centred in the middle band of the frame. The coach is shown in pure SIDE profile — the front grille is out of shot entirely. Bright airy daylight.',
  },
  {
    id: 'erken-rezervasyon',
    tone: 'warning',
    kicker: 'Erken rezervasyon',
    headline: '30 gün önce alana',
    offer: '100 TL iade',
    code: 'ERKEN30',
    scene:
      'A white coach parked at a sunlit open terminal apron early in the morning, photographed from the REAR three-quarter angle so that only the back and one flank are visible and the front of the vehicle is entirely out of shot. Middle band of the frame, warm golden light, clear sky.',
  },
  {
    id: 'uygulama',
    tone: 'brand',
    kicker: 'Mobil uygulama',
    headline: 'Uygulamadan alana',
    offer: 'ek 50 TL',
    code: 'MOBIL50',
    scene:
      'A hand holding a smartphone with a blank switched-off screen, centred in the middle band of the frame, a white coach and sunny landscape softly blurred behind, bright cheerful light.',
  },
]
