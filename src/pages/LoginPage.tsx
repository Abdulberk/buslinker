import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { AuthDemoNotice, AuthLayout } from '@/features/auth/AuthLayout'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/primitives'
import { Field } from '@/shared/ui/field'
import { isEmail } from '@/features/auth/validation'

// The `| undefined` is deliberate: under exactOptionalPropertyTypes, clearing a
// field by assigning undefined is only legal if the type admits it.
interface Errors {
  email?: string | undefined
  password?: string | undefined
}

export default function LoginPage() {
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    document.title = 'Giriş Yap | BusLinker'
  }, [])

  const set = (key: keyof typeof values) => (event: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [key]: event.target.value }))
    // Clearing on edit rather than on blur: an error that persists while the
    // user is fixing it reads as if the fix was rejected.
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const next: Errors = {}
    if (!values.email.trim()) next.email = 'E-posta adresinizi girin.'
    else if (!isEmail(values.email)) next.email = 'Geçerli bir e-posta adresi girin.'
    if (!values.password) next.password = 'Parolanızı girin.'

    setErrors(next)
    const firstInvalid = (['email', 'password'] as const).find((k) => next[k])
    if (firstInvalid) {
      document.querySelector<HTMLInputElement>(`#field-${firstInvalid}`)?.focus()
      return
    }

    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      toast.info('Giriş bu tanıtım sürümünde etkin değil.', {
        description: 'Sefer aramak için giriş yapmanıza gerek yok.',
      })
    }, 600)
  }

  return (
    <AuthLayout
      title="Tekrar hoş geldiniz"
      subtitle="Biletlerinize ulaşmak ve daha hızlı ödeme yapmak için giriş yapın."
      footer={
        <>
          Hesabınız yok mu?{' '}
          <Link
            to="/kayit"
            className="font-semibold text-brand-fg underline-offset-4 hover:underline"
          >
            Üye olun
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
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
        />

        <Field
          label="Parola"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={values.password}
          onChange={set('password')}
          error={errors.password}
        />

        <div className="mt-1 flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-fg-secondary">
            <Checkbox name="remember" />
            Beni hatırla
          </label>
          <a
            href="#"
            className="text-sm font-medium text-brand-fg underline-offset-4 hover:underline"
          >
            Parolamı unuttum
          </a>
        </div>

        <Button type="submit" size="lg" full loading={submitting} className="mt-6">
          Giriş Yap
        </Button>

        <AuthDemoNotice />
      </form>
    </AuthLayout>
  )
}
