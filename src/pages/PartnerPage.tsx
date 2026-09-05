import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { Handshake, Send } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Card, CardBody } from '@/shared/ui/card'
import { Field } from '@/shared/ui/field'
import { PhoneField } from '@/shared/ui/phone-field'
import { Illustration } from '@/shared/ui/asset-icon'
import { OperatorLogo } from '@/shared/ui/operator-logo'
import { VALUE_ICON } from '@/shared/config/assets'
import { OPERATORS } from '@/shared/api/catalog'
import { cn } from '@/shared/lib/cn'
import { pluralTr } from '@/shared/lib/tr'
import { isEmail } from '@/features/auth/validation'

interface Value {
  readonly art: string
  readonly title: string
  readonly body: string
}

const VALUES: readonly Value[] = [
  {
    art: VALUE_ICON.bestPrice,
    title: 'Daha fazla yolcu',
    body: 'Seferleriniz, kalkış saati ve fiyat karşılaştırmasının içinde görünür. Yolcu firmayı aramak yerine hattı arar; siz de yalnızca kendi sitenize gelenlere değil, tüm aramaya açılırsınız.',
  },
  {
    art: VALUE_ICON.comfortableTravel,
    title: 'Gerçek zamanlı koltuk yönetimi',
    body: 'Koltuk durumu satış anında kilitlenir; aynı koltuğun iki kez satılması engellenir. Cinsiyet kuralları ve tekli koltuk farkı, sizin tanımladığınız biçimde uygulanır.',
  },
  {
    art: VALUE_ICON.securePayment,
    title: 'Tek panelden sefer yönetimi',
    body: 'Sefer saatlerini, güzergâhı, otobüs düzenini ve fiyatlandırmayı tek yerden güncellersiniz. Değişiklik, listelemeye ve koltuk planına aynı anda yansır.',
  },
]

const STEPS: readonly { title: string; body: string }[] = [
  {
    title: 'Başvurunuzu iletin',
    body: 'Aşağıdaki formu doldurun. Firma adınız, filo büyüklüğünüz ve işlettiğiniz hatlar ilk görüşme için yeterlidir.',
  },
  {
    title: 'Teknik görüşme yapalım',
    body: 'Mevcut otomasyonunuzu ve sefer verinizi hangi biçimde ürettiğinizi konuşuruz. Bir entegrasyon planı ve takvim çıkarırız.',
  },
  {
    title: 'Entegrasyonu kurun',
    body: 'Sefer, koltuk ve fiyat servisleri bağlanır. Test ortamında örnek bir günün tamamı uçtan uca denenir.',
  },
  {
    title: 'Yayına alın',
    body: 'Seferleriniz arama sonuçlarında görünmeye başlar. Panelden doluluğu ve iptal oranlarını izleyebilirsiniz.',
  },
]

const FLEET_SIZES = [
  { value: '1-10', label: '1 – 10 otobüs' },
  { value: '11-50', label: '11 – 50 otobüs' },
  { value: '51-150', label: '51 – 150 otobüs' },
  { value: '150+', label: '150 otobüs ve üzeri' },
] as const

const MESSAGE_MAX = 600

type FieldName = 'company' | 'contact' | 'email' | 'phone' | 'fleet' | 'message'

// `| undefined` is required under exactOptionalPropertyTypes: clearing an
// error by assigning undefined is only legal if the type admits it.
type Errors = Partial<Record<FieldName, string | undefined>>

const ORDER: readonly FieldName[] = ['company', 'contact', 'email', 'phone', 'fleet', 'message']

