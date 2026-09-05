import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  RadioGroup,
  RadioGroupItem,
} from '@/shared/ui/primitives'
import { cn } from '@/shared/lib/cn'
import { Flag } from '@/shared/ui/flag'
import { upperAscii } from '@/shared/lib/tr'
import { useLocale } from '@/shared/i18n/use-locale'
import {
  CURRENCIES,
  LANGUAGES,
  RATES_AS_OF,
  type CurrencyCode,
  type LanguageCode,
} from '@/shared/i18n/config'

/** The fare the currency tiles convert, so the choice is shown, not described. */
const EXAMPLE_FARE_TRY = 790

/**
 * The language and currency picker.
 *
 * Choices apply on selection rather than behind a Save button: the dialog is
 * the clearest possible preview of what it changes, since the copy around the
 * controls and the example fare inside them both restate themselves as soon as
 * you pick. A confirm step would only make you commit to a change you cannot
 * yet see.
 *
 * The trigger is supplied by the caller, so the header badge and the mobile
 * sheet row open the same dialog without either one owning it.
 */
export function LocaleDialog({
  children,
  open,
  onOpenChange,
}: {
  /** Rendered as the trigger. Omit it to drive the dialog from outside. */
  children?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const { t, i18n } = useTranslation()
  const { language, currency, setLanguage, setCurrency } = useLocale()

  // Under `exactOptionalPropertyTypes`, passing `open={undefined}` is not the
  // same as not passing it, and Radix reads the difference as "controlled with
  // no value". The props are therefore built, not spread through.
  const dialogProps: { open?: boolean; onOpenChange?: (open: boolean) => void } = {}
  if (open !== undefined) dialogProps.open = open
  if (onOpenChange) dialogProps.onOpenChange = onOpenChange

  return (
    <Dialog {...dialogProps}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent title={t('locale.title')} description={t('locale.description')}>
        <div className="flex flex-col gap-6 overflow-y-auto p-5">
          <Section heading={t('locale.languageHeading')}>
            <RadioGroup
              value={language}
              onValueChange={(next) => setLanguage(next as LanguageCode)}
              aria-label={t('locale.languageHeading')}
              className="grid gap-2 sm:grid-cols-2"
            >
              {LANGUAGES.map((option) => (
                <RadioGroupItem key={option.code} value={option.code}>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'grid size-9 shrink-0 place-items-center rounded-lg',
                      option.code === language ? 'bg-brand/15' : 'bg-surface-sunken',
                    )}
                  >
                    <Flag code={option.code} />
                  </span>
                  <span className="min-w-0">
                    {/* The name in the language itself, which is how someone
                        who cannot read the current one finds their own. */}
                    <span className="block truncate text-sm font-semibold text-fg">
                      {option.label}
                    </span>
                    <span className="block truncate text-xs text-fg-muted">
                      {t(`locale.languageName.${option.code}`)}
                    </span>
                  </span>
                </RadioGroupItem>
              ))}
            </RadioGroup>
          </Section>

          <Section heading={t('locale.currencyHeading')}>
            <RadioGroup
              value={currency}
              onValueChange={(next) => setCurrency(next as CurrencyCode)}
              aria-label={t('locale.currencyHeading')}
              className="grid gap-2 sm:grid-cols-2"
            >
              {CURRENCIES.map((option) => (
                <RadioGroupItem key={option.code} value={option.code}>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'grid size-9 shrink-0 place-items-center rounded-lg font-display text-base font-semibold',
                      option.code === currency
                        ? 'bg-brand/15 text-brand-fg'
                        : 'bg-surface-sunken text-fg-secondary',
                    )}
                  >
                    {option.code === 'TRY' ? '₺' : option.display}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-fg">
                      {t(`locale.currencyName.${option.code}`)}
                    </span>
                    <span className="block truncate text-xs text-fg-muted" data-numeric>
                      {option.code} · {formatPriceIn(EXAMPLE_FARE_TRY, option, i18n.language)}
                    </span>
                  </span>
                </RadioGroupItem>
              ))}
            </RadioGroup>
          </Section>

          <p className="text-xs text-fg-muted">{t('locale.ratesNote', { date: RATES_AS_OF })}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 font-display text-sm font-semibold text-fg">{heading}</h3>
      {children}
    </section>
  )
}

/**
 * The example fare for a currency that is not the active one.
 *
 * `formatPrice` reads the active currency, which is exactly right everywhere
 * else and wrong here: each tile has to show its own. The rule it applies is
 * the same one, kept in one expression so the two cannot drift far.
 */
function formatPriceIn(
  valueTry: number,
  currency: (typeof CURRENCIES)[number],
  language: string,
): string {
  const amount = valueTry / currency.tryPerUnit
  const text = new Intl.NumberFormat(language === 'en' ? 'en-GB' : 'tr-TR', {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(currency.decimals === 0 ? Math.round(amount) : amount)
  return currency.position === 'suffix'
    ? `${text} ${currency.display}`
    : `${currency.display}${text}`
}

/**
 * What the header shows: the flag carries the language, so the chip only has
 * to spell out the currency. `aria` keeps both in the accessible name, since a
 * flag says nothing to a screen reader.
 */
export function useLocaleSummary(): {
  language: LanguageCode
  currencyLabel: string
  aria: string
} {
  const { language, currency } = useLocale()
  const active = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0]
  const currencyLabel = active.code === 'TRY' ? 'TL' : active.code
  return { language, currencyLabel, aria: `${currencyLabel} · ${upperAscii(language)}` }
}
