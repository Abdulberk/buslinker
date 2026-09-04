import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { CircleAlert, Mail, Search, Ticket, User } from 'lucide-react'
import { DEMO_PNRS, getTicket, isPnrShape } from '@/shared/api/tickets'
import { upperAscii } from '@/shared/lib/tr'
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

const PNR_LENGTH = 6

export default function TicketLookupPage() {
  const navigate = useNavigate()
  const pnrRef = useRef<HTMLInputElement>(null)

  const [values, setValues] = useState({ pnr: '', surname: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [notFound, setNotFound] = useState(false)

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

  const fillDemo = (code: string) => {
    setPnr(code)
    pnrRef.current?.focus()
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

    const ticket = getTicket(pnr)
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
                  ref={pnrRef}
                  value={values.pnr}
                  onChange={(event) => {
                    setPnr(event.target.value)
                  }}
                  error={errors.pnr}
                  hint="Bilette ve onay e-postasında yer alan 6 karakterlik kod."
                  placeholder="BK7J2M"
                  icon={<Ticket className="size-4" aria-hidden="true" />}
                  maxLength={PNR_LENGTH}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="off"
                  inputMode="text"
                  className="font-display font-semibold"
                  data-numeric
                />

                <Field
                  label="Soyad"
                  name="surname"
                  value={values.surname}
                  onChange={setSurname}
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
                        PNR kodunu onay e-postanızdan kontrol edip tekrar deneyin. Kodu SMS ile
                        aldıysanız baştaki ve sondaki boşlukları da temizleyin.
                      </p>
                    </div>
                  </div>
                ) : null}

                <Button type="submit" size="lg" full className="mt-6">
                  <Search className="size-4" aria-hidden="true" />
                  Bileti Sorgula
                </Button>
              </form>
            </CardBody>
          </Card>

          <section aria-labelledby="demo-codes-title" className="mt-6">
            <h2 id="demo-codes-title" className="text-sm font-semibold text-fg">
              Deneme kodları
            </h2>
            <p className="mt-1 text-sm text-fg-muted">
              Elinizde bir PNR yoksa aşağıdaki tanıtım kodlarından birini seçerek örnek bir bileti
              görüntüleyebilirsiniz.
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {DEMO_PNRS.map((code) => (
                <li key={code}>
                  <Button
                    type="button"
                    variant="subtle"
                    size="sm"
                    onClick={() => {
                      fillDemo(code)
                    }}
                    className="tap-44 font-display font-semibold"
                    data-numeric
                  >
                    {code}
                    <span className="sr-only"> kodunu forma yazdır</span>
                  </Button>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="where-is-pnr-title"
            className="mt-6 rounded-xl border border-border bg-surface-sunken p-4 sm:p-5"
          >
            <h2
              id="where-is-pnr-title"
              className="flex items-center gap-2 font-display text-base font-semibold text-fg"
            >
              <Mail className="size-4 shrink-0 text-brand-fg" aria-hidden="true" />
              Biletiniz e-postanızda
            </h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-fg-secondary">
              <li className="flex gap-2">
                <span
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-brand/50"
                  aria-hidden="true"
                />
                Satın alma tamamlandığında PNR kodunuz, sefer saatiniz ve koltuk numaralarınız
                e-posta ile gönderilir.
              </li>
              <li className="flex gap-2">
                <span
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-brand/50"
                  aria-hidden="true"
                />
                E-postayı göremiyorsanız gereksiz (spam) klasörünü ve tanıtım sekmesini kontrol
                edin.
              </li>
              <li className="flex gap-2">
                <span
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-brand/50"
                  aria-hidden="true"
                />
                PNR kodu her zaman 6 karakterdir ve büyük harf ile rakamlardan oluşur.
              </li>
            </ul>
            <p className="mt-4 text-sm text-fg-muted">
              Biletinizi iptal etmek istiyorsanız{' '}
              <Link
                to="/bilet-iptal"
                className="font-medium text-brand-fg underline-offset-4 hover:underline"
              >
                bilet iptal sayfasını
              </Link>{' '}
              kullanabilirsiniz.
            </p>
          </section>
        </div>
      </div>
    </>
  )
}