export default function PartnerPage() {
  const [values, setValues] = useState({
    company: '',
    contact: '',
    email: '',
    phone: '',
    fleet: '',
    message: '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'Firma İş Birliği | BusLinker'
  }, [])

  const set = (key: FieldName) => (event: { target: { value: string } }) => {
    const raw = event.target.value
    setValues((v) => ({ ...v, [key]: key === 'message' ? raw.slice(0, MESSAGE_MAX) : raw }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const next: Errors = {}
    if (values.company.trim().length < 2) next.company = 'Firma adını girin.'
    if (values.contact.trim().length < 3) next.contact = 'Yetkilinin adını ve soyadını girin.'
    if (!values.email.trim()) next.email = 'E-posta adresinizi girin.'
    else if (!isEmail(values.email)) next.email = 'Geçerli bir e-posta adresi girin.'
    if (!values.phone) next.phone = 'Numarayı ülke koduna uygun şekilde eksiksiz girin.'
    if (!values.fleet) next.fleet = 'Filo büyüklüğünü seçin.'
    if (values.message.trim().length < 20)
      next.message = 'İşlettiğiniz hatları en az 20 karakterle anlatın.'

    setErrors(next)

    const firstInvalid = ORDER.find((key) => next[key])
    if (firstInvalid) {
      document
        .querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
          `#field-${firstInvalid}`,
        )
        ?.focus()
      return
    }

    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      setValues({ company: '', contact: '', email: '', phone: '', fleet: '', message: '' })
      toast.info('Başvuru gönderimi bu tanıtım sürümünde etkin değil.', {
        description: 'Formunuz kaydedilmedi; hiçbir bilgi bir sunucuya iletilmedi.',
      })
    }, 600)
  }

  const remaining = MESSAGE_MAX - values.message.length

  return (
    <>
      <PageHeader
        title="Firma İş Birliği"
        lead="Seferlerinizi BusLinker'da listeleyin; koltuk yönetimini, fiyatlandırmayı ve sefer güncellemelerini tek panelden yürütün."
        breadcrumbs={[{ label: 'Ana sayfa', to: '/' }]}
      />

      <div className="app-container section-y">
        <section aria-labelledby="deger-baslik">
          <h2 id="deger-baslik" className="text-2xl text-balance-tr sm:text-3xl">
            Taşımacılara ne sağlıyoruz?
          </h2>
          <p className="mt-2 max-w-prose text-base text-fg-secondary">
            BusLinker bir tanıtım ürünüdür; aşağıdaki başlıklar arayüzün hâlihazırda kurduğu akışın
            firma tarafındaki karşılığını anlatır.
          </p>

          <ul className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((item) => (
              <li
                key={item.title}
                className="flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-5"
              >
                <Illustration src={item.art} alt="" width={80} height={80} className="size-12" />
                <h3 className="text-base">{item.title}</h3>
                <p className="text-sm text-fg-secondary">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="border-y border-border bg-bg-alt">
        <div className="app-container section-y">
          <section aria-labelledby="nasil-baslik">
            <h2 id="nasil-baslik" className="text-2xl text-balance-tr sm:text-3xl">
              Nasıl çalışır?
            </h2>
            <p className="mt-2 max-w-prose text-base text-fg-secondary">
              Başvurudan yayına kadar dört adım vardır.
            </p>

            <ol className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-5"
                >
                  <span
                    className="grid size-9 place-items-center rounded-full bg-brand/8 font-display text-base font-semibold text-brand-fg"
                    aria-hidden="true"
                    data-numeric
                  >
                    {index + 1}
                  </span>
                  {/* The number is decorative: an <ol> already announces the
                      item's position, so repeating it would double up. */}
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
          <section aria-labelledby="basvuru-baslik" className="min-w-0">
            <h2 id="basvuru-baslik" className="text-2xl text-balance-tr sm:text-3xl">
              İş birliği başvurusu
            </h2>
            <p className="mt-2 max-w-prose text-base text-fg-secondary">
              Formu doldurun; başvurunuzu inceleyip teknik görüşme için dönüş yapalım. Lütfen
              kimlik, kart ya da vergi bilgisi gibi verileri bu forma yazmayın.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-6 max-w-xl">
              <Field
                label="Firma adı"
                name="company"
                autoComplete="organization"
                placeholder="Örn. Ege Yıldızı Turizm"
                value={values.company}
                onChange={set('company')}
                error={errors.company}
              />

              <Field
                label="Yetkili adı"
                name="contact"
                autoComplete="name"
                placeholder="Örn. Elif Yılmaz"
                value={values.contact}
                onChange={set('contact')}
                error={errors.contact}
              />

              <Field
                label="E-posta"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="ornek@firma.com"
                value={values.email}
                onChange={set('email')}
                error={errors.email}
                hint="Dönüşü bu adrese yaparız."
              />

              <PhoneField
                label="Telefon"
                name="phone"
                value={values.phone}
                onChange={(phone) => {
                  setValues((v) => ({ ...v, phone }))
                  setErrors((e) => ({ ...e, phone: undefined }))
                }}
                error={errors.phone}
                hint="Gün içinde ulaşabileceğimiz bir numara yazın."
              />

              <SelectField
                label="Filo büyüklüğü"
                name="fleet"
                value={values.fleet}
                onChange={set('fleet')}
                error={errors.fleet}
              />

              <TextareaField
                label="Mesajınız"
                name="message"
                value={values.message}
                onChange={set('message')}
                error={errors.message}
                remaining={remaining}
                max={MESSAGE_MAX}
              />

              <Button type="submit" size="lg" loading={submitting} className="mt-4">
                <Send className="size-4" aria-hidden="true" />
                Başvuruyu gönderin
              </Button>

              <p className="mt-4 text-xs text-fg-muted">
                BusLinker bir tanıtım uygulamasıdır. Bu form hiçbir bilgiyi kaydetmez ve bir
                sunucuya göndermez.
              </p>
            </form>
          </section>

          <aside aria-labelledby="firma-baslik" className="min-w-0">
            <h2 id="firma-baslik" className="text-xl sm:text-2xl">
              Listelenen firmalar
            </h2>

            <Card className="mt-6">
              <CardBody className="p-5 sm:p-5">
                <p className="flex items-center gap-2 text-sm font-medium text-fg-secondary">
                  <Handshake className="size-4 shrink-0 text-brand-fg" aria-hidden="true" />
                  {pluralTr(OPERATORS.length, 'firma')} arama sonuçlarında görünüyor
                </p>

                <ul className="mt-4 flex flex-col gap-2">
                  {OPERATORS.map((operator) => (
                    <li key={operator.id}>
                      <Link
                        to={`/otobus-firmalari/${operator.id}`}
                        className={cn(
                          'flex min-h-11 items-center gap-3 rounded-lg border border-transparent p-2',
                          'transition-colors duration-(--duration-fast) ease-standard',
                          'hover:border-border hover:bg-surface-sunken',
                        )}
                      >
                        <OperatorLogo operatorId={operator.id} className="size-10" />
                        <span className="min-w-0 truncate text-sm font-medium text-fg">
                          {operator.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-fg-muted">
                  <Badge tone="warning">Temsilî</Badge>
                  <span>
                    Bu firmalar tanıtım kataloğunda listelenir; aralarında yürürlükte olan bir
                    ticari anlaşmayı ifade etmez.
                  </span>
                </p>
              </CardBody>
            </Card>
          </aside>
        </div>
      </div>
    </>
  )
}

interface SelectFieldProps {
  label: string
  name: FieldName
  value: string
  onChange: (event: { target: { value: string } }) => void
  error?: string | undefined
}

function SelectField({ label, name, value, onChange, error }: SelectFieldProps) {
  const id = `field-${name}`
  const messageId = `${id}-message`

  return (
    <div className="mb-3 flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-fg-secondary">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={messageId}
        className={cn(
          'h-11 w-full min-w-0 rounded-lg border bg-surface px-3 text-base text-fg',
          'transition-colors duration-(--duration-fast) ease-standard',
          'focus-within:border-brand hover:border-border-strong',
          error ? 'border-danger' : 'border-border-strong',
        )}
      >
        <option value="">Filo büyüklüğü seçin</option>
        {FLEET_SIZES.map((size) => (
          <option key={size.value} value={size.value}>
            {size.label}
          </option>
        ))}
      </select>
      <p
        id={messageId}
        {...(error && { role: 'alert' })}
        className={cn('min-h-4 text-xs', error ? 'font-medium text-danger-fg' : 'text-fg-muted')}
      >
        {error ?? 'Yaklaşık bir aralık seçmeniz yeterlidir.'}
      </p>
    </div>
  )
}

interface TextareaFieldProps {
  label: string
  name: FieldName
  value: string
  onChange: (event: { target: { value: string } }) => void
  error?: string | undefined
  remaining: number
  max: number
}

function TextareaField({
  label,
  name,
  value,
  onChange,
  error,
  remaining,
  max,
}: TextareaFieldProps) {
  const id = `field-${name}`
  const messageId = `${id}-message`
  const counterId = `${id}-counter`

  return (
    <div className="mb-3 flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-fg-secondary">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={5}
        maxLength={max}
        value={value}
        onChange={onChange}
        placeholder="Hangi hatlarda çalışıyorsunuz, günde kaç sefer yapıyorsunuz?"
        aria-invalid={error ? true : undefined}
        aria-describedby={`${messageId} ${counterId}`}
        className={cn(
          'w-full min-w-0 resize-y rounded-lg border bg-surface p-3 text-base text-fg',
          'placeholder:text-fg-subtle',
          'transition-colors duration-(--duration-fast) ease-standard',
          'focus-within:border-brand hover:border-border-strong',
          error ? 'border-danger' : 'border-border-strong',
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <p
          id={messageId}
          {...(error && { role: 'alert' })}
          className={cn('min-h-4 text-xs', error ? 'font-medium text-danger-fg' : 'text-fg-muted')}
        >
          {error ?? 'Hatlarınız ve mevcut otomasyonunuz görüşmeyi hızlandırır.'}
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
