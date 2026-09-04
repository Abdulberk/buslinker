import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Check, ChevronRight, CircleAlert, Info, Pencil } from 'lucide-react'
import { DEFAULT_POLICY } from '@/entities/seat/model'
import { quote } from '@/entities/seat/rules'
import { useBookingStore } from '@/features/booking/store'
import { OrderSummary } from '@/features/checkout/OrderSummary'
import {
  PassengerFields,
  emptyCheckoutValues,
  resolveContact,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutValues,
} from '@/features/checkout/PassengerFields'
import { GenderMark } from '@/features/seat-map/SeatGlyph'
import { seatMapQuery, tripQuery } from '@/shared/api/queries'
import { cn } from '@/shared/lib/cn'
import { checkoutSuccessPath, seatPath } from '@/shared/lib/search-params'
import { formatPrice } from '@/shared/lib/tr'
import { Button } from '@/shared/ui/button'
import { Card, CardBody } from '@/shared/ui/card'
import { Checkbox } from '@/shared/ui/primitives'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'
import { VisuallyHidden } from '@/shared/ui/visually-hidden'

/**
 * Checkout, in two honest steps.
 *
 * Payment is out of scope for this build, so the last step neither renders a
 * card form nor implies that money moves. What it does do is everything a
 * ticketing flow actually owes the traveller before that point: named
 * passengers, one contact channel, the terms, and a total that reconciles.
 */

type Step = 1 | 2

const STEPS: readonly { id: Step; label: string }[] = [
  { id: 1, label: 'Yolcu Bilgileri' },
  { id: 2, label: 'Onay' },
]

const STEP_TITLE: Record<Step, string> = {
  1: 'Yolcu Bilgileri',
  2: 'Rezervasyon Onayı',
}

const STEP_LEAD: Record<Step, string> = {
  1: 'Her koltuk için yolcunun adını ve soyadını girin, biletin gönderileceği iletişim bilgilerini ekleyin.',
  2: 'Bilgilerinizi son kez kontrol edin. Bu tanıtım sürümünde ödeme alınmaz ve gerçek bir bilet düzenlenmez.',
}

const TERMS_CHECKBOX_ID = 'checkout-terms'

