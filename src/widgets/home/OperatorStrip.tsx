import { Star } from 'lucide-react'
import { OPERATORS } from '@/shared/api/catalog'
import { OperatorLogo } from '@/shared/ui/operator-logo'
import { ICON } from '@/shared/config/assets'
import { AssetIcon } from '@/shared/ui/asset-icon'

/** `8.4` -> `8,4`. Locale-independent: `toFixed` never emits a comma itself. */
function formatRating(value: number): string {
  return value.toFixed(1).replace('.', ',')
}

export function OperatorStrip() {
  return (
    <>
      <h2 id="anlasmali-firmalar" className="flex items-center gap-2.5 text-2xl sm:text-3xl">
        <AssetIcon src={ICON.linker} className="size-5 shrink-0 text-brand" />
        Anlaşmalı firmalar
      </h2>
      <p className="mt-2 max-w-prose text-base text-fg-secondary">
        Türkiye'nin köklü otobüs firmalarının seferlerini aynı listede karşılaştırın.
      </p>

      <ul className="mt-6 scrollbar-none flex gap-3 overflow-x-auto fade-inline-edges pb-1 sm:mt-8 md:flex-wrap md:justify-center md:gap-4 md:overflow-visible md:[mask-image:none] md:pb-0">
        {OPERATORS.map((operator) => (
          <li
            key={operator.id}
            className="flex w-36 shrink-0 flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 text-center md:w-40"
          >
            <OperatorLogo operatorId={operator.id} className="size-20" />
            <span className="text-sm font-medium text-balance-tr text-fg">{operator.name}</span>
            <span
              className="inline-flex items-center gap-1 text-xs text-fg-muted"
              aria-label={`Yolcu puanı ${formatRating(operator.rating)} / 10`}
            >
              <Star className="size-3.5 fill-current text-warning-fg" aria-hidden="true" />
              <span data-numeric aria-hidden="true">
                {formatRating(operator.rating)}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </>
  )
}
