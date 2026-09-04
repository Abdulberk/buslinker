import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { CircleAlert, Info, Search, Ticket as TicketIcon, User } from 'lucide-react'
import { getTicket, isPnrShape, ticketRoute, type Ticket } from '@/shared/api/tickets'
import { formatDateLong, formatPrice, formatTime, upperAscii } from '@/shared/lib/tr'
import { Button } from '@/shared/ui/button'
import { Card, CardBody } from '@/shared/ui/card'
import { Field } from '@/shared/ui/field'
import { PageHeader } from '@/shared/ui/page-header'
import { Dialog, DialogClose, DialogContent } from '@/shared/ui/primitives'

interface Errors {
  pnr?: string | undefined
  surname?: string | undefined
}

const PNR_LENGTH = 6

/**
 * Illustrative only. A real deduction depends on the carrier's own tariff and
 * on how close to departure the request is; this build has no such contract,
 * so the number is presented as an example and labelled as one everywhere it
 * appears.
 */
const DEDUCTION_RATE = 0.1

export default function TicketCancelPage() {
  const [searchParams] = useSearchParams()
  const pnrRef = useRef<HTMLInputElement>(null)

  const [values, setValues] = useState(() => ({
    pnr: upperAscii((searchParams.get('pnr') ?? '').trim()).slice(0, PNR_LENGTH),
    surname: '',
  }))
  const [errors, setErrors] = useState<Errors>({})
  const [notFound, setNotFound] = useState(false)
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    document.title = 'Bilet İptal | BusLinker'
  }, [])

  const setPnr = (raw: string) => {
    setValues((v) => ({ ...v, pnr: upperAscii(raw.trim()).slice(0, PNR_LENGTH) }))
    setErrors((e) => ({ ...e, pnr: undefined }))
    setNotFound(false)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setNotFound(false)

    const pnr = values.pnr.trim()
    const next: Errors = {}
    if (!pnr) next.pnr = 'PNR kodunuzu girin.'
    else if (!isPnrShape(pnr))
      next.pnr = 'PNR kodu 6 karakterden oluşur ve yalnızca harf ile rakam içerir.'
    if (!values.surname.trim()) next.surname = 'Bilette yazan soyadı girin.'

    setErrors(next)
    const firstInvalid = (['pnr', 'surname'] as const).find((key) => next[key])
    if (firstInvalid) {
      document.querySelector<HTMLInputElement>(`#field-${firstInvalid}`)?.focus()
      return
    }

    const found = getTicket(pnr)
    if (!found) {
      setNotFound(true)
      return
    }
    setTicket(found)
  }

  const reset = () => {
    setTicket(null)
    setValues({ pnr: '', surname: '' })
    setErrors({})
    setNotFound(false)
    // Returning focus to the first field is what makes "başka bilet" feel like
    // a fresh query rather than a cleared screen.
    window.requestAnimationFrame(() => pnrRef.current?.focus())
  }

  return (
    <>
      <PageHeader
        title="Bilet İptal"
        lead="PNR kodunuz ve soyadınızla biletinizi bulun, iptal koşullarını ve iade tutarını görün."
        breadcrumbs={[{ label: 'Bilet Sorgula', to: '/bilet-sorgula' }]}
      />

      <div className="app-container section-y">
        <div className="mx-auto max-w-xl">
          {ticket ? (
            <ResolvedTicket
              ticket={ticket}
              onReset={reset}
              confirmOpen={confirmOpen}
              onConfirmOpenChange={setConfirmOpen}
            />
          ) : (
            <>
              <Card>
                <CardBody>
                  <form onSubmit={handleSubmit} noValidate aria-labelledby="cancel-form-title">
                    <h2
                      id="cancel-form-title"
                      className="font-display text-lg font-semibold text-fg"
                    >
                      İptal edilecek bileti bulun
                    </h2>
                    <p className="mt-1 mb-5 text-sm text-fg-secondary">
                      Bilet bilgilerinizi girdiğinizde iptal koşulları ve iade tutarı gösterilir. Bu
                      adımda hiçbir işlem yapılmaz.
                    </p>

                    <Field
                      label="PNR kodu"
                      name="pnr"
                      ref={pnrRef}
                      value={values.pnr}
                      onChange={(event) => {
                        setPnr(event.target.value)
                      }}
                      error={errors.pnr}
                      hint="Onay e-postanızdaki 6 karakterlik kod."
                      placeholder="BK7J2M"
                      icon={<TicketIcon className="size-4" aria-hidden="true" />}
                      maxLength={PNR_LENGTH}
                      autoCapitalize="characters"
                      autoCorrect="off"
                      spellCheck={false}
                      autoComplete="off"
                      className="font-display font-semibold"
                      data-numeric
                    />

                    <Field
                      label="Soyad"
                      name="surname"
                      value={values.surname}
                      onChange={(event) => {
                        setValues((v) => ({ ...v, surname: event.target.value }))
                        setErrors((e) => ({ ...e, surname: undefined }))
                        setNotFound(false)
                      }}
                      error={errors.surname}
                      hint="Bileti alan yolcunun soyadını yazın."
                      placeholder="Yılmaz"
                      icon={<User className="size-4" aria-hidden="true" />}
                      autoComplete="family-name"
                    />

                    {notFound ? (
                      <div
                        role="alert"
                        className="mt-2 flex gap-3 rounded-lg border border-danger/25 bg-danger-tint p-3.5"
                      >
                        <CircleAlert
                          className="mt-0.5 size-5 shrink-0 text-danger-fg"
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-danger-fg">
                            Bu bilgilere ait bilet bulunamadı.
                          </p>
                          <p className="mt-1 text-sm text-fg-secondary">
                            PNR kodunu onay e-postanızdan kontrol edip tekrar deneyin.
                          </p>
                        </div>
                      </div>
                    ) : null}

                    <Button type="submit" size="lg" full className="mt-6">
                      <Search className="size-4" aria-hidden="true" />
                      Bileti Bulun
                    </Button>
                  </form>
                </CardBody>
              </Card>

              <p className="mt-6 text-sm text-fg-muted">
                Yalnızca biletinizi görüntülemek istiyorsanız{' '}
                <Link
                  to="/bilet-sorgula"
                  className="font-medium text-brand-fg underline-offset-4 hover:underline"
                >
                  bilet sorgulama sayfasını
                </Link>{' '}
                kullanabilirsiniz.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  )
}

function ResolvedTicket({
  ticket,
  onReset,
  confirmOpen,
  onConfirmOpenChange,
}: {
  ticket: Ticket
  onReset: () => void
  confirmOpen: boolean
  onConfirmOpenChange: (open: boolean) => void
}) {
  const { from, to, operator } = ticketRoute(ticket)
  const { trip } = ticket

  const deduction = Math.round(ticket.total * DEDUCTION_RATE)
  const refund = ticket.total - deduction

  const blocker = cancellationBlocker(ticket)

  const confirmCancel = () => {
    onConfirmOpenChange(false)
    toast.info('Bu tanıtım sürümünde iptal işlemi gerçekleştirilmez.', {
      description: 'Biletiniz olduğu gibi kalır; hiçbir kayıt değiştirilmez.',
    })
  }

  return (
    <>
      <Card>
        <CardBody>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display text-lg font-semibold text-fg">İptal edilecek bilet</h2>
              <p
                className="mt-1 text-sm font-semibold text-fg-secondary"
                style={{ letterSpacing: '0.18em' }}
                data-numeric
              >
                {ticket.pnr}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="tap-44" onClick={onReset}>
              Başka bilet sorgulayın
            </Button>
          </div>

          <dl className="mt-5 flex flex-col gap-3 border-t border-border pt-5 text-sm">
            <SummaryRow label="Sefer">
              {from?.name ?? '—'} — {to?.name ?? '—'}
              <span className="block text-fg-muted">{operator?.name ?? 'Otobüs firması'}</span>
            </SummaryRow>
            <SummaryRow label="Kalkış">
              <span data-numeric>
                {formatDateLong(trip.departsAt)}, {formatTime(trip.departsAt)}
              </span>
            </SummaryRow>
            <SummaryRow label="Yolcular">
              <ul className="flex flex-col gap-0.5">
                {ticket.passengers.map((passenger) => (
                  <li key={passenger.seat}>
                    {passenger.fullName}
                    <span className="text-fg-muted" data-numeric>
                      {` · ${passenger.seat}. koltuk`}
                    </span>
                  </li>
                ))}
              </ul>
            </SummaryRow>
            <SummaryRow label="Ödenen tutar">
              <span className="font-semibold text-fg" data-numeric>
                {formatPrice(ticket.total)}
              </span>
            </SummaryRow>
          </dl>
        </CardBody>
      </Card>

      {blocker ? (
        <Card className="mt-6 border-warning/30 bg-warning-tint">
          <CardBody>
            <h2 className="flex items-start gap-2.5 font-display text-base font-semibold text-fg">
              <CircleAlert className="mt-0.5 size-5 shrink-0 text-warning-fg" aria-hidden="true" />
              {blocker.title}
            </h2>
            <p className="mt-2 text-sm text-fg-secondary">{blocker.body}</p>
            <p className="mt-3 text-sm text-fg-secondary">
              İptal ve iade talebiniz için biletinizi satın aldığınız firmanın müşteri hizmetlerine
              PNR kodunuzla başvurmanız gerekir.
            </p>
            <Button variant="secondary" size="md" asChild className="mt-5">
              <Link to={`/bilet/${ticket.pnr}`}>Bilet ayrıntılarını görüntüleyin</Link>
            </Button>
          </CardBody>
        </Card>
      ) : (
        <>
          <Card className="mt-6">
            <CardBody>
              <h2 className="font-display text-base font-semibold text-fg">İade dökümü</h2>
              <dl className="mt-4 flex flex-col gap-2.5 text-sm">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-fg-secondary">Bilet tutarı</dt>
                  <dd className="font-medium text-fg" data-numeric>
                    {formatPrice(ticket.total)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-fg-secondary">
                    İptal kesintisi
                    <span className="text-fg-muted" data-numeric>
                      {' (%10)'}
                    </span>
                  </dt>
                  <dd className="font-medium text-danger-fg" data-numeric>
                    −{formatPrice(deduction)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-t border-border pt-4">
                  <dt className="text-base font-semibold text-fg">İade edilecek tutar</dt>
                  <dd className="font-display text-xl font-bold text-fg" data-numeric>
                    {formatPrice(refund)}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 flex gap-2.5 rounded-lg bg-surface-sunken p-3.5 text-xs text-fg-muted">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  %10&apos;luk kesinti burada yalnızca örnek olarak gösterilmektedir; geçerli bir
                  iptal koşulu değildir. Gerçek kesinti oranı firmaya ve kalkışa kalan süreye göre
                  değişir.
                </span>
              </p>

              <Button
                variant="danger"
                size="lg"
                full
                className="mt-6"
                onClick={() => {
                  onConfirmOpenChange(true)
                }}
              >
                Bileti İptal Et
              </Button>
              <p className="mt-3 text-center text-xs text-fg-muted">
                İptal işlemi geri alınamaz. Onaydan önce bir kez daha sorulur.
              </p>
            </CardBody>
          </Card>

          <Dialog open={confirmOpen} onOpenChange={onConfirmOpenChange}>
            <DialogContent
              title="İptali onaylayın"
              description={`${ticket.pnr} kodlu biletin iptali onaylanmak üzere.`}
            >
              <div className="px-5 py-4">
                <p className="text-sm text-fg-secondary">
                  {from?.name ?? '—'} — {to?.name ?? '—'} seferindeki{' '}
                  <span data-numeric>{ticket.passengers.length}</span> yolcunun bileti iptal
                  edilecek ve{' '}
                  <span className="font-semibold text-fg" data-numeric>
                    {formatPrice(refund)}
                  </span>{' '}
                  iade edilecektir.
                </p>
                <p className="mt-3 text-sm text-fg-muted">
                  Bu bir tanıtım sürümüdür: onaylasanız da biletiniz iptal edilmez.
                </p>
              </div>
              <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 xs:flex-row xs:justify-end">
                <DialogClose asChild>
                  <Button variant="secondary">Vazgeçin</Button>
                </DialogClose>
                <Button variant="danger" onClick={confirmCancel}>
                  Evet, iptal edin
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </>
  )
}

function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 xs:flex-row xs:gap-4">
      <dt className="shrink-0 text-fg-muted xs:w-32">{label}</dt>
      <dd className="min-w-0 text-fg">{children}</dd>
    </div>
  )
}

function cancellationBlocker(ticket: Ticket): { title: string; body: string } | null {
  if (ticket.status === 'cancelled') {
    return {
      title: 'Bu bilet zaten iptal edilmiş',
      body: 'Kayıtlarımızda bu bilet iptal edilmiş görünüyor, bu nedenle yeniden iptal edilemez.',
    }
  }
  if (ticket.status === 'used') {
    return {
      title: 'Bu seferin kalkış saati geçmiş',
      body: 'Kalkışı gerçekleşmiş bir sefer için çevrim içi iptal yapılamaz.',
    }
  }
  if (!ticket.refundable) {
    return {
      title: 'Bu bilet çevrim içi iptale kapalı',
      body: 'Biletiniz iptal ve iade hakkı bulunmayan bir tarifeyle alınmış; bu nedenle bu sayfadan iptal edilemez.',
    }
  }
  return null
}
