import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { AuthDemoNotice, AuthLayout } from '@/features/auth/AuthLayout'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/primitives'
import { Field } from '@/shared/ui/field'
import { cn } from '@/shared/lib/cn'
import { checkPassword, isEmail, isPhone, PASSWORD_LABELS } from '@/features/auth/validation'

type FieldName = 'fullName' | 'email' | 'phone' | 'password'
// `| undefined` explicitly: under exactOptionalPropertyTypes, clearing a field
// by assigning undefined is only legal if the type admits it.
type Errors = Partial<Record<FieldName | 'terms', string | undefined>>

const ORDER: FieldName[] = ['fullName', 'email', 'phone', 'password']

export default function SignupPage() {
  const [values, setValues] = useState({ fullName: '', email: '', phone: '', password: '' })
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'Üye Ol | BusLinker'
  }, [])

  const strength = useMemo(() => checkPassword(values.password), [values.password])

  const set = (key: FieldName) => (event: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [key]: event.target.value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const next: Errors = {}
    if (values.fullName.trim().length < 3) next.fullName = 'Ad ve soyadınızı girin.'
    if (!values.email.trim()) next.email = 'E-posta adresinizi girin.'
    else if (!isEmail(values.email)) next.email = 'Geçerli bir e-posta adresi girin.'
    if (!values.phone.trim()) next.phone = 'Cep telefonu numaranızı girin.'
    else if (!isPhone(values.phone)) next.phone = 'Numarayı 5XX XXX XX XX biçiminde girin.'
    if (!strength.ok) next.password = strength.message
    if (!terms) next.terms = 'Devam etmek için koşulları onaylamanız gerekiyor.'

    setErrors(next)

    const firstInvalid = ORDER.find((k) => next[k])
    if (firstInvalid) {
      document.querySelector<HTMLInputElement>(`#field-${firstInvalid}`)?.focus()
      return
    }
    if (next.terms) return

    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      toast.info('Üyelik bu tanıtım sürümünde etkin değil.', {
        description: 'Bilet aramak ve koltuk seçmek için üye olmanıza gerek yok.',
      })
    }, 600)
  }

  return (
    <AuthLayout
      title="Hesabınızı oluşturun"
      subtitle="Biletlerinizi tek yerden yönetin, sonraki alışverişlerinizde bilgilerinizi yeniden girmeyin."
      footer={
        <>
          Zaten hesabınız var mı?{' '}
          <Link
            to="/giris"
            className="font-semibold text-brand-fg underline-offset-4 hover:underline"
          >
            Giriş yapın
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <Field
          label="Ad Soyad"
          name="fullName"
          autoComplete="name"
          placeholder="Ayşe Yılmaz"
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
          hint="Biletiniz bu adrese gönderilir."
        />

        <Field
          label="Cep Telefonu"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="5XX XXX XX XX"
          value={values.phone}
          onChange={set('phone')}
          error={errors.phone}
        />

        <Field
          label="Parola"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="En az 8 karakter"
          value={values.password}
          onChange={set('password')}
          error={errors.password}
        />

        {values.password.length > 0 && !errors.password ? (
          <PasswordMeter score={strength.score} />
        ) : null}

        <div className="mt-3">
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-fg-secondary">
            <Checkbox
              checked={terms}
              onCheckedChange={(checked) => {
                setTerms(checked === true)
                setErrors((e) => ({ ...e, terms: undefined }))
              }}
              aria-describedby={errors.terms ? 'terms-error' : undefined}
              aria-invalid={errors.terms ? true : undefined}
              className="mt-0.5"
            />
            <span>
              <a href="#" className="font-medium text-brand-fg underline-offset-4 hover:underline">
                Kullanım Koşulları
              </a>{' '}
              ve{' '}
              <a href="#" className="font-medium text-brand-fg underline-offset-4 hover:underline">
                Gizlilik Politikası
              </a>
              &apos;nı okudum, onaylıyorum.
            </span>
          </label>
          {errors.terms ? (
            <p id="terms-error" role="alert" className="mt-1.5 text-xs font-medium text-danger-fg">
              {errors.terms}
            </p>
          ) : null}
        </div>

        <Button type="submit" size="lg" full loading={submitting} className="mt-6">
          Üye Ol
        </Button>

        <AuthDemoNotice />
      </form>
    </AuthLayout>
  )
}

/**
 * Strength is advisory, so the meter is `aria-hidden` and the same information
 * is given as text — a screen reader gets "Güçlü", not four coloured divs.
 */
function PasswordMeter({ score }: { score: number }) {
  const label = PASSWORD_LABELS[score] ?? ''
  const tone =
    score >= 4 ? 'bg-success' : score === 3 ? 'bg-info' : score === 2 ? 'bg-warning' : 'bg-danger'

  return (
    <div className="-mt-2 mb-1">
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((step) => (
          <span
            key={step}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors duration-(--duration-base)',
              step <= score ? tone : 'bg-surface-sunken',
            )}
          />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-fg-muted">
        Parola gücü: <span className="font-medium text-fg-secondary">{label}</span>
      </p>
    </div>
  )
}
