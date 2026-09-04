import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { Gift, ShoppingCart } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Card, CardBody } from '@/shared/ui/card'
import { Field } from '@/shared/ui/field'
import { Logo } from '@/shared/ui/logo'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/primitives'
import { cn } from '@/shared/lib/cn'
import { formatPrice } from '@/shared/lib/tr'
import { isEmail } from '@/features/auth/validation'

const PRESET_AMOUNTS = [250, 500, 1000, 2500] as const

const MIN_AMOUNT = 100
const MAX_AMOUNT = 10_000
const MESSAGE_MAX = 160

/** A sample code, shown masked: nothing here redeems anything. */
const SAMPLE_CODE = 'BLK-••••-••••-7314'

const STEPS: readonly { title: string; body: string }[] = [
  {
    title: 'Kartı alın',
    body: 'Tutarı seçin, alıcının adını ve e-posta adresini yazın. Kart, üzerindeki kod ile birlikte alıcıya iletilir.',
  },
  {
    title: 'Kodu bilet alırken girin',
    body: 'Sefer ve koltuk seçildikten sonra ödeme adımındaki hediye kart alanına kod yazılır.',
  },
  {
    title: 'Bakiyeden düşsün',
    body: 'Kart tutarı bilet ücretinden düşülür. Bakiye yetmezse kalan tutar normal ödeme ile tamamlanır.',
  },
]

const TERMS: readonly string[] = [
  'Hediye kart, satın alındığı tarihten itibaren bir yıl geçerlidir.',
  'Kart tutarı birden fazla bilette kullanılabilir; kalan bakiye kartta durur.',
  'Hediye kart nakde çevrilemez ve başka bir karta aktarılamaz.',
  'Kart ile alınan bir bilet iptal edilirse tutar yine hediye karta iade edilir.',
  'Kodu yalnızca hediye edeceğiniz kişiyle paylaşın; kodu bilen herkes kullanabilir.',
]

type FieldName = 'custom' | 'recipient' | 'email' | 'note'

// `| undefined` is required under exactOptionalPropertyTypes: clearing an
// error by assigning undefined is only legal if the type admits it.
type Errors = Partial<Record<FieldName, string | undefined>>

const ORDER: readonly FieldName[] = ['custom', 'recipient', 'email', 'note']

