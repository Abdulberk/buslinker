import { OPERATORS } from '@/shared/api/catalog'
import { OperatorLogo } from '@/shared/ui/operator-logo'
import { ICON } from '@/shared/config/assets'
import { AssetIcon } from '@/shared/ui/asset-icon'

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
            // No card here on purpose. OperatorLogo already draws a bordered
            // white tile — the marks are PNGs on white and need that ground to
            // survive dark mode — so a second bordered box around it just put
            // one frame inside another.
            // 128px is the narrowest cell that still fits the longest name on
            // one line. Narrowing it to show a third mark wrapped "Pamukkale
            // Turizm" onto two lines and made the whole strip taller.
            className="flex w-32 shrink-0 flex-col items-center gap-2.5 py-2 text-center md:w-36"
          >
            <OperatorLogo operatorId={operator.id} className="size-20" />
            <span className="text-sm font-medium text-balance-tr text-fg">{operator.name}</span>
          </li>
        ))}
      </ul>
    </>
  )
}
