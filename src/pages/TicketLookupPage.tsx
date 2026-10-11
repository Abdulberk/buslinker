import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { CircleAlert, Search, Ticket, User } from 'lucide-react'
import { PnrCode } from '@/features/ticket/PnrCode'
import { TicketHeading } from '@/features/ticket/TicketActions'
import {
  DEMO_PNRS,
  PNR_LENGTH,
  effectiveStatus,
  findTicket,
  getTicket,
  isPnrShape,
  issuedTickets,
  ticketRoute,
  type Ticket as TicketRecord,
  type TicketStatus,
} from '@/shared/api/tickets'
import { formatDateShort, upperAscii } from '@/shared/lib/tr'
import { Button } from '@/shared/ui/button'
import { Card, CardBody } from '@/shared/ui/card'
import { Field } from '@/shared/ui/field'
import { PageHeader } from '@/shared/ui/page-header'

// `| undefined` is required under exactOptionalPropertyTypes: clearing a field
// by assigning undefined is only legal when the type admits it.
interface Errors {
  pnr?: string | undefined
  surname?: string | undefined
}

/** What a demo code will open, said before it is opened. */
const DEMO_STATE: Record<TicketStatus, string> = {
  confirmed: 'Yaklaşan yolculuk',
  used: 'Tamamlandı',
  cancelled: 'İptal edildi',
}

const LINK = 'font-medium text-brand-fg underline underline-offset-4 hover:no-underline'

