import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { CircleCheck, Link2Off, TriangleAlert } from 'lucide-react'
import { AuthDemoNotice, AuthLayout } from '@/features/auth/AuthLayout'
import { Button } from '@/shared/ui/button'
import { Field } from '@/shared/ui/field'
import { cn } from '@/shared/lib/cn'
import { checkPassword, PASSWORD_LABELS } from '@/features/auth/validation'

type FieldName = 'password' | 'confirm'
// `| undefined` explicitly: under exactOptionalPropertyTypes, clearing a field
// by assigning undefined is only legal if the type admits it.
type Errors = Partial<Record<FieldName, string | undefined>>

const ORDER: FieldName[] = ['password', 'confirm']

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [values, setValues] = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    document.title = 'Parola Sıfırlama | BusLinker'
  }, [])

  const strength = useMemo(() => checkPassword(values.password), [values.password])

  const set = (key: FieldName) => (event: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [key]: event.target.value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const next: Errors = {}
    if (!strength.ok) next.password = strength.message
    if (!values.confirm) next.confirm = 'Parolanızı tekrar girin.'
    else if (values.confirm !== values.password) next.confirm = 'İki parola birbiriyle uyuşmuyor.'

    setErrors(next)

    const firstInvalid = ORDER.find((k) => next[k])
    if (firstInvalid) {
      document.querySelector<HTMLInputElement>(`#field-${firstInvalid}`)?.focus()
      return
    }

    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      setDone(true)
    }, 600)
  }

  // A reset form with no token cannot do anything, so it is not shown at all:
  // an inert form that only fails on submit wastes the effort of filling it in.
  if (!token) {
    return (
      <AuthLayout
        title="Bağlantı geçersiz"
        subtitle="Parola sıfırlama bağlantısı eksik veya süresi dolmuş görünüyor."
        footer={
          <>
            Hesabınızı hatırladınız mı?{' '}
            <Link
              to="/giris"
              className="font-semibold text-brand-fg underline-offset-4 hover:underline"
            >
              Giriş yapın
            </Link>
          </>
        }
      >
        <div>
          <div className="rounded-xl border border-border bg-surface-raised p-5 shadow-sm">
            <span
              aria-hidden="true"
              className="grid size-12 place-items-center rounded-full bg-warning-tint text-warning-fg"
            >
              <Link2Off className="size-6" />
            </span>

            <p role="status" className="mt-4 text-base text-fg-secondary">
              Bu sayfaya ulaşmak için e-postanızdaki sıfırlama bağlantısını kullanmanız gerekiyor.
            </p>

            <ul className="mt-4 flex flex-col gap-2 text-sm text-fg-muted">
              <li className="flex items-start gap-2">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Bağlantılar 60 dakika sonra geçerliliğini yitirir.
              </li>
              <li className="flex items-start gap-2">
                <Link2Off className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Adresi elle yazdıysanız bağlantının tamamını kopyaladığınızdan emin olun.
              </li>
            </ul>
          </div>

          <Button asChild size="lg" full className="mt-6">
            <Link to="/sifremi-unuttum">Yeni Bağlantı İsteyin</Link>
          </Button>

          <AuthDemoNotice />
        </div>
      </AuthLayout>
    )
  }

  if (done) {
    return (
      <AuthLayout
        title="Parolanız güncellendi"
        subtitle="Yeni parolanızla giriş yapabilirsiniz."
        footer={
          <>
            Sorun mu yaşıyorsunuz?{' '}
            <Link
              to="/iletisim"
              className="font-semibold text-brand-fg underline-offset-4 hover:underline"
            >
              Bize ulaşın
            </Link>
          </>
        }
      >
        <div>
          <div className="rounded-xl border border-border bg-surface-raised p-5 shadow-sm">
            <span
              aria-hidden="true"
              className="grid size-12 place-items-center rounded-full bg-success-tint text-success-fg"
            >
              <CircleCheck className="size-6" />
            </span>

            <p role="status" className="mt-4 text-base text-fg-secondary">
              Parolanız değiştirildi. Güvenliğiniz için diğer cihazlardaki oturumlarınız kapatıldı.
            </p>

            <p className="mt-2 text-sm text-fg-muted">
              Bu işlemi siz yapmadıysanız lütfen hemen bizimle iletişime geçin.
            </p>
          </div>

          <Button asChild size="lg" full className="mt-6">
            <Link to="/giris">Giriş Yapın</Link>
          </Button>

          <AuthDemoNotice />
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Yeni parolanızı belirleyin"
      subtitle="Parolanız en az 8 karakter olmalıdır. Uzun bir parola, karmaşık ama kısa bir paroladan daha güvenlidir."
      footer={
        <>
          Vazgeçtiniz mi?{' '}
          <Link
            to="/giris"
            className="font-semibold text-brand-fg underline-offset-4 hover:underline"
          >
            Giriş sayfasına dönün
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <Field
          label="Yeni Parola"
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

        <Field
          label="Yeni Parola (Tekrar)"
          name="confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Parolanızı tekrar girin"
          value={values.confirm}
          onChange={set('confirm')}
          error={errors.confirm}
        />

        <Button type="submit" size="lg" full loading={submitting} className="mt-4">
          Parolayı Güncelle
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