export default function GiftCardPage() {
  const [preset, setPreset] = useState<string>(String(PRESET_AMOUNTS[0]))
  const [custom, setCustom] = useState('')
  const [values, setValues] = useState({ recipient: '', email: '', note: '' })
  const [errors, setErrors] = useState<Errors>({})

  useEffect(() => {
    document.title = 'Hediye Kart | BusLinker'
  }, [])

  const customAmount = custom.trim() === '' ? null : Number(custom.replace(/\D/g, ''))
  const amount = customAmount !== null && customAmount > 0 ? customAmount : Number(preset)

  const set = (key: 'recipient' | 'email' | 'note') => (event: { target: { value: string } }) => {
    const raw = event.target.value
    setValues((v) => ({ ...v, [key]: key === 'note' ? raw.slice(0, MESSAGE_MAX) : raw }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  // A typed custom amount wins over the chips, so the two controls can never
  // disagree about what the card is worth.
  const handleCustom = (raw: string) => {
    setCustom(raw.replace(/\D/g, '').slice(0, 5))
    setErrors((e) => ({ ...e, custom: undefined }))
  }

  const handlePreset = (next: string) => {
    if (!next) return
    setPreset(next)
    setCustom('')
    setErrors((e) => ({ ...e, custom: undefined }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const next: Errors = {}
    if (customAmount !== null && (customAmount < MIN_AMOUNT || customAmount > MAX_AMOUNT))
      next.custom = `Tutar ${formatPrice(MIN_AMOUNT)} ile ${formatPrice(MAX_AMOUNT)} arasında olmalıdır.`
    if (values.recipient.trim().length < 2) next.recipient = 'Alıcının adını girin.'
    if (!values.email.trim()) next.email = 'Alıcının e-posta adresini girin.'
    else if (!isEmail(values.email)) next.email = 'Geçerli bir e-posta adresi girin.'

    setErrors(next)

    const firstInvalid = ORDER.find((key) => next[key])
    if (firstInvalid) {
      document
        .querySelector<HTMLInputElement | HTMLTextAreaElement>(`#field-${firstInvalid}`)
        ?.focus()
      return
    }

    toast.info('Hediye kart satışı bu tanıtım sürümünde etkin değil.', {
      description: 'Hiçbir ödeme alınmadı ve girdiğiniz bilgiler kaydedilmedi.',
    })
  }

  const remaining = MESSAGE_MAX - values.note.length

  return (
    <>
      <PageHeader
        title="Hediye Kart"
        lead="Yolculuğu hediye edin: tutarı siz belirleyin, alıcı kendi seferini ve koltuğunu seçsin."
        breadcrumbs={[{ label: 'Ana sayfa', to: '/' }]}
      />

      <div className="app-container section-y">
        <div className="grid gap-8 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-12">
          <div className="min-w-0 lg:sticky lg:top-6 lg:self-start">
            <GiftCardVisual amount={amount} recipient={values.recipient.trim()} />

            <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
              <Badge tone="warning">Tanıtım</Badge>
              <span>
                Karttaki kod örnektir ve bir bakiyeye karşılık gelmez. Bu sürümde hediye kart
                satılmaz.
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="min-w-0">
            <section aria-labelledby="tutar-baslik">
              <h2 id="tutar-baslik" className="text-xl sm:text-2xl">
                Tutarı seçin
              </h2>
              <p className="mt-2 max-w-prose text-base text-fg-secondary">
                Hazır tutarlardan birini seçebilir ya da kendi tutarınızı yazabilirsiniz.
              </p>

              <ToggleGroup
                type="single"
                value={custom === '' ? preset : ''}
                onValueChange={handlePreset}
                aria-label="Hediye kart tutarı"
                className="mt-4 flex flex-wrap gap-2"
              >
                {PRESET_AMOUNTS.map((value) => (
                  <ToggleGroupItem
                    key={value}
                    value={String(value)}
                    className="tap-44 px-4"
                    data-numeric
                  >
                    {formatPrice(value)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>

              <div className="mt-4 max-w-xs">
                <Field
                  label="Kendi tutarınız"
                  name="custom"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Örn. 750"
                  value={custom}
                  onChange={(event) => {
                    handleCustom(event.target.value)
                  }}
                  error={errors.custom}
                  hint={`${formatPrice(MIN_AMOUNT)} ile ${formatPrice(MAX_AMOUNT)} arasında bir tutar yazın.`}
                  data-numeric
                />
              </div>
            </section>

            <section aria-labelledby="alici-baslik" className="mt-10">
              <h2 id="alici-baslik" className="text-xl sm:text-2xl">
                Kimi mutlu edeceksiniz?
              </h2>
              <p className="mt-2 max-w-prose text-base text-fg-secondary">
                Kartı alıcıya biz ileteceğimiz için yalnızca adı ve e-posta adresi yeterlidir.
              </p>

              <div className="mt-4 max-w-xl">
                <Field
                  label="Alıcının adı"
                  name="recipient"
                  autoComplete="off"
                  placeholder="Örn. Elif"
                  value={values.recipient}
                  onChange={set('recipient')}
                  error={errors.recipient}
                  hint="Kartın üzerinde bu ad görünür."
                />

                <Field
                  label="Alıcının e-postası"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="off"
                  placeholder="ornek@eposta.com"
                  value={values.email}
                  onChange={set('email')}
                  error={errors.email}
                  hint="Kart bu adrese gönderilir."
                />

                <NoteField
                  value={values.note}
                  onChange={set('note')}
                  remaining={remaining}
                  max={MESSAGE_MAX}
                />
              </div>

              <Button type="submit" size="lg" className="mt-4">
                <ShoppingCart className="size-4" aria-hidden="true" />
                Satın alın
              </Button>

              <p className="mt-4 max-w-prose text-xs text-fg-muted">
                BusLinker bir tanıtım uygulamasıdır. Bu form hiçbir bilgiyi kaydetmez, bir sunucuya
                göndermez ve ödeme almaz.
              </p>
            </section>
          </form>
        </div>
      </div>

      <div className="border-y border-border bg-bg-alt">
        <div className="app-container section-y">
          <section aria-labelledby="nasil-baslik">
            <h2 id="nasil-baslik" className="text-2xl text-balance-tr sm:text-3xl">
              Nasıl kullanılır?
            </h2>
            <p className="mt-2 max-w-prose text-base text-fg-secondary">
              Hediye kart, bilet ücretinden düşen bir bakiyedir; ayrı bir üyelik gerektirmez.
            </p>

            <ol className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-5"
                >
                  {/* The number is decorative: an <ol> already announces the
                      item's position, so repeating it would double up. */}
                  <span
                    className="grid size-9 place-items-center rounded-full bg-brand/8 font-display text-base font-semibold text-brand-fg"
                    aria-hidden="true"
                    data-numeric
                  >
                    {index + 1}
                  </span>
                  <h3 className="text-base">{step.title}</h3>
                  <p className="text-sm text-fg-secondary">{step.body}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      <div className="app-container section-y">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
          <section aria-labelledby="kosul-baslik" className="min-w-0">
            <h2 id="kosul-baslik" className="text-xl sm:text-2xl">
              Kullanım koşulları
            </h2>
            <ul className="mt-4 flex max-w-prose flex-col gap-2 text-sm text-fg-secondary">
              {TERMS.map((term) => (
                <li key={term} className="flex gap-2">
                  <span
                    className="mt-2 size-1.5 shrink-0 rounded-full bg-brand/50"
                    aria-hidden="true"
                  />
                  {term}
                </li>
              ))}
            </ul>
            <p className="mt-4 max-w-prose text-sm text-fg-muted">
              Ayrıntılar için{' '}
              <Link
                to="/kullanim-kosullari"
                className="font-medium text-brand-fg underline-offset-4 hover:underline"
              >
                kullanım koşullarına
              </Link>{' '}
              göz atabilirsiniz.
            </p>
          </section>

          <aside className="min-w-0">
            <Card>
              <CardBody className="p-5 sm:p-5">
                <h2 className="flex items-center gap-2 text-base">
                  <Gift className="size-4 shrink-0 text-brand-fg" aria-hidden="true" />
                  Kart elinizde mi?
                </h2>
                <p className="mt-2 text-sm text-fg-secondary">
                  Bir hediye kartınız varsa önce seferinizi seçin; kod, ödeme adımındaki hediye kart
                  alanına girilir.
                </p>
                <Button variant="brand-outline" size="sm" full asChild className="mt-4">
                  <Link to="/">Sefer arayın</Link>
                </Button>
              </CardBody>
            </Card>
          </aside>
        </div>
      </div>
    </>
  )
}

/**
 * The card artwork is built from tokens rather than an image file, so it stays
 * crisp at any size and follows the brand ramp if the palette ever moves.
 */
function GiftCardVisual({ amount, recipient }: { amount: number; recipient: string }) {
  return (
    <div
      className={cn(
        'on-brand relative isolate overflow-hidden rounded-2xl p-5 shadow-lg sm:p-6',
        'bg-linear-to-br from-brand-500 via-brand-600 to-brand-800',
      )}
    >
      {/* Two soft highlights give the plastic its sheen; both are decorative. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-10 -z-10 size-44 rounded-full bg-neutral-0/15 blur-2xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -left-12 -z-10 size-48 rounded-full bg-brand-950/25 blur-2xl"
      />

      <div className="flex items-start justify-between gap-4">
        <Logo className="h-7 w-auto text-on-brand" />
        <span className="rounded-full border border-neutral-0/30 bg-neutral-0/10 px-2.5 py-1 text-2xs font-medium text-on-brand">
          Hediye Kart
        </span>
      </div>

      <p className="mt-8 font-display text-4xl font-semibold text-on-brand" data-numeric>
        {formatPrice(amount)}
      </p>

      <p className="mt-1 text-sm text-on-brand/80">
        {recipient === '' ? 'Alıcının adı kartta görünür' : `${recipient} için`}
      </p>

      <p className="mt-6 font-display text-base font-semibold text-on-brand/90">
        <span className="sr-only">Örnek kart kodu: </span>
        {SAMPLE_CODE}
      </p>
    </div>
  )
}

function NoteField({
  value,
  onChange,
  remaining,
  max,
}: {
  value: string
  onChange: (event: { target: { value: string } }) => void
  remaining: number
  max: number
}) {
  const id = 'field-note'
  const messageId = `${id}-message`
  const counterId = `${id}-counter`

  return (
    <div className="mb-3 flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-fg-secondary">
        Kısa mesajınız
      </label>
      <textarea
        id={id}
        name="note"
        rows={3}
        maxLength={max}
        value={value}
        onChange={onChange}
        placeholder="İyi yolculuklar!"
        aria-describedby={`${messageId} ${counterId}`}
        className={cn(
          'w-full min-w-0 resize-y rounded-lg border border-border-strong bg-surface p-3 text-base text-fg',
          'placeholder:text-fg-subtle',
          'transition-colors duration-(--duration-fast) ease-standard',
          'focus-within:border-brand hover:border-border-strong',
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <p id={messageId} className="min-h-4 text-xs text-fg-muted">
          İsteğe bağlıdır; mesaj kartla birlikte iletilir.
        </p>
        {/* Described-by only, with no live region: the count changes on every
            keystroke, and announcing each one would talk over the typing. */}
        <p id={counterId} className="shrink-0 text-xs text-fg-muted tabular-nums">
          {remaining} karakter kaldı
        </p>
      </div>
    </div>
  )
}
