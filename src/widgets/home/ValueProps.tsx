import { ICON, VALUE_ICON } from '@/shared/config/assets'
import { AssetIcon, Illustration } from '@/shared/ui/asset-icon'
import { cn } from '@/shared/lib/cn'

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
      <h2 id="neden-buslinker" className="flex items-center gap-2.5 text-2xl sm:text-3xl">
        <AssetIcon src={ICON.linker} className="size-5 shrink-0 text-brand" />
        Neden BusLinker?
      </h2>
      <p className="mt-2 max-w-prose text-base text-fg-secondary">
        Bileti almak, yolculuğun en kolay kısmı olmalı. Bunun için altı sözümüz var.
      </p>

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
                are images rather than masked icons — and they need no tinted
                tile behind them. */}
            <Illustration
              src={art}
              alt=""
              width={80}
              height={80}
              className="size-10 shrink-0 sm:size-14"
            />
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