export default function TicketLookupPage() {
  const navigate = useNavigate()
  const submitRef = useRef<HTMLButtonElement>(null)

  const [values, setValues] = useState({ pnr: '', surname: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [notFound, setNotFound] = useState(false)

  // Read once per visit: the demo set is fixed, and this session's bookings
  // only change on the checkout screen.
  const demos = useMemo(
    () => DEMO_PNRS.map(getTicket).filter((t): t is TicketRecord => t !== undefined),
    [],
  )
  const booked = useMemo(() => issuedTickets(), [])

  useEffect(() => {
    document.title = 'Bilet Sorgula | BusLinker'
  }, [])

  const setSurname = (event: { target: { value: string } }) => {
    setValues((v) => ({ ...v, surname: event.target.value }))
    setErrors((e) => ({ ...e, surname: undefined }))
    setNotFound(false)
  }

  // A PNR is a machine identifier, not Turkish text: upperAscii keeps a typed
  // "i" as "I" rather than "İ", which would fail the [A-Z0-9] shape check.
  const setPnr = (raw: string) => {
    setValues((v) => ({ ...v, pnr: upperAscii(raw.trim()).slice(0, PNR_LENGTH) }))
    setErrors((e) => ({ ...e, pnr: undefined }))
    setNotFound(false)
  }

  // A demo code needs its surname too, or the lookup below would refuse it.
  // Focus goes to the submit button: one more press opens the ticket.
  const fillDemo = (ticket: TicketRecord) => {
    setValues({ pnr: ticket.pnr, surname: ticket.surname })
    setErrors({})
    setNotFound(false)
    submitRef.current?.focus()
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

    // Both halves must match: with the code alone, one mistyped character
    // opened a stranger's ticket.
    const ticket = findTicket(pnr, values.surname)
    if (!ticket) {
      setNotFound(true)
      return
    }

    void navigate(`/bilet/${ticket.pnr}`)
  }

  return (
    <>
      <PageHeader
        title="Bilet Sorgula"
        lead="PNR kodunuz ve soyadınızla biletinizi görüntüleyebilir, sefer saatinizi ve koltuk numaranızı kontrol edebilirsiniz."
      />

      <div className="app-container section-y">
        <div className="mx-auto max-w-xl">
          <Card>
            <CardBody>
              <form onSubmit={handleSubmit} noValidate aria-labelledby="lookup-form-title">
                <h2 id="lookup-form-title" className="font-display text-lg font-semibold text-fg">
                  Bilet bilgilerinizi girin
                </h2>
                <p className="mt-1 mb-5 text-sm text-fg-secondary">
                  İki bilgi yeterlidir. Üyelik ya da giriş yapmanız gerekmez.
                </p>

                <Field
                  label="PNR kodu"
                  name="pnr"
                  value={values.pnr}
                  onChange={(event) => {
                    setPnr(event.target.value)
                  }}
                  error={errors.pnr}
                  hint="Bilette ve onay e-postasında yer alan 6 karakterlik kod."
                  // A sample code here read as a value already filled in.
                  placeholder="6 karakter"
                  icon={<Ticket className="size-4" aria-hidden="true" />}
                  maxLength={PNR_LENGTH}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="off"
                  inputMode="text"
                  className="font-display font-semibold tracking-[0.12em] uppercase placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:normal-case"
                  data-numeric
                />

                <Field
                  label="Soyad"
                  name="surname"
                  value={values.surname}
                  onChange={setSurname}
                  error={errors.surname}
                  hint="Bileti alan kişinin ya da yolculardan birinin soyadı."
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
                        PNR kodunu ve soyadı biletteki gibi yazdığınızdan emin olun. Kodu SMS ile
                        aldıysanız baştaki ve sondaki boşlukları da temizleyin.
                      </p>
                    </div>
                  </div>
                ) : null}

                <Button ref={submitRef} type="submit" size="lg" full className="mt-6">
                  <Search className="size-4" aria-hidden="true" />
                  Bileti Sorgula
                </Button>
              </form>
            </CardBody>
          </Card>

          <section
            aria-labelledby="recover-title"
            className="mt-6 rounded-xl border border-border bg-surface-sunken p-4 sm:p-5"
          >
            <TicketHeading id="recover-title">PNR kodunuzu bulamıyor musunuz?</TicketHeading>
            <ul className="mt-3 flex flex-col gap-2.5 text-sm text-fg-secondary">
              <li>
                <span className="font-medium text-fg">E-posta ve SMS: </span>
                Kod, satın almadan sonra gönderilen onay e-postasında ve SMS’te yer alır. E-postayı
                göremiyorsanız gereksiz (spam) klasörüne bakın.
              </li>
              <li>
                <span className="font-medium text-fg">Üyelikle aldıysanız: </span>
                biletleriniz{' '}
                <Link to="/hesabim/seferlerim" className={LINK}>
                  Seferlerim
                </Link>{' '}
                sayfasında listelenir.
              </li>
              {booked.length > 0 ? (
                <li>
                  <span className="font-medium text-fg">
                    Bu tarayıcıda yaptığınız rezervasyonlar:{' '}
                  </span>
                  <span className="mt-1.5 flex flex-wrap gap-2">
                    {booked.map((ticket) => (
                      <BookedLink key={ticket.pnr} ticket={ticket} />
                    ))}
                  </span>
                </li>
              ) : null}
              <li>
                <span className="font-medium text-fg">Hâlâ bulamadıysanız: </span>
                ad, soyad ve sefer tarihinizle{' '}
                <Link to="/yardim" className={LINK}>
                  Yardım merkezi
                </Link>{' '}
                üzerinden bize ulaşın.
              </li>
            </ul>
          </section>

          <section aria-labelledby="demo-codes-title" className="mt-6">
            <TicketHeading id="demo-codes-title">Deneme kodları</TicketHeading>
            <p className="mt-1 text-sm text-fg-muted">
              Tanıtım sürümündeki örnek biletler. Birini seçtiğinizde kod ve soyad forma yazılır.
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {demos.map((ticket) => {
                const state = DEMO_STATE[effectiveStatus(ticket)]
                return (
                  <li key={ticket.pnr}>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        fillDemo(ticket)
                      }}
                      className="h-auto w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-start"
                    >
                      <PnrCode code={ticket.pnr} className="text-base text-fg" />
                      <span className="text-xs font-normal text-fg-muted">{state}</span>
                      <span className="sr-only">: kodu ve soyadı forma yazın</span>
                    </Button>
                  </li>
                )
              })}
            </ul>
          </section>

          <p className="mt-6 text-sm text-fg-muted">
            Biletinizi iptal etmek istiyorsanız{' '}
            <Link to="/bilet-iptal" className={LINK}>
              bilet iptal sayfasını
            </Link>{' '}
            kullanabilirsiniz.
          </p>
        </div>
      </div>
    </>
  )
}

/** One of this session's bookings, by code and route, straight to its ticket. */
function BookedLink({ ticket }: { ticket: TicketRecord }) {
  const { from, to } = ticketRoute(ticket)
  return (
    <Link
      to={`/bilet/${ticket.pnr}`}
      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-fg hover:bg-hover"
    >
      <PnrCode code={ticket.pnr} className="text-sm" />
      <span className="text-xs text-fg-muted">
        {from?.name ?? '—'} – {to?.name ?? '—'}, {formatDateShort(ticket.trip.departsAt)}
      </span>
    </Link>
  )
}