export default function CheckoutPage() {
  const { tripId = '' } = useParams<{ tripId: string }>()
  const navigate = useNavigate()

  const enabled = tripId !== ''
  const tripResult = useQuery({ ...tripQuery(tripId), enabled })
  const seatMapResult = useQuery({ ...seatMapQuery(tripId), enabled })
  const trip = tripResult.data
  const seatMap = seatMapResult.data

  const picks = useBookingStore((s) => s.picks)
  const draftTripId = useBookingStore((s) => s.tripId)

  const [step, setStep] = useState<Step>(1)
  const [values, setValues] = useState<CheckoutValues>(() => emptyCheckoutValues(picks.length))
  const [errors, setErrors] = useState<CheckoutErrors>({})
  const [terms, setTerms] = useState(false)
  const [termsError, setTermsError] = useState<string | undefined>(undefined)

  const stepHeadingRef = useRef<HTMLHeadingElement>(null)

  const policy = seatMap?.policy ?? DEFAULT_POLICY
  const currentQuote = useMemo(() => quote(picks, policy), [picks, policy])

  useEffect(() => {
    document.title = `${STEP_TITLE[step]} | BusLinker`
  }, [step])

  const goToStep = (next: Step) => {
    setStep(next)
    // The heading is the step's name, so moving focus there both announces
    // where the traveller landed and puts the keyboard at the top of it.
    window.requestAnimationFrame(() => stepHeadingRef.current?.focus())
  }

  const focusField = (key: string) => {
    document.querySelector<HTMLInputElement>(`#field-${key}`)?.focus()
  }

  const handleValuesChange = (next: CheckoutValues, changedKeys: readonly string[]) => {
    setValues(next)
    setErrors((prev) => {
      if (!changedKeys.some((key) => prev[key])) return prev
      const out: Record<string, string | undefined> = { ...prev }
      for (const key of changedKeys) delete out[key]
      return out
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (step === 1) {
      const result = validateCheckout(values, picks.length)
      setErrors(result.errors)
      if (result.firstInvalidKey) {
        focusField(result.firstInvalidKey)
        return
      }
      goToStep(2)
      return
    }

    if (!terms) {
      setTermsError('Devam etmek için kullanım koşullarını onaylamanız gerekiyor.')
      document.getElementById(TERMS_CHECKBOX_ID)?.focus()
      return
    }

    toast.info('Bu tanıtım sürümünde sizden ödeme alınmadı.', {
      description: 'Rezervasyon yalnızca örnek amaçlıdır; gerçek bir bilet düzenlenmez.',
    })
    void navigate(checkoutSuccessPath(tripId))
  }

  if (!enabled) return <Navigate to="/" replace />

  // The draft is the only thing that makes this page meaningful; without one
  // (or with one belonging to another departure) the seat page is the truth.
  if (picks.length === 0 || draftTripId !== tripId) {
    return <Navigate to={seatPath(tripId)} replace />
  }

  if (tripResult.isError || seatMapResult.isError) {
    return (
      <>
        <PageHeader
          title="Sefer bulunamadı"
          lead="Bu seferin bilgilerine ulaşılamadı. Güncel seferler için yeni bir arama yapabilirsiniz."
          breadcrumbs={[{ label: 'Ana sayfa', to: '/' }]}
        />
        <div className="app-container section-y">
          <div className="mx-auto max-w-md text-center">
            <span
              className="mx-auto grid size-16 place-items-center rounded-full bg-surface-sunken text-fg-subtle"
              aria-hidden="true"
            >
              <CircleAlert className="size-7" />
            </span>
            <p className="mt-5 text-sm text-fg-secondary">
              Bağlantı geçerliliğini yitirmiş ya da sefer kaldırılmış olabilir. Koltuk seçimine
              dönerek yeniden deneyebilirsiniz.
            </p>
            <div className="mt-7 flex flex-col items-stretch gap-3 xs:flex-row xs:justify-center">
              <Button variant="primary" size="lg" asChild>
                <Link to={seatPath(tripId)}>Koltuk seçimine dönün</Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link to="/">Sefer arayın</Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!trip || !seatMap) {
    return (
      <>
        <PageHeader title={STEP_TITLE[step]} lead={STEP_LEAD[step]} />
        <div className="app-container section-y" aria-busy="true">
          <span className="sr-only">Sipariş bilgileri yükleniyor</span>
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="grid gap-4">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            <Skeleton className="h-112 w-full rounded-xl" />
          </div>
        </div>
      </>
    )
  }

  const contact = resolveContact(values)
  const passengerCount = picks.length

  return (
    <>
      <PageHeader
        title={STEP_TITLE[step]}
        lead={STEP_LEAD[step]}
        breadcrumbs={[
          { label: 'Ana sayfa', to: '/' },
          { label: 'Koltuk seçimi', to: seatPath(tripId) },
        ]}
      />

      <div className="app-container section-y">
        <StepIndicator step={step} onGoBack={goToStep} />

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <form id="checkout-form" onSubmit={handleSubmit} noValidate className="min-w-0">
            <h2
              ref={stepHeadingRef}
              tabIndex={-1}
              className="rounded-sm font-display text-lg font-semibold text-balance-tr text-fg"
            >
              {step === 1 ? 'Yolcu bilgilerini girin' : 'Bilgilerinizi onaylayın'}
            </h2>

            {step === 1 ? (
              <>
                <p className="mt-2 max-w-prose text-sm text-fg-secondary">
                  Bilgileri kimliğinizde yazdığı gibi girin; bilet üzerinde bu şekilde görünür.
                  Girdikleriniz bu tanıtım sürümünde yalnızca tarayıcınızda kalır, hiçbir yere
                  gönderilmez.
                </p>

                <PassengerFields
                  picks={picks}
                  values={values}
                  onChange={handleValuesChange}
                  errors={errors}
                  className="mt-6"
                />

                <div className="mt-6 flex flex-col-reverse gap-3 xs:flex-row xs:items-center xs:justify-between">
                  <Button variant="ghost" size="md" asChild className="xs:-ml-3">
                    <Link to={seatPath(tripId)}>
                      <ArrowLeft className="size-4" aria-hidden="true" />
                      Koltuk seçimine dönün
                    </Link>
                  </Button>
                  <Button type="submit" variant="primary" size="lg" className="max-lg:hidden">
                    Devam Edin
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div
                  id="demo-note"
                  className="mt-4 flex gap-3 rounded-xl border border-info/25 bg-info-tint p-4"
                >
                  <Info className="mt-0.5 size-5 shrink-0 text-info-fg" aria-hidden="true" />
                  <div className="min-w-0 text-sm">
                    <p className="font-semibold text-info-fg">
                      Bu bir tanıtım sürümüdür, ödeme alınmaz.
                    </p>
                    <p className="mt-1 text-fg-secondary">
                      Ödeme altyapısı bu sürümün kapsamı dışındadır: kart bilgisi istenmez, sizden
                      hiçbir tutar tahsil edilmez ve gerçek bir bilet düzenlenmez. Aşağıdaki düğme
                      yalnızca akışın son adımını gösterir.
                    </p>
                  </div>
                </div>

                <Card className="mt-4">
                  <CardBody>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-display text-base font-semibold text-fg">Yolcular</h3>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          goToStep(1)
                        }}
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                        Düzenleyin
                      </Button>
                    </div>

                    <ul className="mt-4 flex flex-col gap-3">
                      {picks.map((pick, index) => {
                        const passenger = values.passengers[index] ?? {
                          firstName: '',
                          lastName: '',
                        }
                        return (
                          <li
                            key={pick.key}
                            className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border pb-3 last:border-b-0 last:pb-0"
                          >
                            <span
                              className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-sunken text-sm font-semibold text-fg tabular-nums"
                              data-numeric
                            >
                              {pick.label}
                              <VisuallyHidden>numaralı koltuk</VisuallyHidden>
                            </span>
                            <span className="min-w-0 text-sm font-medium text-fg">
                              {`${passenger.firstName} ${passenger.lastName}`.trim()}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-fg-muted">
                              {pick.gender === 'S' ? null : <GenderMark gender={pick.gender} />}
                              {pick.gender === 'M'
                                ? 'Erkek yolcu'
                                : pick.gender === 'F'
                                  ? 'Kadın yolcu'
                                  : 'Yolcu'}
                            </span>
                          </li>
                        )
                      })}
                    </ul>

                    <h3 className="mt-6 font-display text-base font-semibold text-fg">
                      İletişim bilgileri
                    </h3>
                    <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-[10rem_minmax(0,1fr)]">
                      <dt className="text-fg-muted">İletişim kişisi</dt>
                      <dd className="text-fg">
                        {`${contact.firstName} ${contact.lastName}`.trim()}
                      </dd>
                      <dt className="text-fg-muted">E-posta</dt>
                      <dd className="wrap-break-word text-fg">{contact.email}</dd>
                      <dt className="text-fg-muted">Telefon</dt>
                      <dd className="text-fg" data-numeric>
                        {contact.phone}
                      </dd>
                    </dl>
                  </CardBody>
                </Card>

                <section
                  aria-labelledby="cancellation-title"
                  className="mt-4 rounded-xl border border-border bg-surface-sunken p-4 sm:p-5"
                >
                  <h3
                    id="cancellation-title"
                    className="font-display text-base font-semibold text-fg"
                  >
                    İptal ve değişiklik koşulları
                  </h3>
                  <ul className="mt-3 flex flex-col gap-2 text-sm text-fg-secondary">
                    <li className="flex gap-2">
                      <span
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-brand/50"
                        aria-hidden="true"
                      />
                      Biletinizi kalkış saatinden önce PNR kodunuzla iptal edebilir ya da
                      değiştirebilirsiniz.
                    </li>
                    <li className="flex gap-2">
                      <span
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-brand/50"
                        aria-hidden="true"
                      />
                      İptalde bilet bedelinden örnek olarak <span data-numeric>%10</span> kesinti
                      gösterilir; bu oran geçerli bir iptal koşulu değildir, gerçek oran firmaya ve
                      kalkışa kalan süreye göre değişir.
                    </li>
                    <li className="flex gap-2">
                      <span
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-brand/50"
                        aria-hidden="true"
                      />
                      Kalkışı gerçekleşmiş seferlerde çevrim içi iptal yapılamaz.
                    </li>
                  </ul>
                </section>

                <div className="mt-5">
                  <label className="flex cursor-pointer items-start gap-2.5 text-sm text-fg-secondary">
                    <Checkbox
                      id={TERMS_CHECKBOX_ID}
                      checked={terms}
                      onCheckedChange={(checked) => {
                        setTerms(checked === true)
                        setTermsError(undefined)
                      }}
                      {...(termsError && {
                        'aria-describedby': 'checkout-terms-error',
                        'aria-invalid': true,
                      })}
                      className="mt-0.5"
                    />
                    <span>
                      <Link
                        to="/kullanim-kosullari"
                        className="font-medium text-brand-fg underline-offset-4 hover:underline"
                      >
                        Kullanım koşullarını
                      </Link>{' '}
                      okudum, kabul ediyorum.
                    </span>
                  </label>
                  {termsError ? (
                    <p
                      id="checkout-terms-error"
                      role="alert"
                      className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-danger-fg"
                    >
                      <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
                      {termsError}
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 xs:flex-row xs:items-center xs:justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => {
                      goToStep(1)
                    }}
                    className="xs:-ml-3"
                  >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Yolcu bilgilerine dönün
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    aria-describedby="demo-note"
                    className="max-lg:hidden"
                  >
                    Tanıtım Rezervasyonunu Tamamlayın
                  </Button>
                </div>
              </>
            )}
          </form>

          <OrderSummary
            trip={trip}
            picks={picks}
            quote={currentQuote}
            className="lg:sticky lg:top-6"
          />
        </div>
      </div>

      <div className="sticky bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="app-container flex items-center gap-4 py-3">
          <div className="min-w-0">
            <p className="text-2xs text-fg-muted">
              Toplam · <span data-numeric>{passengerCount}</span> yolcu
            </p>
            <p className="font-display text-lg font-semibold text-fg tabular-nums" data-numeric>
              {formatPrice(currentQuote.total)}
            </p>
          </div>
          <Button
            type="submit"
            form="checkout-form"
            variant="primary"
            size="lg"
            className="ml-auto shrink-0"
            {...(step === 2 && { 'aria-describedby': 'demo-note' })}
          >
            {step === 1 ? 'Devam Edin' : 'Tamamlayın'}
          </Button>
        </div>
      </div>
    </>
  )
}

/**
 * The wizard's position, as an ordered list.
 *
 * A completed step is a button back to it; an upcoming step is inert text, so
 * validation cannot be jumped over by clicking ahead.
 */
function StepIndicator({ step, onGoBack }: { step: Step; onGoBack: (next: Step) => void }) {
  return (
    <nav aria-label="Rezervasyon adımları">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {STEPS.map((item, index) => {
          const done = item.id < step
          const current = item.id === step

          const mark = (
            <span
              className={cn(
                'grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums',
                current
                  ? 'bg-brand text-on-brand'
                  : done
                    ? 'bg-success-tint text-success-fg'
                    : 'bg-surface-sunken text-fg-muted',
              )}
              aria-hidden="true"
              data-numeric
            >
              {done ? <Check className="size-4" /> : item.id}
            </span>
          )

          const label = (
            <span
              className={cn('text-sm', current ? 'font-semibold text-fg' : 'text-fg-secondary')}
            >
              {item.label}
            </span>
          )

          return (
            <li key={item.id} className="flex items-center gap-2">
              {done ? (
                <button
                  type="button"
                  onClick={() => {
                    onGoBack(item.id)
                  }}
                  className="tap-44 flex items-center gap-2 rounded-lg px-1 py-1 transition-colors duration-(--duration-fast) hover:bg-surface-sunken"
                >
                  {mark}
                  {label}
                  <VisuallyHidden>adımına dönün, tamamlandı</VisuallyHidden>
                </button>
              ) : (
                <span
                  className="flex items-center gap-2 px-1 py-1"
                  {...(current && { 'aria-current': 'step' as const })}
                >
                  {mark}
                  {label}
                </span>
              )}
              {index < STEPS.length - 1 ? (
                <ChevronRight className="size-4 shrink-0 text-fg-subtle" aria-hidden="true" />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
