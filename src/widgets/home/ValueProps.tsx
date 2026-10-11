import { VALUE_ICON } from '@/shared/config/assets'
import { Illustration } from '@/shared/ui/asset-icon'
import { cn } from '@/shared/lib/cn'
import { SectionHeading } from './SectionHeading'

interface ValueProp {
  /** One of the project's own two-tone 80x80 illustrations. */
  readonly art: string
  readonly title: string
  readonly body: string
}

const PROPS: readonly ValueProp[] = [
  {
    art: VALUE_ICON.cancelAnytime,
    title: 'Ücretsiz iptal',
    body: 'Uygun seferlerde kalkıştan 12 saat öncesine kadar bileti tek tıkla iptal edin.',
  },
  {
    art: VALUE_ICON.noFees,
    title: 'Gizli ücret yok',
    body: 'Arama sonucunda gördüğünüz tutar, ödeme ekranında da birebir aynı kalır.',
  },
  {
    art: VALUE_ICON.easyRefund,
    title: 'Kolay iade',
    body: 'İptal ettiğiniz biletin ücreti, aynı kartınıza otomatik olarak geri yansır.',
  },
  {
    art: VALUE_ICON.comfortableTravel,
    title: 'Konforlu yolculuk',
    body: 'Otobüsün gerçek yerleşim planı üzerinden 2+1 koltuğunuzu kendiniz seçersiniz.',
  },
  {
    art: VALUE_ICON.securePayment,
    title: 'Güvenli ödeme',
    body: '3D Secure ile doğrulanan ödeme; kart bilgileriniz sistemimizde saklanmaz.',
  },
  {
    art: VALUE_ICON.bestPrice,
    title: 'En iyi fiyat garantisi',
    body: 'Aynı seferi daha ucuz bulursanız aradaki farkı size geri iade ediyoruz.',
  },
]

export function ValueProps() {
  return (
    <>
      <SectionHeading
        id="neden-buslinker"
        title="Neden BusLinker?"
        lead="Bileti almak, yolculuğun en kolay kısmı olmalı. Bunun için altı sözümüz var."
      />

      <ul className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
        {PROPS.map(({ art, title, body }) => (
          <li
            key={title}
            className={cn(
              'flex h-full gap-3 rounded-xl border border-border bg-surface',
              // On a phone the illustration sits beside the words. Stacked, it
              // took a row of its own and left each card 181px tall for three
              // lines of text — six of those is a wall to scroll past.
              'items-start p-4',
              'sm:flex-col sm:items-stretch sm:p-5',
            )}
          >
            {/* These illustrations carry their own two-tone palette, so they
                are images rather than masked icons, and in light mode they
                need no tile behind them. Their palette was drawn for a light
                page, though, and on the dark card its darker half all but
                vanished. In dark mode they sit on a small light plate: the
                artwork stays exactly as drawn, it simply gets the ground it
                was drawn for. The plate is the same size in both themes, so
                the text beside it does not move when the theme changes. */}
            <span className="shrink-0 self-start rounded-lg p-1 dark:bg-neutral-100">
              <Illustration src={art} alt="" width={80} height={80} className="size-9 sm:size-12" />
            </span>
            <div>
              <h3 className="text-base">{title}</h3>
              <p className="mt-1.5 text-sm text-fg-secondary">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
