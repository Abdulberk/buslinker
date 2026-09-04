import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { HelpCircle, Mail, PhoneCall, Send, Share2 } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { Badge } from '@/shared/ui/badge'
import { Card, CardBody } from '@/shared/ui/card'
import { AssetIcon } from '@/shared/ui/asset-icon'
import { SOCIAL } from '@/shared/config/assets'
import { cn } from '@/shared/lib/cn'
import { isEmail } from '@/features/auth/validation'

const SUBJECTS = [
  { value: 'bilet', label: 'Bilet işlemleri' },
  { value: 'iptal-iade', label: 'İptal ve iade' },
  { value: 'oneri', label: 'Öneri' },
  { value: 'diger', label: 'Diğer' },
] as const

const MESSAGE_MAX = 600

type FieldName = 'fullName' | 'email' | 'subject' | 'message'

// `| undefined` is required under exactOptionalPropertyTypes: clearing an
// error by assigning undefined is only legal if the type admits it.
type Errors = Partial<Record<FieldName, string | undefined>>

const ORDER: readonly FieldName[] = ['fullName', 'email', 'subject', 'message']

export default function ContactPage() {
  const [values, setValues] = useState({ fullName: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'İletişim | BusLinker'
  }, [])

  const set = (key: FieldName) => (event: { target: { value: string } }) => {
    const raw = event.target.value
    setValues((v) => ({ ...v, [key]: key === 'message' ? raw.slice(0, MESSAGE_MAX) : raw }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const next: Errors = {}
    if (values.fullName.trim().length < 3) next.fullName = 'Adınızı ve soyadınızı girin.'
    if (!values.email.trim()) next.email = 'E-posta adresinizi girin.'
    else if (!isEmail(values.email)) next.email = 'Geçerli bir e-posta adresi girin.'
    if (!values.subject) next.subject = 'Bir konu seçin.'
    if (values.message.trim().length < 15) next.message = 'Mesajınızı en az 15 karakterle yazın.'

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
      setValues({ fullName: '', email: '', subject: '', message: '' })
      toast.info('Mesaj gönderimi bu tanıtım sürümünde etkin değil.', {
        description: 'Formunuz kaydedilmedi; hiçbir bilgi bir sunucuya iletilmedi.',
      })
    }, 600)
  }

  const remaining = MESSAGE_MAX - values.message.length

  return (
    <>
      <PageHeader
        title="İletişim"
        lead="Sorularınızı buradan iletebilir, sık sorulanlara göz atarak daha hızlı yanıt alabilirsiniz."
        breadcrumbs={[{ label: 'Ana sayfa', to: '/' }]}
      />

      <div className="app-container section-y">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
          <section aria-labelledby="form-baslik" className="min-w-0">
            <h2 id="form-baslik" className="text-xl sm:text-2xl">
              Bize yazın
            </h2>
            <p className="mt-2 max-w-prose text-base text-fg-secondary">
              Formu doldurup gönderin; hangi konuda yazdığınızı seçmeniz yanıt süresini kısaltır.
              Lütfen kimlik veya kart bilgisi gibi kişisel verilerinizi paylaşmayın.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-6 max-w-xl">
              <Field
                label="Ad Soyad"
                name="fullName"
                autoComplete="name"
                placeholder="Örn. Elif Yılmaz"
                value={values.fullName}
                onChange={set('fullName')}
                error={errors.fullName}
              />

              <Field
                label="E-posta"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="ornek@eposta.com"
                value={values.email}
                onChange={set('email')}
                error={errors.email}
                hint="Yanıtı bu adrese göndeririz."
              />

              <SelectField
                label="Konu"
                name="subject"
                value={values.subject}
                onChange={set('subject')}
                error={errors.subject}
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
                Mesajı gönderin
              </Button>

              <p className="mt-4 text-xs text-fg-muted">
                BusLinker bir tanıtım uygulamasıdır. Bu form hiçbir bilgiyi kaydetmez ve bir
                sunucuya göndermez.
              </p>
            </form>
          </section>

          <aside aria-labelledby="kanallar-baslik" className="min-w-0">
            <h2 id="kanallar-baslik" className="text-xl sm:text-2xl">
              Diğer kanallar
            </h2>

            <div className="mt-6 flex flex-col gap-4">
              <Card>
                <CardBody className="p-5 sm:p-5">
                  <ChannelTitle icon={<PhoneCall className="size-4" aria-hidden="true" />}>
                    Çağrı merkezi
                  </ChannelTitle>
                  <p className="mt-2 font-display text-xl font-semibold text-fg tabular-nums">
                    0850 000 00 00
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone="warning">Tanıtım numarası</Badge>
                    <span className="text-xs text-fg-muted">Aranabilir bir hat değildir.</span>
                  </div>
                  <p className="mt-3 text-sm text-fg-secondary">
                    Gerçek bir uygulamada bu hat haftanın yedi günü, günün yirmi dört saati hizmet
                    verir.
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-5 sm:p-5">
                  <ChannelTitle icon={<Mail className="size-4" aria-hidden="true" />}>
                    E-posta
                  </ChannelTitle>
                  <p className="mt-2 font-medium break-all text-fg">destek@buslinker.example</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge tone="warning">Tanıtım adresi</Badge>
                    <span className="text-xs text-fg-muted">Gelen ileti okunmaz.</span>
                  </div>
                  <p className="mt-3 text-sm text-fg-secondary">
                    Bilet ile ilgili yazarken PNR numaranızı ve yolcu soyadını eklemeniz, işlemi
                    hızlandırır.
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-5 sm:p-5">
                  <ChannelTitle icon={<Share2 className="size-4" aria-hidden="true" />}>
                    Sosyal medya
                  </ChannelTitle>
                  <p className="mt-2 text-sm text-fg-secondary">
                    Kampanyaları ve yeni hatları sosyal hesaplardan da duyururuz.
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {SOCIAL.map((item) => (
                      <li key={item.id}>
                        <a
                          href="#"
                          aria-label={item.label}
                          className={cn(
                            'flex size-11 items-center justify-center rounded-lg border border-border',
                            'text-fg-secondary transition-colors duration-(--duration-fast)',
                            'hover:border-brand hover:bg-brand/8 hover:text-brand-fg',
                          )}
                        >
                          <AssetIcon src={item.icon} className="size-5" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-5 sm:p-5">
                  <ChannelTitle icon={<HelpCircle className="size-4" aria-hidden="true" />}>
                    Sık sorulan sorular
                  </ChannelTitle>
                  <p className="mt-2 text-sm text-fg-secondary">
                    İptal, iade, koltuk seçimi ve ödeme başlıklarındaki soruların çoğunun yanıtı
                    burada hazır bekliyor.
                  </p>
                  <Button variant="brand-outline" size="sm" full asChild className="mt-4">
                    <Link to="/sss">Sık sorulan sorulara gidin</Link>
                  </Button>
                </CardBody>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}

function ChannelTitle({ icon, children }: { icon: ReactNode; children: string }) {
  return (
    <h3 className="flex items-center gap-2 text-base">
      <span className="text-brand" aria-hidden="true">
        {icon}
      </span>
      {children}
    </h3>
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
        <option value="">Konu seçin</option>
        {SUBJECTS.map((subject) => (
          <option key={subject.value} value={subject.value}>
            {subject.label}
          </option>
        ))}
      </select>
      <p
        id={messageId}
        {...(error && { role: 'alert' })}
        className={cn('min-h-4 text-xs', error ? 'font-medium text-danger-fg' : 'text-fg-muted')}
      >
        {error ?? 'Konuyu seçmeniz talebin doğru ekibe ulaşmasını sağlar.'}
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
        rows={6}
        maxLength={max}
        value={value}
        onChange={onChange}
        placeholder="Nasıl yardımcı olabiliriz?"
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
          {error ?? 'Sefer, tarih ve PNR gibi ayrıntılar yanıtı hızlandırır.'}
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
